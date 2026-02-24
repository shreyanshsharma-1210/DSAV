import { useState, useMemo, useRef, useEffect } from "react";
import type { GraphNodeView, GraphEdgeView, TreeNodeView } from "@/lib/dsa/types";

type Props = {
  category: "Graph" | "Tree" | string;
  customInputStr: string;
  setCustomInputStr: (val: string) => void;
  searchTargetStr?: string;
  setSearchTargetStr?: (val: string) => void;
};

export function InteractiveCanvasEditor({
  category,
  customInputStr,
  setCustomInputStr,
  searchTargetStr = "",
  setSearchTargetStr,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"drag" | "node" | "edge">("node");

  // Graph State
  const [gNodes, setGNodes] = useState<GraphNodeView[]>([]);
  const [gEdges, setGEdges] = useState<GraphEdgeView[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const canvasRef = useRef<SVGSVGElement | null>(null);

  // Tree BST state (insertion array)
  const [treeVals, setTreeVals] = useState<number[]>([]);
  const [newVal, setNewVal] = useState("");

  // Initialize graph from customInputStr or default
  useEffect(() => {
    if (!isOpen) return;

    if (category === "Graph") {
      const edgesStr = customInputStr.trim() || "A-B, A-D, B-C, B-E, C-F, D-E, E-F";
      const parsedEdges: GraphEdgeView[] = [];
      const nodesSet = new Set<string>();

      const parts = edgesStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      for (const part of parts) {
        const nList = part
          .split("-")
          .map((s) => s.trim())
          .filter(Boolean);
        if (nList.length >= 2) {
          parsedEdges.push({ from: nList[0], to: nList[1] });
          nodesSet.add(nList[0]);
          nodesSet.add(nList[1]);
        }
      }

      const nodesList = Array.from(nodesSet).sort();
      const initialNodes: GraphNodeView[] = [];

      // Attempt to preserve positions or lay out in circle
      const cx = 220;
      const cy = 130;
      const r = 90;

      nodesList.forEach((id, idx) => {
        const angle = (idx * 2 * Math.PI) / nodesList.length;
        initialNodes.push({
          id,
          x: Math.round(cx + r * Math.cos(angle)),
          y: Math.round(cy + r * Math.sin(angle)),
        });
      });

      setGNodes(initialNodes);
      setGEdges(parsedEdges);
    } else if (category === "Tree") {
      const vals = customInputStr
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));
      setTreeVals(vals.length > 0 ? vals : [5, 3, 8, 1, 4, 7, 9]);
    }
  }, [isOpen, category, customInputStr]);

  // Handle graph canvas click to add node
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (category !== "Graph" || mode !== "node" || !canvasRef.current) return;

    // Ignore clicks on circles or lines
    const target = e.target as SVGElement;
    if (target.tagName === "circle" || target.tagName === "text") return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // Get next available label A-Z, or A1, A2
    const usedLabels = new Set(gNodes.map((n) => n.id));
    let nextLabel = "A";
    for (let charCode = 65; charCode <= 90; charCode++) {
      const label = String.fromCharCode(charCode);
      if (!usedLabels.has(label)) {
        nextLabel = label;
        break;
      }
    }
    if (usedLabels.has(nextLabel)) {
      nextLabel = `N${gNodes.length + 1}`;
    }

    setGNodes([...gNodes, { id: nextLabel, x, y }]);
  };

  // Node mouse events for dragging / linking
  const handleNodeMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === "drag") {
      setDraggingNode(id);
    } else if (mode === "edge") {
      if (selectedNode === null) {
        setSelectedNode(id);
      } else if (selectedNode !== id) {
        // Create edge
        const exists = gEdges.some(
          (edge) =>
            (edge.from === selectedNode && edge.to === id) ||
            (edge.from === id && edge.to === selectedNode),
        );
        if (!exists) {
          setGEdges([...gEdges, { from: selectedNode, to: id }]);
        }
        setSelectedNode(null);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (category !== "Graph" || !draggingNode || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    setGNodes(gNodes.map((n) => (n.id === draggingNode ? { ...n, x, y } : n)));
  };

  const handleCanvasMouseUp = () => {
    setDraggingNode(null);
  };

  const deleteNode = (id: string) => {
    setGNodes(gNodes.filter((n) => n.id !== id));
    setGEdges(gEdges.filter((e) => e.from !== id && e.to !== id));
    if (selectedNode === id) setSelectedNode(null);
  };

  const clearGraph = () => {
    setGNodes([]);
    setGEdges([]);
    setSelectedNode(null);
  };

  const saveGraph = () => {
    const formatted = gEdges.map((e) => `${e.from}-${e.to}`).join(", ");
    setCustomInputStr(formatted);
    setIsOpen(false);
  };

  // --- Tree / BST calculations ---
  const bstNodes = useMemo(() => {
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
    treeVals.forEach(insertNode);
    return nodes;
  }, [treeVals]);

  const treePositions = useMemo(() => {
    const positions: { x: number; y: number }[] = bstNodes.map(() => ({ x: 0, y: 0 }));
    if (bstNodes.length === 0) return positions;
    const W = 460,
      H = 220;
    let xCounter = 0;
    function inorder(id: number, depth: number) {
      const n = bstNodes[id];
      if (n.left !== undefined) inorder(n.left, depth + 1);
      positions[id] = { x: xCounter++, y: depth };
      if (n.right !== undefined) inorder(n.right, depth + 1);
    }
    inorder(0, 0);
    const xs = positions.map((p) => p.x);
    const ys = positions.map((p) => p.y);
    const xMax = Math.max(...xs, 1);
    const yMax = Math.max(...ys, 1);
    return positions.map((p) => ({
      x: ((p.x + 0.5) / (xMax + 1)) * (W - 60) + 30,
      y: (p.y / yMax) * (H - 60) + 30,
    }));
  }, [bstNodes]);

  const addTreeValue = () => {
    const num = parseInt(newVal);
    if (!isNaN(num)) {
      setTreeVals([...treeVals, num]);
      setNewVal("");
    }
  };

  const removeTreeValueIndex = (idx: number) => {
    setTreeVals(treeVals.filter((_, i) => i !== idx));
  };

  const saveTree = () => {
    setCustomInputStr(treeVals.join(", "));
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-2 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-xs font-mono transition-colors"
      >
        ✏️ Visual Canvas Editor
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Visual Canvas Editor</h3>
            <p className="text-xs text-muted-foreground font-mono">
              Build your customized {category.toLowerCase()} structure
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground text-sm font-mono"
          >
            ✕ Close
          </button>
        </div>

        {/* Editor Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {category === "Graph" ? (
            <>
              {/* Controls */}
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => {
                    setMode("node");
                    setSelectedNode(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    mode === "node"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  ➕ Add Nodes
                </button>
                <button
                  onClick={() => {
                    setMode("edge");
                    setSelectedNode(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    mode === "edge"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  🔗 Add Edges
                </button>
                <button
                  onClick={() => {
                    setMode("drag");
                    setSelectedNode(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    mode === "drag"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  🖐️ Drag Nodes
                </button>
                <button
                  onClick={clearGraph}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 ml-auto transition-colors"
                >
                  🗑️ Clear
                </button>
              </div>

              {/* Status instructions */}
              <div className="text-xs font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                {mode === "node" && "💡 Mode: Click empty spaces in the canvas to add new nodes."}
                {mode === "edge" &&
                  (selectedNode === null
                    ? "💡 Mode: Click a node to select it as the start node."
                    : `💡 Mode: Click another node to connect with ${selectedNode}.`)}
                {mode === "drag" &&
                  "💡 Mode: Click and drag nodes to adjust their coordinate positions."}
              </div>

              {/* Canvas */}
              <div className="relative border border-border rounded-xl bg-background/60 grid-bg overflow-hidden h-[280px]">
                <svg
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="w-full h-full cursor-crosshair select-none"
                >
                  {/* render edges */}
                  {gEdges.map((e, idx) => {
                    const fromNode = gNodes.find((n) => n.id === e.from);
                    const toNode = gNodes.find((n) => n.id === e.to);
                    if (!fromNode || !toNode) return null;
                    return (
                      <line
                        key={idx}
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke="currentColor"
                        className="text-border"
                        strokeWidth="2"
                      />
                    );
                  })}

                  {/* render nodes */}
                  {gNodes.map((n) => {
                    const isSelected = selectedNode === n.id;
                    const isHovered = hoveredNode === n.id;
                    return (
                      <g
                        key={n.id}
                        onMouseDown={(e) => handleNodeMouseDown(n.id, e)}
                        onMouseEnter={() => setHoveredNode(n.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={18}
                          fill={isSelected ? "var(--primary)" : "var(--surface)"}
                          stroke={isSelected ? "var(--primary)" : "var(--border)"}
                          strokeWidth={2}
                          className="transition-colors"
                        />
                        <text
                          x={n.x}
                          y={n.y + 5}
                          textAnchor="middle"
                          fill={isSelected ? "var(--primary-foreground)" : "var(--foreground)"}
                          className="font-mono text-xs font-semibold pointer-events-none"
                        >
                          {n.id}
                        </text>
                        {isHovered && (
                          <g
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNode(n.id);
                            }}
                            className="cursor-pointer"
                          >
                            <circle cx={n.x + 14} cy={n.y - 14} r={7} fill="#ef4444" />
                            <text
                              x={n.x + 14}
                              y={n.y - 11}
                              textAnchor="middle"
                              fill="#fff"
                              fontSize="8"
                              fontWeight="bold"
                            >
                              x
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </>
          ) : (
            <>
              {/* Tree BST Builder */}
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Insert Node value (e.g. 6)"
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTreeValue()}
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm font-mono"
                />
                <button
                  onClick={addTreeValue}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
                >
                  Insert Node
                </button>
                <button
                  onClick={() => setTreeVals([])}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Insertion Order Elements */}
              <div className="flex flex-wrap gap-2 items-center bg-muted/30 p-3 rounded-xl border border-border min-h-[50px]">
                <span className="text-xs font-mono text-muted-foreground mr-1">
                  Insertion Sequence:
                </span>
                {treeVals.length === 0 ? (
                  <span className="text-xs text-muted-foreground font-mono">Empty tree</span>
                ) : (
                  treeVals.map((v, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border text-xs font-mono"
                    >
                      {v}
                      <button
                        onClick={() => removeTreeValueIndex(idx)}
                        className="text-muted-foreground hover:text-rose-500 text-[10px]"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* BST Canvas Preview */}
              <div className="relative border border-border rounded-xl bg-background/60 grid-bg overflow-hidden h-[240px] flex items-center justify-center">
                {bstNodes.length === 0 ? (
                  <div className="text-sm font-mono text-muted-foreground">
                    Add elements to visualize BST preview.
                  </div>
                ) : (
                  <svg className="w-full h-full max-w-[460px]">
                    {/* edges */}
                    {bstNodes.map((n, idx) => {
                      const p = treePositions[idx];
                      const out: React.ReactNode[] = [];
                      if (n.left !== undefined) {
                        const c = treePositions[n.left];
                        out.push(
                          <line
                            key={`${idx}-l`}
                            x1={p.x}
                            y1={p.y}
                            x2={c.x}
                            y2={c.y}
                            stroke="currentColor"
                            className="text-border"
                            strokeWidth="1.5"
                          />,
                        );
                      }
                      if (n.right !== undefined) {
                        const c = treePositions[n.right];
                        out.push(
                          <line
                            key={`${idx}-r`}
                            x1={p.x}
                            y1={p.y}
                            x2={c.x}
                            y2={c.y}
                            stroke="currentColor"
                            className="text-border"
                            strokeWidth="1.5"
                          />,
                        );
                      }
                      return <g key={`e${idx}`}>{out}</g>;
                    })}

                    {/* nodes */}
                    {bstNodes.map((n, idx) => {
                      const p = treePositions[idx];
                      return (
                        <g key={n.id}>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={16}
                            fill="var(--surface)"
                            stroke="var(--border)"
                            strokeWidth={2}
                          />
                          <text
                            x={p.x}
                            y={p.y + 4}
                            textAnchor="middle"
                            fill="var(--foreground)"
                            className="font-mono text-xs font-semibold"
                          >
                            {n.value}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={category === "Graph" ? saveGraph : saveTree}
            className="px-5 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm"
          >
            Apply Structure
          </button>
        </div>
      </div>
    </div>
  );
}
