import { DIFFICULTIES, DIFFICULTY_LABEL, difficultyDotClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";

export interface DifficultyStat {
  solved: number;
  total: number;
}

interface ProgressSummaryProps {
  solved: number;
  total: number;
  byDifficulty: Record<Difficulty, DifficultyStat>;
  hydrated: boolean;
}

export function ProgressSummary({
  solved,
  total,
  byDifficulty,
  hydrated,
}: ProgressSummaryProps) {
  const pct = total ? Math.round((solved / total) * 100) : 0;

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Your progress
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={cn(
                "text-4xl font-bold tabular-nums tracking-tight transition-opacity",
                !hydrated && "opacity-40",
              )}
            >
              {solved}
            </span>
            <span className="text-lg font-medium text-muted-foreground">
              / {total} solved
            </span>
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
              {pct}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {DIFFICULTIES.map((d) => (
            <DifficultyStatCard
              key={d}
              difficulty={d}
              stat={byDifficulty[d]}
              hydrated={hydrated}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}

function DifficultyStatCard({
  difficulty,
  stat,
  hydrated,
}: {
  difficulty: Difficulty;
  stat: DifficultyStat;
  hydrated: boolean;
}) {
  return (
    <div className="min-w-[4.5rem]">
      <div className="flex items-center gap-1.5">
        <span className={cn("h-2 w-2 rounded-full", difficultyDotClass(difficulty))} />
        <span className="text-xs font-medium text-muted-foreground">
          {DIFFICULTY_LABEL[difficulty]}
        </span>
      </div>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums transition-opacity",
          !hydrated && "opacity-40",
        )}
      >
        {stat.solved}
        <span className="font-normal text-muted-foreground"> / {stat.total}</span>
      </p>
    </div>
  );
}
