import type { AlgoStep } from "./types";

export const QUICK_SORT_CODE = [
  "function quickSort(arr, lo, hi) {",
  "  if (lo >= hi) return;",
  "  let p = partition(arr, lo, hi);",
  "  quickSort(arr, lo, p - 1);",
  "  quickSort(arr, p + 1, hi);",
  "}",
  "function partition(arr, lo, hi) {",
  "  let pivot = arr[hi];",
  "  let i = lo - 1;",
  "  for (let j = lo; j < hi; j++) {",
  "    if (arr[j] <= pivot) {",
  "      i++;",
  "      [arr[i], arr[j]] = [arr[j], arr[i]];",
  "    }",
  "  }",
  "  [arr[i+1], arr[hi]] = [arr[hi], arr[i+1]];",
  "  return i + 1;",
  "}",
];

export function quickSortSteps(input: number[]): AlgoStep[] {
  const arr = [...input];
  const steps: AlgoStep[] = [];
  const sorted = new Set<number>();

  steps.push({
    array: [...arr],
    line: 1,
    vars: { n: arr.length },
    explain: `Quick sort partitions around a pivot, then recurses on each side.`,
  });

  function partition(lo: number, hi: number): number {
    const pivot = arr[hi];
    steps.push({
      array: [...arr],
      line: 8,
      pointers: { pivot: hi, lo, hi },
      vars: { pivot, lo, hi },
      explain: `Choose pivot = arr[${hi}] = ${pivot}.`,
    });
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      steps.push({
        array: [...arr],
        line: 11,
        compare: [j, hi],
        pointers: { i, j, pivot: hi },
        vars: { i, j, "arr[j]": arr[j], pivot },
        explain: `Compare arr[${j}] = ${arr[j]} with pivot ${pivot}.`,
      });
      if (arr[j] <= pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({
          array: [...arr],
          line: 13,
          swap: [i, j],
          pointers: { i, j, pivot: hi },
          vars: { swapped: `${i}↔${j}` },
          explain: `arr[${j}] ≤ pivot, place it at i = ${i}.`,
        });
      }
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    steps.push({
      array: [...arr],
      line: 16,
      swap: [i + 1, hi],
      pointers: { pivotAt: i + 1 },
      vars: { pivotAt: i + 1 },
      explain: `Place pivot at its final index ${i + 1}.`,
    });
    sorted.add(i + 1);
    return i + 1;
  }

  function qs(lo: number, hi: number) {
    if (lo >= hi) {
      if (lo === hi) sorted.add(lo);
      steps.push({
        array: [...arr],
        line: 2,
        sorted: [...sorted],
        pointers: { lo, hi },
        vars: { lo, hi },
        explain: `Range [${lo}, ${hi}] is trivially sorted.`,
      });
      return;
    }
    const p = partition(lo, hi);
    qs(lo, p - 1);
    qs(p + 1, hi);
  }

  qs(0, arr.length - 1);
  steps.push({
    array: [...arr],
    line: 5,
    sorted: arr.map((_, i) => i),
    vars: { result: arr.join(",") },
    explain: `Sort complete.`,
  });
  return steps;
}

export const QUICK_SORT_COMPLEXITY = {
  time: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)" },
  space: "O(log n)",
};
