import type { AlgoStep } from "./types";

export const BINARY_SEARCH_CODE = [
  "function binarySearch(arr, target) {",
  "  let lo = 0, hi = arr.length - 1;",
  "  while (lo <= hi) {",
  "    let mid = Math.floor((lo + hi) / 2);",
  "    if (arr[mid] === target) return mid;",
  "    if (arr[mid] < target) lo = mid + 1;",
  "    else hi = mid - 1;",
  "  }",
  "  return -1;",
  "}",
];

export function binarySearchSteps(input: number[], target: number): AlgoStep[] {
  const arr = [...input].sort((a, b) => a - b); // requires sorted
  const steps: AlgoStep[] = [];
  let lo = 0,
    hi = arr.length - 1;
  steps.push({
    array: [...arr],
    line: 1,
    target,
    vars: { target, n: arr.length },
    explain: `Binary search needs a sorted array. Working on [${arr.join(",")}].`,
  });
  steps.push({
    array: [...arr],
    line: 2,
    target,
    pointers: { lo, hi },
    vars: { lo, hi },
    explain: `Initialize lo = ${lo}, hi = ${hi}.`,
  });

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({
      array: [...arr],
      line: 4,
      target,
      pointers: { lo, mid, hi },
      compare: [mid],
      vars: { lo, mid, hi, "arr[mid]": arr[mid] },
      explain: `mid = ${mid}, arr[mid] = ${arr[mid]}.`,
    });
    if (arr[mid] === target) {
      steps.push({
        array: [...arr],
        line: 5,
        target,
        sorted: [mid],
        pointers: { found: mid },
        vars: { foundAt: mid },
        explain: `Hit! Target ${target} found at index ${mid}.`,
        result: `Found at index ${mid}`,
      });
      return steps;
    }
    if (arr[mid] < target) {
      steps.push({
        array: [...arr],
        line: 6,
        target,
        pointers: { lo, mid, hi },
        vars: { decision: "go right" },
        explain: `arr[mid] = ${arr[mid]} < ${target}, discard left half.`,
      });
      lo = mid + 1;
    } else {
      steps.push({
        array: [...arr],
        line: 7,
        target,
        pointers: { lo, mid, hi },
        vars: { decision: "go left" },
        explain: `arr[mid] = ${arr[mid]} > ${target}, discard right half.`,
      });
      hi = mid - 1;
    }
  }
  steps.push({
    array: [...arr],
    line: 9,
    target,
    vars: { result: -1 },
    explain: `lo > hi. Target ${target} not present.`,
    result: `Not found`,
  });
  return steps;
}

export const BINARY_SEARCH_COMPLEXITY = {
  time: { best: "O(1)", avg: "O(log n)", worst: "O(log n)" },
  space: "O(1)",
};
