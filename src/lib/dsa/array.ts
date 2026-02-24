import type { DSAlgoMeta, DSFrame } from "./types";

const SAMPLE = [3, -1, 4, 1, -5, 9, 2, 6];

// ---------- Reverse Array ----------
const REVERSE_CODE = [
  "function reverse(arr) {",
  "  let l = 0, r = arr.length - 1;",
  "  while (l < r) {",
  "    [arr[l], arr[r]] = [arr[r], arr[l]];",
  "    l++; r--;",
  "  }",
  "  return arr;",
  "}",
];
const getArr = (customInput?: number[] | string, defaultArr: number[] = SAMPLE): number[] =>
  Array.isArray(customInput) && customInput.length > 0 ? [...customInput] : defaultArr;

function buildReverse(customInput?: number[] | string): DSFrame[] {
  const arr = getArr(customInput);
  const f: DSFrame[] = [];
  let l = 0,
    r = arr.length - 1;
  f.push({
    shape: { kind: "array", values: [...arr], pointers: { l, r } },
    line: 2,
    vars: { l, r },
    explain: "Two pointers at both ends.",
  });
  while (l < r) {
    f.push({
      shape: { kind: "array", values: [...arr], swap: [l, r], pointers: { l, r } },
      line: 4,
      vars: { l, r },
      explain: `Swap arr[${l}] with arr[${r}].`,
    });
    [arr[l], arr[r]] = [arr[r], arr[l]];
    f.push({
      shape: { kind: "array", values: [...arr], pointers: { l, r } },
      line: 4,
      vars: { l, r },
      explain: "After swap.",
    });
    l++;
    r--;
    f.push({
      shape: { kind: "array", values: [...arr], pointers: { l, r } },
      line: 5,
      vars: { l, r },
      explain: "Move pointers inward.",
    });
  }
  f.push({
    shape: { kind: "array", values: [...arr], done: arr.map((_, i) => i) },
    line: 7,
    vars: { l, r },
    explain: "Reversed.",
    result: arr.join(", "),
  });
  return f;
}

// ---------- Kadane (Max Subarray) ----------
const KADANE_CODE = [
  "function maxSubarray(arr) {",
  "  let cur = arr[0], best = arr[0];",
  "  for (let i = 1; i < arr.length; i++) {",
  "    cur = Math.max(arr[i], cur + arr[i]);",
  "    best = Math.max(best, cur);",
  "  }",
  "  return best;",
  "}",
];
function buildKadane(customInput?: number[] | string): DSFrame[] {
  const arr = getArr(customInput);
  const f: DSFrame[] = [];
  let cur = arr[0],
    best = arr[0];
  f.push({
    shape: { kind: "array", values: [...arr], pointers: { i: 0 }, compare: [0] },
    line: 2,
    vars: { cur, best },
    explain: "Initialise with first element.",
  });
  for (let i = 1; i < arr.length; i++) {
    f.push({
      shape: { kind: "array", values: [...arr], pointers: { i }, compare: [i] },
      line: 4,
      vars: { cur, best, i },
      explain: `Inspect arr[${i}] = ${arr[i]}.`,
    });
    cur = Math.max(arr[i], cur + arr[i]);
    best = Math.max(best, cur);
    f.push({
      shape: { kind: "array", values: [...arr], pointers: { i } },
      line: 5,
      vars: { cur, best, i },
      explain: `cur=${cur}, best=${best}.`,
    });
  }
  f.push({
    shape: { kind: "array", values: [...arr] },
    line: 7,
    vars: { best },
    explain: "Done.",
    result: `max sum = ${best}`,
  });
  return f;
}

// ---------- Move Zeros ----------
const MOVE_ZEROS_CODE = [
  "function moveZeros(arr) {",
  "  let w = 0;",
  "  for (let i = 0; i < arr.length; i++) {",
  "    if (arr[i] !== 0) {",
  "      [arr[w], arr[i]] = [arr[i], arr[w]];",
  "      w++;",
  "    }",
  "  }",
  "}",
];
function buildMoveZeros(customInput?: number[] | string): DSFrame[] {
  const arr = getArr(customInput, [0, 1, 0, 3, 12, 0, 5]);
  const f: DSFrame[] = [];
  let w = 0;
  for (let i = 0; i < arr.length; i++) {
    f.push({
      shape: { kind: "array", values: [...arr], pointers: { w, i }, compare: [i] },
      line: 4,
      vars: { w, i },
      explain: `Check arr[${i}] = ${arr[i]}.`,
    });
    if (arr[i] !== 0) {
      f.push({
        shape: { kind: "array", values: [...arr], pointers: { w, i }, swap: [w, i] },
        line: 5,
        vars: { w, i },
        explain: `Non-zero, swap into position ${w}.`,
      });
      [arr[w], arr[i]] = [arr[i], arr[w]];
      w++;
    }
  }
  f.push({
    shape: { kind: "array", values: [...arr], done: arr.map((_, idx) => idx) },
    line: 9,
    vars: { w },
    explain: "All zeros pushed to the end.",
    result: arr.join(", "),
  });
  return f;
}

// ---------- Rotate Array (right by k) ----------
const ROTATE_CODE = [
  "function rotateRight(arr, k) {",
  "  k = k % arr.length;",
  "  reverse(arr, 0, arr.length - 1);",
  "  reverse(arr, 0, k - 1);",
  "  reverse(arr, k, arr.length - 1);",
  "}",
];
function buildRotate(customInput?: number[] | string, searchTarget?: number): DSFrame[] {
  const arr = getArr(customInput, [1, 2, 3, 4, 5, 6, 7]);
  let k = searchTarget !== undefined ? searchTarget : 3;
  k = k % arr.length;
  if (k < 0) k += arr.length;
  const f: DSFrame[] = [];
  const reverseRange = (lo: number, hi: number, label: string, lineN: number) => {
    let l = lo,
      r = hi;
    f.push({
      shape: { kind: "array", values: [...arr], pointers: { l, r } },
      line: lineN,
      vars: { l, r },
      explain: `${label} — range [${lo}, ${hi}].`,
    });
    while (l < r) {
      [arr[l], arr[r]] = [arr[r], arr[l]];
      f.push({
        shape: { kind: "array", values: [...arr], swap: [l, r], pointers: { l, r } },
        line: lineN,
        vars: { l, r },
        explain: `Swap ${l} ↔ ${r}.`,
      });
      l++;
      r--;
    }
  };
  f.push({
    shape: { kind: "array", values: [...arr] },
    line: 2,
    vars: { k },
    explain: `Rotate right by k=${k}.`,
  });
  reverseRange(0, arr.length - 1, "Reverse whole", 3);
  reverseRange(0, k - 1, "Reverse first k", 4);
  reverseRange(k, arr.length - 1, "Reverse the rest", 5);
  f.push({
    shape: { kind: "array", values: [...arr], done: arr.map((_, i) => i) },
    line: 6,
    vars: {},
    explain: "Done.",
    result: arr.join(", "),
  });
  return f;
}

// ---------- Find Max ----------
const FIND_MAX_CODE = [
  "function findMax(arr) {",
  "  let best = arr[0];",
  "  for (let i = 1; i < arr.length; i++) {",
  "    if (arr[i] > best) best = arr[i];",
  "  }",
  "  return best;",
  "}",
];
function buildFindMax(customInput?: number[] | string): DSFrame[] {
  const arr = getArr(customInput);
  const f: DSFrame[] = [];
  let best = arr[0];
  let bestIdx = 0;
  f.push({
    shape: { kind: "array", values: [...arr], pointers: { i: 0, best: 0 }, compare: [0] },
    line: 2,
    vars: { best },
    explain: "Start with first element.",
  });
  for (let i = 1; i < arr.length; i++) {
    f.push({
      shape: { kind: "array", values: [...arr], pointers: { i, best: bestIdx }, compare: [i] },
      line: 4,
      vars: { i, best },
      explain: `Compare arr[${i}]=${arr[i]} with current best ${best}.`,
    });
    if (arr[i] > best) {
      best = arr[i];
      bestIdx = i;
      f.push({
        shape: { kind: "array", values: [...arr], pointers: { i, best: bestIdx } },
        line: 4,
        vars: { i, best },
        explain: `New best = ${best}.`,
      });
    }
  }
  f.push({
    shape: { kind: "array", values: [...arr], done: [bestIdx] },
    line: 6,
    vars: { best },
    explain: "Done.",
    result: `max = ${best}`,
  });
  return f;
}

export const ARRAY_ALGOS: DSAlgoMeta[] = [
  {
    id: "reverse-array",
    name: "Reverse Array",
    category: "Array",
    difficulty: "Easy",
    blurb: "Two-pointer in-place reversal.",
    code: REVERSE_CODE,
    build: buildReverse,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(1)" },
  },
  {
    id: "max-subarray",
    name: "Max Subarray (Kadane)",
    category: "Array",
    difficulty: "Medium",
    blurb: "Track running sum vs. start-fresh choice.",
    code: KADANE_CODE,
    build: buildKadane,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(1)" },
  },
  {
    id: "move-zeros",
    name: "Move Zeros",
    category: "Array",
    difficulty: "Easy",
    blurb: "Two-pointer write head pushes non-zeros forward.",
    code: MOVE_ZEROS_CODE,
    build: buildMoveZeros,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(1)" },
  },
  {
    id: "rotate-right",
    name: "Rotate Array (Right by k)",
    category: "Array",
    difficulty: "Medium",
    blurb: "Three reversals: whole, first k, rest.",
    code: ROTATE_CODE,
    build: buildRotate,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(1)" },
  },
  {
    id: "find-max",
    name: "Find Maximum",
    category: "Array",
    difficulty: "Easy",
    blurb: "Linear scan tracking the best so far.",
    code: FIND_MAX_CODE,
    build: buildFindMax,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(1)" },
  },
];
