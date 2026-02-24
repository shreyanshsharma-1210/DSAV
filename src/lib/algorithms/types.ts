// Shared step type used by every array-based algorithm visualizer.
// Each step is a single frame the visualizer renders.

export type AlgoStep = {
  array: number[];
  // Indices to highlight as "currently being compared / inspected"
  compare?: number[];
  // Indices that are about to swap (rendered in the swap color)
  swap?: number[];
  // Indices that are now considered final / locked in place
  sorted?: number[];
  // Pointer overlays (e.g. low/high/mid for binary search, pivot for quicksort)
  pointers?: Record<string, number>;
  // 1-indexed line number of the displayed code that is "active" right now
  line: number;
  // Variables to display in the variable chips row
  vars: Record<string, number | string>;
  // Plain-English explanation of what is happening
  explain: string;
  // Optional: a value the algorithm is searching for
  target?: number;
  // Optional: a result to surface at the end (index found, etc.)
  result?: string;
};

export type AlgoMeta = {
  id: string;
  name: string;
  category: "Sorting" | "Searching";
  code: string[];
  build: (input: number[], target?: number) => AlgoStep[];
  complexity: { time: { best: string; avg: string; worst: string }; space: string };
  needsTarget?: boolean;
  needsSorted?: boolean;
  blurb: string;
};
