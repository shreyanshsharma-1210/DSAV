import type { DSAlgoMeta, DSFrame } from "./types";

const SAMPLE = [5, 2, 8, 1, 9, 3, 7, 4];

// ---------- Bubble Sort ----------
const BUBBLE_CODE = [
  "function bubbleSort(arr) {",
  "  for (let i = 0; i < arr.length; i++) {",
  "    for (let j = 0; j < arr.length - i - 1; j++) {",
  "      if (arr[j] > arr[j+1]) {",
  "        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];",
  "      }",
  "    }",
  "  }",
  "}",
];
const getArr = (customInput?: number[] | string): number[] =>
  Array.isArray(customInput) && customInput.length > 0 ? [...customInput] : SAMPLE;

function buildBubble(customInput?: number[] | string): DSFrame[] {
  const arr = getArr(customInput);
  const f: DSFrame[] = [];
  const sorted: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      f.push({
        shape: {
          kind: "array",
          values: [...arr],
          compare: [j, j + 1],
          done: [...sorted],
          pointers: { i, j },
        },
        line: 4,
        vars: { i, j },
        explain: `Compare ${arr[j]} and ${arr[j + 1]}.`,
      });
      if (arr[j] > arr[j + 1]) {
        f.push({
          shape: {
            kind: "array",
            values: [...arr],
            swap: [j, j + 1],
            done: [...sorted],
            pointers: { i, j },
          },
          line: 5,
          vars: { i, j },
          explain: "Swap.",
        });
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
    sorted.unshift(arr.length - 1 - i);
  }
  f.push({
    shape: { kind: "array", values: [...arr], done: arr.map((_, k) => k) },
    line: 8,
    vars: {},
    explain: "Sorted.",
    result: arr.join(", "),
  });
  return f;
}

// ---------- Selection Sort ----------
const SELECTION_CODE = [
  "function selectionSort(arr) {",
  "  for (let i = 0; i < arr.length; i++) {",
  "    let min = i;",
  "    for (let j = i + 1; j < arr.length; j++) {",
  "      if (arr[j] < arr[min]) min = j;",
  "    }",
  "    [arr[i], arr[min]] = [arr[min], arr[i]];",
  "  }",
  "}",
];
function buildSelection(customInput?: number[] | string): DSFrame[] {
  const arr = getArr(customInput);
  const f: DSFrame[] = [];
  const sorted: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    let min = i;
    f.push({
      shape: { kind: "array", values: [...arr], pointers: { i, min }, done: [...sorted] },
      line: 3,
      vars: { i, min },
      explain: `Assume min at index ${i}.`,
    });
    for (let j = i + 1; j < arr.length; j++) {
      f.push({
        shape: {
          kind: "array",
          values: [...arr],
          compare: [j, min],
          pointers: { i, j, min },
          done: [...sorted],
        },
        line: 5,
        vars: { i, j, min },
        explain: `Is arr[${j}]=${arr[j]} < arr[${min}]=${arr[min]}?`,
      });
      if (arr[j] < arr[min]) {
        min = j;
        f.push({
          shape: { kind: "array", values: [...arr], pointers: { i, j, min }, done: [...sorted] },
          line: 5,
          vars: { i, j, min },
          explain: `New min at ${min}.`,
        });
      }
    }
    if (min !== i) {
      f.push({
        shape: { kind: "array", values: [...arr], swap: [i, min], done: [...sorted] },
        line: 7,
        vars: { i, min },
        explain: `Swap ${i} ↔ ${min}.`,
      });
      [arr[i], arr[min]] = [arr[min], arr[i]];
    }
    sorted.push(i);
  }
  f.push({
    shape: { kind: "array", values: [...arr], done: arr.map((_, k) => k) },
    line: 8,
    vars: {},
    explain: "Sorted.",
    result: arr.join(", "),
  });
  return f;
}

// ---------- Insertion Sort ----------
const INSERTION_CODE = [
  "function insertionSort(arr) {",
  "  for (let i = 1; i < arr.length; i++) {",
  "    let key = arr[i], j = i - 1;",
  "    while (j >= 0 && arr[j] > key) {",
  "      arr[j+1] = arr[j];",
  "      j--;",
  "    }",
  "    arr[j+1] = key;",
  "  }",
  "}",
];
function buildInsertion(customInput?: number[] | string): DSFrame[] {
  const arr = getArr(customInput);
  const f: DSFrame[] = [];
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    f.push({
      shape: { kind: "array", values: [...arr], pointers: { i, j }, compare: [i] },
      line: 3,
      vars: { i, key, j },
      explain: `Take key=${key}.`,
    });
    while (j >= 0 && arr[j] > key) {
      f.push({
        shape: { kind: "array", values: [...arr], pointers: { i, j }, compare: [j] },
        line: 5,
        vars: { i, key, j },
        explain: `arr[${j}]=${arr[j]} > key, shift right.`,
      });
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
    f.push({
      shape: {
        kind: "array",
        values: [...arr],
        pointers: { i, j },
        done: Array.from({ length: i + 1 }, (_, k) => k),
      },
      line: 8,
      vars: { i, key, j },
      explain: `Place key at ${j + 1}.`,
    });
  }
  f.push({
    shape: { kind: "array", values: [...arr], done: arr.map((_, k) => k) },
    line: 9,
    vars: {},
    explain: "Sorted.",
    result: arr.join(", "),
  });
  return f;
}

// ---------- Merge Sort ----------
const MERGE_CODE = [
  "function mergeSort(arr, l, r) {",
  "  if (l >= r) return;",
  "  const m = (l + r) >> 1;",
  "  mergeSort(arr, l, m);",
  "  mergeSort(arr, m+1, r);",
  "  merge(arr, l, m, r);",
  "}",
];
function buildMerge(customInput?: number[] | string): DSFrame[] {
  const arr = getArr(customInput);
  const f: DSFrame[] = [];
  function merge(l: number, m: number, r: number) {
    const tmp: number[] = [];
    let i = l,
      j = m + 1;
    while (i <= m && j <= r) {
      f.push({
        shape: { kind: "array", values: [...arr], compare: [i, j], pointers: { l, m, r, i, j } },
        line: 6,
        vars: { l, m, r, i, j },
        explain: `Compare ${arr[i]} and ${arr[j]}.`,
      });
      if (arr[i] <= arr[j]) tmp.push(arr[i++]);
      else tmp.push(arr[j++]);
    }
    while (i <= m) tmp.push(arr[i++]);
    while (j <= r) tmp.push(arr[j++]);
    for (let k = 0; k < tmp.length; k++) arr[l + k] = tmp[k];
    f.push({
      shape: {
        kind: "array",
        values: [...arr],
        done: Array.from({ length: r - l + 1 }, (_, k) => l + k),
        pointers: { l, r },
      },
      line: 6,
      vars: { l, m, r },
      explain: `Merged [${l}, ${r}].`,
    });
  }
  function ms(l: number, r: number) {
    if (l >= r) return;
    const m = (l + r) >> 1;
    f.push({
      shape: { kind: "array", values: [...arr], pointers: { l, m, r } },
      line: 3,
      vars: { l, m, r },
      explain: `Split [${l}, ${r}] at ${m}.`,
    });
    ms(l, m);
    ms(m + 1, r);
    merge(l, m, r);
  }
  ms(0, arr.length - 1);
  f.push({
    shape: { kind: "array", values: [...arr], done: arr.map((_, k) => k) },
    line: 7,
    vars: {},
    explain: "Sorted.",
    result: arr.join(", "),
  });
  return f;
}

// ---------- Quick Sort ----------
const QUICK_CODE = [
  "function quickSort(arr, lo, hi) {",
  "  if (lo >= hi) return;",
  "  const p = partition(arr, lo, hi);",
  "  quickSort(arr, lo, p - 1);",
  "  quickSort(arr, p + 1, hi);",
  "}",
];
function buildQuick(customInput?: number[] | string): DSFrame[] {
  const arr = getArr(customInput);
  const f: DSFrame[] = [];
  function partition(lo: number, hi: number) {
    const pivot = arr[hi];
    let i = lo - 1;
    f.push({
      shape: { kind: "array", values: [...arr], pointers: { lo, hi, pivot: hi } },
      line: 3,
      vars: { lo, hi, pivot },
      explain: `Pivot = ${pivot}.`,
    });
    for (let j = lo; j < hi; j++) {
      f.push({
        shape: { kind: "array", values: [...arr], compare: [j, hi], pointers: { lo, hi, i, j } },
        line: 3,
        vars: { lo, hi, i, j },
        explain: `Compare ${arr[j]} with pivot ${pivot}.`,
      });
      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          f.push({
            shape: { kind: "array", values: [...arr], swap: [i, j], pointers: { lo, hi, i, j } },
            line: 3,
            vars: { lo, hi, i, j },
            explain: `Swap ${i} ↔ ${j}.`,
          });
        }
      }
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    f.push({
      shape: { kind: "array", values: [...arr], swap: [i + 1, hi], pointers: { lo, hi } },
      line: 3,
      vars: { lo, hi },
      explain: `Place pivot at ${i + 1}.`,
    });
    return i + 1;
  }
  function qs(lo: number, hi: number) {
    if (lo >= hi) return;
    const p = partition(lo, hi);
    qs(lo, p - 1);
    qs(p + 1, hi);
  }
  qs(0, arr.length - 1);
  f.push({
    shape: { kind: "array", values: [...arr], done: arr.map((_, k) => k) },
    line: 6,
    vars: {},
    explain: "Sorted.",
    result: arr.join(", "),
  });
  return f;
}

export const SORTING_ALGOS: DSAlgoMeta[] = [
  {
    id: "bubble",
    name: "Bubble Sort",
    category: "Sorting",
    difficulty: "Easy",
    blurb: "Repeatedly swap adjacent out-of-order pairs.",
    code: BUBBLE_CODE,
    build: buildBubble,
    complexity: { time: { best: "O(n)", avg: "O(n²)", worst: "O(n²)" }, space: "O(1)" },
  },
  {
    id: "selection",
    name: "Selection Sort",
    category: "Sorting",
    difficulty: "Easy",
    blurb: "Pick the minimum, place it, repeat.",
    code: SELECTION_CODE,
    build: buildSelection,
    complexity: { time: { best: "O(n²)", avg: "O(n²)", worst: "O(n²)" }, space: "O(1)" },
  },
  {
    id: "insertion",
    name: "Insertion Sort",
    category: "Sorting",
    difficulty: "Easy",
    blurb: "Grow a sorted prefix one element at a time.",
    code: INSERTION_CODE,
    build: buildInsertion,
    complexity: { time: { best: "O(n)", avg: "O(n²)", worst: "O(n²)" }, space: "O(1)" },
  },
  {
    id: "merge",
    name: "Merge Sort",
    category: "Sorting",
    difficulty: "Medium",
    blurb: "Divide, recursively sort, merge halves.",
    code: MERGE_CODE,
    build: buildMerge,
    complexity: {
      time: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)" },
      space: "O(n)",
    },
  },
  {
    id: "quick",
    name: "Quick Sort",
    category: "Sorting",
    difficulty: "Medium",
    blurb: "Partition around a pivot, recurse.",
    code: QUICK_CODE,
    build: buildQuick,
    complexity: {
      time: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)" },
      space: "O(log n)",
    },
  },
];
