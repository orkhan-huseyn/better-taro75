import type { Metadata } from "next";
import { RoadmapGraph } from "@/components/roadmap/roadmap-graph";
import problemsData from "@/data/problems.json";
import type { ProblemListItem } from "@/types";

const problems = problemsData as unknown as ProblemListItem[];

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "A topic-by-topic study roadmap for the Taro 75 — start with arrays & hashing, then work through the dependency graph up to graphs and dynamic programming.",
};

export default function RoadmapPage() {
  return (
    <div className="container space-y-5 py-6 sm:py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Roadmap
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          A suggested path through the {problems.length} problems. Start at the
          top with the fundamentals and follow the arrows — each topic builds on
          the ones above it. Tap any topic to see its problems and track your
          progress. Topics and their order follow the{" "}
          <a
            href="https://neetcode.io/roadmap"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium underline underline-offset-2 hover:text-foreground"
          >
            NeetCode roadmap
          </a>
          .
        </p>
      </div>

      <RoadmapGraph problems={problems} />
    </div>
  );
}
