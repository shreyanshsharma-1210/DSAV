// Central registry of every algorithm available in the visualizer.
import type { AlgoMeta } from "./types";
import { BUBBLE_SORT_CODE, bubbleSortSteps, COMPLEXITY as BUBBLE_C } from "./bubbleSort";
import {
  SELECTION_SORT_CODE,
  selectionSortSteps,
  SELECTION_SORT_COMPLEXITY,
} from "./selectionSort";
import {
  INSERTION_SORT_CODE,
  insertionSortSteps,
  INSERTION_SORT_COMPLEXITY,
} from "./insertionSort";
import { MERGE_SORT_CODE, mergeSortSteps, MERGE_SORT_COMPLEXITY } from "./mergeSort";
import { QUICK_SORT_CODE, quickSortSteps, QUICK_SORT_COMPLEXITY } from "./quickSort";
import { LINEAR_SEARCH_CODE, linearSearchSteps, LINEAR_SEARCH_COMPLEXITY } from "./linearSearch";
import { BINARY_SEARCH_CODE, binarySearchSteps, BINARY_SEARCH_COMPLEXITY } from "./binarySearch";

export const ALGORITHMS: AlgoMeta[] = [
  {
    id: "bubble",
    name: "Bubble Sort",
    category: "Sorting",
    code: BUBBLE_SORT_CODE,
    build: (a) => bubbleSortSteps(a),
    complexity: BUBBLE_C,
    blurb: "Repeatedly swap adjacent out-of-order pairs.",
  },
  {
    id: "selection",
    name: "Selection Sort",
    category: "Sorting",
    code: SELECTION_SORT_CODE,
    build: (a) => selectionSortSteps(a),
    complexity: SELECTION_SORT_COMPLEXITY,
    blurb: "Pick the minimum, place at the front, repeat.",
  },
  {
    id: "insertion",
    name: "Insertion Sort",
    category: "Sorting",
    code: INSERTION_SORT_CODE,
    build: (a) => insertionSortSteps(a),
    complexity: INSERTION_SORT_COMPLEXITY,
    blurb: "Grow a sorted prefix by inserting each new element.",
  },
  {
    id: "merge",
    name: "Merge Sort",
    category: "Sorting",
    code: MERGE_SORT_CODE,
    build: (a) => mergeSortSteps(a),
    complexity: MERGE_SORT_COMPLEXITY,
    blurb: "Divide, recursively sort, then merge halves.",
  },
  {
    id: "quick",
    name: "Quick Sort",
    category: "Sorting",
    code: QUICK_SORT_CODE,
    build: (a) => quickSortSteps(a),
    complexity: QUICK_SORT_COMPLEXITY,
    blurb: "Partition around a pivot, then recurse.",
  },
  {
    id: "linear",
    name: "Linear Search",
    category: "Searching",
    code: LINEAR_SEARCH_CODE,
    build: (a, t) => linearSearchSteps(a, t ?? a[0]),
    complexity: LINEAR_SEARCH_COMPLEXITY,
    needsTarget: true,
    blurb: "Scan every element until the target is found.",
  },
  {
    id: "binary",
    name: "Binary Search",
    category: "Searching",
    code: BINARY_SEARCH_CODE,
    build: (a, t) => binarySearchSteps(a, t ?? a[0]),
    complexity: BINARY_SEARCH_COMPLEXITY,
    needsTarget: true,
    needsSorted: true,
    blurb: "Halve the search space using a sorted array.",
  },
];

export function getAlgo(id: string): AlgoMeta {
  return ALGORITHMS.find((a) => a.id === id) ?? ALGORITHMS[0];
}
