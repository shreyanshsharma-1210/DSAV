import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  QUIZ_BATCHES,
  GUESS_BATCHES,
  PREDICT_BATCHES,
  COMPLEXITY_BATCHES,
  DIFFICULTY_META,
  ALGO_LABEL,
  applyStep,
  type Batch,
  type Quiz,
  type GuessOutput,
  type PredictStep,
  type ComplexityMatch,
  type Difficulty,
  type Mode,
} from "@/lib/arenaContent";
import {
  BADGES,
  defaultArena,
  loadArena,
  recordResult,
  recordBatchRun,
  resetArena,
  type ArenaState,
} from "@/lib/gamification";
import { generateQuizQuestions, isGroqConfigured } from "@/lib/groqQuiz";

export const Route = createFileRoute("/arena")({
  head: () => ({
    meta: [
      { title: "Arena — Quizzes, Puzzles & Challenges | DSA Visualizer AI" },
      {
        name: "description",
        content:
          "Earn XP, build streaks and unlock badges by solving DSA quiz batches, output puzzles, step predictions and complexity match-ups.",
      },
      { property: "og:title", content: "DSA Arena — Gamified DSA Practice" },
      {
        property: "og:description",
        content:
          "Quizzes, puzzles, output prediction and complexity match — all gamified, all batched.",
      },
    ],
  }),
  component: ArenaPage,
});

const MODES: { id: Mode; label: string; icon: string; desc: string }[] = [
  { id: "quiz", label: "Quizzes", icon: "🧠", desc: "Multiple-choice DSA concepts" },
  { id: "guess", label: "Guess the Output", icon: "🔮", desc: "Read code, predict the result" },
  {
    id: "predict",
    label: "Predict the Step",
    icon: "🎯",
    desc: "What does the array look like next?",
  },
  {
    id: "complexity",
    label: "Complexity Match",
    icon: "⏱",
    desc: "Match algorithms to their Big-O",
  },
];

const BATCHES_BY_MODE: Record<Mode, Batch<unknown>[]> = {
  quiz: QUIZ_BATCHES as Batch<unknown>[],
  guess: GUESS_BATCHES as Batch<unknown>[],
  predict: PREDICT_BATCHES as Batch<unknown>[],
  complexity: COMPLEXITY_BATCHES as Batch<unknown>[],
};

// ---------- Page ----------
function ArenaPage() {
  const [mode, setMode] = useState<Mode>("quiz");
  const [batchId, setBatchId] = useState<string | null>(null);
  // Start from the SSR-stable default. We hydrate from localStorage after mount
  // (otherwise the server (xp=0) and client (xp=210) renders disagree and React
  // throws a hydration mismatch.)
  const [state, setState] = useState<ArenaState>(defaultArena);

  // Hydrate from localStorage on the client after the first render.
  useEffect(() => {
    setState(loadArena());
  }, []);

  // When mode changes, drop any open batch.
  useEffect(() => {
    setBatchId(null);
  }, [mode]);

  const onAnswer = (correct: boolean, xp: number) => setState(recordResult(correct, xp));
  const onFinishBatch = (id: string, total: number, correctInRun: number) =>
    setState(recordBatchRun(id, total, correctInRun));

  const activeBatch = useMemo(() => {
    if (!batchId) return null;
    return BATCHES_BY_MODE[mode].find((b) => b.id === batchId) ?? null;
  }, [batchId, mode]);

  return (
    <div className="min-h-dvh relative">
      <div className="absolute top-0 right-0 size-[500px] glow-orb pointer-events-none" />
      <Header />

      <main className="relative mx-auto max-w-6xl px-6 py-10">
        <div className="font-mono text-xs uppercase tracking-widest text-primary mb-2">/ arena</div>
        <h1 className="text-4xl font-semibold tracking-tight mb-3">The Arena</h1>
        <p className="text-muted-foreground max-w-2xl mb-8">
          Earn XP, keep your streak alive and unlock badges. Pick a game mode, choose a batch, and
          play through it.
        </p>

        <StatsBar
          state={state}
          onReset={() => {
            resetArena();
            setState(loadArena());
            setBatchId(null);
          }}
        />

        {/* Mode picker */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODES.map((m) => {
            const active = m.id === mode;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`text-left p-5 glass-card relative overflow-hidden group cursor-pointer transition-all ${
                  active
                    ? "border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(199,244,100,0.1)]"
                    : "border-primary/5 hover:border-primary/20 hover:bg-slate-900/30"
                }`}
              >
                {/* Active glow beacon */}
                {active && (
                  <div className="absolute top-3 right-3 size-1.5 rounded-full bg-primary animate-pulse-soft shadow-[0_0_8px_#C7F464]" />
                )}

                <div
                  className={`text-3xl mb-3 transition-transform duration-300 group-hover:scale-110 ${active ? "animate-bounce" : ""}`}
                >
                  {m.icon}
                </div>
                <div
                  className={`font-semibold tracking-tight transition-colors ${active ? "text-primary" : "text-slate-200 group-hover:text-white"}`}
                >
                  {m.label}
                </div>
                <div className="text-xs text-muted-foreground/80 mt-1.5 leading-relaxed">
                  {m.desc}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {!activeBatch ? (
            <BatchPicker
              mode={mode}
              batches={BATCHES_BY_MODE[mode]}
              state={state}
              onPick={(id) => setBatchId(id)}
            />
          ) : (
            <BatchRunner
              key={activeBatch.id /* reset internal state on batch change */}
              mode={mode}
              batch={activeBatch}
              onAnswer={onAnswer}
              onFinish={(correctInRun) =>
                onFinishBatch(activeBatch.id, activeBatch.items.length, correctInRun)
              }
              onExit={() => setBatchId(null)}
            />
          )}
        </div>

        <BadgeWall state={state} />
      </main>

      <Footer />
    </div>
  );
}

// ---------- Stats ----------
function StatsBar({ state, onReset }: { state: ArenaState; onReset: () => void }) {
  const accuracy = state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0;

  // Fictional progression based on actual XP
  const graphData = useMemo(() => {
    const base = state.xp || 0;
    return [
      { day: "Mon", xp: Math.max(0, base - 100) },
      { day: "Tue", xp: Math.max(0, base - 80) },
      { day: "Wed", xp: Math.max(0, base - 60) },
      { day: "Thu", xp: Math.max(0, base - 40) },
      { day: "Fri", xp: Math.max(0, base - 10) },
      { day: "Sat", xp: base },
    ];
  }, [state.xp]);

  return (
    <div className="grid md:grid-cols-5 gap-6 mb-8 items-stretch">
      {/* 1. Mastery Progression Graph (col-span-3) */}
      <div className="md:col-span-3 glass-card border-primary/20 p-5 flex flex-col justify-between min-h-[220px]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
            📈 MASTERY PROGRESSION
          </span>
          <span className="text-[9px] font-mono text-muted-foreground/60">XP History</span>
        </div>
        <div className="flex-1 w-full h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C7F464" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                stroke="#475569"
                fontSize={9}
                fontClassName="font-mono"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#475569"
                fontSize={9}
                fontClassName="font-mono"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#030712",
                  borderColor: "rgba(199,244,100,0.3)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#94a3b8", fontSize: "10px", fontFamily: "monospace" }}
                itemStyle={{ color: "#C7F464", fontSize: "11px", fontFamily: "monospace" }}
              />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="#C7F464"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorXp)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Streak / XP Analytics Card (col-span-2) */}
      <div className="md:col-span-2 glass-card border-primary/20 p-5 flex items-center justify-between min-h-[220px]">
        <div className="flex-1 flex flex-col justify-between h-full gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="XP Reward" value={state.xp} />
            <Stat label="Accuracy" value={`${accuracy}%`} />
            <Stat label="Best Streak" value={state.bestStreak} />
            <div className="flex flex-col justify-end">
              <button
                onClick={onReset}
                className="text-[9px] font-mono tracking-wider uppercase text-muted-foreground/60 hover:text-destructive transition-colors text-left cursor-pointer"
              >
                Reset Core Progress
              </button>
            </div>
          </div>
        </div>

        {/* Circular Streak Ring */}
        <div className="relative size-24 flex items-center justify-center shrink-0">
          <svg className="size-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="38"
              fill="none"
              stroke="rgba(199,244,100,0.06)"
              strokeWidth="5"
            />
            <circle
              cx="48"
              cy="48"
              r="38"
              fill="none"
              stroke="#C7F464"
              strokeWidth="5"
              strokeDasharray="238.7"
              strokeDashoffset={238.7 - (238.7 * Math.min(state.streak, 7)) / 7}
              className="transition-all duration-700"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center flex flex-col items-center">
            <span className="text-xl font-black text-gradient leading-none">{state.streak}🔥</span>
            <span className="text-[8px] font-mono uppercase text-muted-foreground/50 mt-1">
              streak
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-mono font-bold">
        {label}
      </div>
      <div className="mt-1 text-xl font-black text-[#f8fafc] font-sans tracking-tight">{value}</div>
    </div>
  );
}

// ---------- Batch Picker ----------
const DIFF_BADGE: Record<Difficulty, string> = {
  beginner: "text-emerald-300 border-emerald-400/20 bg-emerald-400/5",
  intermediate: "text-amber-300 border-amber-400/20 bg-amber-400/5",
  advanced: "text-rose-300 border-rose-400/20 bg-rose-400/5",
};

function BatchPicker({
  mode,
  batches,
  state,
  onPick,
}: {
  mode: Mode;
  batches: Batch<unknown>[];
  state: ArenaState;
  onPick: (id: string) => void;
}) {
  const modeMeta = MODES.find((m) => m.id === mode)!;
  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/10">
        <div className="flex items-center gap-3.5">
          <span className="text-3xl">{modeMeta.icon}</span>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-100">Select Batch</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Explore curated challenges under {modeMeta.label}
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/25 px-3 py-1 rounded-xl shadow-[0_0_10px_rgba(199,244,100,0.1)]">
          {batches.length} Batches Active
        </span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((b) => {
          const progress = state.batches[b.id];
          const completed = progress && progress.bestCorrect === b.items.length;
          const meta = DIFFICULTY_META[b.difficulty];
          const xpReward = meta.xpPerCorrect * b.items.length;
          return (
            <button
              key={b.id}
              onClick={() => onPick(b.id)}
              className="text-left glass-card hover:glass-card-hover border-primary/10 p-6 flex flex-col justify-between min-h-[200px] relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-[-10%] right-[-10%] size-20 pointer-events-none opacity-5 transition-opacity group-hover:opacity-10 text-primary">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon
                    points="50,15 90,85 10,85"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                      DIFF_BADGE[b.difficulty]
                    }`}
                  >
                    {meta.label}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground bg-slate-950/40 px-2 py-0.5 rounded border border-primary/5">
                    {b.items.length} Items · +{xpReward} XP
                  </span>
                </div>
                <div className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors text-slate-100">
                  {b.name}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4 font-sans">
                  {b.summary}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary/5">
                <div className="text-[10px] font-mono text-muted-foreground/60">
                  {progress ? (
                    <>
                      Best Record:{" "}
                      <span className="text-slate-200 font-bold">
                        {progress.bestCorrect}/{b.items.length}
                      </span>
                    </>
                  ) : (
                    <span className="opacity-60">Not Started</span>
                  )}
                </div>
                <span
                  className={`text-xs font-bold font-mono uppercase tracking-wider transition-all ${
                    completed ? "text-emerald-400" : "text-primary group-hover:translate-x-1"
                  }`}
                >
                  {completed ? "✓ Cleared" : "Initiate Run →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ---------- Batch Runner ----------
function BatchRunner({
  mode,
  batch,
  onAnswer,
  onFinish,
  onExit,
}: {
  mode: Mode;
  batch: Batch<unknown>;
  onAnswer: (correct: boolean, xp: number) => void;
  onFinish: (correctInRun: number) => void;
  onExit: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [correctInRun, setCorrectInRun] = useState(0);
  const [done, setDone] = useState(false);
  const [items, setItems] = useState<unknown[]>(batch.items);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [playToken, setPlayToken] = useState(0);

  const xpPerCorrect = DIFFICULTY_META[batch.difficulty].xpPerCorrect;

  useEffect(() => {
    if (mode !== "quiz" || !isGroqConfigured()) {
      setItems(batch.items);
      setAiError(null);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setAiError(null);
    generateQuizQuestions({
      topic: batch.topic ?? batch.name,
      topicKey: batch.id,
      difficulty: batch.difficulty,
      count: batch.items.length,
      signal: ctrl.signal,
    })
      .then((qs) => {
        if (ctrl.signal.aborted) return;
        setItems(qs);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name === "AbortError") return;
        setItems(batch.items);
        setAiError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [mode, batch.id, playToken]);

  const total = items.length;

  const resolve = (isCorrect: boolean) => {
    onAnswer(isCorrect, xpPerCorrect);
    if (isCorrect) setCorrectInRun((c) => c + 1);
  };

  const next = () => {
    if (idx + 1 >= total) {
      setDone(true);
    } else {
      setIdx(idx + 1);
    }
  };

  useEffect(() => {
    if (done) onFinish(correctInRun);
  }, [done]);

  if (loading) {
    return (
      <div className="glass-card border-primary/20 p-12 text-center animate-fade-in flex flex-col items-center justify-center">
        <div className="relative size-16 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
          <div className="text-2xl animate-pulse-soft">✨</div>
        </div>
        <h3 className="font-semibold text-lg mb-1 text-slate-100">Generating fresh questions…</h3>
        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
          Asking the AI for new {batch.difficulty} questions on {batch.name.toLowerCase()}.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <BatchSummary
        batchName={batch.name}
        correctInRun={correctInRun}
        total={total}
        xpEarned={correctInRun * xpPerCorrect}
        onReplay={() => {
          setIdx(0);
          setCorrectInRun(0);
          setDone(false);
          setPlayToken((t) => t + 1);
        }}
        onExit={onExit}
      />
    );
  }

  const currentItem = items[idx];
  if (!currentItem) {
    return (
      <div className="glass-card border-primary/15 p-6 text-sm text-muted-foreground">
        No questions available.{" "}
        <button onClick={onExit} className="text-primary underline cursor-pointer">
          Go back
        </button>
        .
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <BatchHeader batch={batch} idx={idx} total={total} onExit={onExit} />
      {mode === "quiz" && isGroqConfigured() && (
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground px-1">
          <span>
            {aiError
              ? "⚠ AI fetch failed — using curated questions"
              : "✨ AI-generated questions for this run"}
          </span>
          <button
            onClick={() => {
              setIdx(0);
              setCorrectInRun(0);
              setPlayToken((t) => t + 1);
            }}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            ↻ New questions
          </button>
        </div>
      )}
      <PlayerByMode
        key={(currentItem as { id: string }).id ?? `q-${idx}`}
        mode={mode}
        item={currentItem}
        onResolve={resolve}
        onNext={next}
        isLast={idx + 1 === total}
      />
    </div>
  );
}

function BatchHeader({
  batch,
  idx,
  total,
  onExit,
}: {
  batch: Batch<unknown>;
  idx: number;
  total: number;
  onExit: () => void;
}) {
  const meta = DIFFICULTY_META[batch.difficulty];
  const pct = Math.round((idx / total) * 100);
  return (
    <div className="glass-card border-primary/15 p-5 relative overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest font-mono text-primary font-bold">
            {meta.label} batch · {meta.xpPerCorrect} XP per correct
          </div>
          <div className="font-bold text-lg text-slate-100 mt-0.5">{batch.name}</div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-slate-200 bg-slate-950/60 border border-primary/10 px-2.5 py-1 rounded-lg">
            Progress: {idx + 1} / {total}
          </span>
          <button
            onClick={onExit}
            className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors px-2 py-1 cursor-pointer"
          >
            Exit Run
          </button>
        </div>
      </div>
      <div className="h-2 rounded-full bg-slate-950 border border-primary/10 overflow-hidden p-[2px]">
        <div
          className="h-full bg-gradient-primary rounded-full transition-all duration-500 shadow-[0_0_8px_#C7F464]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function BatchSummary({
  batchName,
  correctInRun,
  total,
  xpEarned,
  onReplay,
  onExit,
}: {
  batchName: string;
  correctInRun: number;
  total: number;
  xpEarned: number;
  onReplay: () => void;
  onExit: () => void;
}) {
  const perfect = correctInRun === total;
  const pct = Math.round((correctInRun / total) * 100);
  return (
    <div className="glass-card border-primary/20 p-10 text-center animate-fade-in relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 glow-orb pointer-events-none opacity-10" />

      <div className="relative size-20 rounded-full bg-slate-950 border border-primary/10 flex items-center justify-center text-4xl mb-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] animate-float">
        {perfect ? "🏆" : pct >= 60 ? "🎉" : "💪"}
      </div>

      <h3 className="text-3xl font-black mb-2 tracking-tight text-slate-100">
        {perfect ? "Perfect Mastery!" : `Batch Finished`}
      </h3>
      <p className="text-muted-foreground text-sm max-w-md leading-relaxed mb-8">
        You successfully cleared <span className="text-slate-100 font-bold">{batchName}</span>{" "}
        scoring <span className="text-primary font-bold">{correctInRun}</span> / {total} ({pct}%
        accuracy) and unlocked <span className="text-gradient font-black">+{xpEarned} XP</span>.
      </p>

      <div className="flex flex-wrap gap-4 justify-center relative z-10">
        <button
          onClick={onReplay}
          className="btn-secondary-tactile hover:btn-secondary-tactile-hover px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer"
        >
          Replay Batch
        </button>
        <button
          onClick={onExit}
          className="btn-primary-tactile hover:btn-primary-tactile-hover px-6 py-3 rounded-xl text-sm font-bold cursor-pointer"
        >
          Select Another Pathway
        </button>
      </div>
    </div>
  );
}

// ---------- Generic Choice Card ----------
type ChoiceProps = {
  prompt: ReactNode;
  options: ReactNode[];
  correctIndex: number;
  explain: string;
  onResolve: (correct: boolean) => void;
  onNext: () => void;
  isLast: boolean;
};

function ChoiceCard({
  prompt,
  options,
  correctIndex,
  explain,
  onResolve,
  onNext,
  isLast,
}: ChoiceProps) {
  const [picked, setPicked] = useState<number | null>(null);

  const submit = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    onResolve(i === correctIndex);
  };

  return (
    <div className="glass-card border-primary/15 p-6 md:p-8 animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 size-24 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />

      <div className="mb-6 relative z-10 text-[#f8fafc] font-medium leading-relaxed">{prompt}</div>

      <div className="grid sm:grid-cols-2 gap-4 relative z-10">
        {options.map((opt, i) => {
          const isPicked = picked === i;
          const correct = picked !== null && i === correctIndex;
          const wrong = isPicked && i !== correctIndex;
          return (
            <button
              key={i}
              onClick={() => submit(i)}
              disabled={picked !== null}
              className={`text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
                correct
                  ? "border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : wrong
                    ? "border-rose-500 bg-rose-950/20 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                    : picked !== null
                      ? "border-primary/5 bg-slate-950/20 text-muted-foreground opacity-50 cursor-not-allowed"
                      : "border-primary/10 bg-slate-950/40 hover:border-primary/30 hover:bg-slate-900/40 text-slate-300 hover:text-white cursor-pointer shadow-sm hover:shadow-[0_4px_20px_rgba(199,244,100,0.05)]"
              }`}
            >
              {picked === null && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              )}

              <div className="flex items-center gap-3">
                <span
                  className={`font-mono text-xs px-2 py-0.5 rounded border transition-colors ${
                    correct
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : wrong
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                        : "border-primary/10 bg-slate-950/60 text-muted-foreground group-hover:text-primary group-hover:border-primary/30"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-6 pt-6 border-t border-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-5 animate-fade-in relative z-10">
          <div className="flex items-start gap-3 flex-1">
            <span
              className={`text-xl leading-none mt-0.5 ${picked === correctIndex ? "text-emerald-400" : "text-rose-400"}`}
            >
              {picked === correctIndex ? "✓" : "✗"}
            </span>
            <div className="text-sm leading-relaxed">
              <span
                className={`font-bold ${picked === correctIndex ? "text-emerald-400" : "text-rose-400"}`}
              >
                {picked === correctIndex ? "Correct Answer! " : "Incorrect. "}
              </span>
              <span className="text-muted-foreground">{explain}</span>
            </div>
          </div>
          <button
            onClick={onNext}
            className="btn-primary-tactile hover:btn-primary-tactile-hover px-6 py-2.5 rounded-xl font-bold text-sm shrink-0 self-end md:self-center cursor-pointer"
          >
            {isLast ? "Complete Batch →" : "Next Challenge →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Per-Mode Players ----------
function PlayerByMode({
  mode,
  item,
  onResolve,
  onNext,
  isLast,
}: {
  mode: Mode;
  item: unknown;
  onResolve: (correct: boolean) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  if (mode === "quiz") {
    const q = item as Quiz;
    const correctIndex = q.options.indexOf(q.correct);
    return (
      <ChoiceCard
        prompt={
          <>
            <div className="text-[10px] uppercase tracking-widest font-mono text-primary font-bold mb-1">
              DSA THEORY CHALLENGE
            </div>
            <h3 className="text-xl font-bold text-slate-100">{q.question}</h3>
          </>
        }
        options={q.options}
        correctIndex={correctIndex}
        explain={q.explain}
        onResolve={onResolve}
        onNext={onNext}
        isLast={isLast}
      />
    );
  }

  if (mode === "guess") {
    const g = item as GuessOutput;
    const correctIndex = g.options.indexOf(g.correct);
    return (
      <ChoiceCard
        prompt={
          <>
            <div className="text-[10px] uppercase tracking-widest font-mono text-primary font-bold mb-1">
              GUESS THE OUTPUT
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-100">{g.title}</h3>
            <pre className="font-mono text-xs leading-relaxed bg-slate-950/80 border border-primary/15 rounded-xl p-5 overflow-x-auto text-slate-200 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
              <code>{g.code}</code>
            </pre>
          </>
        }
        options={g.options.map((o, i) => (
          <span key={i} className="font-mono font-semibold">
            {o}
          </span>
        ))}
        correctIndex={correctIndex}
        explain={g.explain}
        onResolve={onResolve}
        onNext={onNext}
        isLast={isLast}
      />
    );
  }

  if (mode === "predict") {
    const p = item as PredictStep;
    const correct = applyStep(p.before, p.algo, p.stepIndex ?? 0);
    const seed = hash(p.id);
    const candidates = shuffleStable([correct, ...p.distractors], seed);
    const correctIndex = candidates.findIndex((arr) => arraysEqual(arr, correct));
    return (
      <ChoiceCard
        prompt={
          <>
            <div className="text-[10px] uppercase tracking-widest font-mono text-primary font-bold mb-1">
              PREDICT THE STEP
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-100">{p.title}</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Algorithm: <span className="text-slate-200 font-semibold">{ALGO_LABEL[p.algo]}</span>{" "}
              · {p.hint}
            </p>
            <ArrayPreview values={p.before.map(String)} label="Current Array State" />
          </>
        }
        options={candidates.map((arr, i) => (
          <ArrayPreview key={i} values={arr.map(String)} compact />
        ))}
        correctIndex={correctIndex}
        explain={p.explain}
        onResolve={onResolve}
        onNext={onNext}
        isLast={isLast}
      />
    );
  }

  const c = item as ComplexityMatch;
  const correctIndex = c.options.indexOf(c.correct);
  return (
    <ChoiceCard
      prompt={
        <>
          <div className="text-[10px] uppercase tracking-widest font-mono text-primary font-bold mb-1">
            COMPLEXITY ANALYSIS
          </div>
          <h3 className="text-xl font-bold text-slate-100">
            What is the time complexity of <span className="text-gradient">{c.algo}</span>?
          </h3>
        </>
      }
      options={c.options.map((o, i) => (
        <span key={i} className="font-mono">
          {o}
        </span>
      ))}
      correctIndex={correctIndex}
      explain={c.explain}
      onResolve={onResolve}
      onNext={onNext}
      isLast={isLast}
    />
  );
}

function ArrayPreview({
  values,
  label,
  compact,
}: {
  values: string[];
  label?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "mb-2"}>
      {label && (
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-2">
          {label}
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {values.map((v, i) => (
          <div
            key={i}
            className="size-10 rounded-lg border border-primary/20 bg-slate-950/70 flex items-center justify-center font-mono text-xs text-primary font-bold shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] transition-all hover:border-primary/40"
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Helpers ----------
function arraysEqual(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}

function shuffleStable<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Badge Icons ----------
function getBadgeIcon(id: string, earned: boolean): ReactNode {
  const color = earned ? "text-slate-950" : "text-muted-foreground/30";
  switch (id) {
    case "first-blood":
      return (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "streak-3":
      return (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "streak-7":
      return (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "xp-100":
      return (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "xp-500":
      return (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      );
    case "tenacious":
      return (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      );
    case "batch-clear":
      return (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      );
    case "completionist":
      return (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.24.588 1.81l-3.974 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.976-2.89c-.773-.569-.373-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      );
  }
}

// ---------- Badge Wall ----------
function BadgeWall({ state }: { state: ArenaState }) {
  return (
    <section className="mt-16 border-t border-primary/10 pt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-100">Alchemical Seals</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Unlock these badges as you progress through core data structures.
          </p>
        </div>
        <div className="text-xs font-mono text-muted-foreground bg-slate-950/60 border border-primary/10 px-3 py-1.5 rounded-xl">
          Unlocked: <span className="text-primary font-bold">{state.badges.length}</span> /{" "}
          {BADGES.length}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BADGES.map((b) => {
          const earned = state.badges.includes(b.id);
          return (
            <div
              key={b.id}
              className={`rounded-2xl border p-5 flex items-center gap-5 transition-all duration-300 relative overflow-hidden group ${
                earned
                  ? "border-primary/30 bg-gradient-to-br from-primary/10 to-slate-950/20 shadow-[0_4px_20px_rgba(199,244,100,0.08)] hover:border-primary/50"
                  : "border-primary/5 bg-slate-950/20 opacity-55 hover:opacity-75"
              }`}
            >
              {earned && (
                <div className="absolute -bottom-6 -right-6 size-24 bg-primary/5 rounded-full blur-xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
              )}

              <div
                className={`size-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 transition-all duration-300 ${
                  earned
                    ? "bg-gradient-primary text-slate-950 shadow-[0_0_15px_rgba(199,244,100,0.3)] group-hover:scale-105"
                    : "bg-slate-950/80 border border-primary/10 text-muted-foreground/30"
                }`}
              >
                {getBadgeIcon(b.id, earned)}
              </div>

              <div className="flex-1">
                <div
                  className={`font-bold transition-colors ${earned ? "text-slate-100 group-hover:text-primary" : "text-muted-foreground"}`}
                >
                  {b.name}
                </div>
                <div className="text-xs text-muted-foreground/80 mt-1 leading-relaxed">
                  {b.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
