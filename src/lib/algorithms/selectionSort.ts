import type { AlgoStep } from "./types";

export const SELECTION_SORT_CODE = [
  "function selectionSort(arr) {",
  "  let n = arr.length;",
  "  for (let i = 0; i < n - 1; i++) {",
  "    let min = i;",
  "    for (let j = i + 1; j < n; j++) {",
  "      if (arr[j] < arr[min]) min = j;",
  "    }",
  "    if (min !== i) {",
  "      [arr[i], arr[min]] = [arr[min], arr[i]];",
  "    }",
  "  }",
  "  return arr;",
  "}",
];

export function selectionSortSteps(input: number[]): AlgoStep[] {
  const arr = [...input];
  const steps: AlgoStep[] = [];
  const n = arr.length;
  const sorted: number[] = [];

  steps.push({
    array: [...arr],
    line: 2,
    vars: { n },
    explain: `Selection sort: pick the smallest from the unsorted region and move it to the front.`,
  });

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    steps.push({
      array: [...arr],
      line: 4,
      sorted: [...sorted],
      pointers: { i, min },
      vars: { i, min },
      explain: `Assume the smallest is at index ${i}.`,
    });
    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...arr],
        line: 5,
        sorted: [...sorted],
        compare: [min, j],
        pointers: { i, min, j },
        vars: { j, min, "arr[j]": arr[j], "arr[min]": arr[min] },
        explain: `Compare arr[${j}] = ${arr[j]} with current min arr[${min}] = ${arr[min]}.`,
      });
      if (arr[j] < arr[min]) {
        min = j;
        steps.push({
          array: [...arr],
          line: 6,
          sorted: [...sorted],
          compare: [min],
          pointers: { i, min },
          vars: { newMin: min },
          explain: `New minimum found at index ${min} (value ${arr[min]}).`,
        });
      }
    }
    if (min !== i) {
      [arr[i], arr[min]] = [arr[min], arr[i]];
      steps.push({
        array: [...arr],
        line: 9,
        sorted: [...sorted],
        swap: [i, min],
        vars: { swapped: `${i}↔${min}` },
        explain: `Swap arr[${i}] and arr[${min}].`,
      });
    }
    sorted.push(i);
    steps.push({
      array: [...arr],
      line: 3,
      sorted: [...sorted],
      vars: { locked: i },
      explain: `Index ${i} is now finalized.`,
    });
  }
  sorted.push(n - 1);
  steps.push({
    array: [...arr],
    line: 12,
    sorted,
    vars: { result: arr.join(",") },
    explain: `Sort complete.`,
  });
  return steps;
}

export const SELECTION_SORT_COMPLEXITY = {
  time: { best: "O(n²)", avg: "O(n²)", worst: "O(n²)" },
  space: "O(1)",
};
