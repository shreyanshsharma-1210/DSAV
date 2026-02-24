import type { DSAlgoMeta, DSFrame } from "./types";

// ---------- Enqueue / Dequeue ----------
const ENQDEQ_CODE = [
  "// Queue basics: FIFO",
  "queue.enqueue(3); queue.enqueue(7); queue.enqueue(1);",
  "queue.dequeue(); // removes 3",
  "queue.enqueue(5);",
  "queue.dequeue(); // removes 7",
];
const getArr = (customInput?: number[] | string, defaultArr: number[] = [3, 7, 1, 5]): number[] =>
  Array.isArray(customInput) && customInput.length > 0 ? [...customInput] : defaultArr;

function buildEnqDeq(customInput?: number[] | string): DSFrame[] {
  const q: number[] = [];
  const f: DSFrame[] = [];
  const vals = getArr(customInput, [3, 7, 1, 5]);
  const ops: { op: "enq" | "deq"; v?: number; line: number; expl: string }[] = [];

  vals.forEach((v) => {
    ops.push({ op: "enq", v, line: 2, expl: `Enqueue ${v}.` });
  });
  if (vals.length > 0) {
    ops.push({ op: "deq", line: 3, expl: `Dequeue front (${vals[0]}).` });
  }
  ops.push({ op: "enq", v: 99, line: 4, expl: "Enqueue 99." });
  ops.push({ op: "deq", line: 5, expl: "Dequeue front." });

  for (const o of ops) {
    if (o.op === "enq") {
      q.push(o.v!);
      f.push({
        shape: { kind: "queue", values: [...q], highlight: [q.length - 1] },
        line: o.line,
        vars: { back: o.v! },
        explain: o.expl,
      });
    } else {
      const front = q.shift();
      f.push({
        shape: { kind: "queue", values: [...q] },
        line: o.line,
        vars: { dequeued: front ?? "—" },
        explain: o.expl,
      });
    }
  }
  return f;
}

// ---------- Reverse Queue using Stack ----------
const REV_Q_CODE = [
  "function reverse(q) {",
  "  const stack = [];",
  "  while (!q.empty()) stack.push(q.dequeue());",
  "  while (stack.length) q.enqueue(stack.pop());",
  "}",
];
function buildRevQueue(customInput?: number[] | string): DSFrame[] {
  const q = getArr(customInput, [1, 2, 3, 4, 5]);
  const stack: number[] = [];
  const f: DSFrame[] = [];
  f.push({
    shape: { kind: "queue", values: [...q] },
    line: 1,
    vars: {},
    explain: "Initial queue.",
  });
  while (q.length) {
    const v = q.shift()!;
    stack.push(v);
    f.push({
      shape: { kind: "queue", values: [...q] },
      line: 3,
      vars: { popped: v },
      explain: `Dequeue ${v}, push to stack.`,
    });
  }
  while (stack.length) {
    const v = stack.pop()!;
    q.push(v);
    f.push({
      shape: { kind: "queue", values: [...q], highlight: [q.length - 1] },
      line: 4,
      vars: { enqueued: v },
      explain: `Pop ${v} from stack, enqueue.`,
    });
  }
  f.push({
    shape: { kind: "queue", values: [...q] },
    line: 5,
    vars: {},
    explain: "Reversed.",
    result: q.join(", "),
  });
  return f;
}

// ---------- Sliding Window Maximum ----------
const SLIDING_CODE = [
  "function slidingMax(arr, k) {",
  "  const dq = []; // indices, decreasing values",
  "  const out = [];",
  "  for (let i = 0; i < arr.length; i++) {",
  "    while (dq.length && dq[0] <= i - k) dq.shift();",
  "    while (dq.length && arr[dq.at(-1)] < arr[i]) dq.pop();",
  "    dq.push(i);",
  "    if (i >= k - 1) out.push(arr[dq[0]]);",
  "  }",
  "  return out;",
  "}",
];
function buildSliding(customInput?: number[] | string, searchTarget?: number): DSFrame[] {
  const arr = getArr(customInput, [1, 3, -1, -3, 5, 3, 6, 7]);
  const k = searchTarget !== undefined ? searchTarget : 3;
  const dq: number[] = []; // indices
  const out: number[] = [];
  const f: DSFrame[] = [];
  for (let i = 0; i < arr.length; i++) {
    while (dq.length && dq[0] <= i - k) dq.shift();
    while (dq.length && arr[dq[dq.length - 1]] < arr[i]) dq.pop();
    dq.push(i);
    f.push({
      shape: { kind: "queue", values: dq.map((idx) => arr[idx]), highlight: [0] },
      line: 7,
      vars: { i, val: arr[i], windowMax: arr[dq[0]] },
      explain: `i=${i}, deque values reflect window candidates.`,
    });
    if (i >= k - 1) out.push(arr[dq[0]]);
  }
  f.push({
    shape: { kind: "queue", values: out },
    line: 10,
    vars: {},
    explain: "Window maxes.",
    result: out.join(", "),
  });
  return f;
}

// ---------- First Non-Repeating Char (stream) ----------
const FNR_CODE = [
  "function firstNonRepeating(stream) {",
  "  const q = [], cnt = {};",
  "  const out = [];",
  "  for (const c of stream) {",
  "    cnt[c] = (cnt[c] || 0) + 1;",
  "    q.push(c);",
  "    while (q.length && cnt[q[0]] > 1) q.shift();",
  "    out.push(q.length ? q[0] : '#');",
  "  }",
  "  return out;",
  "}",
];
function buildFNR(customInput?: number[] | string): DSFrame[] {
  let stream = "aabcbcd";
  if (typeof customInput === "string" && customInput.trim()) {
    stream = customInput.trim();
  } else if (Array.isArray(customInput) && customInput.length > 0) {
    stream = customInput.map(String).join("");
  }
  const q: number[] = []; // store char codes for visual
  const cnt: Record<string, number> = {};
  const out: string[] = [];
  const f: DSFrame[] = [];
  for (const c of stream) {
    cnt[c] = (cnt[c] || 0) + 1;
    q.push(c.charCodeAt(0));
    while (q.length && cnt[String.fromCharCode(q[0])] > 1) q.shift();
    const ans = q.length ? String.fromCharCode(q[0]) : "#";
    out.push(ans);
    f.push({
      shape: { kind: "queue", values: [...q], highlight: q.length ? [0] : [] },
      line: 8,
      vars: { c, ans },
      explain: `Read '${c}', first non-repeating so far: '${ans}'.`,
    });
  }
  f.push({
    shape: { kind: "queue", values: [...q] },
    line: 10,
    vars: {},
    explain: "Done.",
    result: out.join(""),
  });
  return f;
}

// ---------- Circular Queue ----------
const CIRC_CODE = [
  "// Circular queue of capacity 5",
  "cq.enqueue(1); cq.enqueue(2); cq.enqueue(3);",
  "cq.dequeue();",
  "cq.enqueue(4); cq.enqueue(5); cq.enqueue(6); // wraps",
];
function buildCircular(customInput?: number[] | string): DSFrame[] {
  const vals = getArr(customInput, [1, 2, 3, 4, 5]);
  const cap = 5;
  const buf: (number | null)[] = Array(cap).fill(null);
  let head = 0,
    tail = 0,
    size = 0;
  const f: DSFrame[] = [];
  const view = () => buf.map((v) => (v === null ? 0 : v));
  const enq = (v: number, expl: string) => {
    if (size === cap) return;
    buf[tail] = v;
    tail = (tail + 1) % cap;
    size++;
    f.push({
      shape: { kind: "queue", values: view(), highlight: [(tail - 1 + cap) % cap] },
      line: 2,
      vars: { head, tail, size },
      explain: expl,
    });
  };
  const deq = (expl: string) => {
    if (size === 0) return;
    buf[head] = null;
    head = (head + 1) % cap;
    size--;
    f.push({
      shape: { kind: "queue", values: view() },
      line: 3,
      vars: { head, tail, size },
      explain: expl,
    });
  };

  vals.slice(0, Math.min(3, vals.length)).forEach((v) => enq(v, `Enqueue ${v}.`));
  if (vals.length > 0) {
    deq(`Dequeue (${vals[0]}).`);
  }
  vals.slice(3).forEach((v) => enq(v, `Enqueue ${v}.`));
  return f;
}

export const QUEUE_ALGOS: DSAlgoMeta[] = [
  {
    id: "queue-basics",
    name: "Enqueue / Dequeue",
    category: "Queue",
    difficulty: "Easy",
    blurb: "FIFO basics demo.",
    code: ENQDEQ_CODE,
    build: buildEnqDeq,
    complexity: { time: { best: "O(1)", avg: "O(1)", worst: "O(1)" }, space: "O(n)" },
  },
  {
    id: "reverse-queue",
    name: "Reverse a Queue",
    category: "Queue",
    difficulty: "Easy",
    blurb: "Drain into stack, refill.",
    code: REV_Q_CODE,
    build: buildRevQueue,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(n)" },
  },
  {
    id: "sliding-window-max",
    name: "Sliding Window Max",
    category: "Queue",
    difficulty: "Hard",
    blurb: "Monotonic deque keeps the window max.",
    code: SLIDING_CODE,
    build: buildSliding,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(k)" },
  },
  {
    id: "first-non-repeating",
    name: "First Non-Repeating Char",
    category: "Queue",
    difficulty: "Medium",
    blurb: "Queue of candidates, drop repeats.",
    code: FNR_CODE,
    build: buildFNR,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(n)" },
  },
  {
    id: "circular-queue",
    name: "Circular Queue",
    category: "Queue",
    difficulty: "Medium",
    blurb: "Wrap head/tail in a fixed buffer.",
    code: CIRC_CODE,
    build: buildCircular,
    complexity: { time: { best: "O(1)", avg: "O(1)", worst: "O(1)" }, space: "O(k)" },
  },
];
