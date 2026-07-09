"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { CompanyLogo } from "@/components/company-logo";
import { Prose } from "@/components/detail/prose";
import { ProgressPanel } from "@/components/detail/progress-panel";
import { SolutionView } from "@/components/detail/solution-view";
import { DifficultyPill } from "@/components/difficulty-pill";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProblemDetail, Solution } from "@/types";

export function ProblemDetailView({ detail }: { detail: ProblemDetail }) {
  const { optimal, bruteForce } = detail.solutions;
  const solutionTabs = [
    bruteForce && {
      value: "brute",
      label: "Brute force",
      solution: bruteForce,
    },
    optimal && {
      value: "optimal", 
      label: "Optimal",
      solution: optimal,
    },
  ].filter(Boolean) as { value: string; label: string; solution: Solution }[];

  return (
    <div className="container max-w-6xl py-6 sm:py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All problems
      </Link>

      {/* Header */}
      <header className="mt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="tabular-nums">#{detail.rank}</span>
          <span>·</span>
          <DifficultyPill difficulty={detail.difficulty} />
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {detail.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {detail.topics.map((t) => (
            <span
              key={t}
              className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {t}
            </span>
          ))}
          {detail.numViews != null && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              {detail.numViews.toLocaleString()} views
            </span>
          )}
          {detail.externalUrl && (
            <Button variant="outline" size="sm" asChild className="ml-auto">
              <a
                href={detail.externalUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <ExternalLink className="h-3.5 w-3.5" /> LeetCode
              </a>
            </Button>
          )}
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Main column */}
        <div className="min-w-0 space-y-4">
          <Section title="Problem">
            <Prose html={detail.questionBody} />
          </Section>

          {detail.clarifyingQuestions.length > 0 && (
            <CollapsibleSection
              title="Clarifying questions"
              icon={<CircleHelp className="h-4 w-4 text-primary" />}
              count={detail.clarifyingQuestions.length}
            >
              <ul className="space-y-2.5">
                {detail.clarifyingQuestions.map((q, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                    <span className="text-muted-foreground">
                      <InlineText text={q} />
                    </span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {detail.edgeCases.length > 0 && (
            <CollapsibleSection
              title="Edge cases"
              icon={<ShieldAlert className="h-4 w-4 text-primary" />}
              count={detail.edgeCases.length}
            >
              <ul className="space-y-3">
                {detail.edgeCases.map((e, i) => (
                  <li key={i} className="text-sm">
                    <p className="font-medium">
                      <InlineText text={e.edgeCase} />
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                      <InlineText text={e.handling} />
                    </p>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {solutionTabs.length > 0 && (
            <Section title="Solution">
              {solutionTabs.length === 1 ? (
                <SolutionView solution={solutionTabs[0].solution} />
              ) : (
                <Tabs defaultValue={solutionTabs[0].value}>
                  <TabsList>
                    {solutionTabs.map((t) => (
                      <TabsTrigger key={t.value} value={t.value}>
                        {t.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {solutionTabs.map((t) => (
                    <TabsContent key={t.value} value={t.value}>
                      <SolutionView solution={t.solution} />
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <aside>
          <div className="space-y-4 lg:sticky lg:top-20">
            <ProgressPanel slug={detail.slug} />
            {detail.companies.length > 0 && (
              <div className="rounded-2xl border bg-card p-4 shadow-sm">
                <p className="mb-3 text-sm font-semibold">
                  Asked at{" "}
                  <span className="text-muted-foreground">
                    {detail.companies.length} companies
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {detail.companies.map((c) => (
                    <span
                      key={c.slug}
                      className="inline-flex items-center gap-1.5 rounded-full border bg-background py-0.5 pl-0.5 pr-2 text-xs"
                      title={c.name}
                    >
                      <CompanyLogo company={c} size={18} />
                      <span className="max-w-[9rem] truncate">{c.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 flex items-center gap-1.5 text-base font-semibold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

// Native <details> panel — collapsed by default, no JS/hydration cost.
function CollapsibleSection({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <details className="rounded-2xl border bg-card shadow-sm">
      <summary className="flex cursor-pointer select-none items-center gap-1.5 p-4 text-base font-semibold sm:p-5">
        {icon}
        <span>{title}</span>
        {count != null && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        )}
        <ChevronDown className="details-chevron ml-auto h-4 w-4 text-muted-foreground transition-transform" />
      </summary>
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
    </details>
  );
}

// Render `inline code` spans in plain-text strings from Taro.
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={i}
            className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}
