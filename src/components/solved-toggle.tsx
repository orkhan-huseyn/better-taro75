"use client";

import { Check } from "lucide-react";
import { useProgressStore } from "@/lib/progress-store";
import { cn } from "@/lib/utils";

interface SolvedToggleProps {
  slug: string;
  solved: boolean;
  size?: "sm" | "md" | "lg";
  withLabel?: boolean;
  className?: string;
}

const SIZES = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-7 w-7",
};

export function SolvedToggle({
  slug,
  solved,
  size = "md",
  withLabel = false,
  className,
}: SolvedToggleProps) {
  const toggleSolved = useProgressStore((s) => s.toggleSolved);

  const circle = (
    <span
      className={cn(
        "flex items-center justify-center rounded-full border-2 transition-colors",
        SIZES[size],
        solved
          ? "border-easy bg-easy text-white"
          : "border-muted-foreground/30 text-transparent group-hover/solve:border-easy/60",
      )}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  );

  return (
    <button
      type="button"
      aria-pressed={solved}
      aria-label={solved ? "Mark as not solved" : "Mark as solved"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSolved(slug);
      }}
      className={cn(
        "group/solve inline-flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full",
        withLabel && "rounded-md",
        className,
      )}
    >
      {circle}
      {withLabel && (
        <span
          className={cn(
            "text-sm font-medium",
            solved ? "text-easy" : "text-muted-foreground",
          )}
        >
          {solved ? "Solved" : "Mark solved"}
        </span>
      )}
    </button>
  );
}
