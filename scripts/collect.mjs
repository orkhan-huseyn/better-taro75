// Collect Taro 75 data from jointaro.com's public endpoints and bake it into
// static JSON + local logos. Re-runnable: `npm run collect`.
//
// Data sources (both public, no auth):
//   - List:   GET /api/interview-insights-canonical/fetch-taro-75/
//   - Detail: GET /interviews/questions/{slug}/  -> __NEXT_DATA__.props.pageProps.interviewInsight
//
// Outputs:
//   src/data/problems.json            light list for the home page
//   src/data/questions/{slug}.json    full detail (pre-highlighted code) per problem
//   src/data/companies.json           company facets (name, logo, count)
//   src/data/topics.json              topic facets (name, count)
//   src/data/meta.json                aggregate counts + generatedAt
//   public/logos/{slug}.{ext}         downloaded company logos

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const QUESTIONS_DIR = path.join(DATA_DIR, "questions");
const LOGOS_DIR = path.join(ROOT, "public", "logos");

const ORIGIN = "https://www.jointaro.com";
const LIST_URL = `${ORIGIN}/api/interview-insights-canonical/fetch-taro-75/`;
const UA = "Mozilla/5.0 (better-taro75 data collector)";

// Preferred display order for the language switcher.
const LANG_ORDER = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C#",
  "Go", "Rust", "Kotlin", "Swift", "Ruby", "PHP",
];
// Company slug -> nice display name (title-case handles the rest).
const COMPANY_NAME_OVERRIDES = {
  "bloomberg-lp": "Bloomberg", tiktok: "TikTok", bytedance: "ByteDance",
  sap: "SAP", ibm: "IBM", amd: "AMD", nvidia: "NVIDIA", hubspot: "HubSpot",
  paypal: "PayPal", servicenow: "ServiceNow", linkedin: "LinkedIn",
  doordash: "DoorDash", netapp: "NetApp", sofi: "SoFi", ebay: "eBay",
  docusign: "DocuSign", "goldman-sachs": "Goldman Sachs", tcs: "TCS",
  "expedia-group": "Expedia Group", "palo-alto-networks": "Palo Alto Networks",
  "american-express": "American Express", "morgan-stanley": "Morgan Stanley",
  zscaler: "Zscaler", roblox: "Roblox", "capital-one": "Capital One",
  jpmorgan: "JPMorgan", "j-p-morgan": "JPMorgan",
};

function titleCase(slug) {
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
function companyName(slug) {
  return COMPANY_NAME_OVERRIDES[slug] ?? titleCase(slug);
}

async function fetchWithRetry(url, { json = false, tries = 4 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: json ? "application/json" : "text/html" },
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return json ? res.json() : res.text();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr;
}

function extractNextData(html) {
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!m) throw new Error("no __NEXT_DATA__");
  return JSON.parse(m[1]);
}

// Simple bounded-concurrency map.
async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const cur = idx++;
      results[cur] = await fn(items[cur], cur);
    }
  });
  await Promise.all(workers);
  return results;
}

function buildSolution(sol) {
  if (!sol) return null;
  const raw = sol.codeSolutions || {};
  const langs = LANG_ORDER.filter((l) => typeof raw[l] === "string" && raw[l].trim());
  const code = {};
  for (const l of langs) {
    // Store raw source only; syntax highlighting happens at render time.
    code[l] = raw[l];
  }
  const overview = sol.plainEnglishOverview || {};
  const steps = Array.isArray(overview.steps)
    ? overview.steps
    : overview.steps
      ? [overview.steps]
      : [];
  const b = sol.bigOAnalysis || {};
  return {
    overview: overview.overview || "",
    steps,
    bigO: {
      runtimeValue: b.runtimeValue || "",
      runtimeExplanation: b.runtimeExplanation || "",
      spaceValue: b.spaceValue || "",
      spaceExplanation: b.spaceExplanation || "",
    },
    languages: langs,
    code,
  };
}

function extFromLogoUrl(url) {
  const decoded = decodeURIComponent(url);
  const m = decoded.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  const ext = (m ? m[1] : "png").toLowerCase();
  return ext === "jpeg" ? "jpg" : ext;
}

async function downloadLogo(slug, url) {
  const ext = extFromLogoUrl(url);
  const file = `${slug}.${ext}`;
  const dest = path.join(LOGOS_DIR, file);
  try {
    await fs.access(dest);
    return `/logos/${file}`; // already downloaded
  } catch {}
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`logo HTTP ${res.status} for ${slug}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
  return `/logos/${file}`;
}

async function main() {
  await fs.mkdir(QUESTIONS_DIR, { recursive: true });
  await fs.mkdir(LOGOS_DIR, { recursive: true });

  console.log("→ fetching Taro 75 list…");
  const list = await fetchWithRetry(LIST_URL, { json: true });
  const questions = list.questions;
  console.log(`  got ${questions.length} questions`);

  // Collect unique companies (slug -> logoUrl) across the whole list.
  const companyLogoUrl = new Map();
  const companyCount = new Map();
  for (const q of questions) {
    for (const c of q.askingCompanies || []) {
      if (!companyLogoUrl.has(c.slug)) companyLogoUrl.set(c.slug, c.logoUrl);
      companyCount.set(c.slug, (companyCount.get(c.slug) || 0) + 1);
    }
  }
  console.log(`→ downloading ${companyLogoUrl.size} company logos…`);
  const companyLogoPath = new Map();
  await mapPool([...companyLogoUrl.entries()], 8, async ([slug, url]) => {
    try {
      companyLogoPath.set(slug, await downloadLogo(slug, url));
    } catch (e) {
      console.warn(`  ! logo failed for ${slug}: ${e.message}`);
      companyLogoPath.set(slug, null);
    }
  });

  const companyMeta = (slug) => ({
    slug,
    name: companyName(slug),
    logo: companyLogoPath.get(slug) || null,
  });

  console.log("→ fetching + highlighting 75 detail pages…");
  const lightList = [];
  let done = 0;
  await mapPool(questions, 5, async (q) => {
    const url = `${ORIGIN}/interviews/questions/${q.slug}/`;
    const html = await fetchWithRetry(url);
    const ii = extractNextData(html).props.pageProps.interviewInsight;

    const companies = (q.askingCompanies || []).map((c) => companyMeta(c.slug));
    const bruteForce = buildSolution(ii.bruteForceSolution);
    const optimal = buildSolution(ii.optimalSolution);

    const detail = {
      id: q.id,
      slug: q.slug,
      rank: q.rank,
      title: ii.questionTitle || q.title,
      difficulty: q.difficulty,
      topics: q.topics || ii.topics || [],
      externalUrl: ii.externalUrl || null,
      numViews: ii.numViews ?? null,
      questionBody: ii.questionBody || "",
      clarifyingQuestions: ii.clarifyingQuestions || [],
      edgeCases: ii.edgeCases || [],
      companies,
      solutions: { bruteForce, optimal },
    };
    await fs.writeFile(
      path.join(QUESTIONS_DIR, `${q.slug}.json`),
      JSON.stringify(detail),
    );

    lightList.push({
      id: q.id,
      rank: q.rank,
      title: q.title,
      slug: q.slug,
      difficulty: q.difficulty,
      topics: q.topics || [],
      preview: q.questionPreview || "",
      companies: (q.askingCompanies || []).map((c) => c.slug),
      companyCount: (q.askingCompanies || []).length,
      hasBruteForce: !!bruteForce,
      hasOptimal: !!optimal,
    });

    done++;
    if (done % 10 === 0 || done === questions.length) {
      console.log(`  ${done}/${questions.length}`);
    }
  });

  lightList.sort((a, b) => a.rank - b.rank);

  // Facets
  const companies = [...companyCount.entries()]
    .map(([slug, count]) => ({ ...companyMeta(slug), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const topicCount = new Map();
  for (const q of questions)
    for (const t of q.topics || []) topicCount.set(t, (topicCount.get(t) || 0) + 1);
  const topics = [...topicCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const byDifficulty = lightList.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {});

  const meta = {
    total: lightList.length,
    difficulty: byDifficulty,
    topicCount: topics.length,
    companyCount: companies.length,
    source: "https://www.jointaro.com/interviews/taro-75/",
    generatedAt: new Date().toISOString(),
  };

  await fs.writeFile(path.join(DATA_DIR, "problems.json"), JSON.stringify(lightList, null, 2));
  await fs.writeFile(path.join(DATA_DIR, "companies.json"), JSON.stringify(companies, null, 2));
  await fs.writeFile(path.join(DATA_DIR, "topics.json"), JSON.stringify(topics, null, 2));
  await fs.writeFile(path.join(DATA_DIR, "meta.json"), JSON.stringify(meta, null, 2));

  console.log("\n✓ done");
  console.log(`  problems: ${meta.total}  |  topics: ${topics.length}  |  companies: ${companies.length}`);
  console.log(`  difficulty:`, byDifficulty);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
