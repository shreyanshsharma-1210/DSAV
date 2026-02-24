import { ARRAY_ALGOS } from "./array";
import { SORTING_ALGOS } from "./sorting";
import { SEARCHING_ALGOS } from "./searching";
import { LINKEDLIST_ALGOS } from "./linkedlist";
import { STACK_ALGOS } from "./stack";
import { QUEUE_ALGOS } from "./queue";
import { TREE_ALGOS } from "./tree";
import { GRAPH_ALGOS } from "./graph";
import type { DSAlgoMeta, DSCategory } from "./types";

export const DSA_REGISTRY: DSAlgoMeta[] = [
  ...ARRAY_ALGOS,
  ...SORTING_ALGOS,
  ...SEARCHING_ALGOS,
  ...LINKEDLIST_ALGOS,
  ...STACK_ALGOS,
  ...QUEUE_ALGOS,
  ...TREE_ALGOS,
  ...GRAPH_ALGOS,
];

export const CATEGORIES: DSCategory[] = [
  "Array",
  "Sorting",
  "Searching",
  "Linked List",
  "Stack",
  "Queue",
  "Tree",
  "Graph",
];

export function getAlgoById(id: string): DSAlgoMeta | undefined {
  return DSA_REGISTRY.find((a) => a.id === id);
}

export function algosInCategory(cat: DSCategory): DSAlgoMeta[] {
  return DSA_REGISTRY.filter((a) => a.category === cat);
}

export type { DSAlgoMeta, DSCategory };
