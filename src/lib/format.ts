import type { Confidence, Difficulty } from "@/types";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

// Text + subtle background for a difficulty pill.
export function difficultyPillClass(d: Difficulty): string {
  switch (d) {
    case "easy":
      return "text-easy bg-easy/10 ring-1 ring-inset ring-easy/25";
    case "medium":
      return "text-medium bg-medium/10 ring-1 ring-inset ring-medium/25";
    case "hard":
      return "text-hard bg-hard/10 ring-1 ring-inset ring-hard/25";
  }
}

export function difficultyDotClass(d: Difficulty): string {
  return d === "easy" ? "bg-easy" : d === "medium" ? "bg-medium" : "bg-hard";
}

export const CONFIDENCE_META: Record<
  Confidence,
  { label: string; short: string; className: string; dot: string }
> = {
  shaky: {
    label: "Shaky",
    short: "Shaky",
    className: "text-hard bg-hard/10 ring-1 ring-inset ring-hard/25",
    dot: "bg-hard",
  },
  good: {
    label: "Getting there",
    short: "Good",
    className: "text-medium bg-medium/10 ring-1 ring-inset ring-medium/25",
    dot: "bg-medium",
  },
  solid: {
    label: "Solid",
    short: "Solid",
    className: "text-easy bg-easy/10 ring-1 ring-inset ring-easy/25",
    dot: "bg-easy",
  },
};

export const CONFIDENCE_ORDER: Confidence[] = ["shaky", "good", "solid"];
