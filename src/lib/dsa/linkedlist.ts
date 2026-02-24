import type { DSAlgoMeta, DSFrame, ListNodeView } from "./types";

const mk = (vals: number[]): ListNodeView[] => vals.map((v, i) => ({ id: i, value: v }));

// ---------- Traverse ----------
const TRAVERSE_CODE = [
  "function traverse(head) {",
  "  let cur = head;",
  "  while (cur) {",
  "    visit(cur.value);",
  "    cur = cur.next;",
  "  }",
  "}",
];
const getArr = (
  customInput?: number[] | string,
  defaultArr: number[] = [7, 3, 9, 1, 5],
): number[] =>
  Array.isArray(customInput) && customInput.length > 0 ? [...customInput] : defaultArr;

function buildTraverse(customInput?: number[] | string): DSFrame[] {
  const nodes = mk(getArr(customInput, [7, 3, 9, 1, 5]));
  const f: DSFrame[] = [];
  for (let i = 0; i < nodes.length; i++) {
    f.push({
      shape: { kind: "list", nodes, pointers: { cur: i }, highlight: [i] },
      line: 4,
      vars: { value: nodes[i].value },
      explain: `Visit node value ${nodes[i].value}.`,
    });
  }
  f.push({
    shape: { kind: "list", nodes, pointers: { cur: null } },
    line: 6,
    vars: {},
    explain: "Reached end.",
    result: nodes.map((n) => n.value).join(" → "),
  });
  return f;
}

// ---------- Insert at Head ----------
const INSERT_HEAD_CODE = [
  "function insertHead(head, value) {",
  "  const node = { value, next: head };",
  "  return node;",
  "}",
];
function buildInsertHead(customInput?: number[] | string, searchTarget?: number): DSFrame[] {
  let nodes = mk(getArr(customInput, [3, 9, 1, 5]));
  const targetVal = searchTarget !== undefined ? searchTarget : 7;
  const f: DSFrame[] = [];
  f.push({
    shape: { kind: "list", nodes, pointers: { head: 0 } },
    line: 1,
    vars: { newValue: targetVal },
    explain: "Original list.",
  });
  const newNode: ListNodeView = { id: -1, value: targetVal };
  nodes = [newNode, ...nodes.map((n, i) => ({ ...n, id: i + 1 }))];
  // re-id
  nodes = nodes.map((n, i) => ({ ...n, id: i }));
  f.push({
    shape: { kind: "list", nodes, pointers: { head: 0 }, highlight: [0] },
    line: 2,
    vars: {},
    explain: "New node points to old head.",
  });
  f.push({
    shape: { kind: "list", nodes, pointers: { head: 0 } },
    line: 3,
    vars: {},
    explain: "Return new head.",
    result: nodes.map((n) => n.value).join(" → "),
  });
  return f;
}

// ---------- Insert at Tail ----------
const INSERT_TAIL_CODE = [
  "function insertTail(head, value) {",
  "  if (!head) return { value, next: null };",
  "  let cur = head;",
  "  while (cur.next) cur = cur.next;",
  "  cur.next = { value, next: null };",
  "  return head;",
  "}",
];
function buildInsertTail(customInput?: number[] | string, searchTarget?: number): DSFrame[] {
  let nodes = mk(getArr(customInput, [3, 9, 1, 5]));
  const targetVal = searchTarget !== undefined ? searchTarget : 7;
  const f: DSFrame[] = [];
  for (let i = 0; i < nodes.length; i++) {
    f.push({
      shape: { kind: "list", nodes, pointers: { cur: i }, highlight: [i] },
      line: 4,
      vars: { i },
      explain: `Walk to last node (${nodes[i].value}).`,
    });
  }
  nodes = [...nodes, { id: nodes.length, value: targetVal }];
  f.push({
    shape: {
      kind: "list",
      nodes,
      pointers: { cur: nodes.length - 2, new: nodes.length - 1 },
      highlight: [nodes.length - 1],
    },
    line: 5,
    vars: {},
    explain: `Append new node ${targetVal}.`,
  });
  f.push({
    shape: { kind: "list", nodes, pointers: { head: 0 } },
    line: 6,
    vars: {},
    explain: "Done.",
    result: nodes.map((n) => n.value).join(" → "),
  });
  return f;
}

// ---------- Delete Node ----------
const DELETE_CODE = [
  "function deleteValue(head, target) {",
  "  if (head.value === target) return head.next;",
  "  let cur = head;",
  "  while (cur.next && cur.next.value !== target) cur = cur.next;",
  "  if (cur.next) cur.next = cur.next.next;",
  "  return head;",
  "}",
];
function buildDelete(customInput?: number[] | string, searchTarget?: number): DSFrame[] {
  let nodes = mk(getArr(customInput, [7, 3, 9, 1, 5]));
  const target = searchTarget !== undefined ? searchTarget : 9;
  const f: DSFrame[] = [];

  if (nodes.length > 0 && nodes[0].value === target) {
    f.push({
      shape: { kind: "list", nodes, pointers: { head: 0 }, highlight: [0] },
      line: 2,
      vars: { target },
      explain: `Head value = target, return head.next.`,
    });
    nodes = nodes.slice(1).map((n, k) => ({ ...n, id: k }));
    f.push({
      shape: { kind: "list", nodes, pointers: { head: 0 } },
      line: 2,
      vars: {},
      explain: "Done.",
      result: nodes.map((n) => n.value).join(" → "),
    });
    return f;
  }

  let i = 0;
  while (i < nodes.length - 1 && nodes[i + 1].value !== target) {
    f.push({
      shape: { kind: "list", nodes, pointers: { cur: i }, highlight: [i + 1] },
      line: 4,
      vars: { i, target },
      explain: `cur.next = ${nodes[i + 1].value}, ≠ target.`,
    });
    i++;
  }
  if (i < nodes.length - 1) {
    f.push({
      shape: { kind: "list", nodes, pointers: { cur: i }, highlight: [i + 1] },
      line: 5,
      vars: { i, target },
      explain: `Found target at index ${i + 1}, unlink it.`,
    });
    nodes = nodes.filter((_, k) => k !== i + 1).map((n, k) => ({ ...n, id: k }));
  }
  f.push({
    shape: { kind: "list", nodes, pointers: { head: 0 } },
    line: 6,
    vars: {},
    explain: "Done.",
    result: nodes.map((n) => n.value).join(" → "),
  });
  return f;
}

// ---------- Reverse Linked List ----------
const REVERSE_CODE = [
  "function reverse(head) {",
  "  let prev = null, cur = head;",
  "  while (cur) {",
  "    const next = cur.next;",
  "    cur.next = prev;",
  "    prev = cur; cur = next;",
  "  }",
  "  return prev;",
  "}",
];
function buildReverse(customInput?: number[] | string): DSFrame[] {
  let nodes = mk(getArr(customInput, [1, 2, 3, 4, 5]));
  const f: DSFrame[] = [];
  let prev: number | null = null;
  let cur: number | null = 0;
  while (cur !== null) {
    const ptrs: Record<string, number | null> = { prev, cur };
    f.push({
      shape: { kind: "list", nodes, pointers: ptrs, highlight: [cur] },
      line: 5,
      vars: { prev: prev === null ? "null" : nodes[prev].value, cur: nodes[cur].value },
      explain: `Flip cur.next to prev.`,
    });
    const next: number | null = cur < nodes.length - 1 ? cur + 1 : null;
    prev = cur;
    cur = next;
  }
  nodes = nodes
    .slice()
    .reverse()
    .map((n, i) => ({ ...n, id: i }));
  f.push({
    shape: { kind: "list", nodes, pointers: { head: 0 } },
    line: 8,
    vars: {},
    explain: "Reversed.",
    result: nodes.map((n) => n.value).join(" → "),
  });
  return f;
}

export const LINKEDLIST_ALGOS: DSAlgoMeta[] = [
  {
    id: "ll-traverse",
    name: "Traverse Linked List",
    category: "Linked List",
    difficulty: "Easy",
    blurb: "Walk node-by-node from head.",
    code: TRAVERSE_CODE,
    build: buildTraverse,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(1)" },
  },
  {
    id: "ll-insert-head",
    name: "Insert at Head",
    category: "Linked List",
    difficulty: "Easy",
    blurb: "New node points to old head; return it.",
    code: INSERT_HEAD_CODE,
    build: buildInsertHead,
    complexity: { time: { best: "O(1)", avg: "O(1)", worst: "O(1)" }, space: "O(1)" },
  },
  {
    id: "ll-insert-tail",
    name: "Insert at Tail",
    category: "Linked List",
    difficulty: "Easy",
    blurb: "Walk to last node, append.",
    code: INSERT_TAIL_CODE,
    build: buildInsertTail,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(1)" },
  },
  {
    id: "ll-delete",
    name: "Delete by Value",
    category: "Linked List",
    difficulty: "Easy",
    blurb: "Find predecessor, unlink target.",
    code: DELETE_CODE,
    build: buildDelete,
    complexity: { time: { best: "O(1)", avg: "O(n)", worst: "O(n)" }, space: "O(1)" },
  },
  {
    id: "ll-reverse",
    name: "Reverse Linked List",
    category: "Linked List",
    difficulty: "Medium",
    blurb: "Three-pointer iterative flip.",
    code: REVERSE_CODE,
    build: buildReverse,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(1)" },
  },
];
