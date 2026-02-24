import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MultiVisualizer } from "@/components/MultiVisualizer";
import { InteractiveCanvasEditor } from "@/components/InteractiveCanvasEditor";
import { CATEGORIES, DSA_REGISTRY, getAlgoById } from "@/lib/dsa/registry";
import type { DSCategory, Difficulty } from "@/lib/dsa/types";

type PracticeSearch = { algo?: string };

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Visualizer — DSA Visualizer AI" },
      {
        name: "description",
        content:
          "40 DSA algorithms across arrays, sorting, searching, linked lists, stacks, queues, trees and graphs — every one with a working step-by-step visualization.",
      },
      { property: "og:title", content: "DSA Visualizer" },
      { property: "og:description", content: "Pick a category, pick a problem, watch it run." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): PracticeSearch => ({
    algo: typeof search.algo === "string" ? search.algo : undefined,
  }),
  component: PracticePage,
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

function PracticePage() {
  const search = Route.useSearch();
  const selectedAlgo = search.algo ? getAlgoById(search.algo) : undefined;
  const [runKey, setRunKey] = useState(0);

  const [customInputStr, setCustomInputStr] = useState("");
  const [searchTargetStr, setSearchTargetStr] = useState("");

  useEffect(() => {
    setCustomInputStr("");
    setSearchTargetStr("");
  }, [selectedAlgo?.id]);

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

  const frames = useMemo(() => {
    return selectedAlgo?.build(parsedInput, parsedTarget) ?? [];
  }, [selectedAlgo, runKey, parsedInput, parsedTarget]);

  const [filter, setFilter] = useState<"All" | Difficulty>("All");
  const [activeCat, setActiveCat] = useState<DSCategory | "All">("All");

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

  return (
    <div className="min-h-dvh relative bg-[#020617] text-[#f8fafc]">
      <div className="absolute top-0 left-0 size-[600px] glow-orb pointer-events-none" />
      <Header />

      <main className="relative mx-auto max-w-7xl px-6 py-12">
        {selectedAlgo ? (
          <>
            <Link
              to="/practice"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-[#030712]/50 hover:bg-white/5 text-xs font-mono text-muted-foreground hover:text-primary transition-all mb-6"
            >
              ← Back to Discovery Hub
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-primary mb-2">
                  / WORKSTATION / {selectedAlgo.category.toUpperCase()}
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-balance">
                  {selectedAlgo.name}{" "}
                  <span className="text-muted-foreground/30 font-light">Trace Engine</span>
                </h1>
                <p className="text-muted-foreground mt-3 max-w-[70ch] leading-relaxed text-sm">
                  {selectedAlgo.blurb}
                </p>
              </div>
              <button
                onClick={() => setRunKey((k) => k + 1)}
                className="self-start md:self-end px-5 py-2.5 rounded-xl btn-primary-tactile text-sm font-semibold hover:btn-primary-tactile-hover shrink-0"
              >
                ↻ Re-run Engine
              </button>
            </div>

            {/* Custom Input Workstation Controls */}
            <div className="mb-8 p-6 glass-card border-primary/20 flex flex-wrap gap-6 items-end relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />

              <div className="flex-1 min-w-[280px]">
                <div className="flex justify-between items-center mb-2.5">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {inputLabel}
                  </label>
                  {(selectedAlgo?.category === "Graph" || selectedAlgo?.category === "Tree") && (
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
                  className="w-full px-4 py-2.5 rounded-xl bg-[#030712] border border-border text-sm font-mono text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                />
              </div>

              {showSearchTarget && (
                <div className="w-[180px]">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2.5">
                    {targetLabel}
                  </label>
                  <input
                    type="text"
                    value={searchTargetStr}
                    onChange={(e) => setSearchTargetStr(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030712] border border-border text-sm font-mono text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                  />
                </div>
              )}

              <button
                onClick={() => setRunKey((k) => k + 1)}
                className="px-6 py-2.5 rounded-xl btn-secondary-tactile text-sm hover:btn-secondary-tactile-hover font-semibold transition-all shrink-0"
              >
                Apply Parameters
              </button>
            </div>

            <MultiVisualizer
              key={selectedAlgo.id + runKey}
              frames={frames}
              code={selectedAlgo.code}
              fileName={`${selectedAlgo.id}.js`}
              algoId={selectedAlgo.id}
            />

            {/* Complexity Analytics Cards */}
            <div className="mt-8 grid sm:grid-cols-3 gap-6">
              <ComplexityCard label="Time — Best Case" value={selectedAlgo.complexity.time.best} />
              <ComplexityCard
                label="Time — Average / Worst"
                value={`${selectedAlgo.complexity.time.avg} / ${selectedAlgo.complexity.time.worst}`}
              />
              <ComplexityCard label="Space Complexity" value={selectedAlgo.complexity.space} />
            </div>
          </>
        ) : (
          <>
            <div className="font-mono text-xs uppercase tracking-widest text-primary mb-2">
              / ALGORITHM CURATION
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-4">Discovery Hub</h1>
            <p className="text-muted-foreground mb-10 max-w-3xl text-sm leading-relaxed">
              Explore 40 modular algorithm containers structured across 8 operational categories.
              Click any element card to run compiler visualization step-by-step.
            </p>

            {/* Filter Dashboard */}
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
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCat(c)}
                      className={`px-4 py-2 rounded-full border text-xs font-mono tracking-wider transition-all uppercase cursor-pointer flex items-center gap-1.5 ${
                        activeCat === c
                          ? "bg-primary text-black border-transparent font-bold shadow-[0_0_10px_rgba(199,244,100,0.3)]"
                          : "border-border bg-[#030712] text-muted-foreground hover:text-foreground hover:border-primary/30"
                      }`}
                    >
                      <span className="text-primary font-bold">{CATEGORY_ICON[c]}</span>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Collectible Cards Grid */}
            <div className="space-y-16">
              {CATEGORIES.filter((c) => activeCat === "All" || activeCat === c).map((cat) => {
                const list = DSA_REGISTRY.filter(
                  (a) => a.category === cat && (filter === "All" || a.difficulty === filter),
                );
                if (list.length === 0) return null;
                return (
                  <section key={cat} className="animate-fade-in">
                    <div className="flex items-center gap-4 mb-6 border-b border-border pb-3">
                      <span className="text-3xl text-primary font-mono">{CATEGORY_ICON[cat]}</span>
                      <h2 className="text-2xl font-black tracking-tight">{cat}</h2>
                      <span className="font-mono text-xs text-muted-foreground bg-primary/10 border border-primary/20 px-2 py-0.5 rounded ml-2">
                        {list.length} {list.length === 1 ? "algorithm" : "algorithms"}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {list.map((p) => {
                        const stars = (p.name.length % 3) + 3; // Deterministic popularity indicator
                        return (
                          <div
                            key={p.id}
                            className="glass-card hover:glass-card-hover border-primary/10 p-6 flex flex-col justify-between group relative overflow-hidden min-h-[200px]"
                          >
                            {/* Decorative preview illustration */}
                            <div className="absolute top-[-10%] right-[-10%] size-20 pointer-events-none opacity-5 transition-opacity group-hover:opacity-10 text-primary">
                              <svg viewBox="0 0 100 100" className="w-full h-full">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeDasharray="4 8"
                                />
                                <circle cx="50" cy="50" r="20" fill="currentColor" opacity="0.3" />
                              </svg>
                            </div>

                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3.5">
                                <span
                                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                    COLORS[p.difficulty]
                                  }`}
                                >
                                  {p.difficulty}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  {"★".repeat(stars)}
                                </span>
                              </div>
                              <h3 className="font-bold text-lg tracking-tight mb-2 group-hover:text-primary transition-colors">
                                {p.name}
                              </h3>
                              <p className="text-xs text-muted-foreground leading-relaxed font-sans mb-6">
                                {p.blurb}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-[9px] font-mono text-muted-foreground uppercase">
                                Space: {p.complexity.space}
                              </span>
                              <Link
                                to="/practice"
                                search={{ algo: p.id }}
                                className="px-4 py-2 rounded-xl btn-primary-tactile text-[11px] font-bold hover:btn-primary-tactile-hover transition-all flex items-center gap-1.5"
                              >
                                Visualize
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
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

function ComplexityCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card border-primary/20 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-primary/40">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono font-bold">
        {label}
      </div>
      <div className="mt-4 font-mono text-3xl text-gradient font-black tracking-tight">{value}</div>
    </div>
  );
}
