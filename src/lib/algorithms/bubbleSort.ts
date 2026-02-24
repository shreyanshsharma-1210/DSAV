// Bubble Sort step generator. Returns ordered animation frames the visualizer plays.
import type { AlgoStep } from "./types";

// Re-exported alias kept so older imports keep working.
export type SortStep = AlgoStep;

export const BUBBLE_SORT_CODE = [
  "function bubbleSort(arr) {",
  "  let n = arr.length;",
  "  for (let i = 0; i < n - 1; i++) {",
  "    for (let j = 0; j < n - i - 1; j++) {",
  "      if (arr[j] > arr[j + 1]) {",
  "        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];",
  "      }",
  "    }",
  "  }",
  "  return arr;",
  "}",
];

export function bubbleSortSteps(input: number[]): AlgoStep[] {
  const arr = [...input];
  const steps: AlgoStep[] = [];
  const n = arr.length;
  const sorted: number[] = [];

  steps.push({
    array: [...arr],
    line: 2,
    vars: { n },
    explain: `We start with ${n} elements. Bubble sort repeatedly bubbles the largest remaining value to the end.`,
  });

  for (let i = 0; i < n - 1; i++) {
    steps.push({
      array: [...arr],
      line: 3,
      sorted: [...sorted],
      vars: { i, n, "n-i-1": n - i - 1 },
      explain: `Outer pass ${i + 1}. After this pass, the largest unsorted value will be locked at the right.`,
    });

    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        array: [...arr],
        line: 4,
        sorted: [...sorted],
        compare: [j, j + 1],
        vars: { i, j, "arr[j]": arr[j], "arr[j+1]": arr[j + 1] },
        explain: `Comparing arr[${j}] = ${arr[j]} with arr[${j + 1}] = ${arr[j + 1]}.`,
      });

      steps.push({
        array: [...arr],
        line: 5,
        sorted: [...sorted],
        compare: [j, j + 1],
        vars: { "arr[j]": arr[j], "arr[j+1]": arr[j + 1] },
        explain:
          arr[j] > arr[j + 1]
            ? `${arr[j]} is greater than ${arr[j + 1]}, so we swap them.`
            : `${arr[j]} is not greater than ${arr[j + 1]}, no swap needed.`,
      });

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({
          array: [...arr],
          line: 6,
          sorted: [...sorted],
          swap: [j, j + 1],
          vars: { "arr[j]": arr[j], "arr[j+1]": arr[j + 1] },
          explain: `Swap done — arr[${j}] = ${arr[j]} and arr[${j + 1}] = ${arr[j + 1]}.`,
        });
      }
    }

    sorted.unshift(n - 1 - i);
    steps.push({
      array: [...arr],
      line: 7,
      sorted: [...sorted],
      vars: { "locked@": n - 1 - i, value: arr[n - 1 - i] },
      explain: `Pass complete. Index ${n - 1 - i} is locked with value ${arr[n - 1 - i]}.`,
    });
  }

  for (let k = 0; k < n; k++) if (!sorted.includes(k)) sorted.push(k);
  steps.push({
    array: [...arr],
    line: 10,
    sorted,
    vars: { result: arr.join(",") },
    explain: `Sort complete. The array is fully ordered.`,
  });

  return steps;
}

export const COMPLEXITY = {
  time: { best: "O(n)", avg: "O(n²)", worst: "O(n²)" },
  space: "O(1)",
};
