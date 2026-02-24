import type { DSAlgoMeta, DSFrame, GraphNodeView, GraphEdgeView } from "./types";

// Sample undirected graph (positions chosen for visual clarity).
// Sample undirected graph (positions chosen for visual clarity).
const NODES: GraphNodeView[] = [
  { id: "A", x: 80, y: 60 },
  { id: "B", x: 220, y: 60 },
  { id: "C", x: 360, y: 60 },
  { id: "D", x: 80, y: 200 },
  { id: "E", x: 220, y: 200 },
  { id: "F", x: 360, y: 200 },
];
const EDGES: GraphEdgeView[] = [
  { from: "A", to: "B" },
  { from: "A", to: "D" },
  { from: "B", to: "C" },
  { from: "B", to: "E" },
  { from: "C", to: "F" },
  { from: "D", to: "E" },
  { from: "E", to: "F" },
];

function parseGraphInput(customInput?: number[] | string) {
  let edgesStr = "A-B, A-D, B-C, B-E, C-F, D-E, E-F";
  if (typeof customInput === "string" && customInput.trim()) {
    edgesStr = customInput.trim();
  } else if (Array.isArray(customInput) && customInput.length > 0) {
    const pairs: string[] = [];
    for (let i = 0; i < customInput.length; i += 2) {
      if (i + 1 < customInput.length) {
        pairs.push(`${customInput[i]}-${customInput[i + 1]}`);
      }
    }
    if (pairs.length > 0) {
      edgesStr = pairs.join(", ");
    }
  }

  const parsedEdges: GraphEdgeView[] = [];
  const nodesSet = new Set<string>();
  const parts = edgesStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const part of parts) {
    const nodes = part
      .split("-")
      .map((s) => s.trim())
      .filter(Boolean);
    if (nodes.length >= 2) {
      const from = nodes[0];
      const to = nodes[1];
      parsedEdges.push({ from, to });
      nodesSet.add(from);
      nodesSet.add(to);
    }
  }

  if (nodesSet.size === 0) {
    return { nodes: NODES, edges: EDGES };
  }

  const nodesList = Array.from(nodesSet).sort();
  const parsedNodes: GraphNodeView[] = [];
  const cx = 220;
  const cy = 130;
  const r = 90;
  nodesList.forEach((id, index) => {
    const angle = (index * 2 * Math.PI) / nodesList.length;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    parsedNodes.push({ id, x: Math.round(x), y: Math.round(y) });
  });

  return { nodes: parsedNodes, edges: parsedEdges };
}

function getNeighbors(id: string, edges: GraphEdgeView[]): string[] {
  const set: string[] = [];
  for (const e of edges) {
    if (e.from === id) set.push(e.to);
    else if (e.to === id) set.push(e.from);
  }
  return Array.from(new Set(set)).sort();
}

function makeFrame(
  nodes: GraphNodeView[],
  edges: GraphEdgeView[],
  highlight: string[],
  visited: string[],
  order: string[],
  frontier: string[],
  frontierLabel: string,
  line: number,
  explain: string,
  vars: Record<string, number | string> = {},
  result?: string,
): DSFrame {
  return {
    shape: {
      kind: "graph",
      nodes,
      edges,
      undirected: true,
      highlight,
      visited,
      order,
      frontier,
      frontierLabel,
    },
    line,
    vars,
    explain,
    result,
  };
}

// ---------- BFS ----------
const BFS_CODE = [
  "function bfs(start) {",
  "  const q = [start], seen = new Set([start]);",
  "  const order = [];",
  "  while (q.length) {",
  "    const node = q.shift();",
  "    order.push(node);",
  "    for (const n of neighbors(node)) {",
  "      if (!seen.has(n)) { seen.add(n); q.push(n); }",
  "    }",
  "  }",
  "  return order;",
  "}",
];
function buildBFS(customInput?: number[] | string): DSFrame[] {
  const { nodes, edges } = parseGraphInput(customInput);
  const start = nodes.length > 0 ? nodes[0].id : "A";
  const q = [start];
  const seen = new Set([start]);
  const order: string[] = [];
  const f: DSFrame[] = [];
  f.push(makeFrame(nodes, edges, [start], [], [], [...q], "queue", 2, `Start BFS at ${start}.`));
  while (q.length) {
    const node = q.shift()!;
    order.push(node);
    f.push(
      makeFrame(nodes, edges, [node], [...order], [...order], [...q], "queue", 6, `Visit ${node}.`),
    );
    for (const n of getNeighbors(node, edges)) {
      if (!seen.has(n)) {
        seen.add(n);
        q.push(n);
        f.push(
          makeFrame(
            nodes,
            edges,
            [n],
            [...order],
            [...order],
            [...q],
            "queue",
            8,
            `Discover ${n}, enqueue.`,
          ),
        );
      }
    }
  }
  f.push(
    makeFrame(
      nodes,
      edges,
      [],
      [...order],
      [...order],
      [],
      "queue",
      11,
      "Done.",
      {},
      order.join(" → "),
    ),
  );
  return f;
}

// ---------- DFS ----------
const DFS_CODE = [
  "function dfs(start) {",
  "  const stack = [start], seen = new Set();",
  "  const order = [];",
  "  while (stack.length) {",
  "    const node = stack.pop();",
  "    if (seen.has(node)) continue;",
  "    seen.add(node); order.push(node);",
  "    for (const n of neighbors(node)) if (!seen.has(n)) stack.push(n);",
  "  }",
  "  return order;",
  "}",
];
function buildDFS(customInput?: number[] | string): DSFrame[] {
  const { nodes, edges } = parseGraphInput(customInput);
  const start = nodes.length > 0 ? nodes[0].id : "A";
  const stack = [start];
  const seen = new Set<string>();
  const order: string[] = [];
  const f: DSFrame[] = [];
  f.push(
    makeFrame(nodes, edges, [start], [], [], [...stack], "stack", 2, `Start DFS at ${start}.`),
  );
  while (stack.length) {
    const node = stack.pop()!;
    if (seen.has(node)) continue;
    seen.add(node);
    order.push(node);
    f.push(
      makeFrame(
        nodes,
        edges,
        [node],
        [...order],
        [...order],
        [...stack],
        "stack",
        7,
        `Visit ${node}.`,
      ),
    );
    for (const n of getNeighbors(node, edges).slice().reverse()) {
      if (!seen.has(n)) {
        stack.push(n);
        f.push(
          makeFrame(
            nodes,
            edges,
            [n],
            [...order],
            [...order],
            [...stack],
            "stack",
            8,
            `Push ${n} on stack.`,
          ),
        );
      }
    }
  }
  f.push(
    makeFrame(
      nodes,
      edges,
      [],
      [...order],
      [...order],
      [],
      "stack",
      10,
      "Done.",
      {},
      order.join(" → "),
    ),
  );
  return f;
}

// ---------- Cycle Detection (DFS, undirected) ----------
const CYCLE_CODE = [
  "function hasCycle() {",
  "  const seen = new Set();",
  "  function dfs(node, parent) {",
  "    seen.add(node);",
  "    for (const n of neighbors(node)) {",
  "      if (!seen.has(n)) { if (dfs(n, node)) return true; }",
  "      else if (n !== parent) return true; // back edge",
  "    }",
  "    return false;",
  "  }",
  "  return dfs(nodes[0], null);",
  "}",
];
function buildCycle(customInput?: number[] | string): DSFrame[] {
  const { nodes, edges } = parseGraphInput(customInput);
  const start = nodes.length > 0 ? nodes[0].id : "A";
  const seen = new Set<string>();
  const stack: string[] = [];
  const f: DSFrame[] = [];
  let found = false;
  function dfs(node: string, parent: string | null): boolean {
    seen.add(node);
    stack.push(node);
    f.push(
      makeFrame(
        nodes,
        edges,
        [node],
        Array.from(seen),
        [...stack],
        [...stack],
        "DFS path",
        4,
        `Enter ${node} (parent ${parent ?? "—"}).`,
      ),
    );
    for (const n of getNeighbors(node, edges)) {
      if (!seen.has(n)) {
        if (dfs(n, node)) return true;
      } else if (n !== parent) {
        f.push(
          makeFrame(
            nodes,
            edges,
            [node, n],
            Array.from(seen),
            [...stack],
            [...stack],
            "DFS path",
            7,
            `Back edge to ${n} — cycle!`,
            {},
            "cycle found",
          ),
        );
        return true;
      }
    }
    stack.pop();
    return false;
  }
  found = dfs(start, null);
  if (!found)
    f.push(
      makeFrame(
        nodes,
        edges,
        [],
        Array.from(seen),
        [],
        [],
        "DFS path",
        9,
        `No cycle reachable from ${start}.`,
        {},
        "no cycle",
      ),
    );
  return f;
}

// ---------- Connected Components ----------
const CC_CODE = [
  "function components() {",
  "  const seen = new Set();",
  "  let count = 0;",
  "  for (const v of nodes) {",
  "    if (seen.has(v.id)) continue;",
  "    bfs(v.id, seen); count++;",
  "  }",
  "  return count;",
  "}",
];
function buildCC(customInput?: number[] | string): DSFrame[] {
  const { nodes, edges } = parseGraphInput(customInput);
  const altEdges = customInput ? edges : edges.filter((e) => !(e.from === "E" && e.to === "F"));

  const seen = new Set<string>();
  const order: string[] = [];
  let count = 0;
  const f: DSFrame[] = [];
  for (const v of nodes) {
    if (seen.has(v.id)) continue;
    count++;
    const q = [v.id];
    seen.add(v.id);
    f.push({
      shape: {
        kind: "graph",
        nodes,
        edges: altEdges,
        undirected: true,
        highlight: [v.id],
        visited: [...order],
        order: [...order],
        frontier: [...q],
        frontierLabel: `component ${count}`,
      },
      line: 6,
      vars: { count },
      explain: `Start component ${count} at ${v.id}.`,
    });
    while (q.length) {
      const node = q.shift()!;
      order.push(node);
      for (const n of getNeighbors(node, altEdges)) {
        if (!seen.has(n)) {
          seen.add(n);
          q.push(n);
        }
      }
      f.push({
        shape: {
          kind: "graph",
          nodes,
          edges: altEdges,
          undirected: true,
          highlight: [node],
          visited: [...order],
          order: [...order],
          frontier: [...q],
          frontierLabel: `component ${count}`,
        },
        line: 6,
        vars: { count, node },
        explain: `Visit ${node}.`,
      });
    }
  }
  f.push({
    shape: {
      kind: "graph",
      nodes,
      edges: altEdges,
      undirected: true,
      highlight: [],
      visited: order,
      order,
      frontier: [],
      frontierLabel: "",
    },
    line: 8,
    vars: { count },
    explain: `Found ${count} components.`,
    result: `${count} components`,
  });
  return f;
}

// ---------- Shortest Path (BFS, unweighted) ----------
const SP_CODE = [
  "function shortestPath(src, dst) {",
  "  const q = [src], dist = { [src]: 0 }, prev = {};",
  "  while (q.length) {",
  "    const node = q.shift();",
  "    if (node === dst) break;",
  "    for (const n of neighbors(node)) {",
  "      if (dist[n] === undefined) {",
  "        dist[n] = dist[node] + 1; prev[n] = node;",
  "        q.push(n);",
  "      }",
  "    }",
  "  }",
  "  // reconstruct path from prev",
  "}",
];
function buildSP(customInput?: number[] | string, searchTarget?: number): DSFrame[] {
  const { nodes, edges } = parseGraphInput(customInput);
  const src = nodes.length > 0 ? nodes[0].id : "A";
  const dst = nodes.length > 0 ? nodes[nodes.length - 1].id : "F";
  const q = [src];
  const dist: Record<string, number> = { [src]: 0 };
  const prev: Record<string, string> = {};
  const f: DSFrame[] = [];

  f.push(
    makeFrame(nodes, edges, [src], [src], [src], [...q], "queue", 2, `BFS from ${src} → ${dst}.`),
  );
  while (q.length) {
    const node = q.shift()!;
    f.push(
      makeFrame(
        nodes,
        edges,
        [node],
        Object.keys(dist),
        Object.keys(dist),
        [...q],
        "queue",
        4,
        `Pop ${node}, distance ${dist[node]}.`,
      ),
    );
    if (node === dst) break;
    for (const n of getNeighbors(node, edges)) {
      if (dist[n] === undefined) {
        dist[n] = dist[node] + 1;
        prev[n] = node;
        q.push(n);
        f.push(
          makeFrame(
            nodes,
            edges,
            [n],
            Object.keys(dist),
            Object.keys(dist),
            [...q],
            "queue",
            8,
            `Discover ${n}, dist=${dist[n]}.`,
          ),
        );
      }
    }
  }

  const path: string[] = [];
  let cur: string | undefined = dst;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur];
  }
  f.push(
    makeFrame(
      nodes,
      edges,
      path,
      Object.keys(dist),
      path,
      [],
      "path",
      14,
      `Shortest path: ${path.join(" → ")} (length ${path.length - 1}).`,
      {},
      path.join(" → "),
    ),
  );
  return f;
}

export const GRAPH_ALGOS: DSAlgoMeta[] = [
  {
    id: "graph-bfs",
    name: "BFS",
    category: "Graph",
    difficulty: "Easy",
    blurb: "Breadth-first via queue.",
    code: BFS_CODE,
    build: buildBFS,
    complexity: { time: { best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)" }, space: "O(V)" },
  },
  {
    id: "graph-dfs",
    name: "DFS",
    category: "Graph",
    difficulty: "Easy",
    blurb: "Depth-first via stack.",
    code: DFS_CODE,
    build: buildDFS,
    complexity: { time: { best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)" }, space: "O(V)" },
  },
  {
    id: "graph-cycle",
    name: "Cycle Detection",
    category: "Graph",
    difficulty: "Medium",
    blurb: "DFS finds a back edge to non-parent.",
    code: CYCLE_CODE,
    build: buildCycle,
    complexity: { time: { best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)" }, space: "O(V)" },
  },
  {
    id: "graph-components",
    name: "Connected Components",
    category: "Graph",
    difficulty: "Medium",
    blurb: "BFS from each unseen node, count starts.",
    code: CC_CODE,
    build: buildCC,
    complexity: { time: { best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)" }, space: "O(V)" },
  },
  {
    id: "graph-shortest",
    name: "Shortest Path (BFS)",
    category: "Graph",
    difficulty: "Medium",
    blurb: "Unweighted BFS distances + path reconstruction.",
    code: SP_CODE,
    build: buildSP,
    complexity: { time: { best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)" }, space: "O(V)" },
  },
];
