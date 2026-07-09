import { lineComment } from "@/lib/monaco";
import type { ProblemDetail } from "@/types";

const BLOCK = new Set([
  "P",
  "DIV",
  "UL",
  "OL",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "SECTION",
]);

function collect(node: Node): string {
  let out = "";
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += (child.textContent ?? "").replace(/\s+/g, " ");
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as HTMLElement;
    switch (el.tagName) {
      case "BR":
        out += "\n";
        break;
      case "LI":
        out += "\n- " + collect(el).trim();
        break;
      default:
        out += BLOCK.has(el.tagName) ? "\n" + collect(el) + "\n" : collect(el);
    }
  });
  return out;
}

function clean(text: string): string {
  return text
    .replace(/\xa0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// A heading that marks the end of the description prose.
const SECTION_HEADING = /^(Example|Constraints|Follow[-\s]?up)\b/i;

// The first example's input/output, handling both LeetCode markups: the older
// <pre> block and the newer <div class="example-block"> with labelled <p>s.
function firstExample(body: HTMLElement): string {
  // A <pre> can also appear in the description (e.g. a custom-judge block), so
  // scan them all and take the first that actually holds an example. Keep from
  // the "Input" label to just before "Explanation" — this preserves values
  // that sit on their own line below the label (as in the LRU cache example).
  for (const pre of Array.from(body.querySelectorAll("pre"))) {
    let text = (pre.textContent ?? "").replace(/\xa0/g, " ");
    const start = text.search(/^[ \t]*Input\b/im);
    if (start === -1) continue;
    text = text.slice(start);
    const end = text.search(/^[ \t]*Explanation\b/im);
    if (end !== -1) text = text.slice(0, end);
    const lines = text.split("\n").map((l) => l.replace(/\s+$/, ""));
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    if (lines.length) return lines.join("\n");
  }

  let input = "";
  let output = "";
  for (const p of Array.from(body.querySelectorAll("p"))) {
    const text = clean(collect(p)).replace(/\s+/g, " ").trim();
    if (!input && /^Input\b/i.test(text)) input = text;
    else if (!output && /^Output\b/i.test(text)) output = text;
    if (input && output) break;
  }
  return [input, output].filter(Boolean).join("\n");
}

// Pull just the problem description and the first example's input/output from a
// LeetCode-style HTML body — dropping the name, difficulty, and constraints.
function extractStatement(html: string): {
  description: string;
  example: string;
} {
  if (typeof DOMParser === "undefined") return { description: "", example: "" };
  const doc = new DOMParser().parseFromString(html, "text/html");
  // Render superscripts inline, e.g. 10<sup>4</sup> -> 10^4.
  doc.querySelectorAll("sup").forEach((el) => {
    el.textContent = "^" + (el.textContent ?? "");
  });

  const body = doc.body;

  let description = "";
  for (const node of Array.from(body.childNodes)) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    // Stop at the first example/constraints marker. A bare <pre> may be part of
    // the description (a diagram or judge block), so it isn't a boundary.
    if (el.classList?.contains("example-block")) break;
    if (SECTION_HEADING.test((el.textContent ?? "").replace(/\xa0/g, " ").trim()))
      break;
    const text = clean(collect(el));
    if (text) description += (description ? "\n\n" : "") + text;
  }

  return { description: description.trim(), example: firstExample(body) };
}

// Soft-wrap long lines to `width`, preserving indentation and leaving already
// short lines (like the example input/output) untouched.
function wrap(text: string, width: number): string {
  return text
    .split("\n")
    .map((line) => {
      if (line.length <= width) return line;
      const indent = line.match(/^\s*/)?.[0] ?? "";
      const words = line.slice(indent.length).split(/\s+/);
      const lines: string[] = [];
      let cur = "";
      for (const w of words) {
        const next = cur ? `${cur} ${w}` : w;
        if ((indent + next).length > width && cur) {
          lines.push(indent + cur);
          cur = w;
        } else {
          cur = next;
        }
      }
      if (cur) lines.push(indent + cur);
      return lines.join("\n");
    })
    .join("\n");
}

// Build the starter buffer: a short problem statement (description + one
// example) as comments, then blank space to write in.
export function buildTemplate(detail: ProblemDetail, lang: string): string {
  const c = lineComment(lang);
  const prefix = (line: string) => (line ? `${c} ${line}` : c);
  const { description, example } = extractStatement(detail.questionBody);

  const lines = wrap(description, 76).split("\n").map(prefix);
  if (example) {
    lines.push(c, ...example.split("\n").map(prefix));
  }
  lines.push(
    c,
    `${c} ${"-".repeat(64)}`,
    `${c} Write your solution below.`,
    "",
    "",
    "",
  );
  return lines.join("\n");
}
