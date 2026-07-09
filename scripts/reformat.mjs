// Reformat collapsed solution code in the LOCAL data files (no network).
//   npm run reformat
//
// Detects code blocks that Taro served with newlines stripped and reconstructs
// them in place. Safe to re-run; only touches genuinely-collapsed blocks.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { needsReflow, reflow, stripCrlfArtifacts } from "./reflow.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUESTIONS_DIR = path.resolve(__dirname, "..", "src", "data", "questions");

let files = 0;
let changedFiles = 0;
let blocks = 0;
const byLang = {};

for (const file of (await fs.readdir(QUESTIONS_DIR)).sort()) {
  if (!file.endsWith(".json")) continue;
  files++;
  const fp = path.join(QUESTIONS_DIR, file);
  const detail = JSON.parse(await fs.readFile(fp, "utf8"));
  let touched = false;

  for (const kind of ["bruteForce", "optimal"]) {
    const sol = detail.solutions?.[kind];
    if (!sol?.code) continue;
    for (const [lang, code] of Object.entries(sol.code)) {
      if (typeof code !== "string") continue;
      let out = stripCrlfArtifacts(code);
      if (needsReflow(out)) out = reflow(out);
      if (out !== code) {
        sol.code[lang] = out;
        blocks++;
        touched = true;
        byLang[lang] = (byLang[lang] || 0) + 1;
      }
    }
  }

  if (touched) {
    await fs.writeFile(fp, JSON.stringify(detail));
    changedFiles++;
  }
}

console.log(`✓ reformatted ${blocks} code blocks in ${changedFiles}/${files} files`);
console.log("  by language:", byLang);
