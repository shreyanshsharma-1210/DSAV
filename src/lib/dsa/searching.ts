import type { DSAlgoMeta, DSFrame } from "./types";

const SORTED = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];
const UNSORTED = [4, 9, 1, 7, 3, 12, 5, 8];

// ---------- Linear Search ----------
const LINEAR_CODE = [
  "function linearSearch(arr, target) {",
  "  for (let i = 0; i < arr.length; i++) {",
  "    if (arr[i] === target) return i;",
  "  }",
  "  return -1;",
  "}",
];
const getArr = (customInput?: number[] | string, defaultArr: number[] = UNSORTED): number[] =>
  Array.isArray(customInput) && customInput.length > 0 ? [...customInput] : defaultArr;

function buildLinear(customInput?: number[] | string, searchTarget?: number): DSFrame[] {
  const arr = getArr(customInput, UNSORTED);
  const target = searchTarget !== undefined ? searchTarget : 12;
  const f: DSFrame[] = [];
  for (let i = 0; i < arr.length; i++) {
    f.push({
      shape: { kind: "array", values: [...arr], compare: [i], pointers: { i } },
      line: 3,
      vars: { i, target },
      explain: `Check arr[${i}] = ${arr[i]}.`,
    });
    if (arr[i] === target) {
      f.push({
        shape: { kind: "array", values: [...arr], done: [i], pointers: { i } },
        line: 3,
        vars: { i, target },
        explain: `Found ${target} at index ${i}.`,
        result: `index ${i}`,
      });
      return f;
    }
  }
  f.push({
    shape: { kind: "array", values: [...arr] },
    line: 5,
    vars: { target },
    explain: "Not found.",
    result: "-1",
  });
  return f;
}

// ---------- Binary Search ----------
const BINARY_CODE = [
  "function binarySearch(arr, target) {",
  "  let lo = 0, hi = arr.length - 1;",
  "  while (lo <= hi) {",
  "    const mid = (lo + hi) >> 1;",
  "    if (arr[mid] === target) return mid;",
  "    if (arr[mid] < target) lo = mid + 1;",
  "    else hi = mid - 1;",
  "  }",
  "  return -1;",
  "}",
];
function buildBinary(customInput?: number[] | string, searchTarget?: number): DSFrame[] {
  const arr = getArr(customInput, SORTED);
  if (Array.isArray(customInput)) {
    arr.sort((a, b) => a - b);
  }
  const target = searchTarget !== undefined ? searchTarget : 13;
  const f: DSFrame[] = [];
  let lo = 0,
    hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    f.push({
      shape: { kind: "array", values: [...arr], compare: [mid], pointers: { lo, mid, hi } },
      line: 4,
      vars: { lo, mid, hi, target },
      explain: `mid=${mid}, arr[mid]=${arr[mid]}.`,
    });
    if (arr[mid] === target) {
      f.push({
        shape: { kind: "array", values: [...arr], done: [mid], pointers: { lo, mid, hi } },
        line: 5,
        vars: { lo, mid, hi, target },
        explain: `Found at ${mid}.`,
        result: `index ${mid}`,
      });
      return f;
    }
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
    f.push({
      shape: { kind: "array", values: [...arr], pointers: { lo, hi } },
      line: 7,
      vars: { lo, hi },
      explain: `Narrow to [${lo}, ${hi}].`,
    });
  }
  f.push({
    shape: { kind: "array", values: [...arr] },
    line: 9,
    vars: { target },
    explain: "Not found.",
    result: "-1",
  });
  return f;
}

// ---------- First Occurrence (Binary Search variant) ----------
const FIRST_OCC_CODE = [
  "function firstOccurrence(arr, target) {",
  "  let lo = 0, hi = arr.length - 1, ans = -1;",
  "  while (lo <= hi) {",
  "    const mid = (lo + hi) >> 1;",
  "    if (arr[mid] === target) { ans = mid; hi = mid - 1; }",
  "    else if (arr[mid] < target) lo = mid + 1;",
  "    else hi = mid - 1;",
  "  }",
  "  return ans;",
  "}",
];
function buildFirstOcc(customInput?: number[] | string, searchTarget?: number): DSFrame[] {
  const arr = getArr(customInput, [1, 2, 2, 2, 3, 4, 5, 5, 7]);
  if (Array.isArray(customInput)) {
    arr.sort((a, b) => a - b);
  }
  const target = searchTarget !== undefined ? searchTarget : 2;
  const f: DSFrame[] = [];
  let lo = 0,
    hi = arr.length - 1,
    ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    f.push({
      shape: {
        kind: "array",
        values: [...arr],
        compare: [mid],
        pointers: { lo, mid, hi, ans: ans < 0 ? lo : ans },
      },
      line: 4,
      vars: { lo, mid, hi, ans, target },
      explain: `mid=${mid}, arr[mid]=${arr[mid]}.`,
    });
    if (arr[mid] === target) {
      ans = mid;
      hi = mid - 1;
    } else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  if (ans >= 0)
    f.push({
      shape: { kind: "array", values: [...arr], done: [ans] },
      line: 9,
      vars: { ans },
      explain: `First occurrence at ${ans}.`,
      result: `index ${ans}`,
    });
  else
    f.push({
      shape: { kind: "array", values: [...arr] },
      line: 9,
      vars: {},
      explain: "Not found.",
      result: "-1",
    });
  return f;
}

// ---------- Jump Search ----------
const JUMP_CODE = [
  "function jumpSearch(arr, target) {",
  "  const n = arr.length, step = Math.floor(Math.sqrt(n));",
  "  let prev = 0, j = step;",
  "  while (j < n && arr[j] < target) { prev = j; j += step; }",
  "  for (let i = prev; i < Math.min(j+1, n); i++) {",
  "    if (arr[i] === target) return i;",
  "  }",
  "  return -1;",
  "}",
];
function buildJump(customInput?: number[] | string, searchTarget?: number): DSFrame[] {
  const arr = getArr(customInput, SORTED);
  if (Array.isArray(customInput)) {
    arr.sort((a, b) => a - b);
  }
  const target = searchTarget !== undefined ? searchTarget : 17;
  const f: DSFrame[] = [];
  const n = arr.length;
  const step = Math.max(1, Math.floor(Math.sqrt(n)));
  let prev = 0,
    j = step;
  f.push({
    shape: { kind: "array", values: [...arr], pointers: { prev, j: Math.min(j, n - 1) } },
    line: 3,
    vars: { step, prev, j },
    explain: `Step size = √n ≈ ${step}.`,
  });
  while (j < n && arr[j] < target) {
    f.push({
      shape: { kind: "array", values: [...arr], compare: [j], pointers: { prev, j } },
      line: 4,
      vars: { prev, j },
      explain: `arr[${j}]=${arr[j]} < ${target}, jump.`,
    });
    prev = j;
    j += step;
  }
  f.push({
    shape: { kind: "array", values: [...arr], pointers: { prev, j: Math.min(j, n - 1) } },
    line: 5,
    vars: { prev, j },
    explain: `Linear scan from ${prev}.`,
  });
  for (let i = prev; i < Math.min(j + 1, n); i++) {
    f.push({
      shape: {
        kind: "array",
        values: [...arr],
        compare: [i],
        pointers: { prev, j: Math.min(j, n - 1), i },
      },
      line: 6,
      vars: { i },
      explain: `Check arr[${i}]=${arr[i]}.`,
    });
    if (arr[i] === target) {
      f.push({
        shape: { kind: "array", values: [...arr], done: [i] },
        line: 6,
        vars: { i },
        explain: `Found at ${i}.`,
        result: `index ${i}`,
      });
      return f;
    }
  }
  f.push({
    shape: { kind: "array", values: [...arr] },
    line: 8,
    vars: { target },
    explain: "Not found.",
    result: "-1",
  });
  return f;
}

// ---------- Ternary Search ----------
const TERNARY_CODE = [
  "function ternarySearch(arr, target) {",
  "  let lo = 0, hi = arr.length - 1;",
  "  while (lo <= hi) {",
  "    const m1 = lo + Math.floor((hi - lo) / 3);",
  "    const m2 = hi - Math.floor((hi - lo) / 3);",
  "    if (arr[m1] === target) return m1;",
  "    if (arr[m2] === target) return m2;",
  "    if (target < arr[m1]) hi = m1 - 1;",
  "    else if (target > arr[m2]) lo = m2 + 1;",
  "    else { lo = m1 + 1; hi = m2 - 1; }",
  "  }",
  "  return -1;",
  "}",
];
function buildTernary(customInput?: number[] | string, searchTarget?: number): DSFrame[] {
  const arr = getArr(customInput, SORTED);
  if (Array.isArray(customInput)) {
    arr.sort((a, b) => a - b);
  }
  const target = searchTarget !== undefined ? searchTarget : 9;
  const f: DSFrame[] = [];
  let lo = 0,
    hi = arr.length - 1;
  while (lo <= hi) {
    const m1 = lo + Math.floor((hi - lo) / 3);
    const m2 = hi - Math.floor((hi - lo) / 3);
    f.push({
      shape: { kind: "array", values: [...arr], compare: [m1, m2], pointers: { lo, m1, m2, hi } },
      line: 5,
      vars: { lo, m1, m2, hi, target },
      explain: `Two probes at ${m1} and ${m2}.`,
    });
    if (arr[m1] === target) {
      f.push({
        shape: { kind: "array", values: [...arr], done: [m1] },
        line: 6,
        vars: { m1 },
        explain: `Found at ${m1}.`,
        result: `index ${m1}`,
      });
      return f;
    }
    if (arr[m2] === target) {
      f.push({
        shape: { kind: "array", values: [...arr], done: [m2] },
        line: 7,
        vars: { m2 },
        explain: `Found at ${m2}.`,
        result: `index ${m2}`,
      });
      return f;
    }
    if (target < arr[m1]) hi = m1 - 1;
    else if (target > arr[m2]) lo = m2 + 1;
    else {
      lo = m1 + 1;
      hi = m2 - 1;
    }
    f.push({
      shape: { kind: "array", values: [...arr], pointers: { lo, hi } },
      line: 10,
      vars: { lo, hi },
      explain: `Narrow to [${lo}, ${hi}].`,
    });
  }
  f.push({
    shape: { kind: "array", values: [...arr] },
    line: 12,
    vars: { target },
    explain: "Not found.",
    result: "-1",
  });
  return f;
}

export const SEARCHING_ALGOS: DSAlgoMeta[] = [
  {
    id: "linear",
    name: "Linear Search",
    category: "Searching",
    difficulty: "Easy",
    blurb: "Scan each element until match.",
    code: LINEAR_CODE,
    build: buildLinear,
    complexity: { time: { best: "O(1)", avg: "O(n)", worst: "O(n)" }, space: "O(1)" },
  },
  {
    id: "binary",
    name: "Binary Search",
    category: "Searching",
    difficulty: "Easy",
    blurb: "Halve the search space each step.",
    code: BINARY_CODE,
    build: buildBinary,
    complexity: { time: { best: "O(1)", avg: "O(log n)", worst: "O(log n)" }, space: "O(1)" },
  },
  {
    id: "first-occurrence",
    name: "First Occurrence",
    category: "Searching",
    difficulty: "Medium",
    blurb: "Binary search variant for leftmost match.",
    code: FIRST_OCC_CODE,
    build: buildFirstOcc,
    complexity: { time: { best: "O(1)", avg: "O(log n)", worst: "O(log n)" }, space: "O(1)" },
  },
  {
    id: "jump-search",
    name: "Jump Search",
    category: "Searching",
    difficulty: "Medium",
    blurb: "Jump in √n steps then linear scan.",
    code: JUMP_CODE,
    build: buildJump,
    complexity: { time: { best: "O(1)", avg: "O(√n)", worst: "O(√n)" }, space: "O(1)" },
  },
  {
    id: "ternary-search",
    name: "Ternary Search",
    category: "Searching",
    difficulty: "Medium",
    blurb: "Two probes split the range into thirds.",
    code: TERNARY_CODE,
    build: buildTernary,
    complexity: { time: { best: "O(1)", avg: "O(log₃ n)", worst: "O(log₃ n)" }, space: "O(1)" },
  },
];
