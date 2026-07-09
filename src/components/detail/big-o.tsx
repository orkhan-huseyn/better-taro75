import { cn } from "@/lib/utils";

export function BigO({
  label,
  value,
  explanation,
  className,
}: {
  label: string;
  value: string;
  explanation: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-muted/30 p-3.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-sm font-semibold text-primary">
          {value || "—"}
        </span>
      </div>
      {explanation && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {explanation}
        </p>
      )}
    </div>
  );
}
