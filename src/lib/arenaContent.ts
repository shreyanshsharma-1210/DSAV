// Arena content organised into batches per game mode.
// Design goals:
//  - No magic "answer index" numbers: the correct answer is always stored as a value
//    (string or array) and the index is derived from `options` at render time.
//  - Predict-the-Step answers are derived by running a real algorithm step on `before`,
//    so they cannot drift from reality.
//  - Each game mode is a list of `Batch`es with metadata (difficulty, name, summary).
//    A Batch is a self-contained mini-quiz with a fixed pool of items.

export type Difficulty = "beginner" | "intermediate" | "advanced";

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; xpPerCorrect: number; color: string }
> = {
  beginner: { label: "Beginner", xpPerCorrect: 10, color: "emerald" },
  intermediate: { label: "Intermediate", xpPerCorrect: 20, color: "amber" },
  advanced: { label: "Advanced", xpPerCorrect: 30, color: "rose" },
};

export type Batch<T> = {
  id: string;
  name: string;
  summary: string;
  difficulty: Difficulty;
  items: T[];
  /** Optional natural-language topic used by the AI quiz generator. */
  topic?: string;
};

// ---------- Quiz ----------
export type Quiz = {
  id: string;
  question: string;
  options: string[];
  correct: string; // value, not index
  explain: string;
};

export const QUIZ_BATCHES: Batch<Quiz>[] = [
  {
    id: "quiz-foundations",
    name: "Foundations",
    summary: "Core DSA concepts every learner should know.",
    difficulty: "beginner",
    topic:
      "core data-structures and algorithms fundamentals — arrays, hash maps, basic complexity, queues, stacks, and binary search prerequisites",
    items: [
      {
        id: "qf1",
        question: "What is the worst-case time complexity of Bubble Sort?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        correct: "O(n²)",
        explain: "Two nested loops over n elements give O(n²) in the worst case.",
      },
      {
        id: "qf2",
        question: "Binary Search requires the input to be…",
        options: ["Sorted", "Unique", "A power of two in length", "Reversed"],
        correct: "Sorted",
        explain: "Binary search relies on order to discard half the search space each step.",
      },
      {
        id: "qf3",
        question: "Which data structure gives O(1) average-case lookup?",
        options: ["Linked List", "Hash Map", "Binary Tree", "Stack"],
        correct: "Hash Map",
        explain: "Hash maps reach amortised O(1) lookup with good hashing.",
      },
      {
        id: "qf4",
        question: "BFS on a graph typically uses which structure?",
        options: ["Stack", "Queue", "Heap", "Trie"],
        correct: "Queue",
        explain: "BFS processes nodes level-by-level using a FIFO queue.",
      },
      {
        id: "qf5",
        question: "Accessing arr[i] in a contiguous array is…",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correct: "O(1)",
        explain: "Index access is direct pointer arithmetic — constant time.",
      },
    ],
  },
  {
    id: "quiz-sorting",
    name: "Sorting Deep-Dive",
    summary: "Trade-offs between comparison sorts.",
    difficulty: "intermediate",
    topic:
      "comparison-based sorting algorithms — bubble, selection, insertion, merge, quick and heap sort — including stability, in-place behaviour, best/avg/worst time and space complexity",
    items: [
      {
        id: "qs1",
        question: "Which sort is in-place and stable?",
        options: ["Quick Sort", "Merge Sort", "Selection Sort", "Insertion Sort"],
        correct: "Insertion Sort",
        explain: "Insertion sort is in-place (O(1) extra space) and stable.",
      },
      {
        id: "qs2",
        question: "Average-case time of Quick Sort?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        correct: "O(n log n)",
        explain: "Random pivots yield balanced partitions on average → O(n log n).",
      },
      {
        id: "qs3",
        question: "Merge Sort's auxiliary space is…",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correct: "O(n)",
        explain: "It allocates a temporary array of size n while merging.",
      },
      {
        id: "qs4",
        question: "Best case of Insertion Sort (already sorted input)?",
        options: ["O(1)", "O(n)", "O(n log n)", "O(n²)"],
        correct: "O(n)",
        explain: "One pass with no shifts — every element is already in place.",
      },
      {
        id: "qs5",
        question: "Which sort has guaranteed O(n log n) regardless of input?",
        options: ["Quick Sort", "Bubble Sort", "Merge Sort", "Insertion Sort"],
        correct: "Merge Sort",
        explain: "Merge sort always halves and merges — worst case stays O(n log n).",
      },
    ],
  },
  {
    id: "quiz-graphs-trees",
    name: "Graphs & Trees",
    summary: "Traversals, balance and shortest paths.",
    difficulty: "advanced",
    topic:
      "graph and tree algorithms — BFS, DFS, topological sort, Dijkstra, Bellman-Ford, MST (Kruskal/Prim), BST operations, balanced trees and tree traversals",
    items: [
      {
        id: "qg1",
        question:
          "Which algorithm finds the shortest path on a weighted graph with non-negative edges?",
        options: ["DFS", "Dijkstra", "Bellman-Ford", "Kruskal"],
        correct: "Dijkstra",
        explain: "Dijkstra greedily picks the closest unvisited node; needs non-negative weights.",
      },
      {
        id: "qg2",
        question: "In a balanced BST with n nodes, search runs in…",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correct: "O(log n)",
        explain: "Balanced height is log n, so search descends at most log n levels.",
      },
      {
        id: "qg3",
        question: "Topological sort applies to…",
        options: ["Any graph", "Undirected graphs", "DAGs only", "Trees only"],
        correct: "DAGs only",
        explain: "Topological order requires a Directed Acyclic Graph.",
      },
      {
        id: "qg4",
        question: "Which traversal visits root → left → right?",
        options: ["In-order", "Pre-order", "Post-order", "Level-order"],
        correct: "Pre-order",
        explain: "Pre-order: visit node, then left subtree, then right.",
      },
      {
        id: "qg5",
        question: "Detecting a cycle in a directed graph uses…",
        options: ["BFS only", "Union-Find", "DFS with recursion stack", "Topological count"],
        correct: "DFS with recursion stack",
        explain: "Track nodes in the current DFS path; revisiting one means a back-edge → cycle.",
      },
    ],
  },
];

// ---------- Guess the Output ----------
export type GuessOutput = {
  id: string;
  title: string;
  code: string;
  options: string[];
  correct: string;
  explain: string;
};

export const GUESS_BATCHES: Batch<GuessOutput>[] = [
  {
    id: "guess-arrays",
    name: "Arrays Warm-up",
    summary: "Read the snippet, predict the printed value.",
    difficulty: "beginner",
    items: [
      {
        id: "ga1",
        title: "What does this print?",
        code: `let arr = [3, 1, 2];\narr.sort((a,b) => a - b);\nconsole.log(arr[1]);`,
        options: ["1", "2", "3", "undefined"],
        correct: "2",
        explain: "Sorted ascending → [1, 2, 3]. Index 1 is 2.",
      },
      {
        id: "ga2",
        title: "Output of this loop?",
        code: `let s = 0;\nfor (let i = 1; i <= 4; i++) s += i;\nconsole.log(s);`,
        options: ["6", "10", "16", "4"],
        correct: "10",
        explain: "1 + 2 + 3 + 4 = 10.",
      },
      {
        id: "ga3",
        title: "Output?",
        code: `let a = [1,2,3];\na.push(4);\na.shift();\nconsole.log(a.join(','));`,
        options: ["1,2,3", "2,3,4", "1,2,3,4", "2,3"],
        correct: "2,3,4",
        explain: "Push 4 → [1,2,3,4]; shift removes first → [2,3,4].",
      },
      {
        id: "ga4",
        title: "What gets logged?",
        code: `let a = [5,4,3,2,1];\nconsole.log(a.indexOf(3));`,
        options: ["0", "1", "2", "3"],
        correct: "2",
        explain: "indexOf returns the first matching index — 3 sits at index 2.",
      },
    ],
  },
  {
    id: "guess-recursion",
    name: "Recursion & Search",
    summary: "Trace recursive calls and search results.",
    difficulty: "intermediate",
    items: [
      {
        id: "gr1",
        title: "Result of binary search?",
        code: `// arr = [1,3,5,7,9], target = 7\n// returns the index found`,
        options: ["2", "3", "4", "-1"],
        correct: "3",
        explain: "7 sits at index 3 in [1,3,5,7,9].",
      },
      {
        id: "gr2",
        title: "What does fact(4) return?",
        code: `function fact(n){ return n<=1 ? 1 : n * fact(n-1); }\nconsole.log(fact(4));`,
        options: ["12", "16", "24", "10"],
        correct: "24",
        explain: "4·3·2·1 = 24.",
      },
      {
        id: "gr3",
        title: "Output of fib(5)?",
        code: `function fib(n){ return n<2 ? n : fib(n-1)+fib(n-2); }\nconsole.log(fib(5));`,
        options: ["3", "5", "8", "13"],
        correct: "5",
        explain: "Sequence 0,1,1,2,3,5 — fib(5) = 5.",
      },
      {
        id: "gr4",
        title: "Final value of `count`?",
        code: `let count = 0;\nfunction walk(n){ if(n===0) return; count++; walk(n-1); }\nwalk(6);\nconsole.log(count);`,
        options: ["5", "6", "7", "0"],
        correct: "6",
        explain: "walk decrements n until 0 — 6 increments happen.",
      },
    ],
  },
];

// ---------- Predict the Step (algorithm-driven) ----------
// Authoring just inputs; the correct "after" is computed from a real algorithm.
export type StepAlgo = "bubble-pass" | "selection-step" | "insertion-step";

export type PredictStep = {
  id: string;
  title: string;
  before: number[];
  algo: StepAlgo;
  /** zero-indexed step parameter (e.g. selection iteration index, insertion target) */
  stepIndex?: number;
  /** distractor candidate states (incorrect on purpose) */
  distractors: number[][];
  hint: string;
  explain: string;
};

export function applyStep(before: number[], algo: StepAlgo, stepIndex = 0): number[] {
  const a = [...before];
  switch (algo) {
    case "bubble-pass": {
      // one full outer pass: bubble largest unsorted element to the end of the unsorted region
      const last = a.length - 1 - stepIndex;
      for (let j = 0; j < last; j++) {
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
        }
      }
      return a;
    }
    case "selection-step": {
      // place the min of a[stepIndex..] at index stepIndex
      let minIdx = stepIndex;
      for (let j = stepIndex + 1; j < a.length; j++) {
        if (a[j] < a[minIdx]) minIdx = j;
      }
      [a[stepIndex], a[minIdx]] = [a[minIdx], a[stepIndex]];
      return a;
    }
    case "insertion-step": {
      // insert a[stepIndex] into sorted prefix a[0..stepIndex-1]
      const key = a[stepIndex];
      let j = stepIndex - 1;
      while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j];
        j--;
      }
      a[j + 1] = key;
      return a;
    }
  }
}

export const ALGO_LABEL: Record<StepAlgo, string> = {
  "bubble-pass": "Bubble Sort",
  "selection-step": "Selection Sort",
  "insertion-step": "Insertion Sort",
};

export const PREDICT_BATCHES: Batch<PredictStep>[] = [
  {
    id: "predict-basic",
    name: "First Steps",
    summary: "Single-pass predictions on small arrays.",
    difficulty: "beginner",
    items: [
      {
        id: "pb1",
        title: "Bubble Sort — state after one full pass",
        before: [5, 1, 4, 2, 8],
        algo: "bubble-pass",
        stepIndex: 0,
        distractors: [
          [1, 2, 4, 5, 8],
          [5, 4, 2, 1, 8],
          [1, 5, 4, 2, 8],
        ],
        hint: "One outer pass bubbles the largest unsorted element to the end.",
        explain: "Pass 1 swaps (5,1)(5,4)(5,2); 8 stays. Result: [1,4,2,5,8].",
      },
      {
        id: "pb2",
        title: "Selection Sort — state after first iteration",
        before: [29, 10, 14, 37, 13],
        algo: "selection-step",
        stepIndex: 0,
        distractors: [
          [10, 13, 14, 29, 37],
          [29, 10, 14, 37, 13],
          [13, 10, 14, 37, 29],
        ],
        hint: "Find the min in the unsorted region and place it at index 0.",
        explain: "Min is 10. Swap with index 0.",
      },
      {
        id: "pb3",
        title: "Insertion Sort — after inserting arr[2]",
        before: [3, 7, 4, 9, 5],
        algo: "insertion-step",
        stepIndex: 2,
        distractors: [
          [3, 7, 4, 9, 5],
          [4, 3, 7, 9, 5],
          [3, 7, 9, 4, 5],
        ],
        hint: "Take 4 and slot it into the sorted prefix [3, 7].",
        explain: "4 fits between 3 and 7 → [3, 4, 7, 9, 5].",
      },
    ],
  },
  {
    id: "predict-advanced",
    name: "Mid-Algorithm",
    summary: "Predict a state several steps in.",
    difficulty: "intermediate",
    items: [
      {
        id: "pa1",
        title: "Bubble Sort — after the second pass",
        before: [6, 3, 8, 1, 5],
        algo: "bubble-pass",
        stepIndex: 1,
        distractors: [
          [3, 6, 1, 5, 8],
          [1, 3, 5, 6, 8],
          [6, 3, 1, 5, 8],
        ],
        hint: "First pass already settled 8. The second pass works on the rest.",
        explain: "After pass 1: [3,6,1,5,8]. Pass 2 → [3,1,5,6,8].",
      },
      {
        id: "pa2",
        title: "Selection Sort — second iteration",
        before: [29, 10, 14, 37, 13],
        algo: "selection-step",
        stepIndex: 1,
        distractors: [
          [10, 14, 29, 37, 13],
          [10, 29, 14, 37, 13],
          [10, 13, 14, 29, 37],
        ],
        hint: "After iteration 0, array is [10,29,14,37,13]. Now place the min of indices 1..4.",
        explain: "Min in [29,14,37,13] is 13 → swap with index 1.",
      },
      {
        id: "pa3",
        title: "Insertion Sort — after inserting arr[3]",
        before: [3, 4, 7, 5, 9],
        algo: "insertion-step",
        stepIndex: 3,
        distractors: [
          [3, 4, 7, 5, 9],
          [3, 5, 4, 7, 9],
          [5, 3, 4, 7, 9],
        ],
        hint: "Take 5 and slot it into sorted prefix [3,4,7].",
        explain: "5 fits between 4 and 7 → [3, 4, 5, 7, 9].",
      },
    ],
  },
];

// ---------- Complexity Match ----------
export type ComplexityMatch = {
  id: string;
  algo: string;
  options: string[];
  correct: string;
  explain: string;
};

export const COMPLEXITY_BATCHES: Batch<ComplexityMatch>[] = [
  {
    id: "cx-classics",
    name: "Classic Big-O",
    summary: "Standard time complexities for everyday algorithms.",
    difficulty: "beginner",
    items: [
      {
        id: "cc1",
        algo: "Linear Search (worst)",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correct: "O(n)",
        explain: "May scan every element.",
      },
      {
        id: "cc2",
        algo: "Binary Search (worst)",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correct: "O(log n)",
        explain: "Halves the search space each step.",
      },
      {
        id: "cc3",
        algo: "Merge Sort (avg)",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        correct: "O(n log n)",
        explain: "Always splits in half and merges in linear time.",
      },
      {
        id: "cc4",
        algo: "Hash Map lookup (avg)",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correct: "O(1)",
        explain: "Good hashing gives constant amortised lookup.",
      },
    ],
  },
  {
    id: "cx-edge",
    name: "Edge Cases",
    summary: "Worst-case and tricky scenarios.",
    difficulty: "intermediate",
    items: [
      {
        id: "ce1",
        algo: "Quick Sort (worst)",
        options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
        correct: "O(n²)",
        explain: "Already-sorted input with poor pivot choice degrades to O(n²).",
      },
      {
        id: "ce2",
        algo: "BFS on V vertices, E edges",
        options: ["O(V)", "O(E)", "O(V + E)", "O(V·E)"],
        correct: "O(V + E)",
        explain: "Each vertex and edge is processed once.",
      },
      {
        id: "ce3",
        algo: "Heap insert",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correct: "O(log n)",
        explain: "Sift-up climbs at most log n levels.",
      },
      {
        id: "ce4",
        algo: "Dijkstra with binary heap",
        options: ["O(V²)", "O((V + E) log V)", "O(V·E)", "O(E)"],
        correct: "O((V + E) log V)",
        explain: "Each vertex/edge work multiplied by log V heap ops.",
      },
    ],
  },
];

// Flat utility: list every batch with its mode tag (handy for stats / completion tracking).
export type Mode = "quiz" | "guess" | "predict" | "complexity";

export const ALL_BATCHES: { mode: Mode; batch: Batch<unknown> }[] = [
  ...QUIZ_BATCHES.map((b) => ({ mode: "quiz" as const, batch: b as Batch<unknown> })),
  ...GUESS_BATCHES.map((b) => ({ mode: "guess" as const, batch: b as Batch<unknown> })),
  ...PREDICT_BATCHES.map((b) => ({ mode: "predict" as const, batch: b as Batch<unknown> })),
  ...COMPLEXITY_BATCHES.map((b) => ({ mode: "complexity" as const, batch: b as Batch<unknown> })),
];
