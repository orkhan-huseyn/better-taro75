// Display name -> Monaco language id. Shared by the read-only code viewer and
// the editable scratchpad so the two stay in sync.
export const MONACO_LANG: Record<string, string> = {
  Python: "python",
  JavaScript: "javascript",
  TypeScript: "typescript",
  Java: "java",
  "C++": "cpp",
  "C#": "csharp",
  Go: "go",
  Rust: "rust",
  Kotlin: "kotlin",
  Swift: "swift",
  Ruby: "ruby",
  PHP: "php",
};

// Languages offered in the workspace language picker.
export const EDITOR_LANGUAGES = Object.keys(MONACO_LANG);

// Languages whose line comments start with `#`; everything else uses `//`.
const HASH_COMMENT = new Set(["Python", "Ruby"]);

// The line-comment token for a display language, used to render the problem
// statement as comments in the editor.
export function lineComment(lang: string): string {
  return HASH_COMMENT.has(lang) ? "#" : "//";
}
