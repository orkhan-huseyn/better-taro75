import { ListChecks } from "lucide-react";
import { BigO } from "@/components/detail/big-o";
import { CodeViewer } from "@/components/detail/code-viewer";
import type { Solution } from "@/types";

export function SolutionView({ solution }: { solution: Solution }) {
  return (
    <div className="space-y-5">
      {solution.overview && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {solution.overview}
        </p>
      )}

      {solution.steps.length > 0 && (
        <div>
          <h4 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold">
            <ListChecks className="h-4 w-4 text-primary" />
            Approach
          </h4>
          <ol className="space-y-2">
            {solution.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <BigO
          label="Time"
          value={solution.bigO.runtimeValue}
          explanation={solution.bigO.runtimeExplanation}
        />
        <BigO
          label="Space"
          value={solution.bigO.spaceValue}
          explanation={solution.bigO.spaceExplanation}
        />
      </div>

      {solution.languages.length > 0 && (
        <CodeViewer languages={solution.languages} code={solution.code} />
      )}
    </div>
  );
}
