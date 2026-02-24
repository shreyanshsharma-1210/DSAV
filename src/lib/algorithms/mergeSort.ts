import type { AlgoStep } from "./types";

export const MERGE_SORT_CODE = [
  "function mergeSort(arr, l, r) {",
  "  if (l >= r) return;",
  "  let m = Math.floor((l + r) / 2);",
  "  mergeSort(arr, l, m);",
  "  mergeSort(arr, m + 1, r);",
  "  merge(arr, l, m, r);",
  "}",
  "function merge(arr, l, m, r) {",
  "  let left = arr.slice(l, m + 1);",
  "  let right = arr.slice(m + 1, r + 1);",
  "  // merge back into arr[l..r]",
  "}",
];

export function mergeSortSteps(input: number[]): AlgoStep[] {
  const arr = [...input];
  const steps: AlgoStep[] = [];

  steps.push({
    array: [...arr],
    line: 1,
    vars: { n: arr.length },
    explain: `Merge sort divides the array recursively, then merges sorted halves.`,
  });

  function sort(l: number, r: number) {
    if (l >= r) {
      steps.push({
        array: [...arr],
        line: 2,
        pointers: { l, r },
        vars: { l, r },
        explain: `Range [${l}, ${r}] has 0 or 1 element — already sorted.`,
      });
      return;
    }
    const m = Math.floor((l + r) / 2);
    steps.push({
      array: [...arr],
      line: 3,
      pointers: { l, m, r },
      vars: { l, m, r },
      explain: `Split range [${l}, ${r}] at middle ${m}.`,
    });
    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
  }

  function merge(l: number, m: number, r: number) {
    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    steps.push({
      array: [...arr],
      line: 9,
      pointers: { l, m, r },
      vars: { left: left.join(","), right: right.join(",") },
      explain: `Merging [${left.join(",")}] and [${right.join(",")}].`,
    });
    let i = 0,
      j = 0,
      k = l;
    while (i < left.length && j < right.length) {
      steps.push({
        array: [...arr],
        line: 11,
        compare: [l + i, m + 1 + j],
        pointers: { l, k, r },
        vars: { "left[i]": left[i], "right[j]": right[j] },
        explain: `Compare ${left[i]} and ${right[j]}; take the smaller.`,
      });
      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
      }
      steps.push({
        array: [...arr],
        line: 11,
        swap: [k],
        pointers: { wrote: k },
        vars: { wroteAt: k, value: arr[k] },
        explain: `Wrote ${arr[k]} to index ${k}.`,
      });
      k++;
    }
    while (i < left.length) {
      arr[k] = left[i];
      steps.push({
        array: [...arr],
        line: 11,
        swap: [k],
        vars: { drainLeft: arr[k] },
        explain: `Drain remaining left element ${arr[k]} to index ${k}.`,
      });
      i++;
      k++;
    }
    while (j < right.length) {
      arr[k] = right[j];
      steps.push({
        array: [...arr],
        line: 11,
        swap: [k],
        vars: { drainRight: arr[k] },
        explain: `Drain remaining right element ${arr[k]} to index ${k}.`,
      });
      j++;
      k++;
    }
  }

  sort(0, arr.length - 1);
  steps.push({
    array: [...arr],
    line: 7,
    sorted: arr.map((_, i) => i),
    vars: { result: arr.join(",") },
    explain: `Sort complete.`,
  });
  return steps;
}

export const MERGE_SORT_COMPLEXITY = {
  time: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)" },
  space: "O(n)",
};
