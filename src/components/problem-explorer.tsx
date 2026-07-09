"use client";

import * as React from "react";
import {
  ArrowUpDown,
  Building2,
  Filter,
  Search,
  Tags,
  X,
} from "lucide-react";
import { CompanyLogo } from "@/components/company-logo";
import {
  ProgressSummary,
  type DifficultyStat,
} from "@/components/list/progress-summary";
import { ProblemRow } from "@/components/list/problem-row";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  CONFIDENCE_META,
  CONFIDENCE_ORDER,
  DIFFICULTIES,
  DIFFICULTY_LABEL,
  DIFFICULTY_ORDER,
  difficultyDotClass,
} from "@/lib/format";
import {
  selectProgress,
  useHydratedProgress,
  useProgressStore,
} from "@/lib/progress-store";
import { cn } from "@/lib/utils";
import type {
  CompanyFacet,
  CompanyRef,
  Confidence,
  Difficulty,
  ProblemListItem,
  TopicFacet,
} from "@/types";

type StatusFilter = "all" | "unsolved" | "solved";

const SORTS = [
  { value: "rank-asc", label: "Rank (1 → 75)" },
  { value: "title-asc", label: "Title (A → Z)" },
  { value: "difficulty-asc", label: "Difficulty (Easy → Hard)" },
  { value: "difficulty-desc", label: "Difficulty (Hard → Easy)" },
  { value: "companies-desc", label: "Most asked" },
  { value: "companies-asc", label: "Fewest companies" },
] as const;
type SortValue = (typeof SORTS)[number]["value"];

interface ProblemExplorerProps {
  problems: ProblemListItem[];
  companies: CompanyFacet[];
  topics: TopicFacet[];
  total: number;
}

export function ProblemExplorer({
  problems,
  companies,
  topics,
  total,
}: ProblemExplorerProps) {
  const hydrated = useHydratedProgress();
  const items = useProgressStore((s) => s.items);

  const [search, setSearch] = React.useState("");
  const [difficulties, setDifficulties] = React.useState<Difficulty[]>([]);
  const [topicFilter, setTopicFilter] = React.useState<string[]>([]);
  const [companyFilter, setCompanyFilter] = React.useState<string[]>([]);
  const [confidenceFilter, setConfidenceFilter] = React.useState<Confidence[]>(
    [],
  );
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [sort, setSort] = React.useState<SortValue>("rank-asc");

  const companiesBySlug = React.useMemo(() => {
    const map = new Map<string, CompanyRef>();
    for (const c of companies)
      map.set(c.slug, { slug: c.slug, name: c.name, logo: c.logo });
    return map;
  }, [companies]);

  const resolveCompanies = React.useCallback(
    (slugs: string[]): CompanyRef[] =>
      slugs.map(
        (s) =>
          companiesBySlug.get(s) ?? { slug: s, name: s, logo: null },
      ),
    [companiesBySlug],
  );

  const progressFor = React.useCallback(
    (slug: string) => items[slug] ?? null,
    [items],
  );

  // ----- Derived: filtered + sorted list -----
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const diffSet = new Set(difficulties);
    const topicSet = new Set(topicFilter);
    const companySet = new Set(companyFilter);
    const confSet = new Set(confidenceFilter);

    const rows = problems.filter((p) => {
      if (q) {
        const hay = `${p.title} ${p.preview} ${p.topics.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (diffSet.size && !diffSet.has(p.difficulty)) return false;
      if (topicSet.size && !p.topics.some((t) => topicSet.has(t))) return false;
      if (companySet.size && !p.companies.some((c) => companySet.has(c)))
        return false;

      const prog = items[p.slug];
      const isSolved = !!prog?.solved;
      if (status === "solved" && !isSolved) return false;
      if (status === "unsolved" && isSolved) return false;

      if (confSet.size) {
        if (!prog?.confidence || !confSet.has(prog.confidence)) return false;
      }
      return true;
    });

    const [key, dir] = sort.split("-") as [string, "asc" | "desc"];
    const sign = dir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      let cmp = 0;
      if (key === "rank") cmp = a.rank - b.rank;
      else if (key === "title") cmp = a.title.localeCompare(b.title);
      else if (key === "difficulty")
        cmp =
          DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] ||
          a.rank - b.rank;
      else if (key === "companies")
        cmp = a.companyCount - b.companyCount || a.rank - b.rank;
      return cmp * sign;
    });
    return rows;
  }, [
    problems,
    items,
    search,
    difficulties,
    topicFilter,
    companyFilter,
    confidenceFilter,
    status,
    sort,
  ]);

  // ----- Summary stats -----
  const summary = React.useMemo(() => {
    const byDifficulty = {
      easy: { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 },
    } as Record<Difficulty, DifficultyStat>;
    let solved = 0;
    for (const p of problems) {
      byDifficulty[p.difficulty].total += 1;
      if (items[p.slug]?.solved) {
        solved += 1;
        byDifficulty[p.difficulty].solved += 1;
      }
    }
    return { solved, byDifficulty };
  }, [problems, items]);

  const topicOptions = topics.map((t) => ({
    value: t.name,
    label: t.name,
    count: t.count,
  }));
  const companyOptions = companies.map((c) => ({
    value: c.slug,
    label: c.name,
    count: c.count,
    icon: <CompanyLogo company={c} size={18} />,
  }));
  const confidenceOptions = CONFIDENCE_ORDER.map((c) => ({
    value: c,
    label: CONFIDENCE_META[c].label,
    icon: (
      <span className={cn("h-2 w-2 rounded-full", CONFIDENCE_META[c].dot)} />
    ),
  }));

  const activeCount =
    (search ? 1 : 0) +
    difficulties.length +
    topicFilter.length +
    companyFilter.length +
    confidenceFilter.length +
    (status !== "all" ? 1 : 0);

  function resetFilters() {
    setSearch("");
    setDifficulties([]);
    setTopicFilter([]);
    setCompanyFilter([]);
    setConfidenceFilter([]);
    setStatus("all");
  }

  const currentSortLabel = SORTS.find((s) => s.value === sort)?.label;

  return (
    <div className="container space-y-5 py-6 sm:py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Taro 75
        </h1>
        <p className="text-sm text-muted-foreground">
          The {total} most frequently asked DSA interview questions — filter,
          sort, and track what you&apos;ve solved.
        </p>
      </div>

      <ProgressSummary
        solved={summary.solved}
        total={total}
        byDifficulty={summary.byDifficulty}
        hydrated={hydrated}
      />

      {/* Filter bar */}
      <div className="sticky top-14 z-30 -mx-4 border-y bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[12rem] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems…"
                className="pl-8"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{currentSortLabel}</span>
                  <span className="sm:hidden">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[14rem]">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                {SORTS.map((s) => (
                  <DropdownMenuItem
                    key={s.value}
                    onSelect={() => setSort(s.value)}
                    className={cn(
                      sort === s.value && "font-semibold text-primary",
                    )}
                  >
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DifficultySegmented
              value={difficulties}
              onChange={setDifficulties}
            />
            <StatusSegmented value={status} onChange={setStatus} />
            <MultiSelect
              label="Topics"
              icon={<Tags className="h-3.5 w-3.5" />}
              options={topicOptions}
              selected={topicFilter}
              onChange={setTopicFilter}
            />
            <MultiSelect
              label="Companies"
              icon={<Building2 className="h-3.5 w-3.5" />}
              options={companyOptions}
              selected={companyFilter}
              onChange={setCompanyFilter}
              searchable
              searchPlaceholder="Search companies…"
            />
            <MultiSelect
              label="Confidence"
              icon={<Filter className="h-3.5 w-3.5" />}
              options={confidenceOptions}
              selected={confidenceFilter}
              onChange={(v) => setConfidenceFilter(v as Confidence[])}
            />
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-muted-foreground"
                onClick={resetFilters}
              >
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filtered.length}
          </span>{" "}
          of {total}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((p) => {
            const prog = progressFor(p.slug);
            return (
              <ProblemRow
                key={p.slug}
                problem={p}
                companies={resolveCompanies(p.companies)}
                solved={!!prog?.solved}
                confidence={prog?.confidence ?? null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function DifficultySegmented({
  value,
  onChange,
}: {
  value: Difficulty[];
  onChange: (v: Difficulty[]) => void;
}) {
  const set = new Set(value);
  return (
    <div className="flex h-9 items-center rounded-md border bg-background p-0.5">
      {DIFFICULTIES.map((d) => {
        const active = set.has(d);
        return (
          <button
            key={d}
            type="button"
            onClick={() =>
              onChange(active ? value.filter((x) => x !== d) : [...value, d])
            }
            className={cn(
              "flex h-full items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors",
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", difficultyDotClass(d))} />
            <span className="hidden sm:inline">{DIFFICULTY_LABEL[d]}</span>
          </button>
        );
      })}
    </div>
  );
}

function StatusSegmented({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}) {
  const opts: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unsolved", label: "To do" },
    { value: "solved", label: "Solved" },
  ];
  return (
    <div className="flex h-9 items-center rounded-md border bg-background p-0.5">
      {opts.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "h-full rounded px-2.5 text-xs font-medium transition-colors",
            value === o.value
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <Search className="h-8 w-8 text-muted-foreground/50" />
      <div>
        <p className="font-medium">No problems match your filters</p>
        <p className="text-sm text-muted-foreground">
          Try loosening the difficulty, topic or company filters.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onReset}>
        Clear all filters
      </Button>
    </div>
  );
}
