import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CompanyLogoStack } from "@/components/company-logo";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { DifficultyPill } from "@/components/difficulty-pill";
import { SolvedToggle } from "@/components/solved-toggle";
import { cn } from "@/lib/utils";
import type { Confidence, CompanyRef, ProblemListItem } from "@/types";

interface ProblemRowProps {
  problem: ProblemListItem;
  companies: CompanyRef[];
  solved: boolean;
  confidence: Confidence | null;
}

export function ProblemRow({
  problem,
  companies,
  solved,
  confidence,
}: ProblemRowProps) {
  return (
    <article
      className={cn(
        "group relative rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md",
        solved && "border-easy/30 bg-easy/[0.03]",
      )}
    >
      <Link
        href={`/questions/${problem.slug}`}
        aria-label={`Open ${problem.title}`}
        className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="flex gap-3 sm:gap-4">
        {/* Rank + solved toggle */}
        <div className="relative z-10 flex flex-col items-center gap-2 pt-0.5">
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            #{problem.rank}
          </span>
          <SolvedToggle slug={problem.slug} solved={solved} size="md" />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold leading-tight">
                {problem.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {problem.preview}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <DifficultyPill difficulty={problem.difficulty} />
              {confidence && <ConfidenceBadge confidence={confidence} />}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <CompanyLogoStack companies={companies} max={6} />
            <div className="flex flex-wrap items-center gap-1.5">
              {problem.topics.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {t}
                </span>
              ))}
              <ChevronRight className="ml-1 hidden h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 sm:block" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
