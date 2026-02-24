import type { DSAlgoMeta, DSFrame } from "./types";

// ---------- Push / Pop demo ----------
const PUSH_POP_CODE = [
  "// Stack basics: LIFO",
  "stack.push(3); stack.push(7); stack.push(1);",
  "stack.pop();   // removes 1",
  "stack.push(5);",
  "stack.pop();   // removes 5",
];
const getArr = (customInput?: number[] | string, defaultArr: number[] = [3, 7, 1, 5]): number[] =>
  Array.isArray(customInput) && customInput.length > 0 ? [...customInput] : defaultArr;

function buildPushPop(customInput?: number[] | string): DSFrame[] {
  const stack: number[] = [];
  const f: DSFrame[] = [];
  const vals = getArr(customInput, [3, 7, 1, 5]);
  const ops: { op: "push" | "pop"; val?: number; line: number; explain: string }[] = [];

  vals.forEach((v) => {
    ops.push({ op: "push", val: v, line: 2, explain: `Push ${v}.` });
  });
  if (vals.length > 0) {
    ops.push({ op: "pop", line: 3, explain: `Pop top (${vals[vals.length - 1]}).` });
  }
  ops.push({ op: "push", val: 99, line: 4, explain: "Push 99." });
  ops.push({ op: "pop", line: 5, explain: "Pop top (99)." });

  for (const o of ops) {
    if (o.op === "push") {
      stack.push(o.val!);
      f.push({
        shape: { kind: "stack", values: [...stack], highlight: [stack.length - 1] },
        line: o.line,
        vars: { top: stack[stack.length - 1] },
        explain: o.explain,
      });
    } else {
      const popped = stack.pop();
      f.push({
        shape: { kind: "stack", values: [...stack] },
        line: o.line,
        vars: { popped: popped ?? "—" },
        explain: o.explain,
      });
    }
  }
  return f;
}

// ---------- Balanced Parentheses ----------
const BAL_CODE = [
  "function isBalanced(s) {",
  "  const stack = [];",
  "  const pairs = { ')': '(', ']': '[', '}': '{' };",
  "  for (const c of s) {",
  "    if ('([{'.includes(c)) stack.push(c);",
  "    else if (stack.pop() !== pairs[c]) return false;",
  "  }",
  "  return stack.length === 0;",
  "}",
];
function buildBalanced(customInput?: number[] | string): DSFrame[] {
  let s = "({[]})";
  if (typeof customInput === "string" && customInput.trim()) {
    s = customInput.trim();
  } else if (Array.isArray(customInput) && customInput.length > 0) {
    s = customInput.map(String).join("");
  }
  const stack: number[] = []; // store char codes for visual; map to ASCII numbers
  const f: DSFrame[] = [];
  const open = new Set("([{");
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (open.has(c)) {
      stack.push(c.charCodeAt(0));
      f.push({
        shape: { kind: "stack", values: [...stack], highlight: [stack.length - 1] },
        line: 5,
        vars: { i, c, stackTop: c },
        explain: `Push '${c}'.`,
      });
    } else {
      const top = stack.pop();
      const ok = top !== undefined && String.fromCharCode(top) === pairs[c];
      f.push({
        shape: { kind: "stack", values: [...stack] },
        line: 6,
        vars: { i, c, ok: ok ? "yes" : "no" },
        explain: ok ? `Match '${c}' with '${pairs[c]}'.` : `Mismatch — not balanced.`,
      });
      if (!ok) {
        f.push({
          shape: { kind: "stack", values: [...stack] },
          line: 6,
          vars: {},
          explain: "Return false.",
          result: "false",
        });
        return f;
      }
    }
  }
  f.push({
    shape: { kind: "stack", values: [...stack] },
    line: 8,
    vars: {},
    explain: stack.length === 0 ? "Stack empty — balanced." : "Stack not empty — unbalanced.",
    result: stack.length === 0 ? "true" : "false",
  });
  return f;
}

// ---------- Reverse a String ----------
const REV_STR_CODE = [
  "function reverseString(s) {",
  "  const stack = [];",
  "  for (const c of s) stack.push(c);",
  "  let out = '';",
  "  while (stack.length) out += stack.pop();",
  "  return out;",
  "}",
];
function buildRevStr(customInput?: number[] | string): DSFrame[] {
  let s = "HELLO";
  if (typeof customInput === "string" && customInput.trim()) {
    s = customInput.trim();
  } else if (Array.isArray(customInput) && customInput.length > 0) {
    s = customInput.map(String).join("");
  }
  const codes: number[] = [];
  const f: DSFrame[] = [];
  for (let i = 0; i < s.length; i++) {
    codes.push(s.charCodeAt(i));
    f.push({
      shape: { kind: "stack", values: [...codes], highlight: [codes.length - 1] },
      line: 3,
      vars: { c: s[i] },
      explain: `Push '${s[i]}'.`,
    });
  }
  let out = "";
  while (codes.length) {
    const c = String.fromCharCode(codes.pop()!);
    out += c;
    f.push({
      shape: { kind: "stack", values: [...codes] },
      line: 5,
      vars: { out },
      explain: `Pop '${c}', append to result.`,
    });
  }
  f.push({
    shape: { kind: "stack", values: [] },
    line: 6,
    vars: { out },
    explain: "Done.",
    result: out,
  });
  return f;
}

// ---------- Next Greater Element ----------
const NGE_CODE = [
  "function nextGreater(arr) {",
  "  const stack = [], res = Array(arr.length).fill(-1);",
  "  for (let i = 0; i < arr.length; i++) {",
  "    while (stack.length && arr[stack.at(-1)] < arr[i]) {",
  "      res[stack.pop()] = arr[i];",
  "    }",
  "    stack.push(i);",
  "  }",
  "  return res;",
  "}",
];
function buildNGE(customInput?: number[] | string): DSFrame[] {
  const arr = getArr(customInput, [4, 5, 2, 25, 7, 8]);
  const f: DSFrame[] = [];
  const stack: number[] = [];
  const res = Array(arr.length).fill(-1);
  for (let i = 0; i < arr.length; i++) {
    f.push({
      shape: { kind: "stack", values: stack.map((idx) => arr[idx]) },
      line: 3,
      vars: { i, val: arr[i] },
      explain: `Inspect arr[${i}] = ${arr[i]}.`,
    });
    while (stack.length && arr[stack[stack.length - 1]] < arr[i]) {
      const top = stack.pop()!;
      res[top] = arr[i];
      f.push({
        shape: { kind: "stack", values: stack.map((idx) => arr[idx]) },
        line: 5,
        vars: { top, val: arr[top], next: arr[i] },
        explain: `Pop ${arr[top]}; its next greater is ${arr[i]}.`,
      });
    }
    stack.push(i);
    f.push({
      shape: { kind: "stack", values: stack.map((idx) => arr[idx]), highlight: [stack.length - 1] },
      line: 7,
      vars: { i },
      explain: `Push index ${i}.`,
    });
  }
  f.push({
    shape: { kind: "stack", values: stack.map((idx) => arr[idx]) },
    line: 9,
    vars: {},
    explain: "Done.",
    result: res.join(", "),
  });
  return f;
}

// ---------- Min Stack ----------
const MIN_STACK_CODE = [
  "class MinStack {",
  "  push(v) { stack.push(v); minS.push(Math.min(v, minS.top ?? v)); }",
  "  pop()   { stack.pop(); minS.pop(); }",
  "  getMin() { return minS.top; }",
  "}",
];
function buildMinStack(customInput?: number[] | string): DSFrame[] {
  const stack: number[] = [];
  const minS: number[] = [];
  const f: DSFrame[] = [];
  const vals = getArr(customInput, [5, 2, 7, 1]);
  const ops: { op: "push" | "pop" | "getMin"; v?: number }[] = [];

  vals.forEach((v) => {
    ops.push({ op: "push", v });
  });
  ops.push({ op: "getMin" });
  if (vals.length > 0) {
    ops.push({ op: "pop" });
  }
  ops.push({ op: "getMin" });

  for (const o of ops) {
    if (o.op === "push") {
      stack.push(o.v!);
      const m = minS.length ? Math.min(o.v!, minS[minS.length - 1]) : o.v!;
      minS.push(m);
      f.push({
        shape: { kind: "stack", values: [...stack], highlight: [stack.length - 1] },
        line: 2,
        vars: { top: o.v!, min: m },
        explain: `Push ${o.v}; min stack tops at ${m}.`,
      });
    } else if (o.op === "pop") {
      stack.pop();
      minS.pop();
      f.push({
        shape: { kind: "stack", values: [...stack] },
        line: 3,
        vars: { min: minS[minS.length - 1] ?? "—" },
        explain: "Pop top from both stacks.",
      });
    } else {
      f.push({
        shape: { kind: "stack", values: [...stack] },
        line: 4,
        vars: { min: minS[minS.length - 1] ?? "—" },
        explain: `Min = ${minS[minS.length - 1]}.`,
      });
    }
  }
  return f;
}

export const STACK_ALGOS: DSAlgoMeta[] = [
  {
    id: "stack-basics",
    name: "Push / Pop",
    category: "Stack",
    difficulty: "Easy",
    blurb: "LIFO basics demo.",
    code: PUSH_POP_CODE,
    build: buildPushPop,
    complexity: { time: { best: "O(1)", avg: "O(1)", worst: "O(1)" }, space: "O(n)" },
  },
  {
    id: "balanced-parens",
    name: "Balanced Parentheses",
    category: "Stack",
    difficulty: "Easy",
    blurb: "Match opens/closes via stack.",
    code: BAL_CODE,
    build: buildBalanced,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(n)" },
  },
  {
    id: "reverse-string",
    name: "Reverse a String",
    category: "Stack",
    difficulty: "Easy",
    blurb: "Push chars, pop into result.",
    code: REV_STR_CODE,
    build: buildRevStr,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(n)" },
  },
  {
    id: "next-greater",
    name: "Next Greater Element",
    category: "Stack",
    difficulty: "Medium",
    blurb: "Monotonic stack of indices.",
    code: NGE_CODE,
    build: buildNGE,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(n)" },
  },
  {
    id: "min-stack",
    name: "Min Stack",
    category: "Stack",
    difficulty: "Medium",
    blurb: "Auxiliary stack tracks running min.",
    code: MIN_STACK_CODE,
    build: buildMinStack,
    complexity: { time: { best: "O(1)", avg: "O(1)", worst: "O(1)" }, space: "O(n)" },
  },
];
