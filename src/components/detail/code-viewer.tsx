"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Check, ChevronDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MONACO_LANG } from "@/lib/monaco";
import { cn } from "@/lib/utils";

// Monaco is client-only and loads its assets lazily (via the default CDN loader),
// so keep it out of SSR entirely.
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Loading editor…
      </div>
    ),
  },
);

const LANG_PREF_KEY = "better-taro75:lang";
const LINE_HEIGHT = 20;

export function CodeViewer({
  languages,
  code,
}: {
  languages: string[];
  code: Record<string, string>;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const defaultLang = languages.includes("Python") ? "Python" : languages[0];
  const [selected, setSelected] = React.useState(defaultLang);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Restore the reader's preferred language on mount.
  React.useEffect(() => {
    const pref = localStorage.getItem(LANG_PREF_KEY);
    if (pref && languages.includes(pref)) setSelected(pref);
  }, [languages]);

  function pick(lang: string) {
    setSelected(lang);
    try {
      localStorage.setItem(LANG_PREF_KEY, lang);
    } catch {}
  }

  const source = code[selected] ?? code[languages[0]] ?? "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  const isDark = mounted && resolvedTheme === "dark";
  const lineCount = source.split("\n").length;
  const height = Math.min(Math.max(lineCount * LINE_HEIGHT + 24, 140), 560);

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-2 py-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 font-medium"
            >
              {selected}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-h-72 overflow-y-auto scrollbar-thin"
          >
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang}
                onSelect={() => pick(lang)}
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
        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-easy" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <div className={isDark ? "bg-[#1e1e1e]" : "bg-white"}>
        <MonacoEditor
          height={height}
          language={MONACO_LANG[selected] ?? "plaintext"}
          value={source}
          theme={isDark ? "vs-dark" : "vs"}
          options={{
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            lineHeight: LINE_HEIGHT,
            fontSize: 13,
            fontFamily:
              "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
            fontLigatures: false,
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: {
              alwaysConsumeMouseWheel: false,
              verticalScrollbarSize: 9,
              horizontalScrollbarSize: 9,
            },
            padding: { top: 12, bottom: 12 },
            folding: false,
            glyphMargin: false,
            contextmenu: false,
            guides: { indentation: false },
            wordWrap: "off",
            automaticLayout: true,
            tabSize: 4,
            stickyScroll: { enabled: false },
          }}
        />
      </div>
    </div>
  );
}
