"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { TopicPanel } from "@/components/roadmap/topic-panel";
import { DIFFICULTY_ORDER } from "@/lib/format";
import { useHydratedProgress, useProgressStore } from "@/lib/progress-store";
import {
  CANVAS_H,
  CANVAS_W,
  edgePath,
  NODE_H,
  NODE_W,
  nodeCx,
  nodeCy,
  ROADMAP_EDGES,
  ROADMAP_NODES,
  type RoadmapNode,
} from "@/lib/roadmap";
import { cn } from "@/lib/utils";
import type { ProblemListItem } from "@/types";

interface RoadmapGraphProps {
  problems: ProblemListItem[];
}

interface TopicStat {
  solved: number;
  total: number;
}

export function RoadmapGraph({ problems }: RoadmapGraphProps) {
  const hydrated = useHydratedProgress();
  const items = useProgressStore((s) => s.items);

  const [selected, setSelected] = React.useState<string | null>(null);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // topic -> problems, sorted easy → hard (rank breaks ties)
  const byTopic = React.useMemo(() => {
    const m = new Map<string, ProblemListItem[]>();
    for (const p of problems) {
      for (const t of p.topics) {
        const list = m.get(t);
        if (list) list.push(p);
        else m.set(t, [p]);
      }
    }
    for (const list of m.values())
      list.sort(
        (a, b) =>
          DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] ||
          a.rank - b.rank,
      );
    return m;
  }, [problems]);

  const statFor = React.useCallback(
    (topic: string): TopicStat => {
      const list = byTopic.get(topic) ?? [];
      const solved = list.filter((p) => items[p.slug]?.solved).length;
      return { solved, total: list.length };
    },
    [byTopic, items],
  );

  const nodeByTopic = React.useMemo(() => {
    const m = new Map<string, RoadmapNode>();
    for (const n of ROADMAP_NODES) m.set(n.topic, n);
    return m;
  }, []);

  const focus = hovered ?? selected;

  function handleSelect(topic: string) {
    setSelected((cur) => (cur === topic ? null : topic));
    // Defer scroll until the panel has rendered.
    requestAnimationFrame(() =>
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  }

  const selectedProblems = selected ? byTopic.get(selected) ?? [] : [];

  return (
    <div className="space-y-5">
      <Legend />

      <div className="overflow-x-auto pb-3 scrollbar-thin">
        <div
          className="relative mx-auto"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        >
          {/* Edges */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={CANVAS_W}
            height={CANVAS_H}
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            fill="none"
            aria-hidden
          >
            {ROADMAP_EDGES.map((e) => {
              const from = nodeByTopic.get(e.from);
              const to = nodeByTopic.get(e.to);
              if (!from || !to) return null;
              const active =
                focus != null && (e.from === focus || e.to === focus);
              return (
                <path
                  key={`${e.from}->${e.to}`}
                  d={edgePath(from, to)}
                  className={cn(
                    "transition-all duration-200",
                    active
                      ? "stroke-primary"
                      : "stroke-border",
                  )}
                  strokeWidth={active ? 2.5 : 1.75}
                  strokeOpacity={focus != null && !active ? 0.4 : 1}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {ROADMAP_NODES.map((n) => {
            const stat = statFor(n.topic);
            const connected =
              focus != null &&
              (n.topic === focus ||
                ROADMAP_EDGES.some(
                  (e) =>
                    (e.from === focus && e.to === n.topic) ||
                    (e.to === focus && e.from === n.topic),
                ));
            return (
              <TopicNode
                key={n.topic}
                node={n}
                stat={stat}
                hydrated={hydrated}
                selected={selected === n.topic}
                dimmed={focus != null && !connected}
                onSelect={() => handleSelect(n.topic)}
                onHoverChange={(h) => setHovered(h ? n.topic : null)}
              />
            );
          })}
        </div>
      </div>

      <div ref={panelRef} className="scroll-mt-24">
        {selected && (
          <TopicPanel
            topic={selected}
            problems={selectedProblems}
            items={items}
            hydrated={hydrated}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}

function TopicNode({
  node,
  stat,
  hydrated,
  selected,
  dimmed,
  onSelect,
  onHoverChange,
}: {
  node: RoadmapNode;
  stat: TopicStat;
  hydrated: boolean;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
  onHoverChange: (hovered: boolean) => void;
}) {
  const pct = stat.total ? (stat.solved / stat.total) * 100 : 0;
  const done = stat.total > 0 && stat.solved === stat.total;
  const started = stat.solved > 0 && !done;
  const isStart = node.row === 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
      onBlur={() => onHoverChange(false)}
      aria-pressed={selected}
      style={{
        position: "absolute",
        left: nodeCx(node.col) - NODE_W / 2,
        top: nodeCy(node.row) - NODE_H / 2,
        width: NODE_W,
        height: NODE_H,
      }}
      className={cn(
        "group z-10 flex flex-col justify-between rounded-xl border bg-card p-2.5 text-left shadow-sm outline-none transition-all",
        "hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring",
        done && "border-easy/45 bg-easy/[0.07]",
        started && !done && "border-primary/50 bg-primary/[0.05]",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        dimmed && "opacity-45",
      )}
    >
      <div className="flex items-start justify-between gap-1.5">
        <span className="line-clamp-2 text-sm font-semibold leading-tight">
          {node.topic}
        </span>
        {done ? (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-easy text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : isStart ? (
          <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
            Start
          </span>
        ) : null}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-medium">
          <span
            className={cn(
              "tabular-nums text-muted-foreground",
              !hydrated && "opacity-40",
            )}
          >
            <span className="text-foreground">{stat.solved}</span>/{stat.total}
          </span>
          {node.blurb && (
            <span className="ml-1 hidden truncate text-muted-foreground/70 sm:inline">
              {node.blurb}
            </span>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              done ? "bg-easy" : "bg-primary",
            )}
            style={{ width: `${hydrated ? pct : 0}%` }}
          />
        </div>
      </div>
    </button>
  );
}

function Legend() {
  const dots: { label: string; className: string }[] = [
    { label: "Not started", className: "border-border bg-card" },
    { label: "In progress", className: "border-primary/50 bg-primary/20" },
    { label: "Complete", className: "border-easy/50 bg-easy" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <span className="font-medium">Legend:</span>
      {dots.map((d) => (
        <span key={d.label} className="flex items-center gap-1.5">
          <span className={cn("h-3 w-3 rounded border", d.className)} />
          {d.label}
        </span>
      ))}
      <span className="hidden items-center gap-1.5 sm:flex">
        <span className="h-px w-6 bg-border" />
        Prerequisite
      </span>
    </div>
  );
}
