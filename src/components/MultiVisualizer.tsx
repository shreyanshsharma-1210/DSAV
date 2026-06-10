import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import type {
  DSFrame,
  ArrayShape,
  ListShape,
  StackShape,
  QueueShape,
  TreeShape,
  GraphShape,
  TreeNodeView,
} from "@/lib/dsa/types";
import { translateCode } from "@/lib/dsa/translations";

type Props = {
  frames: DSFrame[];
  code: string[];
  fileName?: string;
  algoId?: string;
};

export function MultiVisualizer({ frames, code, fileName = "algorithm.js", algoId }: Props) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [lang, setLang] = useState<"javascript" | "java" | "cpp">("javascript");

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const frame = frames[i] ?? frames[0];

  const translatedLines = useMemo(() => {
    return translateCode(algoId ?? "", code, lang);
  }, [algoId, code, lang]);

  const codeString = useMemo(() => translatedLines.join("\n"), [translatedLines]);

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Apply initial decoration
    if (frame?.line) {
      const line = frame.line;
      decorationsRef.current = editor.deltaDecorations(
        [],
        [
          {
            range: new monaco.Range(line, 1, line, 1),
            options: {
              isWholeLine: true,
              className: "monaco-active-line",
              marginClassName: "monaco-active-line",
            },
          },
        ],
      );
    }
  }

  useEffect(() => {
    if (editorRef.current && monacoRef.current && frame?.line) {
      const editor = editorRef.current;
      const monaco = monacoRef.current;
      const line = frame.line;

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
    }
  }, [frame?.line, codeString]);

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

  useEffect(() => {
    setI(0);
    setPlaying(false);
  }, [frames]);

  const next = () => setI((p) => Math.min(p + 1, frames.length - 1));
  const prev = () => setI((p) => Math.max(p - 1, 0));
  const reset = () => {
    setI(0);
    setPlaying(false);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-5 items-stretch">
      {/* 1. CODE INTELLIGENCE PANEL (LEFT - col-span-4) */}
      <div className="lg:col-span-4 glass-card border-primary/20 overflow-hidden flex flex-col h-full min-h-[500px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#030712]/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-primary">👁️ CODE INTEL</span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            {lang === "javascript" ? "javascript" : lang === "cpp" ? "c++" : "java"}
          </span>
        </div>

        {/* Language Selection Sub-header */}
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

        <div className="flex-1 relative bg-[#020617]/40">
          <Editor
            height="100%"
            language={lang}
            theme="vs-dark"
            value={codeString}
            onMount={handleEditorDidMount}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 12,
              lineHeight: 20,
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
              lineNumbers: "on",
              renderLineHighlight: "none",
              scrollbar: {
                vertical: "visible",
                horizontal: "auto",
                useShadows: false,
                verticalScrollbarSize: 6,
                horizontalScrollbarSize: 6,
              },
              cursorWidth: 0,
              hideCursorInOverviewRuler: true,
              contextmenu: false,
            }}
          />
        </div>
      </div>

      {/* 2. VISUALIZATION CANVAS (CENTER - col-span-5) */}
      <div className="lg:col-span-5 glass-card border-primary/20 overflow-hidden flex flex-col justify-between h-full min-h-[500px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#030712]/50">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono font-bold text-foreground">⚡ LIVE STAGE</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
            Step {i + 1} / {frames.length}
          </span>
        </div>

        {/* Canvas Display */}
        <div className="grid-bg flex-1 p-6 min-h-[300px] flex items-center justify-center bg-[#020617]/20 relative">
          <ShapeRenderer frames={frames} index={i} />
        </div>

        {/* Variables state */}
        <div className="border-t border-border px-4 py-3 flex flex-wrap gap-2 min-h-[52px] bg-[#030712]/30">
          {frame.vars && Object.keys(frame.vars).length > 0 ? (
            Object.entries(frame.vars).map(([k, val]) => (
              <div
                key={k}
                className="font-mono text-[10px] px-2.5 py-1 rounded-lg border border-border bg-[#020617]/50"
              >
                <span className="text-muted-foreground">{k}</span>
                <span className="mx-1.5 text-primary/60">=</span>
                <span className="text-primary font-bold">{String(val)}</span>
              </div>
            ))
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground/40 self-center">
              No active scoped variables
            </span>
          )}
        </div>

        {/* Playback Controls */}
        <div className="border-t border-border p-4 flex flex-wrap items-center gap-3 bg-[#030712]/50">
          <button
            onClick={prev}
            disabled={i === 0}
            className="px-3 py-1.5 rounded-lg border border-border bg-[#020617] hover:bg-white/5 disabled:opacity-40 text-xs font-mono transition-colors cursor-pointer"
          >
            ◀ PREV
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="px-4 py-1.5 rounded-lg btn-primary-tactile text-xs font-mono hover:btn-primary-tactile-hover cursor-pointer"
          >
            {playing ? "❚❚ PAUSE" : "▶ PLAY"}
          </button>
          <button
            onClick={next}
            disabled={i >= frames.length - 1}
            className="px-3 py-1.5 rounded-lg border border-border bg-[#020617] hover:bg-white/5 disabled:opacity-40 text-xs font-mono transition-colors cursor-pointer"
          >
            NEXT ▶
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 rounded-lg border border-border bg-[#020617] hover:bg-white/5 text-xs font-mono transition-colors cursor-pointer"
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

        {/* Progress scrub bar */}
        <div className="h-1 bg-[#0b1220] relative">
          <div
            className="h-full bg-gradient-primary transition-all duration-150"
            style={{ width: `${((i + 1) / frames.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 3. AI EXPLANATION COACH (RIGHT - col-span-3) */}
      <div className="lg:col-span-3 glass-card border-primary/20 overflow-hidden flex flex-col justify-between h-full min-h-[500px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#030712]/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-primary">🤖 AI COACH</span>
          </div>
        </div>

        <div className="flex-1 p-5 overflow-y-auto bg-[#020617]/40 flex flex-col gap-4">
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-md relative">
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-primary mb-2 font-mono">
              Live Commentary
            </div>
            <p
              key={i}
              className="text-xs leading-relaxed text-muted-foreground animate-fade-in font-sans"
            >
              {frame.explain}
            </p>
          </div>

          {frame.result && (
            <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 backdrop-blur-md animate-fade-in">
              <div className="text-[9px] font-bold uppercase tracking-widest text-accent mb-2 font-mono">
                Outcome Log
              </div>
              <div className="text-xs font-mono font-bold text-accent">✓ {frame.result}</div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-[#030712]/30 text-center">
          <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            VisualDSA Engine v1.0
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------- Shape dispatcher ----------
export function ShapeRenderer({ frames, index }: { frames: DSFrame[]; index: number }) {
  const frame = frames[index];
  const shape = frame.shape;
  switch (shape.kind) {
    case "array":
      return <ArrayView shape={shape} maxValue={maxOfArrays(frames)} />;
    case "list":
      return <ListView shape={shape} />;
    case "stack":
      return <StackView shape={shape} />;
    case "queue":
      return <QueueView shape={shape} />;
    case "tree":
      return <TreeView shape={shape} />;
    case "graph":
      return <GraphView shape={shape} />;
  }
}

export function maxOfArrays(frames: DSFrame[]) {
  let m = 1;
  for (const f of frames) {
    if (f.shape.kind === "array") {
      for (const v of f.shape.values) if (Math.abs(v) > m) m = Math.abs(v);
    }
  }
  return m || 1;
}

// ---------- Array ----------
function ArrayView({ shape, maxValue }: { shape: ArrayShape; maxValue: number }) {
  const pointerAt: Record<number, string[]> = {};
  if (shape.pointers) {
    for (const [name, idx] of Object.entries(shape.pointers)) {
      if (typeof idx === "number" && idx >= 0 && idx < shape.values.length) {
        (pointerAt[idx] ||= []).push(name);
      }
    }
  }
  return (
    <div className="flex items-end justify-center gap-2 w-full">
      {shape.values.map((v, idx) => {
        const isCompare = shape.compare?.includes(idx);
        const isSwap = shape.swap?.includes(idx);
        const isDone = shape.done?.includes(idx);
        const isError =
          shape.error === true || (Array.isArray(shape.error) && shape.error.includes(idx));
        const labels = pointerAt[idx];
        const h = (Math.abs(v) / maxValue) * 220 + 28;
        return (
          <div
            key={idx}
            className="flex flex-col items-center gap-2 transition-all duration-300"
            style={{ width: 44 }}
          >
            <div className="h-6 flex flex-col items-center justify-end gap-0.5">
              {labels?.map((name) => (
                <span
                  key={name}
                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/40 leading-none"
                >
                  {name}
                </span>
              ))}
            </div>
            <div
              className={[
                "w-full rounded-t-md transition-all duration-300 origin-bottom flex items-start justify-center pt-1 text-xs font-bold",
                isError
                  ? "bg-red-500 text-white border-2 border-red-400 animate-pulse"
                  : isSwap
                    ? "bg-destructive text-destructive-foreground"
                    : isCompare
                      ? "bg-gradient-primary text-primary-foreground"
                      : isDone
                        ? "bg-primary/30 text-foreground border border-primary"
                        : "bg-muted text-muted-foreground",
              ].join(" ")}
              style={{ height: `${h}px` }}
            >
              {v}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">{idx}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Linked List ----------
function ListView({ shape }: { shape: ListShape }) {
  const pointerAt: Record<number, string[]> = {};
  if (shape.pointers) {
    for (const [name, idx] of Object.entries(shape.pointers)) {
      if (typeof idx === "number" && idx >= 0 && idx < shape.nodes.length) {
        (pointerAt[idx] ||= []).push(name);
      }
    }
  }
  return (
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {shape.nodes.map((n, idx) => {
        const isHi = shape.highlight?.includes(idx);
        const isError =
          shape.error === true || (Array.isArray(shape.error) && shape.error.includes(idx));
        const labels = pointerAt[idx];
        return (
          <div key={n.id} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-2">
              <div className="h-5 flex flex-col items-center gap-0.5">
                {labels?.map((name) => (
                  <span
                    key={name}
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/40 leading-none"
                  >
                    {name}
                  </span>
                ))}
              </div>
              <div
                className={[
                  "px-3 py-2.5 rounded-lg border-2 font-mono text-sm transition-colors",
                  isError
                    ? "border-red-500 bg-red-500/10 text-red-400 animate-pulse"
                    : isHi
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background/60 text-foreground",
                ].join(" ")}
              >
                {n.value}
              </div>
            </div>
            {idx < shape.nodes.length - 1 && (
              <span className="text-muted-foreground text-xl select-none">→</span>
            )}
          </div>
        );
      })}
      {shape.nodes.length > 0 && <span className="text-muted-foreground text-xs ml-2">∅</span>}
    </div>
  );
}

// ---------- Stack ----------
function StackView({ shape }: { shape: StackShape }) {
  return (
    <div className="flex flex-col-reverse items-center gap-1.5">
      {shape.values.length === 0 && (
        <div className="text-xs text-muted-foreground font-mono">— empty —</div>
      )}
      {shape.values.map((v, idx) => {
        const isHi = shape.highlight?.includes(idx);
        const isError =
          shape.error === true || (Array.isArray(shape.error) && shape.error.includes(idx));
        const isTop = idx === shape.values.length - 1;
        return (
          <div key={idx} className="flex items-center gap-3">
            <div
              className={[
                "w-28 h-10 rounded-md border-2 flex items-center justify-center font-mono text-sm transition-colors",
                isError
                  ? "border-red-500 bg-red-500/10 text-red-400 animate-pulse"
                  : isHi
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background/60",
              ].join(" ")}
            >
              {/* Render as char if value looks like an ASCII letter, else as number */}
              {v >= 32 && v <= 126 ? renderCellValue(v) : v}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground w-8">
              {isTop ? "← top" : ""}
            </span>
          </div>
        );
      })}
      <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1">
        bottom
      </div>
    </div>
  );
}

function renderCellValue(v: number): string {
  // We use char codes for stack/queue char demos; show printable ASCII as the char.
  if (v >= 65 && v <= 90) return String.fromCharCode(v); // A-Z
  if (v >= 97 && v <= 122) return String.fromCharCode(v); // a-z
  if (v === 40 || v === 41 || v === 91 || v === 93 || v === 123 || v === 125)
    return String.fromCharCode(v); // brackets
  return String(v);
}

// ---------- Queue ----------
function QueueView({ shape }: { shape: QueueShape }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mr-2">
          front →
        </span>
        {shape.values.length === 0 ? (
          <div className="text-xs text-muted-foreground font-mono px-4">— empty —</div>
        ) : (
          shape.values.map((v, idx) => {
            const isHi = shape.highlight?.includes(idx);
            const isError =
              shape.error === true || (Array.isArray(shape.error) && shape.error.includes(idx));
            return (
              <div
                key={idx}
                className={[
                  "w-14 h-12 rounded-md border-2 flex items-center justify-center font-mono text-sm transition-colors",
                  isError
                    ? "border-red-500 bg-red-500/10 text-red-400 animate-pulse"
                    : isHi
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background/60",
                ].join(" ")}
              >
                {v >= 32 && v <= 126 ? renderCellValue(v) : v}
              </div>
            );
          })
        )}
        <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground ml-2">
          ← back
        </span>
      </div>
    </div>
  );
}

// ---------- Tree ----------
function TreeView({ shape }: { shape: TreeShape }) {
  const positions = layoutTree(shape.nodes);
  const W = 480,
    H = 280;
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[520px]">
        {/* edges */}
        {shape.nodes.map((n, idx) => {
          const p = positions[idx];
          const out: React.ReactNode[] = [];
          if (n.left !== undefined) {
            const c = positions[n.left];
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
            const c = positions[n.right];
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
        {shape.nodes.map((n, idx) => {
          const p = positions[idx];
          const isHi = shape.highlight?.includes(idx);
          const isVisited = shape.visited?.includes(idx);
          const isError =
            shape.error === true || (Array.isArray(shape.error) && shape.error.includes(idx));
          const fill = isError
            ? "var(--destructive)"
            : isHi
              ? "var(--primary)"
              : isVisited
                ? "color-mix(in srgb, var(--primary) 25%, transparent)"
                : "var(--surface)";
          const stroke = isError
            ? "var(--destructive)"
            : isHi || isVisited
              ? "var(--primary)"
              : "var(--border)";
          const text = isError || isHi ? "var(--primary-foreground)" : "var(--foreground)";
          return (
            <g key={n.id}>
              <circle
                cx={p.x}
                cy={p.y}
                r={20}
                fill={fill}
                stroke={stroke}
                strokeWidth={2}
                className={isError ? "animate-pulse" : ""}
              />
              <text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fill={text}
                className="font-mono text-sm"
                fontSize="14"
                fontWeight="600"
              >
                {n.value}
              </text>
            </g>
          );
        })}
      </svg>
      {shape.order && shape.order.length > 0 && (
        <div className="text-xs font-mono">
          <span className="text-muted-foreground mr-2">visited:</span>
          <span className="text-primary">{shape.order.join(" → ")}</span>
        </div>
      )}
    </div>
  );
}

// Simple binary-tree layout: position by traversal depth + horizontal slot.
function layoutTree(nodes: TreeNodeView[]): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = nodes.map(() => ({ x: 0, y: 0 }));
  if (nodes.length === 0) return positions;
  const W = 480,
    H = 280;
  let xCounter = 0;
  function inorder(id: number, depth: number) {
    const n = nodes[id];
    if (n.left !== undefined) inorder(n.left, depth + 1);
    positions[id] = { x: xCounter++, y: depth };
    if (n.right !== undefined) inorder(n.right, depth + 1);
  }
  inorder(0, 0);
  // Normalise to viewBox
  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const xMax = Math.max(...xs, 1);
  const yMax = Math.max(...ys, 1);
  return positions.map((p) => ({
    x: ((p.x + 0.5) / (xMax + 1)) * (W - 60) + 30,
    y: (p.y / yMax) * (H - 80) + 40,
  }));
}

// ---------- Graph ----------
function GraphView({ shape }: { shape: GraphShape }) {
  const W = 460,
    H = 280;
  const xs = shape.nodes.map((n) => n.x);
  const ys = shape.nodes.map((n) => n.y);
  const xMin = Math.min(...xs),
    xMax = Math.max(...xs, xMin + 1);
  const yMin = Math.min(...ys),
    yMax = Math.max(...ys, yMin + 1);
  const project = (x: number, y: number) => ({
    x: ((x - xMin) / (xMax - xMin)) * (W - 80) + 40,
    y: ((y - yMin) / (yMax - yMin)) * (H - 80) + 40,
  });
  const nodeMap = new Map(shape.nodes.map((n) => [n.id, project(n.x, n.y)]));

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[520px]">
        {shape.edges.map((e, idx) => {
          const a = nodeMap.get(e.from)!;
          const b = nodeMap.get(e.to)!;
          return (
            <line
              key={idx}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="currentColor"
              className="text-border"
              strokeWidth="1.5"
            />
          );
        })}
        {shape.nodes.map((n) => {
          const p = nodeMap.get(n.id)!;
          const isHi = shape.highlight?.includes(n.id);
          const isVisited = shape.visited?.includes(n.id);
          const isError =
            shape.error === true || (Array.isArray(shape.error) && shape.error.includes(n.id));
          const fill = isError
            ? "var(--destructive)"
            : isHi
              ? "var(--primary)"
              : isVisited
                ? "color-mix(in srgb, var(--primary) 25%, transparent)"
                : "var(--surface)";
          const stroke = isError
            ? "var(--destructive)"
            : isHi || isVisited
              ? "var(--primary)"
              : "var(--border)";
          const text = isError || isHi ? "var(--primary-foreground)" : "var(--foreground)";
          return (
            <g key={n.id}>
              <circle
                cx={p.x}
                cy={p.y}
                r={20}
                fill={fill}
                stroke={stroke}
                strokeWidth={2}
                className={isError ? "animate-pulse" : ""}
              />
              <text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fill={text}
                className="font-mono"
                fontSize="14"
                fontWeight="600"
              >
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-4 text-xs font-mono">
        {shape.frontier && shape.frontier.length > 0 && (
          <div>
            <span className="text-muted-foreground mr-2">{shape.frontierLabel ?? "frontier"}:</span>
            <span className="text-accent">[{shape.frontier.join(", ")}]</span>
          </div>
        )}
        {shape.order && shape.order.length > 0 && (
          <div>
            <span className="text-muted-foreground mr-2">visited:</span>
            <span className="text-primary">{shape.order.join(" → ")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
