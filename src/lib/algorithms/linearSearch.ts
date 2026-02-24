import type { AlgoStep } from "./types";

export const LINEAR_SEARCH_CODE = [
  "function linearSearch(arr, target) {",
  "  for (let i = 0; i < arr.length; i++) {",
  "    if (arr[i] === target) return i;",
  "  }",
  "  return -1;",
  "}",
];

export function linearSearchSteps(input: number[], target: number): AlgoStep[] {
  const arr = [...input];
  const steps: AlgoStep[] = [];
  steps.push({
    array: [...arr],
    line: 1,
    target,
    vars: { target, n: arr.length },
    explain: `Linear search: look at each element until we find ${target}.`,
  });
  for (let i = 0; i < arr.length; i++) {
    steps.push({
      array: [...arr],
      line: 2,
      target,
      compare: [i],
      pointers: { i },
      vars: { i, "arr[i]": arr[i], target },
      explain: `Check arr[${i}] = ${arr[i]} against ${target}.`,
    });
    if (arr[i] === target) {
      steps.push({
        array: [...arr],
        line: 3,
        target,
        sorted: [i],
        pointers: { found: i },
        vars: { foundAt: i },
        explain: `Match found at index ${i}.`,
        result: `Found at index ${i}`,
      });
      return steps;
    }
  }
  steps.push({
    array: [...arr],
    line: 5,
    target,
    vars: { result: -1 },
    explain: `Reached the end without finding ${target}.`,
    result: `Not found`,
  });
  return steps;
}

export const LINEAR_SEARCH_COMPLEXITY = {
  time: { best: "O(1)", avg: "O(n)", worst: "O(n)" },
  space: "O(1)",
};
