"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { Monaco, OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Check, ChevronDown, Copy, RotateCcw, SquareCode, X } from "lucide-react";
import { DifficultyPill } from "@/components/difficulty-pill";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EDITOR_LANGUAGES, MONACO_LANG } from "@/lib/monaco";
import { buildTemplate } from "@/lib/problem-text";
import { cn } from "@/lib/utils";
import type { ProblemDetail } from "@/types";

// Monaco is client-only and loads its assets lazily (via the default CDN loader),
// so keep it out of SSR entirely — same setup as the read-only code viewer.
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading editor…
      </div>
    ),
  },
);

const LANG_KEY = "better-taro75:scratch-lang";
const contentKey = (slug: string) => `better-taro75:scratch:${slug}`;

// Turn off every source of IntelliSense so the pad behaves like a plain
// interview whiteboard — syntax highlighting, but no autocomplete.
const NO_AUTOCOMPLETE = {
  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  acceptSuggestionOnEnter: "off",
  tabCompletion: "off",
  wordBasedSuggestions: "off",
  parameterHints: { enabled: false },
  inlineSuggest: { enabled: false },
  suggest: { showWords: false, showSnippets: false },
  hover: { enabled: false },
  codeLens: false,
} as const;

const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  lineNumbers: "on",
  lineHeight: 20,
  fontSize: 13,
  fontFamily:
    "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
  fontLigatures: false,
  tabSize: 4,
  automaticLayout: true,
  wordWrap: "on",
  padding: { top: 16, bottom: 16 },
  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
} as const;

// The TypeScript/JavaScript workers surface completions and red squiggles even
// with the editor options above, so silence them at the language-service level.
function disableLanguageServices(monaco: Monaco) {
  const ts = monaco.languages?.typescript;
  if (!ts) return;
  for (const defaults of [ts.typescriptDefaults, ts.javascriptDefaults]) {
    defaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });
  }
}

// Launch button + the fullscreen coding workspace it opens.
export function PracticeWorkspace({ detail }: { detail: ProblemDetail }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-1.5">
        <SquareCode className="h-4 w-4" /> Practice mode
      </Button>
      {open && <Workspace detail={detail} onClose={() => setOpen(false)} />}
    </>
  );
}

function Workspace({
  detail,
  onClose,
}: {
  detail: ProblemDetail;
  onClose: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const [selected, setSelected] = React.useState("Python");
  const [value, setValue] = React.useState("");
  const [ready, setReady] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Latest buffer, so the on-close flush persists work typed inside the
  // debounce window without the effect re-subscribing on every keystroke.
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const readyRef = React.useRef(false);

  // Restore a saved buffer + preferred language, or seed with the statement.
  React.useEffect(() => {
    let lang = "Python";
    let saved: string | null = null;
    try {
      const savedLang = localStorage.getItem(LANG_KEY);
      if (savedLang && EDITOR_LANGUAGES.includes(savedLang)) lang = savedLang;
      saved = localStorage.getItem(contentKey(detail.slug));
    } catch {}
    setSelected(lang);
    setValue(saved != null ? saved : buildTemplate(detail, lang));
    setReady(true);
    readyRef.current = true;
  }, [detail]);

  // Debounced autosave so we don't hit localStorage on every keystroke.
  React.useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => {
      try {
        if (value) localStorage.setItem(contentKey(detail.slug), value);
        else localStorage.removeItem(contentKey(detail.slug));
      } catch {}
    }, 400);
    return () => clearTimeout(id);
  }, [value, detail.slug, ready]);

  // Lock background scroll while open, and flush the latest buffer on close so
  // work typed just before closing (inside the debounce window) isn't lost.
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (!readyRef.current) return;
      try {
        if (valueRef.current)
          localStorage.setItem(contentKey(detail.slug), valueRef.current);
        else localStorage.removeItem(contentKey(detail.slug));
      } catch {}
    };
  }, [detail.slug]);

  function pickLang(lang: string) {
    setSelected(lang);
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {}
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  function reset() {
    if (
      window.confirm(
        "Reset the pad back to the problem statement? Your work here will be lost.",
      )
    ) {
      setValue(buildTemplate(detail, selected));
    }
  }

  // Drop the cursor into the writing area and focus, so you can just start typing.
  const handleMount: OnMount = (editor) => {
    const line = editor.getModel()?.getLineCount() ?? 1;
    editor.setPosition({ lineNumber: line, column: 1 });
    editor.revealLine(line);
    editor.focus();
  };

  const isDark = resolvedTheme === "dark";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b px-2 sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          title="Exit to problem"
          className="h-8 w-8 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden shrink-0 text-sm font-medium tabular-nums text-muted-foreground sm:inline">
            #{detail.rank}
          </span>
          <DifficultyPill difficulty={detail.difficulty} className="shrink-0" />
          <span className="truncate text-sm font-semibold">{detail.title}</span>
        </div>

        {/* Right cluster. A timer and tab switch (whiteboard) can slot in here. */}
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 font-medium"
              >
                {selected}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-72 overflow-y-auto scrollbar-thin"
            >
              {EDITOR_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onSelect={() => pickLang(lang)}
                  className={cn(
                    "justify-between gap-6",
                    lang === selected && "font-semibold text-primary",
                  )}
                >
                  {lang}
                  {lang === selected && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <PadButton onClick={reset} title="Reset to the problem statement">
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </PadButton>
          <PadButton onClick={copy} disabled={!value} title="Copy all">
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-easy" />
                <span className="hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </PadButton>
        </div>
      </div>

      <div
        className={cn("min-h-0 flex-1", isDark ? "bg-[#1e1e1e]" : "bg-white")}
      >
        {ready && (
          <MonacoEditor
            height="100%"
            language={MONACO_LANG[selected] ?? "plaintext"}
            value={value}
            theme={isDark ? "vs-dark" : "vs"}
            beforeMount={disableLanguageServices}
            onMount={handleMount}
            onChange={(v) => setValue(v ?? "")}
            options={{ ...EDITOR_OPTIONS, ...NO_AUTOCOMPLETE }}
          />
        )}
      </div>
    </div>
  );
}

function PadButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted-foreground"
      {...props}
    >
      {children}
    </button>
  );
}
