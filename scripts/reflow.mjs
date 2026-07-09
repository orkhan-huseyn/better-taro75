// Reconstruct newlines in solution code that Taro sometimes serves with the
// line breaks stripped (indentation is preserved as space runs; on brace
// languages the newline survives as a stray "n" after `{`, `;` or `}`).
//
// This is a pure heuristic that operates ONLY on already-collected local data —
// it never fetches. It is validated by:
//   - a content-preservation invariant (only whitespace + stray-n markers change)
//   - Python `ast.parse` and JS `node --check` on the reformatted output.

const nlCount = (c) => (c.match(/\n/g) || []).length;
const hasStrayN = (c) => /[{};]n(?=[ }]|$)/.test(c);
const hasCollapsedLine = (c) =>
  c.split("\n").some((l) => l.length > 200 && (l.match(/ {2,}/g) || []).length >= 2);

/**
 * True when a code block is genuinely collapsed/corrupted — NOT merely because
 * it contains alignment double-spaces (e.g. gofmt-aligned struct fields).
 */
export const needsReflow = (c) =>
  (nlCount(c) === 0 && c.length > 60) || // fully collapsed onto one line
  hasStrayN(c) || // brace-language stray-n markers
  (nlCount(c) > 0 && !hasStrayN(c) && hasCollapsedLine(c)); // partial collapse

/**
 * Remove leftover `\r\n` artifacts: some blocks arrive with real newlines but a
 * stray `rn` (occasionally `urn`, or doubled `rnrn`) tacked onto each line just
 * before the newline / closing brace. Only touches blocks with an UNAMBIGUOUS
 * artifact (a `rn`-run after punctuation or a digit — a real word never ends
 * that way), and uses a lookahead so a word's own trailing "rn" (e.g. `return`)
 * is never eaten.
 */
export function stripCrlfArtifacts(code) {
  if (!/[^A-Za-z\s](?:rn)+(?=[\n}]|$)/.test(code)) return code;
  let s = code
    .replace(/([^A-Za-z])(?:rn)+(?=[\n}]|$)/g, "$1") // punctuation/digit-preceded: whole run
    .replace(/([A-Za-z])u?rn(?=[\n}]|$)/g, "$1"); // word-preceded: one unit (rn | urn)
  // A closing brace glued to the final statement -> its own line.
  s = s.replace(/([^\s{}])(\}+)\s*$/, (m, a, br) => a + "\n" + br.split("").join("\n"));
  return s;
}

export function reflow(code) {
  let s = code;

  // 1) Structural newline markers (stray `n` after {};, only when followed by an
  //    indent / `}` / end — never a real identifier such as `{name}`), plus
  //    indentation runs (2+ spaces after real content). Spaces immediately after
  //    a comment marker (`#`, `//`) are kept inline, not treated as a break.
  s = s.replace(/([{};])n(?=[ }]|$)( *)|(\S)( {2,})/g, (m, br, sp1, ch, sp2) => {
    if (br !== undefined) return br + "\n" + sp1;
    if (ch === "#" || ch === "/") return m;
    return ch + "\n" + sp2;
  });

  // 1b) Stray `n` before a top-level keyword at column 0 (e.g. Go `}nfunc`).
  s = s.replace(
    /([{}])n(?=(?:func|type|const|var|import|package|impl|fn|struct|class|public|private|def|end)\b)/g,
    "$1\n",
  );

  // 2) Preamble directives whose newline was lost at column 0 (only when glued,
  //    i.e. immediately followed by more non-space content).
  s = s.replace(/(#\s*(?:include|import)\s*(?:<[^>\n]*>|"[^"\n]*"))(?=\S)/g, "$1\n");
  s = s.replace(/(using [^;\n]*;)(?=\S)/g, "$1\n");
  s = s.replace(/(import [^;\n]{0,200};)(?=\S)/g, "$1\n"); // java / kotlin / ts / js
  s = s.replace(/(import "[^"\n]*")(?=\S)/g, "$1\n"); // go
  s = s.replace(
    /(package [A-Za-z0-9_.]+;?)(?=(?:import|func|type|const|var|class|public|private)\b)/g,
    "$1\n",
  );
  s = s.replace(/(use [^;\n]{0,200};)(?=\S)/g, "$1\n"); // rust
  s = s.replace(/(require(?:_relative)? ['"][^'"\n]*['"])(?=\S)/g, "$1\n"); // ruby
  // python: semicolon-less `import x` / `from x import y` glued to def/class
  s = s.replace(
    /\b(import [^\n]*?|from [^\n]*? import [^\n]*?)((?:async )?def |class )/g,
    "$1\n$2",
  );

  // 3) Trailing glued closing braces / Ruby `end`.
  s = s.replace(/([^\s{}])(\}+)\s*$/, (m, a, br) => a + "\n" + br.split("").join("\n"));
  s = s.replace(/([^\s])(end)\s*$/, (m, a) => a + "\nend");

  // Cleanup: trailing whitespace, excess blank lines, leading/trailing newlines.
  s = s
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .replace(/\s+$/, "");
  return s;
}
