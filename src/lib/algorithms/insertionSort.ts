import type { AlgoStep } from "./types";

export const INSERTION_SORT_CODE = [
  "function insertionSort(arr) {",
  "  for (let i = 1; i < arr.length; i++) {",
  "    let key = arr[i];",
  "    let j = i - 1;",
  "    while (j >= 0 && arr[j] > key) {",
  "      arr[j + 1] = arr[j];",
  "      j--;",
  "    }",
  "    arr[j + 1] = key;",
  "  }",
  "  return arr;",
  "}",
];

export function insertionSortSteps(input: number[]): AlgoStep[] {
  const arr = [...input];
  const steps: AlgoStep[] = [];
  const n = arr.length;
  const sorted: number[] = [0];

  steps.push({
    array: [...arr],
    line: 1,
    sorted: [...sorted],
    vars: { n },
    explain: `Insertion sort grows a sorted prefix one element at a time.`,
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    steps.push({
      array: [...arr],
      line: 3,
      sorted: [...sorted],
      pointers: { i },
      compare: [i],
      vars: { i, key },
      explain: `Take key = arr[${i}] = ${key} and find its place in the sorted prefix.`,
    });
    while (j >= 0 && arr[j] > key) {
      steps.push({
        array: [...arr],
        line: 5,
        sorted: [...sorted],
        compare: [j, j + 1],
        pointers: { j },
        vars: { j, "arr[j]": arr[j], key },
        explain: `arr[${j}] = ${arr[j]} > ${key}, shift it right.`,
      });
      arr[j + 1] = arr[j];
      steps.push({
        array: [...arr],
        line: 6,
        sorted: [...sorted],
        swap: [j, j + 1],
        pointers: { j },
        vars: { shifted: arr[j + 1] },
        explain: `Shifted ${arr[j + 1]} from index ${j} to ${j + 1}.`,
      });
      j--;
    }
    arr[j + 1] = key;
    sorted.push(i);
    steps.push({
      array: [...arr],
      line: 8,
      sorted: [...sorted],
      pointers: { placed: j + 1 },
      vars: { placedAt: j + 1, key },
      explain: `Inserted ${key} at index ${j + 1}.`,
    });
  }
  steps.push({
    array: [...arr],
    line: 10,
    sorted,
    vars: { result: arr.join(",") },
    explain: `Sort complete.`,
  });
  return steps;
}

export const INSERTION_SORT_COMPLEXITY = {
  time: { best: "O(n)", avg: "O(n²)", worst: "O(n²)" },
  space: "O(1)",
};
