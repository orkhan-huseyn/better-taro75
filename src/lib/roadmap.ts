// The learning roadmap — a NeetCode-style dependency graph of topics.
//
// Categories and their prerequisite edges are taken from neetcode.io's own
// roadmap (neetcode.io/roadmap). We include the 14 categories that at least one
// of our problems falls under; NeetCode's four remaining categories (Tries,
// Advanced Graphs, 2-D Dynamic Programming, Bit Manipulation) have no problems
// in this list and are omitted. Each `topic` matches a category used in the
// problem data / topics.json exactly.
//
// Positions are given on a virtual grid (`row`, `col`); the graph component
// turns them into pixel coordinates. `col` may be fractional to centre a row.

export interface RoadmapNode {
  /** Category name — must match the `topics` values in the problem data. */
  topic: string;
  /** Vertical tier (0 = top). */
  row: number;
  /** Horizontal grid column (0-based, may be fractional). */
  col: number;
  /** Optional one-line hint shown on the node. */
  blurb?: string;
}

export interface RoadmapEdge {
  /** Prerequisite category. */
  from: string;
  /** Category that builds on `from`. */
  to: string;
}

export const ROADMAP_NODES: RoadmapNode[] = [
  // Tier 0 — foundation
  { topic: "Arrays & Hashing", row: 0, col: 2 },

  // Tier 1
  { topic: "Two Pointers", row: 1, col: 1 },
  { topic: "Stack", row: 1, col: 3 },

  // Tier 2
  { topic: "Binary Search", row: 2, col: 0 },
  { topic: "Sliding Window", row: 2, col: 1 },
  { topic: "Linked List", row: 2, col: 2 },

  // Tier 3
  { topic: "Trees", row: 3, col: 1 },

  // Tier 4
  { topic: "Heap / Priority Queue", row: 4, col: 0.5 },
  { topic: "Backtracking", row: 4, col: 2.5 },

  // Tier 5
  { topic: "Intervals", row: 5, col: 0 },
  { topic: "Greedy", row: 5, col: 1 },
  { topic: "Graphs", row: 5, col: 2.5 },
  { topic: "Dynamic Programming", row: 5, col: 3.5 },

  // Tier 6
  { topic: "Math & Geometry", row: 6, col: 2.5 },
];

// Prerequisite edges (parent → child), from NeetCode's roadmap, restricted to
// the categories present above.
export const ROADMAP_EDGES: RoadmapEdge[] = [
  { from: "Arrays & Hashing", to: "Two Pointers" },
  { from: "Arrays & Hashing", to: "Stack" },

  { from: "Two Pointers", to: "Binary Search" },
  { from: "Two Pointers", to: "Sliding Window" },
  { from: "Two Pointers", to: "Linked List" },

  { from: "Binary Search", to: "Trees" },
  { from: "Linked List", to: "Trees" },

  { from: "Trees", to: "Heap / Priority Queue" },
  { from: "Trees", to: "Backtracking" },

  { from: "Heap / Priority Queue", to: "Intervals" },
  { from: "Heap / Priority Queue", to: "Greedy" },
  { from: "Backtracking", to: "Graphs" },
  { from: "Backtracking", to: "Dynamic Programming" },

  { from: "Graphs", to: "Math & Geometry" },
];

// ----- Layout geometry (virtual canvas coordinates, in px) -----

export const NODE_W = 190;
export const NODE_H = 84;
/** Centre-to-centre horizontal distance between columns. */
export const COL_W = 214;
/** Centre-to-centre vertical distance between rows. */
export const ROW_H = 156;
/** Padding around the node field inside the canvas. */
export const MARGIN = 28;

const maxCol = Math.max(...ROADMAP_NODES.map((n) => n.col));
const maxRow = Math.max(...ROADMAP_NODES.map((n) => n.row));

export const CANVAS_W = MARGIN * 2 + NODE_W + maxCol * COL_W;
export const CANVAS_H = MARGIN * 2 + NODE_H + maxRow * ROW_H;

/** Centre x of a node at the given grid column. */
export function nodeCx(col: number): number {
  return MARGIN + NODE_W / 2 + col * COL_W;
}

/** Centre y of a node at the given grid row. */
export function nodeCy(row: number): number {
  return MARGIN + NODE_H / 2 + row * ROW_H;
}

/**
 * A smooth vertical S-curve connecting a parent node's bottom edge to a child
 * node's top edge, as an SVG path `d` string.
 */
export function edgePath(from: RoadmapNode, to: RoadmapNode): string {
  const x1 = nodeCx(from.col);
  const y1 = nodeCy(from.row) + NODE_H / 2;
  const x2 = nodeCx(to.col);
  const y2 = nodeCy(to.row) - NODE_H / 2;
  const dy = (y2 - y1) * 0.5;
  return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
}
