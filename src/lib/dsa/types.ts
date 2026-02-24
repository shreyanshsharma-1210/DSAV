// Unified frame type for the multi-shape visualizer.
// A frame is one rendered "step" of an algorithm.

export type DSCategory =
  | "Array"
  | "Sorting"
  | "Searching"
  | "Linked List"
  | "Stack"
  | "Queue"
  | "Tree"
  | "Graph";

export type Difficulty = "Easy" | "Medium" | "Hard";

// ---------- Shape variants ----------

export type ArrayShape = {
  kind: "array";
  values: number[];
  /** indices currently being inspected/compared */
  compare?: number[];
  /** indices about to swap */
  swap?: number[];
  /** indices marked as final */
  done?: number[];
  /** named pointers (e.g. low/high/mid, i/j) */
  pointers?: Record<string, number>;
  /** out of bounds or general error markers */
  error?: number[] | boolean;
};

export type ListNodeView = { id: number; value: number };
export type ListShape = {
  kind: "list";
  nodes: ListNodeView[];
  pointers?: Record<string, number | null>; // pointer name → node index (or null)
  /** indices being highlighted */
  highlight?: number[];
  error?: number[] | boolean;
};

export type StackShape = {
  kind: "stack";
  values: number[]; // index 0 is bottom, last is top
  highlight?: number[];
  error?: number[] | boolean;
};

export type QueueShape = {
  kind: "queue";
  values: number[]; // index 0 is front
  highlight?: number[];
  error?: number[] | boolean;
};

export type TreeNodeView = {
  id: number;
  value: number;
  left?: number; // child index in `nodes`
  right?: number;
};
export type TreeShape = {
  kind: "tree";
  /** flattened nodes; root is at index 0 */
  nodes: TreeNodeView[];
  highlight?: number[];
  visited?: number[];
  /** ordered visit list to display alongside the tree */
  order?: number[];
  error?: number[] | boolean;
};

export type GraphNodeView = { id: string; x: number; y: number };
export type GraphEdgeView = { from: string; to: string };
export type GraphShape = {
  kind: "graph";
  nodes: GraphNodeView[];
  edges: GraphEdgeView[];
  /** undirected? (just affects arrow rendering) */
  undirected?: boolean;
  highlight?: string[];
  visited?: string[];
  /** ordered visit list */
  order?: string[];
  /** queue/stack content for BFS/DFS */
  frontier?: string[];
  frontierLabel?: string;
  error?: string[] | boolean;
};

export type Shape = ArrayShape | ListShape | StackShape | QueueShape | TreeShape | GraphShape;

// ---------- Frame ----------

export type DSFrame = {
  shape: Shape;
  /** 1-indexed line number in the displayed code */
  line: number;
  vars?: Record<string, number | string>;
  explain: string;
  result?: string;
};

// ---------- Algorithm meta ----------

export type DSAlgoMeta = {
  id: string;
  name: string;
  category: DSCategory;
  difficulty: Difficulty;
  blurb: string;
  code: string[];
  build: (customInput?: number[] | string, searchTarget?: number) => DSFrame[];
  complexity: { time: { best: string; avg: string; worst: string }; space: string };
};
