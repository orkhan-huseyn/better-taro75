"use client";

import { StickyNote } from "lucide-react";
import { SolvedToggle } from "@/components/solved-toggle";
import { CONFIDENCE_META, CONFIDENCE_ORDER } from "@/lib/format";
import { selectProgress, useProgressStore } from "@/lib/progress-store";
import { cn } from "@/lib/utils";

export function ProgressPanel({ slug }: { slug: string }) {
  const progress = useProgressStore(selectProgress(slug));
  const setConfidence = useProgressStore((s) => s.setConfidence);
  const setNote = useProgressStore((s) => s.setNote);

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">Your progress</span>
        <SolvedToggle slug={slug} solved={progress.solved} size="lg" withLabel />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          How confident are you?
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {CONFIDENCE_ORDER.map((c) => {
            const active = progress.confidence === c;
            const meta = CONFIDENCE_META[c];
            return (
              <button
                key={c}
                type="button"
                onClick={() => setConfidence(slug, active ? null : c)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border py-2 text-xs font-medium transition-colors",
                  active
                    ? cn(meta.className, "border-transparent")
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                {meta.short}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor={`note-${slug}`}
          className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          <StickyNote className="h-3.5 w-3.5" /> Notes
        </label>
        <textarea
          id={`note-${slug}`}
          value={progress.note}
          onChange={(e) => setNote(slug, e.target.value)}
          placeholder="Jot down the key idea, gotchas, or a link…"
          className="min-h-[6rem] w-full resize-y rounded-lg border border-input bg-background p-2.5 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}
