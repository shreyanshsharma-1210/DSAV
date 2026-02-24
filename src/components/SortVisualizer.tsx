import { useEffect, useMemo, useRef, useState } from "react";
import type { AlgoStep } from "@/lib/algorithms/types";

type Props = {
  steps: AlgoStep[];
  code: string[];
  fileName?: string;
};

// Generic step-by-step visualizer for any array-based algorithm.
// Renders bars, comparisons, swaps, sorted/locked indices, named pointers (lo/hi/mid/pivot/...)
// plus an active-line code panel and a plain-English explanation pane.
export function SortVisualizer({ steps, code, fileName = "algorithm.js" }: Props) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600); // ms per step
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[i] ?? steps[0];
  const max = useMemo(() => Math.max(...steps.flatMap((s) => s.array), 1), [steps]);

  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setI((p) => p + 1), speed);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, i, speed, steps.length]);

  // Reset when steps change (new run / different algorithm)
  useEffect(() => {
    setI(0);
    setPlaying(false);
  }, [steps]);

  const next = () => setI((p) => Math.min(p + 1, steps.length - 1));
  const prev = () => setI((p) => Math.max(p - 1, 0));
  const reset = () => {
    setI(0);
    setPlaying(false);
  };

  // Build a "pointers at this index" lookup so multiple labels can stack on one bar.
  const pointerAt: Record<number, string[]> = {};
  if (step.pointers) {
    for (const [name, idx] of Object.entries(step.pointers)) {
      if (typeof idx === "number" && idx >= 0 && idx < step.array.length) {
        (pointerAt[idx] ||= []).push(name);
      }
    }
  }

  return (
    <div className="grid lg:grid-cols-12 gap-4">
      {/* Code panel */}
      <div className="lg:col-span-5 rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
          <span className="font-mono text-xs text-muted-foreground">{fileName}</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Step {i + 1} / {steps.length}
          </span>
        </div>
        <pre className="p-4 font-mono text-[12.5px] leading-7 overflow-x-auto">
          {code.map((ln, idx) => {
            const lineNo = idx + 1;
            const active = step.line === lineNo;
            return (
              <div
                key={idx}
                className={`flex gap-4 -mx-4 px-4 ${active ? "bg-[var(--code-active)] border-l-2 border-primary" : ""}`}
              >
                <span className="text-muted-foreground/50 w-6 text-right select-none">
                  {lineNo}
                </span>
                <code className={active ? "text-foreground" : "text-muted-foreground"}>{ln}</code>
              </div>
            );
          })}
        </pre>

        {/* AI explanation */}
        <div className="border-t border-border p-4 bg-background/40">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gradient mb-2">
            AI Explanation
          </div>
          <p key={i} className="text-sm leading-relaxed animate-fade-in">
            {step.explain}
          </p>
          {step.result && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/40 bg-primary/10 text-xs font-semibold text-primary">
              ✓ {step.result}
            </div>
          )}
        </div>
      </div>

      {/* Visual + controls */}
      <div className="lg:col-span-7 rounded-2xl border border-border bg-surface overflow-hidden">
        {step.target !== undefined && (
          <div className="px-4 py-2 border-b border-border bg-muted/20 text-xs font-mono">
            <span className="text-muted-foreground">target =</span>{" "}
            <span className="text-primary font-bold">{step.target}</span>
          </div>
        )}

        <div className="grid-bg p-6 min-h-[360px] flex items-end justify-center gap-2">
          {step.array.map((v, idx) => {
            const isCompare = step.compare?.includes(idx);
            const isSwap = step.swap?.includes(idx);
            const isSorted = step.sorted?.includes(idx);
            const labels = pointerAt[idx];
            const h = (v / max) * 240 + 28;
            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 transition-all duration-300"
                style={{ width: 44 }}
              >
                {/* Pointer labels stacked above the bar */}
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
                    isSwap
                      ? "bg-destructive text-destructive-foreground"
                      : isCompare
                        ? "bg-gradient-primary text-primary-foreground"
                        : isSorted
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

        {/* Variables */}
        <div className="border-t border-border px-4 py-3 flex flex-wrap gap-2 min-h-[52px]">
          {Object.entries(step.vars).map(([k, val]) => (
            <div
              key={k}
              className="font-mono text-xs px-2.5 py-1 rounded-md border border-border bg-background/40"
            >
              <span className="text-muted-foreground">{k}</span>
              <span className="mx-1.5 text-muted-foreground/50">=</span>
              <span className="text-primary">{String(val)}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="border-t border-border p-4 flex flex-wrap items-center gap-3">
          <button
            onClick={prev}
            disabled={i === 0}
            className="px-3 py-2 rounded-lg border border-border bg-surface hover:bg-muted disabled:opacity-40 text-sm"
          >
            ◀ Prev
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="px-5 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm"
          >
            {playing ? "❚❚ Pause" : "▶ Play"}
          </button>
          <button
            onClick={next}
            disabled={i >= steps.length - 1}
            className="px-3 py-2 rounded-lg border border-border bg-surface hover:bg-muted disabled:opacity-40 text-sm"
          >
            Next ▶
          </button>
          <button
            onClick={reset}
            className="px-3 py-2 rounded-lg border border-border bg-surface hover:bg-muted text-sm"
          >
            ↺ Reset
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Speed</span>
            <input
              type="range"
              min={120}
              max={1400}
              step={40}
              value={1520 - speed}
              onChange={(e) => setSpeed(1520 - Number(e.target.value))}
              className="accent-[var(--primary)]"
            />
          </div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-gradient-primary transition-all"
            style={{ width: `${((i + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
