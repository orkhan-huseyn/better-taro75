"use client";

import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { DifficultyPill } from "@/components/difficulty-pill";
import { SolvedToggle } from "@/components/solved-toggle";
import { Button } from "@/components/ui/button";
import { DIFFICULTIES, DIFFICULTY_LABEL, difficultyDotClass } from "@/lib/format";
import type { ProgressMap } from "@/lib/progress-store";
import { cn } from "@/lib/utils";
import type { Confidence, ProblemListItem } from "@/types";

interface TopicPanelProps {
  topic: string;
  problems: ProblemListItem[];
  items: ProgressMap;
  hydrated: boolean;
  onClose: () => void;
}

export function TopicPanel({
  topic,
  problems,
  items,
  hydrated,
  onClose,
}: TopicPanelProps) {
  const solved = problems.filter((p) => items[p.slug]?.solved).length;
  const total = problems.length;
  const pct = total ? Math.round((solved / total) * 100) : 0;

  const byDifficulty = DIFFICULTIES.map((d) => ({
    difficulty: d,
    count: problems.filter((p) => p.difficulty === d).length,
  })).filter((x) => x.count > 0);

  return (
    <section className="rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4 sm:p-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight">{topic}</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {pct}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            <span
              className={cn(
                "font-semibold text-foreground tabular-nums",
                !hydrated && "opacity-40",
              )}
            >
              {solved}
            </span>{" "}
            of {total} solved
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
            {byDifficulty.map((x) => (
              <span
                key={x.difficulty}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    difficultyDotClass(x.difficulty),
                  )}
                />
                {x.count} {DIFFICULTY_LABEL[x.difficulty]}
              </span>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close topic"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ul className="divide-y">
        {problems.map((p) => (
          <ProblemLine
            key={p.slug}
            problem={p}
            solved={!!items[p.slug]?.solved}
            confidence={items[p.slug]?.confidence ?? null}
          />
        ))}
      </ul>
    </section>
  );
}

function ProblemLine({
  problem,
  solved,
  confidence,
}: {
  problem: ProblemListItem;
  solved: boolean;
  confidence: Confidence | null;
}) {
  return (
    <li className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/50 sm:px-5">
      <SolvedToggle slug={problem.slug} solved={solved} size="sm" />
      <span className="w-8 shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
        #{problem.rank}
      </span>
      <Link
        href={`/questions/${problem.slug}`}
        className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary hover:underline"
      >
        {problem.title}
      </Link>
      {confidence && <ConfidenceBadge confidence={confidence} />}
      <DifficultyPill difficulty={problem.difficulty} />
      <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 sm:block" />
    </li>
  );
}
