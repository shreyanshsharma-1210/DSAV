import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InteractiveCanvasEditor } from "@/components/InteractiveCanvasEditor";
import { ShapeRenderer } from "@/components/MultiVisualizer";
import { CATEGORIES, DSA_REGISTRY, getAlgoById } from "@/lib/dsa/registry";
import type { DSFrame, DSCategory, Difficulty } from "@/lib/dsa/types";

type SandboxSearch = { algo?: string };

export const Route = createFileRoute("/sandbox")({
  head: () => ({
    meta: [
      { title: "Sandbox — DSA Visualizer AI" },
      {
        name: "description",
        content:
          "Interactive code playground. Select a DSA question to practice, edit the blank workspace syntax in JS, Java, or C++, and simulate compiler output step-by-step.",
      },
      { property: "og:title", content: "Sandbox" },
      {
        property: "og:description",
        content:
          "Coding sandbox workspace. Choose questions, write your own solution, and run trace animations.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): SandboxSearch => ({
    algo: typeof search.algo === "string" ? search.algo : undefined,
  }),
  component: SandboxPage,
});

const DIFFICULTIES: ("All" | Difficulty)[] = ["All", "Easy", "Medium", "Hard"];

const COLORS: Record<Difficulty, string> = {
  Easy: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
  Medium: "text-amber-400 border-amber-400/30 bg-amber-400/5",
  Hard: "text-rose-400 border-rose-400/30 bg-rose-400/5",
};

const CATEGORY_ICON: Record<DSCategory, string> = {
  Array: "▦",
  Sorting: "↕",
  Searching: "⌕",
  "Linked List": "→",
  Stack: "▤",
  Queue: "⇉",
  Tree: "⟙",
  Graph: "◯",
};

export interface TestCase {
  input: any;
  target?: number;
  expected: any;
}

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  output: any;
  error?: string;
}

export function getTestCases(algoId: string, category: DSCategory): TestCase[] {
  if (category === "Sorting") {
    return [
      { input: [5, 2, 9, 1, 6], expected: "1, 2, 5, 6, 9" },
      { input: [10, -2, 4, 0], expected: "-2, 0, 4, 10" },
      { input: [3, 2, 1], expected: "1, 2, 3" },
    ];
  }
  if (category === "Searching") {
    return [
      { input: [1, 3, 5, 7, 9], target: 5, expected: 2 },
      { input: [1, 3, 5, 7, 9], target: 4, expected: -1 },
      { input: [2, 10, 15, 20], target: 20, expected: 3 },
    ];
  }
  switch (algoId) {
    case "reverse-array":
      return [
        { input: [1, 2, 3, 4], expected: "4, 3, 2, 1" },
        { input: [5], expected: "5" },
        { input: [7, 8, 9], expected: "9, 8, 7" },
      ];
    case "max-subarray":
      return [
        { input: [-2, 1, -3, 4, -1, 2, 1, -5, 4], expected: 6 },
        { input: [1], expected: 1 },
        { input: [5, 4, -1, 7, 8], expected: 23 },
      ];
    case "move-zeros":
      return [
        { input: [0, 1, 0, 3, 12], expected: "1, 3, 12, 0, 0" },
        { input: [0], expected: "0" },
        { input: [2, 1], expected: "2, 1" },
      ];
    case "rotate-right":
      return [
        { input: [1, 2, 3, 4, 5], target: 2, expected: "4, 5, 1, 2, 3" },
        { input: [1, 2], target: 3, expected: "2, 1" },
        { input: [7], target: 5, expected: "7" },
      ];
    case "find-max":
      return [
        { input: [1, 5, 3, 9, 2], expected: 9 },
        { input: [-1, -5, -2], expected: -1 },
        { input: [10], expected: 10 },
      ];
    case "ll-traverse":
      return [
        { input: [1, 2, 3], expected: "1 → 2 → 3" },
        { input: [5], expected: "5" },
        { input: [9, 8, 7], expected: "9 → 8 → 7" },
      ];
    case "ll-insert-head":
      return [
        { input: [1, 2, 3], target: 0, expected: "0 → 1 → 2 → 3" },
        { input: [], target: 5, expected: "5" },
        { input: [9], target: 8, expected: "8 → 9" },
      ];
    case "ll-insert-tail":
      return [
        { input: [1, 2, 3], target: 4, expected: "1 → 2 → 3 → 4" },
        { input: [], target: 5, expected: "5" },
        { input: [9], target: 10, expected: "9 → 10" },
      ];
    case "ll-delete":
      return [
        { input: [1, 2, 3], target: 2, expected: "1 → 3" },
        { input: [1, 2, 3], target: 1, expected: "2 → 3" },
        { input: [1, 2, 3], target: 4, expected: "1 → 2 → 3" },
      ];
    case "ll-reverse":
      return [
        { input: [1, 2, 3], expected: "3 → 2 → 1" },
        { input: [5], expected: "5" },
        { input: [9, 8], expected: "8 → 9" },
      ];
    case "balanced-parens":
      return [
        { input: "()[]{}", expected: "true" },
        { input: "(]", expected: "false" },
        { input: "([{}])", expected: "true" },
      ];
    case "reverse-string":
      return [
        { input: "hello", expected: "olleh" },
        { input: "a", expected: "a" },
        { input: "racecar", expected: "racecar" },
      ];
    case "next-greater":
      return [
        { input: [4, 5, 2, 25], expected: "5, 25, 25, -1" },
        { input: [13, 7, 6, 12], expected: "-1, 12, 12, -1" },
        { input: [1, 2, 3], expected: "2, 3, -1" },
      ];
    case "sliding-window-max":
      return [
        { input: [1, 3, -1, -3, 5], target: 3, expected: "3, 3, 5" },
        { input: [1, -1], target: 1, expected: "1, -1" },
        { input: [9, 11, 8, 5, 7, 10], target: 3, expected: "11, 11, 8, 10" },
      ];
    case "first-non-repeating":
      return [
        { input: "aabcbcd", expected: "a#bbccd" },
        { input: "abc", expected: "aaa" },
        { input: "aabb", expected: "a###" },
      ];
    case "tree-insert-bst":
      return [
        { input: [5, 3, 8], target: 6, expected: "inserted 6" },
        { input: [], target: 5, expected: "inserted 5" },
        { input: [10], target: 12, expected: "inserted 12" },
      ];
    case "tree-inorder":
      return [
        { input: [5, 3, 8], expected: "3, 5, 8" },
        { input: [10], expected: "10" },
        { input: [4, 2, 6, 1, 3, 5, 7], expected: "1, 2, 3, 4, 5, 6, 7" },
      ];
    case "tree-preorder":
      return [
        { input: [5, 3, 8], expected: "5, 3, 8" },
        { input: [10], expected: "10" },
        { input: [4, 2, 6], expected: "4, 2, 6" },
      ];
    case "tree-postorder":
      return [
        { input: [5, 3, 8], expected: "3, 8, 5" },
        { input: [10], expected: "10" },
        { input: [4, 2, 6], expected: "2, 6, 4" },
      ];
    case "tree-levelorder":
      return [
        { input: [5, 3, 8], expected: "5, 3, 8" },
        { input: [10], expected: "10" },
        { input: [4, 2, 6, 1, 3], expected: "4, 2, 6, 1, 3" },
      ];
    case "graph-bfs":
      return [
        { input: "A-B, B-C", expected: "A, B, C" },
        { input: "A-B, A-C, B-D", expected: "A, B, C, D" },
        { input: "A-B", expected: "A, B" },
      ];
    case "graph-dfs":
      return [
        { input: "A-B, B-C", expected: "A, B, C" },
        { input: "A-B, A-C, B-D", expected: "A, B, D, C" },
        { input: "A-B", expected: "A, B" },
      ];
    case "graph-cycle":
      return [
        { input: "A-B, B-C, C-A", expected: "cycle detected" },
        { input: "A-B, B-C", expected: "no cycle" },
        { input: "A-B, B-C, C-D, D-B", expected: "cycle detected" },
      ];
    case "graph-components":
      return [
        { input: "A-B, C-D", expected: "2 components" },
        { input: "A-B, B-C", expected: "1 component" },
        { input: "A-B, C-D, E-F", expected: "3 components" },
      ];
    case "graph-shortest":
      return [
        { input: "A-B, B-C", expected: "A → B → C" },
        { input: "A-B, A-C, B-D, C-D", expected: "A → B → D" },
        { input: "A-B", expected: "A → B" },
      ];
    default:
      return [
        { input: [1, 2, 3], expected: "1, 2, 3" },
        { input: [4, 5], expected: "4, 5" },
        { input: [6], expected: "6" },
      ];
  }
}

function getLineFromStack(offset: number): number {
  try {
    const err = new Error();
    const stack = err.stack || "";
    const lines = stack.split("\n");
    for (const line of lines) {
      if (line.includes("<anonymous>") || line.includes("Function")) {
        const match = line.match(/(?:<anonymous>|Function):(\d+):/);
        if (match) {
          const rawLine = parseInt(match[1], 10);
          if (rawLine >= offset) {
            return rawLine - offset + 1;
          }
        }
      }
    }
  } catch (e) {}
  return 0;
}

function runUserJsAndTrace(
  userCode: string,
  category: DSCategory,
  algoId: string,
  inputVal: any,
  targetVal?: number,
): { success: boolean; frames: DSFrame[]; result: any; error?: string } {
  const traceFrames: DSFrame[] = [];
  const originalPush = traceFrames.push.bind(traceFrames);
  traceFrames.push = function (...items: DSFrame[]) {
    if (traceFrames.length + items.length > 1000) {
      throw new Error(
        "Execution limit exceeded: Too many visualization frames generated (potential infinite loop).",
      );
    }
    return originalPush(...items);
  };

  const pushFrame = (
    type: "read" | "write" | "error" | "done",
    values: any[],
    indices: number[],
    explain: string,
    vars: any = {},
    result?: string,
  ) => {
    const line = getLineFromStack(3);
    traceFrames.push({
      shape: {
        kind:
          category === "Linked List"
            ? "list"
            : category === "Tree"
              ? "tree"
              : category === "Graph"
                ? "graph"
                : category === "Stack"
                  ? "stack"
                  : category === "Queue"
                    ? "queue"
                    : "array",
        values: [...values],
        compare: type === "read" ? indices : [],
        swap: type === "write" ? indices : [],
        error: type === "error" ? indices : [],
        done: type === "done" ? indices : [],
        highlight: type === "read" || type === "write" ? indices : [],
      } as any,
      line,
      vars: { ...vars },
      explain,
      result,
    });
  };

  if (category === "Linked List") {
    try {
      const camelName = algoId.replace(/[^a-zA-Z0-9]/g, "");
      const defaultFuncName = camelName.charAt(0).toLowerCase() + camelName.slice(1);
      const matches = Array.from(userCode.matchAll(/function\s+([a-zA-Z0-9_$]+)/g));
      const funcName = matches[0] ? matches[0][1] : defaultFuncName;

      // Clean the user's class Node definition
      const cleanedCode = userCode.replace(/class\s+Node\s*\{[\s\S]*?\}/g, "");

      const setupPrefix =
        "let nodeCounter = 0;\n" +
        "const registeredNodes = [];\n" +
        "let tracking = false;\n" +
        "\n" +
        "class Node {\n" +
        "  constructor(val) {\n" +
        "    this.id = nodeCounter++;\n" +
        "    this._value = val;\n" +
        "    this._next = null;\n" +
        "    registeredNodes.push(this);\n" +
        "    recordFrame('Created Node with value ' + val, this);\n" +
        "  }\n" +
        "  get value() {\n" +
        "    recordFrame('Read node value: ' + this._value, this);\n" +
        "    return this._value;\n" +
        "  }\n" +
        "  set value(v) {\n" +
        "    this._value = v;\n" +
        "    recordFrame('Set node value to ' + v, this);\n" +
        "  }\n" +
        "  get next() {\n" +
        "    recordFrame('Accessed next node', this);\n" +
        "    return this._next;\n" +
        "  }\n" +
        "  set next(n) {\n" +
        "    this._next = n;\n" +
        "    recordFrame('Linked node to ' + (n ? n._value : 'null'), this);\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "function recordFrame(explain, activeNode) {\n" +
        "  if (!tracking) return;\n" +
        "  const incoming = new Set();\n" +
        "  for (const n of registeredNodes) {\n" +
        "    if (n._next) {\n" +
        "      incoming.add(n._next.id);\n" +
        "    }\n" +
        "  }\n" +
        "  let roots = registeredNodes.filter(n => !incoming.has(n.id));\n" +
        "  if (roots.length === 0 && registeredNodes.length > 0) {\n" +
        "    roots = [registeredNodes[0]];\n" +
        "  }\n" +
        "  const nodesList = [];\n" +
        "  const visited = new Set();\n" +
        "  for (const root of roots) {\n" +
        "    let curr = root;\n" +
        "    while (curr && !visited.has(curr.id)) {\n" +
        "      visited.add(curr.id);\n" +
        "      nodesList.push(curr);\n" +
        "      curr = curr._next;\n" +
        "    }\n" +
        "  }\n" +
        "  for (const n of registeredNodes) {\n" +
        "    if (!visited.has(n.id)) {\n" +
        "      nodesList.push(n);\n" +
        "    }\n" +
        "  }\n" +
        "  const shapeNodes = nodesList.map(n => ({ id: n.id, value: n._value }));\n" +
        "  let highlightIdx = -1;\n" +
        "  if (activeNode) {\n" +
        "    highlightIdx = shapeNodes.findIndex(n => n.id === activeNode.id);\n" +
        "  }\n" +
        "  traceFrames.push({\n" +
        "    shape: {\n" +
        "      kind: 'list',\n" +
        "      nodes: shapeNodes,\n" +
        "      highlight: highlightIdx !== -1 ? [highlightIdx] : [],\n" +
        "      pointers: {}\n" +
        "    },\n" +
        "    line: getLineFromStack(offset),\n" +
        "    explain,\n" +
        "    vars: {}\n" +
        "  });\n" +
        "}\n" +
        "\n" +
        "// Build initial linked list\n" +
        "let head = null;\n" +
        "if (Array.isArray(inputVal)) {\n" +
        "  let prevNode = null;\n" +
        "  for (let i = inputVal.length - 1; i >= 0; i--) {\n" +
        "    const node = new Node(inputVal[i]);\n" +
        "    node._next = prevNode;\n" +
        "    prevNode = node;\n" +
        "  }\n" +
        "  head = prevNode;\n" +
        "}\n";

      const offset = setupPrefix.split("\n").length + 2;

      const execute = new Function(
        "inputVal",
        "targetVal",
        "traceFrames",
        "getLineFromStack",
        "offset",
        setupPrefix +
          cleanedCode +
          "\n" +
          "if (typeof " +
          funcName +
          " !== 'function') {\n" +
          "  throw new Error('Function " +
          funcName +
          " is not defined.');\n" +
          "}\n" +
          "tracking = true;\n" +
          "recordFrame('Original list', head);\n" +
          "const output = " +
          funcName +
          "(head, targetVal);\n" +
          "recordFrame('Execution completed', output || head);\n" +
          "function formatLL(h) {\n" +
          "  if (!h) return '∅';\n" +
          "  const vis = new Set();\n" +
          "  const vals = [];\n" +
          "  let curr = h;\n" +
          "  while (curr && !vis.has(curr)) {\n" +
          "    vis.add(curr);\n" +
          "    vals.push(curr._value !== undefined ? curr._value : curr.value);\n" +
          "    curr = curr._next !== undefined ? curr._next : curr.next;\n" +
          "  }\n" +
          "  return vals.join(' → ');\n" +
          "}\n" +
          "return formatLL(output || head);\n",
      );

      const output = execute(inputVal, targetVal, traceFrames, getLineFromStack, offset);
      return { success: true, frames: traceFrames, result: output };
    } catch (err: any) {
      return { success: false, frames: traceFrames, result: "Runtime Error", error: err.message };
    }
  }

  if (category === "Tree") {
    try {
      const camelName = algoId.replace(/[^a-zA-Z0-9]/g, "");
      const defaultFuncName = camelName.charAt(0).toLowerCase() + camelName.slice(1);
      const matches = Array.from(userCode.matchAll(/function\s+([a-zA-Z0-9_$]+)/g));
      const funcName = matches[0] ? matches[0][1] : defaultFuncName;

      // Clean user's class TreeNode definition
      const cleanedCode = userCode.replace(/class\s+TreeNode\s*\{[\s\S]*?\}/g, "");

      const setupPrefix =
        "let nodeCounter = 0;\n" +
        "const registeredNodes = [];\n" +
        "let tracking = false;\n" +
        "const visitedIds = [];\n" +
        "const visitedValues = [];\n" +
        "\n" +
        "class TreeNode {\n" +
        "  constructor(val) {\n" +
        "    this.id = nodeCounter++;\n" +
        "    this._value = val;\n" +
        "    this._left = null;\n" +
        "    this._right = null;\n" +
        "    registeredNodes.push(this);\n" +
        "    recordFrame('Created Tree Node with value ' + val, this);\n" +
        "  }\n" +
        "  get value() {\n" +
        "    if (tracking && !visitedIds.includes(this.id)) {\n" +
        "      visitedIds.push(this.id);\n" +
        "      visitedValues.push(this._value);\n" +
        "    }\n" +
        "    recordFrame('Read node value: ' + this._value, this);\n" +
        "    return this._value;\n" +
        "  }\n" +
        "  set value(v) {\n" +
        "    this._value = v;\n" +
        "    recordFrame('Set node value to ' + v, this);\n" +
        "  }\n" +
        "  get left() {\n" +
        "    recordFrame('Accessed left child of ' + this._value, this);\n" +
        "    return this._left;\n" +
        "  }\n" +
        "  set left(n) {\n" +
        "    this._left = n;\n" +
        "    recordFrame('Set left child of ' + this._value, this);\n" +
        "  }\n" +
        "  get right() {\n" +
        "    recordFrame('Accessed right child of ' + this._value, this);\n" +
        "    return this._right;\n" +
        "  }\n" +
        "  set right(n) {\n" +
        "    this._right = n;\n" +
        "    recordFrame('Set right child of ' + this._value, this);\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "function serializeTree(rootNode) {\n" +
        "  if (!rootNode) return [];\n" +
        "  const nodesList = [];\n" +
        "  const nodeToIndex = new Map();\n" +
        "  const queue = [rootNode];\n" +
        "  const visited = new Set();\n" +
        "  \n" +
        "  while (queue.length > 0) {\n" +
        "    const curr = queue.shift();\n" +
        "    if (!curr || visited.has(curr.id)) continue;\n" +
        "    visited.add(curr.id);\n" +
        "    nodeToIndex.set(curr.id, nodesList.length);\n" +
        "    nodesList.push(curr);\n" +
        "    if (curr._left) queue.push(curr._left);\n" +
        "    if (curr._right) queue.push(curr._right);\n" +
        "  }\n" +
        "\n" +
        "  for (const n of registeredNodes) {\n" +
        "    if (!visited.has(n.id)) {\n" +
        "      nodeToIndex.set(n.id, nodesList.length);\n" +
        "      nodesList.push(n);\n" +
        "    }\n" +
        "  }\n" +
        "\n" +
        "  return nodesList.map(n => {\n" +
        "    const view = { id: n.id, value: n._value };\n" +
        "    if (n._left) view.left = nodeToIndex.get(n._left.id);\n" +
        "    if (n._right) view.right = nodeToIndex.get(n._right.id);\n" +
        "    return view;\n" +
        "  });\n" +
        "}\n" +
        "\n" +
        "function recordFrame(explain, activeNode) {\n" +
        "  if (!tracking) return;\n" +
        "  const shapeNodes = serializeTree(root);\n" +
        "  let highlightIdx = -1;\n" +
        "  if (activeNode) {\n" +
        "    highlightIdx = shapeNodes.findIndex(n => n.id === activeNode.id);\n" +
        "  }\n" +
        "  \n" +
        "  const visitedIndices = visitedIds\n" +
        "    .map(id => shapeNodes.findIndex(n => n.id === id))\n" +
        "    .filter(idx => idx !== -1);\n" +
        "\n" +
        "  traceFrames.push({\n" +
        "    shape: {\n" +
        "      kind: 'tree',\n" +
        "      nodes: shapeNodes,\n" +
        "      highlight: highlightIdx !== -1 ? [highlightIdx] : [],\n" +
        "      visited: visitedIndices,\n" +
        "      order: [...visitedValues]\n" +
        "    },\n" +
        "    line: getLineFromStack(offset),\n" +
        "    explain,\n" +
        "    vars: {}\n" +
        "  });\n" +
        "}\n" +
        "\n" +
        "function buildBst(arr) {\n" +
        "  if (!Array.isArray(arr) || arr.length === 0) return null;\n" +
        "  const rNode = new TreeNode(arr[0]);\n" +
        "  for (let i = 1; i < arr.length; i++) {\n" +
        "    insertBst(rNode, arr[i]);\n" +
        "  }\n" +
        "  return rNode;\n" +
        "}\n" +
        "\n" +
        "function insertBst(node, val) {\n" +
        "  if (val < node._value) {\n" +
        "    if (node._left) insertBst(node._left, val);\n" +
        "    else node.left = new TreeNode(val);\n" +
        "  } else {\n" +
        "    if (node._right) insertBst(node._right, val);\n" +
        "    else node.right = new TreeNode(val);\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "const root = buildBst(inputVal);\n";

      const offset = setupPrefix.split("\n").length + 2;

      const execute = new Function(
        "inputVal",
        "targetVal",
        "traceFrames",
        "algoId",
        "getLineFromStack",
        "offset",
        setupPrefix +
          cleanedCode +
          "\n" +
          "if (typeof " +
          funcName +
          " !== 'function') {\n" +
          "  throw new Error('Function " +
          funcName +
          " is not defined.');\n" +
          "}\n" +
          "tracking = true;\n" +
          "recordFrame('Original BST', root);\n" +
          "const outArr = [];\n" +
          "const output = " +
          funcName +
          "(root, outArr, targetVal);\n" +
          "recordFrame('Execution completed', root);\n" +
          "if (algoId === 'tree-insert-bst') {\n" +
          "  const checkVal = (node, val) => {\n" +
          "    if (!node) return false;\n" +
          "    if (node._value === val) return true;\n" +
          "    return checkVal(node._left, val) || checkVal(node._right, val);\n" +
          "  };\n" +
          "  const inserted = checkVal(output || root, targetVal);\n" +
          "  return inserted ? 'inserted ' + targetVal : 'failed to insert';\n" +
          "}\n" +
          "const finalResult = (Array.isArray(output) ? output : (outArr.length > 0 ? outArr : visitedValues)).join(', ');\n" +
          "return finalResult;\n",
      );

      const output = execute(inputVal, targetVal, traceFrames, algoId, getLineFromStack, offset);
      return { success: true, frames: traceFrames, result: output };
    } catch (err: any) {
      return { success: false, frames: traceFrames, result: "Runtime Error", error: err.message };
    }
  }

  if (category === "Graph") {
    try {
      const camelName = algoId.replace(/[^a-zA-Z0-9]/g, "");
      const defaultFuncName = camelName.charAt(0).toLowerCase() + camelName.slice(1);
      const matches = Array.from(userCode.matchAll(/function\s+([a-zA-Z0-9_$]+)/g));
      const funcName = matches[0] ? matches[0][1] : defaultFuncName;

      const setupPrefix =
        "let tracking = false;\n" +
        "const visitedIds = new Set();\n" +
        "const visitedOrder = [];\n" +
        "\n" +
        "// Parse graph input\n" +
        "let edgesStr = 'A-B, A-D, B-C, B-E, C-F, D-E, E-F';\n" +
        "if (typeof inputVal === 'string' && inputVal.trim()) {\n" +
        "  edgesStr = inputVal.trim();\n" +
        "}\n" +
        "const parsedEdges = [];\n" +
        "const nodesSet = new Set();\n" +
        "const parts = edgesStr.split(',').map(s => s.trim()).filter(Boolean);\n" +
        "for (const part of parts) {\n" +
        "  const nodes = part.split('-').map(s => s.trim()).filter(Boolean);\n" +
        "  if (nodes.length >= 2) {\n" +
        "    parsedEdges.push({ from: nodes[0], to: nodes[1] });\n" +
        "    nodesSet.add(nodes[0]);\n" +
        "    nodesSet.add(nodes[1]);\n" +
        "  }\n" +
        "}\n" +
        "const nodesList = Array.from(nodesSet).sort();\n" +
        "const parsedNodes = [];\n" +
        "const cx = 220;\n" +
        "const cy = 130;\n" +
        "const r = 90;\n" +
        "nodesList.forEach((id, index) => {\n" +
        "  const angle = (index * 2 * Math.PI) / nodesList.length;\n" +
        "  const x = cx + r * Math.cos(angle);\n" +
        "  const y = cy + r * Math.sin(angle);\n" +
        "  parsedNodes.push({ id, x: Math.round(x), y: Math.round(y) });\n" +
        "});\n" +
        "\n" +
        "const adjList = {};\n" +
        "for (const edge of parsedEdges) {\n" +
        "  if (!adjList[edge.from]) adjList[edge.from] = [];\n" +
        "  if (!adjList[edge.to]) adjList[edge.to] = [];\n" +
        "  adjList[edge.from].push(edge.to);\n" +
        "  adjList[edge.to].push(edge.from);\n" +
        "}\n" +
        "for (const node in adjList) {\n" +
        "  adjList[node].sort();\n" +
        "}\n" +
        "\n" +
        "function recordFrame(explain, activeNodeId) {\n" +
        "  if (!tracking) return;\n" +
        "  if (activeNodeId) {\n" +
        "    visitedIds.add(activeNodeId);\n" +
        "    if (!visitedOrder.includes(activeNodeId)) {\n" +
        "      visitedOrder.push(activeNodeId);\n" +
        "    }\n" +
        "  }\n" +
        "  traceFrames.push({\n" +
        "    shape: {\n" +
        "      kind: 'graph',\n" +
        "      nodes: parsedNodes,\n" +
        "      edges: parsedEdges,\n" +
        "      undirected: true,\n" +
        "      highlight: activeNodeId ? [activeNodeId] : [],\n" +
        "      visited: Array.from(visitedIds),\n" +
        "      order: [...visitedOrder],\n" +
        "      frontier: []\n" +
        "    },\n" +
        "    line: getLineFromStack(offset),\n" +
        "    explain,\n" +
        "    vars: {}\n" +
        "  });\n" +
        "}\n" +
        "\n" +
        "const proxyAdjList = new Proxy(adjList, {\n" +
        "  get(target, prop) {\n" +
        "    if (prop in target) {\n" +
        "      recordFrame('Access neighbors of ' + prop, String(prop));\n" +
        "      return target[prop];\n" +
        "    }\n" +
        "    return Reflect.get(target, prop);\n" +
        "  }\n" +
        "});\n";

      const offset = setupPrefix.split("\n").length + 2;

      const execute = new Function(
        "inputVal",
        "targetVal",
        "traceFrames",
        "algoId",
        "getLineFromStack",
        "offset",
        setupPrefix +
          userCode +
          "\n" +
          "if (typeof " +
          funcName +
          " !== 'function') {\n" +
          "  throw new Error('Function " +
          funcName +
          " is not defined.');\n" +
          "}\n" +
          "const startNode = parsedNodes.length > 0 ? parsedNodes[0].id : 'A';\n" +
          "tracking = true;\n" +
          "recordFrame('Start Graph Algorithm at ' + startNode, startNode);\n" +
          "const output = " +
          funcName +
          "(proxyAdjList, startNode);\n" +
          "recordFrame('Execution completed', null);\n" +
          "let formatted = String(output);\n" +
          "if (output === true) formatted = 'cycle detected';\n" +
          "else if (output === false) formatted = 'no cycle';\n" +
          "else if (algoId === 'graph-components' && typeof output === 'number') {\n" +
          "  formatted = output + ' component' + (output !== 1 ? 's' : '');\n" +
          "}\n" +
          "else if (algoId === 'graph-shortest' && Array.isArray(output)) {\n" +
          "  formatted = output.join(' → ');\n" +
          "}\n" +
          "else if (Array.isArray(output)) {\n" +
          "  formatted = output.join(', ');\n" +
          "}\n" +
          "else if (!output && visitedOrder.length > 0) {\n" +
          "  formatted = visitedOrder.join(algoId === 'graph-shortest' ? ' → ' : ', ');\n" +
          "}\n" +
          "return formatted;\n",
      );

      const output = execute(inputVal, targetVal, traceFrames, algoId, getLineFromStack, offset);
      return { success: true, frames: traceFrames, result: output };
    } catch (err: any) {
      return { success: false, frames: traceFrames, result: "Runtime Error", error: err.message };
    }
  }

  // Else Array, Sorting, Searching, Stack, Queue
  if (
    category === "Array" ||
    category === "Sorting" ||
    category === "Searching" ||
    category === "Stack" ||
    category === "Queue"
  ) {
    let arr: any[] = [];
    if (Array.isArray(inputVal)) {
      arr = [...inputVal];
    } else if (typeof inputVal === "string") {
      arr = inputVal
        .split(",")
        .map((s) => {
          const val = s.trim();
          return isNaN(Number(val)) ? val : Number(val);
        })
        .filter(Boolean);
    }

    const proxyArr = new Proxy(arr, {
      get(target, prop) {
        if (prop === "length") return target.length;
        if (typeof prop === "string" && !isNaN(Number(prop))) {
          const idx = Number(prop);
          if (idx < 0 || idx >= target.length) {
            pushFrame(
              "error",
              [...target],
              [idx],
              `Out of bounds read: Accessing index ${idx} on array of size ${target.length}.`,
              { index: idx, size: target.length },
            );
            throw new Error(`Array index out of bounds: index ${idx} size ${target.length}`);
          }
          pushFrame("read", [...target], [idx], `Read index ${idx} = ${target[idx]}.`, {
            index: idx,
            value: target[idx],
          });
          return target[idx];
        }
        return Reflect.get(target, prop);
      },
      set(target, prop, value) {
        if (typeof prop === "string" && !isNaN(Number(prop))) {
          const idx = Number(prop);
          if (idx < 0 || idx >= target.length) {
            pushFrame(
              "error",
              [...target],
              [idx],
              `Out of bounds write: Writing to index ${idx} on array of size ${target.length}.`,
              { index: idx, value, size: target.length },
            );
            throw new Error(`Array index out of bounds: index ${idx} size ${target.length}`);
          }
          target[idx] = value;
          pushFrame("write", [...target], [idx], `Write index ${idx} = ${value}.`, {
            index: idx,
            value,
          });
          return true;
        }
        return Reflect.set(target, prop, value);
      },
    });

    try {
      const camelName = algoId.replace(/[^a-zA-Z0-9]/g, "");
      const defaultFuncName = camelName.charAt(0).toLowerCase() + camelName.slice(1);
      const matches = Array.from(userCode.matchAll(/function\s+([a-zA-Z0-9_$]+)/g));
      const funcName = matches[0] ? matches[0][1] : defaultFuncName;

      const execute = new Function(
        "arr",
        "target",
        `
        ${userCode}
        if (typeof ${funcName} === 'function') {
          return ${funcName}(arr, target);
        } else {
          throw new Error("Function '${funcName}' is not defined in your code.");
        }
      `,
      );

      const output = execute(proxyArr, targetVal);
      const finalResult =
        output !== undefined
          ? Array.isArray(output)
            ? output.join(", ")
            : String(output)
          : Array.isArray(arr)
            ? arr.join(", ")
            : "undefined";
      pushFrame(
        "done",
        [...arr],
        [],
        `Successfully executed! Output: ${finalResult}`,
        {},
        finalResult,
      );
      return { success: true, frames: traceFrames, result: finalResult };
    } catch (err: any) {
      const errMsg = err.message || String(err);
      traceFrames.push({
        shape: {
          kind: category === "Stack" ? "stack" : category === "Queue" ? "queue" : "array",
          values: [...arr],
          error: true,
        } as any,
        line: 0,
        vars: { error: errMsg },
        explain: `Execution Halted: ${errMsg}`,
        result: "Runtime Error",
      });
    }
  }

  return { success: false, frames: [], result: "Not Implemented" };
}

function transpileToJs(
  code: string,
  lang: "cpp" | "java",
  category: DSCategory,
  algoId: string,
): string {
  let js = code;

  // 1. Remove comments
  js = js.replace(/\/\*[\s\S]*?\*\//g, ""); // multi-line comments
  js = js.replace(/\/\/.*/g, ""); // single-line comments

  // 2. Remove standard header directives, packages, imports, and system boilerplate
  if (lang === "cpp") {
    js = js.replace(/#include\s*<.*?>/g, "");
    js = js.replace(/using\s+namespace\s+std\s*;/g, "");
  } else if (lang === "java") {
    js = js.replace(/package\s+\w+\s*;/g, "");
    js = js.replace(/import\s+.*?;/g, "");
  }

  // 3. Remove struct/class definitions for Node and TreeNode
  js = js.replace(/(?:static\s+)?(?:struct|class)\s+Node\s*\{[\s\S]*?\};?/g, "");
  js = js.replace(/(?:static\s+)?(?:struct|class)\s+TreeNode\s*\{[\s\S]*?\};?/g, "");

  // 4. For Java, strip out class wrappers like "public class Main { ... }"
  if (lang === "java") {
    js = js.replace(/public\s+class\s+\w+\s*\{/g, "");
    // Remove Java static/public modifiers
    js = js.replace(/\bpublic\s+static\s+/g, "");
    js = js.replace(/\bpublic\s+/g, "");
    js = js.replace(/\bprivate\s+/g, "");
    js = js.replace(/\bstatic\s+/g, "");
    js = js.replace(/\bboolean\b/g, "bool");
  }

  // Remove references symbol next to variable names
  js = js.replace(/&\s*(\w+)/g, "$1");

  // Clean C++ Node* and TreeNode* pointer types
  js = js.replace(/\bNode\s*\*/g, "Node");
  js = js.replace(/\bTreeNode\s*\*/g, "TreeNode");

  // 5. Replace function headers with JS functions
  const types = [
    "int",
    "void",
    "double",
    "float",
    "string",
    "String",
    "bool",
    "char",
    "Node",
    "TreeNode",
    "vector<int>",
    "vector<char>",
    "vector<string>",
    "map<char,\\s*vector<char>>",
    "Map<Character,\\s*List<Character>>",
  ];

  // Regex to match C++/Java function signatures
  js = js.replace(
    /(\w+(?:<[^>]+>)?)\s+(\w+)\s*\(([^)]*)\)\s*\{/g,
    (match, retType, funcName, args) => {
      if (funcName === "main") {
        return "/* main */ function main_disabled() {";
      }
      let cleanedArgs = args;
      types.forEach((t) => {
        const reg = new RegExp(`\\b${t}\\b\\s*`, "g");
        cleanedArgs = cleanedArgs.replace(reg, "");
      });
      // Remove remaining references/pointers/array brackets in parameters
      cleanedArgs = cleanedArgs.replace(/\*/g, "").replace(/&/g, "").replace(/\[\]/g, "");
      return `function ${funcName}(${cleanedArgs}) {`;
    },
  );

  // 6. Replace variable declarations inside code
  // Match lines like "Type var = val;" or "Type var;"
  // Convert standard types to let
  js = js.replace(
    /\b(?:int|double|float|bool|string|String|char|Node|TreeNode)\s+(\*?\w+)/g,
    "let $1",
  );
  // Clean up pointer asterisks on variable names
  js = js.replace(/\blet\s+\*(\w+)/g, "let $1");
  js = js.replace(/,\s*\*(\w+)/g, ", $1");
  // Clean up Java/C++ array brackets on variable declarations (e.g. let arr[])
  js = js.replace(/\blet\s+(\w+)\[\]/g, "let $1");

  // Replace vector declarations
  js = js.replace(/vector<\w+>\s+(\w+)\s*\(([^)]+)\)\s*;/g, "let $1 = new Array($2).fill(0);");
  js = js.replace(/vector<\w+>\s+(\w+)\s*;/g, "let $1 = [];");

  // Replace Java array declarations
  js = js.replace(
    /\b\w+\[\]\s+(\w+)\s*=\s*new\s+\w+\[([^\]]+)\]\s*;/g,
    "let $1 = new Array($2).fill(0);",
  );
  js = js.replace(/\b\w+\[\]\s+(\w+)\s*=/g, "let $1 =");

  // Replace Java/C++ curly brace array initializer with brackets
  js = js.replace(/=\s*\{([^}]*)\}/g, "= [$1]");

  // Replace Java Collections instantiation (e.g. Queue q = new LinkedList<>())
  js = js.replace(/=\s*new\s+\w+(?:<[^>]*>)?\s*\([^)]*\)\s*;/g, "= [];");

  // Replace pointer access -> with .
  js = js.replace(/->/g, ".");
  js = js.replace(/\(\*(\w+)\)/g, "$1");
  js = js.replace(/\bnullptr\b/g, "null");

  // Replace stack/queue operations
  if (
    category === "Stack" ||
    category === "Queue" ||
    algoId.includes("bfs") ||
    algoId.includes("dfs") ||
    algoId.includes("levelorder")
  ) {
    if (category === "Stack" || algoId.includes("stack") || algoId.includes("parens")) {
      js = js.replace(/\.pop\(\)/g, ".pop()"); // stack pop
    } else {
      js = js.replace(/\.pop\(\)/g, ".shift()"); // queue pop/poll (removes from front)
    }
    js = js.replace(/\.push_back\((.*?)\)/g, ".push($1)");
    js = js.replace(/\.front\(\)/g, "[0]");
    js = js.replace(/\.empty\(\)/g, ".length === 0");
    js = js.replace(/\.size\(\)/g, ".length");
    js = js.replace(/\.offer\((.*?)\)/g, ".push($1)");
    js = js.replace(/\.poll\(\)/g, ".shift()");
    js = js.replace(/\.isEmpty\(\)/g, ".length === 0");
  }

  // Common Java Map/List helpers
  js = js.replace(/\.get\((.*?)\)/g, "[$1]");
  js = js.replace(/\.put\((.*?),\s*(.*?)\)/g, "[$1] = $2");
  js = js.replace(/\.containsKey\((.*?)\)/g, "($1 in $2)");

  // Swaps mapping
  js = js.replace(/(?:std::)?swap\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\);?/g, "[$1, $2] = [$2, $1];");

  // Console output
  js = js.replace(/cout\s*<<\s*([\s\S]*?);/g, (match, content) => {
    const parts = content
      .split("<<")
      .map((p: string) => p.trim())
      .filter((p: string) => p && p !== "endl");
    return `console.log(${parts.join(" + ")});`;
  });
  js = js.replace(/System\.out\.println\((.*?)\);?/g, "console.log($1);");
  js = js.replace(/System\.out\.print\((.*?)\);?/g, "console.log($1);");

  // Remove final extra closing class brace if any remain from public class Main
  if (lang === "java") {
    // If the transpiled code ends with a single closing brace, remove it
    const trimmed = js.trim();
    if (trimmed.endsWith("}")) {
      js = trimmed.substring(0, trimmed.lastIndexOf("}"));
    }
  }

  return js;
}

function getBoilerplate(
  category: DSCategory,
  name: string,
  lang: "javascript" | "java" | "cpp",
): string {
  const normalizedName = name.replace(/[^a-zA-Z0-9]/g, "");
  const camelName = normalizedName.charAt(0).toLowerCase() + normalizedName.slice(1);

  if (category === "Sorting") {
    if (lang === "javascript") {
      return `// Practice ${name} in JavaScript
function ${camelName}(arr) {
  // TODO: Write your sorting algorithm here
  
  return arr;
}`;
    } else if (lang === "cpp") {
      return `// Practice ${name} in C++
#include <iostream>
#include <vector>
using namespace std;

void ${camelName}(vector<int>& arr) {
    // TODO: Write your sorting algorithm here
    
}

int main() {
    vector<int> arr = {5, 3, 8, 4, 2};
    ${camelName}(arr);
    cout << "Sorted array: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`;
    } else {
      return `// Practice ${name} in Java
import java.util.*;

public class Main {
    public static void ${camelName}(int[] arr) {
        // TODO: Write your sorting algorithm here
        
    }

    public static void main(String[] args) {
        int[] arr = {5, 3, 8, 4, 2};
        ${camelName}(arr);
        System.out.println("Sorted array: " + Arrays.toString(arr));
    }
}`;
    }
  }

  if (category === "Searching") {
    if (lang === "javascript") {
      return `// Practice ${name} in JavaScript
function ${camelName}(arr, target) {
  // TODO: Write your search algorithm here (return index, or -1)
  
  return -1;
}`;
    } else if (lang === "cpp") {
      return `// Practice ${name} in C++
#include <iostream>
#include <vector>
using namespace std;

int ${camelName}(const vector<int>& arr, int target) {
    // TODO: Write your search algorithm here
    
    return -1;
}

int main() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    int target = 7;
    cout << "Index of target: " << ${camelName}(arr, target) << endl;
    return 0;
}`;
    } else {
      return `// Practice ${name} in Java
import java.util.*;

public class Main {
    public static int ${camelName}(int[] arr, int target) {
        // TODO: Write your search algorithm here
        
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11};
        int target = 7;
        System.out.println("Index of target: " + ${camelName}(arr, target));
    }
}`;
    }
  }

  if (category === "Linked List") {
    if (lang === "javascript") {
      return `// Practice ${name} in JavaScript
class Node {
  constructor(val) {
    this.value = val;
    this.next = null;
  }
}

function ${camelName}(head) {
  // TODO: Write your linked list logic here
  
  return head;
}`;
    } else if (lang === "cpp") {
      return `// Practice ${name} in C++
#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* next;
    Node(int val) : value(val), next(nullptr) {}
};

Node* ${camelName}(Node* head) {
    // TODO: Write your linked list logic here
    
    return head;
}

int main() {
    Node* head = new Node(10);
    head->next = new Node(20);
    Node* res = ${camelName}(head);
    return 0;
}`;
    } else {
      return `// Practice ${name} in Java
public class Main {
    static class Node {
        int value;
        Node next;
        Node(int val) {
            this.value = val;
            this.next = null;
        }
    }

    public static Node ${camelName}(Node head) {
        // TODO: Write your linked list logic here
        
        return head;
    }

    public static void main(String[] args) {
        Node head = new Node(10);
        head.next = new Node(20);
        Node res = ${camelName}(head);
    }
}`;
    }
  }

  if (category === "Tree") {
    if (lang === "javascript") {
      return `// Practice ${name} in JavaScript
class TreeNode {
  constructor(val) {
    this.value = val;
    this.left = null;
    this.right = null;
  }
}

function ${camelName}(root) {
  // TODO: Write your tree logic here
  
}`;
    } else if (lang === "cpp") {
      return `// Practice ${name} in C++
#include <iostream>
using namespace std;

struct TreeNode {
    int value;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int val) : value(val), left(nullptr), right(nullptr) {}
};

void ${camelName}(TreeNode* root) {
    // TODO: Write your tree logic here
    
}

int main() {
    TreeNode* root = new TreeNode(50);
    ${camelName}(root);
    return 0;
}`;
    } else {
      return `// Practice ${name} in Java
public class Main {
    static class TreeNode {
        int value;
        TreeNode left, right;
        TreeNode(int val) {
            value = val;
            left = right = null;
        }
    }

    public static void ${camelName}(TreeNode root) {
        // TODO: Write your tree logic here
        
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(50);
        ${camelName}(root);
    }
}`;
    }
  }

  if (category === "Graph") {
    if (lang === "javascript") {
      return `// Practice ${name} in JavaScript
function ${camelName}(adjList, startNode) {
  // TODO: Write your graph logic here
  
}`;
    } else if (lang === "cpp") {
      return `// Practice ${name} in C++
#include <iostream>
#include <vector>
#include <map>
using namespace std;

void ${camelName}(const map<char, vector<char>>& adjList, char startNode) {
    // TODO: Write your graph logic here
    
}

int main() {
    map<char, vector<char>> adjList;
    adjList['A'] = {'B', 'C'};
    ${camelName}(adjList, 'A');
    return 0;
}`;
    } else {
      return `// Practice ${name} in Java
import java.util.*;

public class Main {
    public static void ${camelName}(Map<Character, List<Character>> adjList, char startNode) {
        // TODO: Write your graph logic here
        
    }

    public static void main(String[] args) {
        Map<Character, List<Character>> adjList = new HashMap<>();
        ${camelName}(adjList, 'A');
    }
}`;
    }
  }

  if (lang === "javascript") {
    return `// Practice ${name} in JavaScript
function ${camelName}(arr) {
  // TODO: Write your algorithm here
  
}`;
  } else if (lang === "cpp") {
    return `// Practice ${name} in C++
#include <iostream>
#include <vector>
using namespace std;

void ${camelName}(vector<int>& arr) {
    // TODO: Write your algorithm here
    
}

int main() {
    vector<int> arr = {1, 2, 3};
    ${camelName}(arr);
    return 0;
}`;
  } else {
    return `// Practice ${name} in Java
import java.util.*;

public class Main {
    public static void ${camelName}(int[] arr) {
        // TODO: Write your algorithm here
        
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3};
        ${camelName}(arr);
    }
}`;
  }
}

function SandboxPage() {
  const search = Route.useSearch();
  const selectedAlgo = useMemo(
    () => (search.algo ? getAlgoById(search.algo) : undefined),
    [search.algo],
  );

  // Dashboard state filters
  const [filter, setFilter] = useState<"All" | Difficulty>("All");
  const [activeCat, setActiveCat] = useState<DSCategory | "All">("All");

  const [lang, setLang] = useState<"javascript" | "java" | "cpp">("javascript");
  const [editorCode, setEditorCode] = useState("");
  const [customInputStr, setCustomInputStr] = useState("");
  const [searchTargetStr, setSearchTargetStr] = useState("");
  const [runKey, setRunKey] = useState(0);

  // Visualization Player States
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Console terminal vs Test Cases tabs
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"terminal" | "tests">("tests");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [solvedAlgos, setSolvedAlgos] = useState<string[]>([]);

  // Terminal Logs State
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);

  // Custom tracing frames from running user code
  const [customTraceFrames, setCustomTraceFrames] = useState<DSFrame[] | null>(null);

  // Monaco editor references for line highlighting during playback
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }

  // Effect to highlight current step's line in the editor during custom code tracing
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      const frame = customTraceFrames ? customTraceFrames[i] : null;
      const line = frame?.line || 0;

      if (line > 0) {
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
          {
            range: new monaco.Range(line, 1, line, 1),
            options: {
              isWholeLine: true,
              className: "monaco-active-line",
              marginClassName: "monaco-active-line",
            },
          },
        ]);
        editor.revealLineInCenterIfOutsideViewport(line);
      } else {
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      }
    }
  }, [i, customTraceFrames]);

  // Clear decorations immediately if code changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const editor = editorRef.current;
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  }, [editorCode]);

  // Load blank syntax code or persisted code when algorithm or language changes
  useEffect(() => {
    if (selectedAlgo) {
      const storageKey = `sandbox_code_${selectedAlgo.id}_${lang}`;
      const savedCode = localStorage.getItem(storageKey);
      if (savedCode) {
        setEditorCode(savedCode);
      } else {
        const emptySyntax = getBoilerplate(selectedAlgo.category, selectedAlgo.name, lang);
        setEditorCode(emptySyntax);
      }

      // Check solved status from local storage
      let solvedList: string[] = [];
      try {
        solvedList = JSON.parse(localStorage.getItem("sandbox_solved_algos") || "[]");
      } catch (e) {}
      setIsSolved(solvedList.includes(selectedAlgo.id));
      setSolvedAlgos(solvedList);

      setI(0);
      setPlaying(false);
      setCustomTraceFrames(null);
      setTestResults([]);
      setTerminalLogs([
        `// Sandbox ready for ${selectedAlgo.name} (${lang === "javascript" ? "JavaScript" : lang === "cpp" ? "C++" : "Java"})`,
        `// Write your solution in the code editor, adjust inputs, and click 'Dry Run'.`,
      ]);
    } else {
      // Load solved list on list view
      let solvedList: string[] = [];
      try {
        solvedList = JSON.parse(localStorage.getItem("sandbox_solved_algos") || "[]");
      } catch (e) {}
      setSolvedAlgos(solvedList);
    }
  }, [selectedAlgo?.id, lang]);

  // Autosave code in localStorage when modified
  useEffect(() => {
    if (selectedAlgo && editorCode) {
      const storageKey = `sandbox_code_${selectedAlgo.id}_${lang}`;
      localStorage.setItem(storageKey, editorCode);
    }
  }, [editorCode, selectedAlgo?.id, lang]);

  // Reset custom parameters when changing selected question
  useEffect(() => {
    setCustomInputStr("");
    setSearchTargetStr("");
  }, [selectedAlgo?.id]);

  // Load test cases
  const testCases = useMemo(() => {
    if (!selectedAlgo) return [];
    return getTestCases(selectedAlgo.id, selectedAlgo.category);
  }, [selectedAlgo]);

  // Parse Inputs
  const parsedInput = useMemo(() => {
    if (!customInputStr.trim()) return undefined;
    const id = selectedAlgo?.id;
    if (id === "reverse-string" || id === "balanced-parens" || id === "first-non-repeating") {
      return customInputStr;
    }
    if (selectedAlgo?.category === "Graph") {
      return customInputStr;
    }
    return customInputStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n));
  }, [customInputStr, selectedAlgo]);

  const parsedTarget = useMemo(() => {
    if (!searchTargetStr.trim()) return undefined;
    return Number(searchTargetStr);
  }, [searchTargetStr]);

  // Generate Frames
  const frames = useMemo(() => {
    if (customTraceFrames) return customTraceFrames;
    return selectedAlgo?.build(parsedInput, parsedTarget) ?? [];
  }, [selectedAlgo, runKey, parsedInput, parsedTarget, customTraceFrames]);

  const frame = frames[i] ?? frames[0];

  // Visualizer Animation loops
  useEffect(() => {
    if (!playing) return;
    if (i >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setI((p) => p + 1), speed);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, i, speed, frames.length]);

  const next = () => setI((p) => Math.min(p + 1, frames.length - 1));
  const prev = () => setI((p) => Math.max(p - 1, 0));
  const reset = () => {
    setI(0);
    setPlaying(false);
  };

  // Dry Run & Test Validation simulation
  const handleDryRun = () => {
    if (isCompiling || !selectedAlgo) return;
    setIsCompiling(true);
    setPlaying(false);
    setI(0);

    const inputDesc = customInputStr ? `[${customInputStr}]` : "default parameters";

    // Spawns log headers depending on language
    if (lang === "javascript") {
      setTerminalLogs([
        "$ node main.js",
        `[info] Parsing JS sandbox AST...`,
        `[info] Executing custom script with tracing proxy...`,
      ]);

      setTimeout(() => {
        // 1. Run live code trace on custom parameter input
        const execTrace = runUserJsAndTrace(
          editorCode,
          selectedAlgo.category,
          selectedAlgo.id,
          parsedInput ||
            (selectedAlgo.category === "Searching" ? [1, 3, 5, 7, 9, 11] : [5, 3, 8, 1, 4]),
          parsedTarget,
        );

        if (execTrace.success) {
          setCustomTraceFrames(execTrace.frames);
          setTerminalLogs((prev) => [
            ...prev,
            `[stdout] Output returned: ${execTrace.result}`,
            `[success] Live trace loaded correctly! Watch visual debug canvas.`,
          ]);
        } else {
          setCustomTraceFrames(execTrace.frames); // even when wrong, play back the error frames!
          setTerminalLogs((prev) => [
            ...prev,
            `[error] Runtime Exception: ${execTrace.error}`,
            `[info] Playing back trace leading to failure point...`,
          ]);
        }

        // 2. Run test cases
        const results: TestResult[] = testCases.map((tc) => {
          // Resolve standard output for test inputs
          const res = runUserJsAndTrace(
            editorCode,
            selectedAlgo.category,
            selectedAlgo.id,
            tc.input,
            tc.target,
          );

          let passed = false;
          if (res.success) {
            const expectedStr = String(tc.expected).trim().replace(/\s+/g, "");
            const gotStr = String(res.result).trim().replace(/\s+/g, "");
            passed = expectedStr === gotStr;
          }

          return {
            testCase: tc,
            passed,
            output: res.result,
            error: res.error,
          };
        });

        setTestResults(results);
        const solved = results.length > 0 && results.every((r) => r.passed);
        setIsSolved(solved);
        if (solved && selectedAlgo) {
          try {
            const solvedList = JSON.parse(localStorage.getItem("sandbox_solved_algos") || "[]");
            if (!solvedList.includes(selectedAlgo.id)) {
              solvedList.push(selectedAlgo.id);
              localStorage.setItem("sandbox_solved_algos", JSON.stringify(solvedList));
              setSolvedAlgos(solvedList);
            }
          } catch (e) {}
        }

        setIsCompiling(false);
        setRunKey((k) => k + 1);
        setPlaying(true);
        setActiveWorkspaceTab("tests");
      }, 1000);
    } else {
      // transpile C++/Java and run trace using dynamic JS representation
      const cmdStr = lang === "cpp" ? "g++ -std=c++17 main.cpp" : "javac Main.java";
      setTerminalLogs([
        `$ ${cmdStr}`,
        `[info] Parsing and translating ${lang.toUpperCase()} source files...`,
      ]);

      setTimeout(() => {
        const normalizedName = selectedAlgo.name.replace(/[^a-zA-Z0-9]/g, "");
        const defaultFuncName = normalizedName.charAt(0).toLowerCase() + normalizedName.slice(1);
        const codeContainsFunc =
          editorCode.toLowerCase().includes(defaultFuncName.toLowerCase()) ||
          editorCode.includes("solve") ||
          editorCode.includes("Main") ||
          editorCode.includes("class");
        const emptySyntax = getBoilerplate(selectedAlgo.category, selectedAlgo.name, lang);
        const codeModified = editorCode.trim() !== emptySyntax.trim();

        if (codeContainsFunc && codeModified) {
          try {
            const jsCode = transpileToJs(editorCode, lang, selectedAlgo.category, selectedAlgo.id);
            setTerminalLogs((prev) => [
              ...prev,
              `[info] Translation successful. Generated visual engine JS bytecode.`,
              `$ node main.js`,
            ]);

            // 1. Run live trace on user's custom input parameters
            const execTrace = runUserJsAndTrace(
              jsCode,
              selectedAlgo.category,
              selectedAlgo.id,
              parsedInput ||
                (selectedAlgo.category === "Searching" ? [1, 3, 5, 7, 9, 11] : [5, 3, 8, 1, 4]),
              parsedTarget,
            );

            if (execTrace.success) {
              setCustomTraceFrames(execTrace.frames);
              setTerminalLogs((prev) => [
                ...prev,
                `[stdout] Output returned: ${execTrace.result}`,
                `[success] Live trace loaded correctly! Watch visual debug canvas.`,
              ]);
            } else {
              setCustomTraceFrames(execTrace.frames);
              setTerminalLogs((prev) => [
                ...prev,
                `[error] Runtime Exception during simulation: ${execTrace.error}`,
                `[info] Playing back trace leading to failure point...`,
              ]);
            }

            // 2. Evaluate solution correctness against predefined test cases
            const results: TestResult[] = testCases.map((tc) => {
              const res = runUserJsAndTrace(
                jsCode,
                selectedAlgo.category,
                selectedAlgo.id,
                tc.input,
                tc.target,
              );

              let passed = false;
              if (res.success) {
                const expectedStr = String(tc.expected).trim().replace(/\s+/g, "");
                const gotStr = String(res.result).trim().replace(/\s+/g, "");
                passed = expectedStr === gotStr;
              }

              return {
                testCase: tc,
                passed,
                output: res.result,
                error: res.error,
              };
            });

            setTestResults(results);
            const solved = results.length > 0 && results.every((r) => r.passed);
            setIsSolved(solved);
            if (solved) {
              try {
                const solvedList = JSON.parse(localStorage.getItem("sandbox_solved_algos") || "[]");
                if (!solvedList.includes(selectedAlgo.id)) {
                  solvedList.push(selectedAlgo.id);
                  localStorage.setItem("sandbox_solved_algos", JSON.stringify(solvedList));
                  setSolvedAlgos(solvedList);
                }
              } catch (e) {}
            }
          } catch (err: any) {
            setTerminalLogs((prev) => [
              ...prev,
              `[error] Translation or Execution halted: ${err.message || String(err)}`,
            ]);
            setIsSolved(false);
          }
        } else {
          const results: TestResult[] = testCases.map((tc) => ({
            testCase: tc,
            passed: false,
            output: "TODO/Compilation Error",
          }));
          setTestResults(results);
          setIsSolved(false);
          setTerminalLogs((prev) => [
            ...prev,
            `[error] Compilation failed. Missing reference function '${defaultFuncName}' or TODO comments remaining.`,
          ]);
        }

        setIsCompiling(false);
        setRunKey((k) => k + 1);
        setPlaying(true);
        setActiveWorkspaceTab("tests");
      }, 1200);
    }
  };

  const inputPlaceholder = useMemo(() => {
    if (!selectedAlgo) return "";
    switch (selectedAlgo.id) {
      case "reverse-string":
        return "e.g. hello";
      case "balanced-parens":
        return "e.g. {[()]}";
      case "first-non-repeating":
        return "e.g. aabcbcd";
      case "graph-bfs":
      case "graph-dfs":
      case "graph-cycle":
      case "graph-components":
      case "graph-shortest":
        return "e.g. A-B, A-D, B-C, B-E, C-F, D-E, E-F";
      default:
        return "e.g. 5, 3, 8, 1, 4";
    }
  }, [selectedAlgo]);

  const inputLabel = useMemo(() => {
    if (!selectedAlgo) return "";
    switch (selectedAlgo.category) {
      case "Graph":
        return "Custom Edges (comma-separated)";
      case "Stack":
        if (selectedAlgo.id === "reverse-string" || selectedAlgo.id === "balanced-parens") {
          return "Custom String";
        }
        return "Custom Array (comma-separated)";
      case "Queue":
        if (selectedAlgo.id === "first-non-repeating") {
          return "Custom Stream";
        }
        return "Custom Array (comma-separated)";
      default:
        return "Custom Array (comma-separated)";
    }
  }, [selectedAlgo]);

  const showSearchTarget = useMemo(() => {
    if (!selectedAlgo) return false;
    const id = selectedAlgo.id;
    return (
      id === "linear" ||
      id === "binary" ||
      id.includes("search") ||
      id.includes("find") ||
      id.includes("occ") ||
      id.includes("target") ||
      id === "rotate-right" ||
      id === "tree-insert-bst" ||
      id === "sliding-window-max" ||
      id === "ll-insert-head" ||
      id === "ll-insert-tail" ||
      id === "ll-delete"
    );
  }, [selectedAlgo]);

  const targetLabel = useMemo(() => {
    if (!selectedAlgo) return "";
    if (selectedAlgo.id === "rotate-right") return "Rotate Steps (k)";
    if (
      selectedAlgo.id === "tree-insert-bst" ||
      selectedAlgo.id === "ll-insert-head" ||
      selectedAlgo.id === "ll-insert-tail"
    )
      return "Value to Insert";
    if (selectedAlgo.id === "ll-delete") return "Value to Delete";
    if (selectedAlgo.id === "sliding-window-max") return "Window Size (k)";
    return "Search Target";
  }, [selectedAlgo]);

  const filteredAlgos = useMemo(() => {
    return DSA_REGISTRY.filter((a) => {
      const matchCat = activeCat === "All" || a.category === activeCat;
      const matchDiff = filter === "All" || a.difficulty === filter;
      return matchCat && matchDiff;
    });
  }, [activeCat, filter]);

  return (
    <div className="min-h-dvh relative flex flex-col bg-[#020617] text-[#f8fafc]">
      <div className="absolute top-0 left-0 size-[600px] glow-orb pointer-events-none" />
      <Header />

      <main className="flex-1 relative mx-auto max-w-7xl w-full px-6 py-8">
        {selectedAlgo ? (
          <>
            <Link
              to="/sandbox"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-[#030712]/50 hover:bg-white/5 text-xs font-mono text-muted-foreground hover:text-primary transition-all mb-6"
            >
              ← Back to Sandbox Hub
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-primary mb-2">
                  / SANDBOX PLAYGROUND / {selectedAlgo.category.toUpperCase()}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-black tracking-tight leading-none">
                    {selectedAlgo.name}
                  </h1>
                  {isSolved && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold font-mono animate-pulse-soft">
                      ✓ SOLVED
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2 max-w-3xl text-sm">{selectedAlgo.blurb}</p>
              </div>
            </div>

            {/* Solved Celebration Banner */}
            {isSolved && (
              <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-semibold flex items-center gap-3 animate-fade-in font-mono">
                <span>🎉</span>
                <span>
                  TRANSMUTATION SUCCESSFUL: Your solution matches all execution targets. +50 XP
                  granted.
                </span>
              </div>
            )}

            {/* Dry Run / Parameters Dashboard */}
            <div className="glass-card border-primary/20 p-6 mb-8 flex flex-col sm:flex-row items-end gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />

              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-2.5">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {inputLabel}
                  </label>
                  {(selectedAlgo?.category === "Tree" || selectedAlgo?.category === "Graph") && (
                    <InteractiveCanvasEditor
                      category={selectedAlgo.category}
                      customInputStr={customInputStr}
                      setCustomInputStr={setCustomInputStr}
                    />
                  )}
                </div>
                <input
                  type="text"
                  value={customInputStr}
                  onChange={(e) => setCustomInputStr(e.target.value)}
                  placeholder={inputPlaceholder}
                  className="w-full h-10 px-4 rounded-xl bg-[#030712] border border-border text-sm font-mono text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                />
              </div>

              {showSearchTarget && (
                <div className="w-full sm:w-48">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2.5">
                    {targetLabel}
                  </label>
                  <input
                    type="text"
                    value={searchTargetStr}
                    onChange={(e) => setSearchTargetStr(e.target.value)}
                    placeholder="e.g. 8"
                    className="w-full h-10 px-4 rounded-xl bg-[#030712] border border-border text-sm font-mono text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                  />
                </div>
              )}

              <button
                onClick={handleDryRun}
                disabled={isCompiling}
                className="w-full sm:w-auto h-10 px-6 rounded-xl btn-primary-tactile text-xs font-mono font-bold hover:btn-primary-tactile-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {isCompiling ? (
                  <>
                    <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    COMPILING...
                  </>
                ) : (
                  <>🚀 RUN SOLUTIONS</>
                )}
              </button>
            </div>

            {/* Split Editor / Visualizer Layout */}
            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Monaco Code Editor + Output Compiler Logs */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                <div className="glass-card border-primary/20 overflow-hidden flex flex-col min-h-[380px] bg-[#030712]/50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#030712]/50">
                    <span className="text-xs font-mono font-bold text-primary">
                      💻 EDITOR SOURCE
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">
                      {lang === "javascript" ? ".js" : lang === "cpp" ? ".cpp" : ".java"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-white/5">
                    <div className="flex gap-1.5">
                      {(["javascript", "java", "cpp"] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setLang(l)}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wide uppercase transition-all cursor-pointer ${
                            lang === l
                              ? "bg-primary text-black font-bold shadow-[0_0_10px_rgba(199,244,100,0.2)]"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          }`}
                        >
                          {l === "javascript" ? "js" : l === "cpp" ? "cpp" : "java"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 bg-[#020617]/40 min-h-[300px]">
                    <Editor
                      height="300px"
                      language={lang}
                      theme="vs-dark"
                      value={editorCode}
                      onChange={(val) => setEditorCode(val ?? "")}
                      onMount={handleEditorDidMount}
                      options={{
                        readOnly: false,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 12,
                        lineHeight: 20,
                        fontFamily: "JetBrains Mono, ui-monospace, monospace",
                        lineNumbers: "on",
                        scrollbar: {
                          vertical: "visible",
                          horizontal: "auto",
                          useShadows: false,
                          verticalScrollbarSize: 6,
                          horizontalScrollbarSize: 6,
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Workspace Output Tabs: Console Output vs Test Cases */}
                <div className="glass-card border-primary/20 overflow-hidden flex flex-col min-h-[240px] bg-[#030712]/50">
                  <div className="flex items-center border-b border-border bg-[#030712]/50 px-4 py-1.5 gap-4">
                    <button
                      onClick={() => setActiveWorkspaceTab("tests")}
                      className={`py-2 text-xs font-mono uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
                        activeWorkspaceTab === "tests"
                          ? "text-primary border-primary font-bold"
                          : "text-muted-foreground border-transparent hover:text-foreground"
                      }`}
                    >
                      🧪 Test Cases ({testResults.filter((r) => r.passed).length}/{testCases.length}
                      )
                    </button>
                    <button
                      onClick={() => setActiveWorkspaceTab("terminal")}
                      className={`py-2 text-xs font-mono uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
                        activeWorkspaceTab === "terminal"
                          ? "text-primary border-primary font-bold"
                          : "text-muted-foreground border-transparent hover:text-foreground"
                      }`}
                    >
                      💻 Compiler Output
                    </button>
                  </div>

                  <div className="flex-1 p-5 overflow-y-auto max-h-[190px] font-mono text-xs text-muted-foreground bg-[#020617]/40">
                    {activeWorkspaceTab === "terminal" ? (
                      <div className="space-y-1.5 pr-2">
                        {terminalLogs.map((log, idx) => {
                          let cls = "text-muted-foreground/60";
                          if (log.startsWith("$")) cls = "text-[#C7F464] font-bold";
                          else if (log.includes("[success]")) cls = "text-emerald-400 font-bold";
                          else if (log.includes("[error]")) cls = "text-rose-400 font-bold";
                          else if (log.includes("[stdout]")) cls = "text-[#22D3EE]";
                          else if (log.startsWith("//")) cls = "text-muted-foreground/30 italic";
                          return (
                            <div key={idx} className={`${cls} leading-relaxed break-all`}>
                              {log}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-4 pr-2">
                        {testCases.map((tc, idx) => {
                          const tr = testResults[idx];
                          return (
                            <div
                              key={idx}
                              className="border-b border-border/40 pb-4 last:border-b-0 last:pb-0"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-foreground font-bold">Case {idx + 1}</span>
                                <span
                                  className={`px-2.5 py-0.5 rounded border text-[9px] font-bold font-mono tracking-wider ${
                                    !tr
                                      ? "border-border/40 bg-white/5 text-muted-foreground/60"
                                      : tr.passed
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                        : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                                  }`}
                                >
                                  {!tr ? "Pending" : tr.passed ? "Passed" : "Failed"}
                                </span>
                              </div>
                              <div className="space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                                <div>
                                  <span className="text-muted-foreground/40 font-mono">INPUT:</span>{" "}
                                  {Array.isArray(tc.input)
                                    ? `[${tc.input.join(", ")}]`
                                    : String(tc.input)}
                                  {tc.target !== undefined && ` (target: ${tc.target})`}
                                </div>
                                <div>
                                  <span className="text-muted-foreground/40 font-mono">
                                    EXPECTED:
                                  </span>{" "}
                                  {String(tc.expected)}
                                </div>
                                {tr && (
                                  <div>
                                    <span className="text-muted-foreground/40 font-mono">
                                      OUTPUT:
                                    </span>{" "}
                                    <span
                                      className={tr.passed ? "text-emerald-400" : "text-rose-400"}
                                    >
                                      {tr.error
                                        ? `Runtime Exception: ${tr.error}`
                                        : String(tr.output)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Visualizer Canvas & Trace controller */}
              <div className="lg:col-span-6 glass-card border-primary/20 overflow-hidden flex flex-col justify-between h-full min-h-[500px] bg-[#030712]/50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#030712]/50">
                  <span className="text-xs font-mono font-bold flex items-center gap-1.5">
                    {customTraceFrames ? (
                      <>
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-400">YOUR ENGINE TRACE</span>
                      </>
                    ) : (
                      <>
                        <span className="size-2 rounded-full bg-primary" />
                        <span className="text-primary">SAMPLE ENGINE TRACE</span>
                      </>
                    )}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                    Step {i + 1} / {frames.length || 1}
                  </span>
                </div>

                <div className="grid-bg p-6 min-h-[320px] flex-1 flex items-center justify-center bg-[#020617]/20 relative">
                  {frames.length > 0 ? (
                    <ShapeRenderer frames={frames} index={i} />
                  ) : (
                    <div className="text-xs text-muted-foreground/40 font-mono">
                      No dry run traces loaded. Configure inputs and click Run.
                    </div>
                  )}
                </div>

                {/* AI Commentary Panel */}
                <div className="border-t border-border p-5 bg-[#020617]/40 min-h-[120px]">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-primary mb-2 font-mono">
                    AI Dry Run Commentary
                  </div>
                  {frame ? (
                    <>
                      <p
                        key={i}
                        className="text-xs leading-relaxed animate-fade-in text-muted-foreground font-sans"
                      >
                        {frame.explain}
                      </p>
                      {frame.result && (
                        <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-primary/30 bg-primary/10 text-[10px] font-bold text-primary font-mono uppercase tracking-wider">
                          OUT: {frame.result}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground/30 italic font-mono">
                      Pending dry run code compiler signals.
                    </p>
                  )}
                </div>

                {/* Variables state */}
                <div className="border-t border-border px-4 py-2 flex flex-wrap gap-2 min-h-[48px] bg-[#030712]/30">
                  {frame?.vars && Object.keys(frame.vars).length > 0 ? (
                    Object.entries(frame.vars).map(([k, val]) => (
                      <div
                        key={k}
                        className="font-mono text-[9px] px-2.5 py-0.5 rounded-lg border border-border bg-[#020617]/50"
                      >
                        <span className="text-muted-foreground">{k}</span>
                        <span className="mx-1 text-primary/60">=</span>
                        <span className="text-primary font-bold">{String(val)}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[9px] font-mono text-muted-foreground/30 self-center">
                      No active scoped variables
                    </span>
                  )}
                </div>

                {/* Controls */}
                <div className="border-t border-border p-4 flex flex-wrap items-center gap-3 bg-[#030712]/50">
                  <button
                    onClick={prev}
                    disabled={i === 0 || frames.length === 0}
                    className="px-3 py-1.5 rounded-lg border border-border bg-[#020617] hover:bg-white/5 disabled:opacity-40 text-xs font-mono cursor-pointer"
                  >
                    ◀ PREV
                  </button>
                  <button
                    onClick={() => setPlaying((p) => !p)}
                    disabled={frames.length === 0}
                    className="px-4 py-1.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-xs disabled:opacity-40 font-mono cursor-pointer"
                  >
                    {playing ? "❚❚ PAUSE" : "▶ PLAY"}
                  </button>
                  <button
                    onClick={next}
                    disabled={i >= frames.length - 1 || frames.length === 0}
                    className="px-3 py-1.5 rounded-lg border border-border bg-[#020617] hover:bg-white/5 disabled:opacity-40 text-xs font-mono cursor-pointer"
                  >
                    NEXT ▶
                  </button>
                  <button
                    onClick={reset}
                    disabled={frames.length === 0}
                    className="px-3 py-1.5 rounded-lg border border-border bg-[#020617] hover:bg-white/5 text-xs font-mono disabled:opacity-40 cursor-pointer"
                  >
                    ↺ RESET
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono">SPEED</span>
                    <input
                      type="range"
                      min={120}
                      max={1400}
                      step={40}
                      value={1520 - speed}
                      onChange={(e) => setSpeed(1520 - Number(e.target.value))}
                      className="w-16 accent-primary"
                    />
                  </div>
                </div>

                <div className="h-1 bg-[#0b1220]">
                  <div
                    className="h-full bg-gradient-primary transition-all duration-150"
                    style={{ width: `${frames.length ? ((i + 1) / frames.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="font-mono text-xs uppercase tracking-widest text-primary mb-2">
              / INTERACTIVE COMPILER LAB
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-4">Algorithm Lab</h1>
            <p className="text-muted-foreground mb-10 max-w-3xl text-sm leading-relaxed">
              Select an algorithm challenge container below. Write your own custom code in
              Javascript, C++, or Java, transpile it dynamically, and evaluate correctness against
              verified test runners.
            </p>

            {/* Dashboard Filters */}
            <div className="glass-card border-primary/15 p-6 mb-10 space-y-6">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Filter by Difficulty
                </div>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setFilter(d)}
                      className={`px-4 py-2 rounded-full border text-xs font-mono tracking-wider transition-all uppercase cursor-pointer ${
                        filter === d
                          ? "bg-primary text-black border-transparent font-bold shadow-[0_0_10px_rgba(199,244,100,0.3)]"
                          : "border-border bg-[#030712] text-muted-foreground hover:text-foreground hover:border-primary/30"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Operational Domain
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveCat("All")}
                    className={`px-4 py-2 rounded-full border text-xs font-mono tracking-wider transition-all uppercase cursor-pointer ${
                      activeCat === "All"
                        ? "bg-primary text-black border-transparent font-bold shadow-[0_0_10px_rgba(199,244,100,0.3)]"
                        : "border-border bg-[#030712] text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    all domains
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCat(cat)}
                      className={`px-4 py-2 rounded-full border text-xs font-mono tracking-wider transition-all uppercase cursor-pointer flex items-center gap-1.5 ${
                        activeCat === cat
                          ? "bg-primary text-black border-transparent font-bold shadow-[0_0_10px_rgba(199,244,100,0.3)]"
                          : "border-border bg-[#030712] text-muted-foreground hover:text-foreground hover:border-primary/30"
                      }`}
                    >
                      <span className="text-primary font-bold">{CATEGORY_ICON[cat]}</span>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid of Lab Challenges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredAlgos.map((algo) => {
                const isAlgoSolved = solvedAlgos.includes(algo.id);
                return (
                  <Link
                    key={algo.id}
                    to="/sandbox"
                    search={{ algo: algo.id }}
                    className="glass-card hover:glass-card-hover border-primary/10 p-6 flex flex-col justify-between group min-h-[220px]"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-3xl text-primary font-mono">
                          {CATEGORY_ICON[algo.category]}
                        </span>
                        <div className="flex items-center gap-2">
                          {isAlgoSolved && (
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ✓ SOLVED
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${COLORS[algo.difficulty]}`}
                          >
                            {algo.difficulty}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">
                        {algo.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-sans">
                        {algo.blurb}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase">
                      <span>{algo.category}</span>
                      <span className="text-primary group-hover:translate-x-1.5 transition-transform font-bold">
                        PRACTICE →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
