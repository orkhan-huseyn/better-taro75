import { DIFFICULTY_LABEL, difficultyPillClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";

export function DifficultyPill({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        difficultyPillClass(difficulty),
        className,
      )}
    >
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  );
}
