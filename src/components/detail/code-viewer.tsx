"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CodeBlock } from "@/types";

const LANG_PREF_KEY = "better-taro75:lang";

export function CodeViewer({
  languages,
  code,
}: {
  languages: string[];
  code: Record<string, CodeBlock>;
}) {
  const [selected, setSelected] = React.useState(languages[0]);
  const [copied, setCopied] = React.useState(false);

  // Apply a stored language preference on mount (client-only to avoid mismatch).
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

  async function copy() {
    try {
      await navigator.clipboard.writeText(code[selected]?.code ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  const block = code[selected] ?? code[languages[0]];

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-1.5 py-1.5">
        <div className="flex flex-1 items-center gap-0.5 overflow-x-auto scrollbar-thin">
          {languages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => pick(lang)}
              className={cn(
                "whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                lang === selected
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {lang}
            </button>
          ))}
        </div>
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
      <div
        className="max-h-[34rem] overflow-y-auto scrollbar-thin"
        dangerouslySetInnerHTML={{ __html: block?.html ?? "" }}
      />
    </div>
  );
}
