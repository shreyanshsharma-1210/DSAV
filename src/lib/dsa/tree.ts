import type { DSAlgoMeta, DSFrame, TreeNodeView } from "./types";

// Sample BST:
//          5
//        /   \
//       3     8
//      / \   / \
//     1   4 7   9
const SAMPLE_TREE: TreeNodeView[] = [
  { id: 0, value: 5, left: 1, right: 2 },
  { id: 1, value: 3, left: 3, right: 4 },
  { id: 2, value: 8, left: 5, right: 6 },
  { id: 3, value: 1 },
  { id: 4, value: 4 },
  { id: 5, value: 7 },
  { id: 6, value: 9 },
];

function frame(
  nodes: TreeNodeView[],
  highlight: number[],
  visited: number[],
  order: number[],
  line: number,
  explain: string,
  vars: Record<string, number | string> = {},
  result?: string,
): DSFrame {
  return {
    shape: { kind: "tree", nodes, highlight, visited, order },
    line,
    vars,
    explain,
    result,
  };
}

// ---------- Inorder ----------
const INORDER_CODE = [
  "function inorder(node, out) {",
  "  if (!node) return;",
  "  inorder(node.left, out);",
  "  out.push(node.value);",
  "  inorder(node.right, out);",
  "}",
];
function buildBstFromArr(customInput?: number[] | string): TreeNodeView[] {
  let arr: number[] = [5, 3, 8, 1, 4, 7, 9];
  if (Array.isArray(customInput) && customInput.length > 0) {
    arr = [...customInput];
  } else if (typeof customInput === "string" && customInput.trim()) {
    arr = customInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
  }
  if (arr.length === 0) {
    arr = [5, 3, 8, 1, 4, 7, 9];
  }

  const nodes: TreeNodeView[] = [];
  const insertNode = (val: number) => {
    if (nodes.length === 0) {
      nodes.push({ id: 0, value: val });
      return;
    }
    let curId = 0;
    while (true) {
      if (val < nodes[curId].value) {
        if (nodes[curId].left === undefined) {
          const newId = nodes.length;
          nodes.push({ id: newId, value: val });
          nodes[curId] = { ...nodes[curId], left: newId };
          break;
        } else {
          curId = nodes[curId].left!;
        }
      } else {
        if (nodes[curId].right === undefined) {
          const newId = nodes.length;
          nodes.push({ id: newId, value: val });
          nodes[curId] = { ...nodes[curId], right: newId };
          break;
        } else {
          curId = nodes[curId].right!;
        }
      }
    }
  };
  arr.forEach(insertNode);
  return nodes;
}

function buildInorder(customInput?: number[] | string): DSFrame[] {
  const tree = buildBstFromArr(customInput);
  const f: DSFrame[] = [];
  const visited: number[] = [];
  const order: number[] = [];
  const walk = (id: number | undefined) => {
    if (id === undefined) return;
    f.push(frame(tree, [id], [...visited], [...order], 2, `Visit subtree at ${tree[id].value}.`));
    walk(tree[id].left);
    visited.push(id);
    order.push(tree[id].value);
    f.push(
      frame(tree, [id], [...visited], [...order], 4, `Output ${tree[id].value}.`, {
        value: tree[id].value,
      }),
    );
    walk(tree[id].right);
  };
  if (tree.length > 0) walk(0);
  f.push(frame(tree, [], visited, order, 6, "Done.", {}, order.join(", ")));
  return f;
}

// ---------- Preorder ----------
const PREORDER_CODE = [
  "function preorder(node, out) {",
  "  if (!node) return;",
  "  out.push(node.value);",
  "  preorder(node.left, out);",
  "  preorder(node.right, out);",
  "}",
];
function buildPreorder(customInput?: number[] | string): DSFrame[] {
  const tree = buildBstFromArr(customInput);
  const f: DSFrame[] = [];
  const visited: number[] = [];
  const order: number[] = [];
  const walk = (id: number | undefined) => {
    if (id === undefined) return;
    visited.push(id);
    order.push(tree[id].value);
    f.push(
      frame(tree, [id], [...visited], [...order], 3, `Output ${tree[id].value}.`, {
        value: tree[id].value,
      }),
    );
    walk(tree[id].left);
    walk(tree[id].right);
  };
  if (tree.length > 0) walk(0);
  f.push(frame(tree, [], visited, order, 6, "Done.", {}, order.join(", ")));
  return f;
}

// ---------- Postorder ----------
const POSTORDER_CODE = [
  "function postorder(node, out) {",
  "  if (!node) return;",
  "  postorder(node.left, out);",
  "  postorder(node.right, out);",
  "  out.push(node.value);",
  "}",
];
function buildPostorder(customInput?: number[] | string): DSFrame[] {
  const tree = buildBstFromArr(customInput);
  const f: DSFrame[] = [];
  const visited: number[] = [];
  const order: number[] = [];
  const walk = (id: number | undefined) => {
    if (id === undefined) return;
    f.push(frame(tree, [id], [...visited], [...order], 2, `Enter subtree at ${tree[id].value}.`));
    walk(tree[id].left);
    walk(tree[id].right);
    visited.push(id);
    order.push(tree[id].value);
    f.push(
      frame(tree, [id], [...visited], [...order], 5, `Output ${tree[id].value}.`, {
        value: tree[id].value,
      }),
    );
  };
  if (tree.length > 0) walk(0);
  f.push(frame(tree, [], visited, order, 6, "Done.", {}, order.join(", ")));
  return f;
}

// ---------- Level Order (BFS) ----------
const LEVEL_CODE = [
  "function levelOrder(root) {",
  "  const q = [root];",
  "  const out = [];",
  "  while (q.length) {",
  "    const node = q.shift();",
  "    out.push(node.value);",
  "    if (node.left) q.push(node.left);",
  "    if (node.right) q.push(node.right);",
  "  }",
  "  return out;",
  "}",
];
function buildLevelOrder(customInput?: number[] | string): DSFrame[] {
  const tree = buildBstFromArr(customInput);
  const f: DSFrame[] = [];
  const visited: number[] = [];
  const order: number[] = [];
  const q: number[] = tree.length > 0 ? [0] : [];
  while (q.length) {
    const id = q.shift()!;
    visited.push(id);
    order.push(tree[id].value);
    f.push(
      frame(
        tree,
        [id],
        [...visited],
        [...order],
        6,
        `Pop ${tree[id].value} from queue, output it.`,
        { value: tree[id].value },
      ),
    );
    if (tree[id].left !== undefined) q.push(tree[id].left!);
    if (tree[id].right !== undefined) q.push(tree[id].right!);
  }
  f.push(frame(tree, [], visited, order, 11, "Done.", {}, order.join(", ")));
  return f;
}

// ---------- Insert into BST ----------
const INSERT_BST_CODE = [
  "function insert(root, value) {",
  "  if (!root) return { value, left: null, right: null };",
  "  if (value < root.value) root.left = insert(root.left, value);",
  "  else root.right = insert(root.right, value);",
  "  return root;",
  "}",
];
function buildInsertBST(customInput?: number[] | string, searchTarget?: number): DSFrame[] {
  const f: DSFrame[] = [];
  const nodes = buildBstFromArr(customInput);
  const target = searchTarget !== undefined ? searchTarget : 6;
  if (nodes.length === 0) {
    nodes.push({ id: 0, value: target });
    f.push(
      frame(
        nodes,
        [0],
        [0],
        [],
        2,
        `Insert ${target} as root node.`,
        { target },
        `inserted ${target}`,
      ),
    );
    return f;
  }
  let curId = 0;
  const visited: number[] = [];
  while (true) {
    visited.push(curId);
    f.push(
      frame(
        nodes,
        [curId],
        [...visited],
        [],
        2,
        `At node ${nodes[curId].value}; compare with ${target}.`,
        { current: nodes[curId].value, target },
      ),
    );
    if (target < nodes[curId].value) {
      if (nodes[curId].left === undefined) {
        const newId = nodes.length;
        nodes.push({ id: newId, value: target });
        nodes[curId] = { ...nodes[curId], left: newId };
        f.push(
          frame(
            nodes,
            [newId],
            [...visited, newId],
            [],
            3,
            `Insert ${target} as left child.`,
            { target },
            `inserted ${target}`,
          ),
        );
        return f;
      }
      curId = nodes[curId].left!;
    } else {
      if (nodes[curId].right === undefined) {
        const newId = nodes.length;
        nodes.push({ id: newId, value: target });
        nodes[curId] = { ...nodes[curId], right: newId };
        f.push(
          frame(
            nodes,
            [newId],
            [...visited, newId],
            [],
            4,
            `Insert ${target} as right child.`,
            { target },
            `inserted ${target}`,
          ),
        );
        return f;
      }
      curId = nodes[curId].right!;
    }
  }
}

export const TREE_ALGOS: DSAlgoMeta[] = [
  {
    id: "tree-inorder",
    name: "Inorder Traversal",
    category: "Tree",
    difficulty: "Easy",
    blurb: "Left, node, right.",
    code: INORDER_CODE,
    build: buildInorder,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(h)" },
  },
  {
    id: "tree-preorder",
    name: "Preorder Traversal",
    category: "Tree",
    difficulty: "Easy",
    blurb: "Node, left, right.",
    code: PREORDER_CODE,
    build: buildPreorder,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(h)" },
  },
  {
    id: "tree-postorder",
    name: "Postorder Traversal",
    category: "Tree",
    difficulty: "Easy",
    blurb: "Left, right, node.",
    code: POSTORDER_CODE,
    build: buildPostorder,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(h)" },
  },
  {
    id: "tree-levelorder",
    name: "Level Order (BFS)",
    category: "Tree",
    difficulty: "Medium",
    blurb: "Queue-based breadth-first traversal.",
    code: LEVEL_CODE,
    build: buildLevelOrder,
    complexity: { time: { best: "O(n)", avg: "O(n)", worst: "O(n)" }, space: "O(n)" },
  },
  {
    id: "tree-insert-bst",
    name: "Insert into BST",
    category: "Tree",
    difficulty: "Medium",
    blurb: "Walk left/right by comparison.",
    code: INSERT_BST_CODE,
    build: buildInsertBST,
    complexity: { time: { best: "O(log n)", avg: "O(log n)", worst: "O(n)" }, space: "O(h)" },
  },
];
