// Lightweight client-side gamification: XP, streaks, badges and per-batch progress.
// Persisted in localStorage so progress survives reloads.

const KEY = "dsa-vis-arena-v2";

export type BatchProgress = {
  /** number of correct answers achieved on the best run of this batch */
  bestCorrect: number;
  /** total number of items in the batch (cached so we know "completed" without the catalogue) */
  total: number;
  /** how many distinct attempts (full plays) the user has made */
  plays: number;
  /** ISO timestamp of last play */
  lastPlayedISO: string | null;
};

export type ArenaState = {
  xp: number;
  correct: number;
  attempts: number;
  streak: number;
  bestStreak: number;
  lastPlayedISO: string | null;
  badges: string[];
  /** per-batch progress, keyed by batch id */
  batches: Record<string, BatchProgress>;
};

const DEFAULT: ArenaState = {
  xp: 0,
  correct: 0,
  attempts: 0,
  streak: 0,
  bestStreak: 0,
  lastPlayedISO: null,
  badges: [],
  batches: {},
};

/** SSR-stable default state. Always returns the same shape on both server and client. */
export function defaultArena(): ArenaState {
  return { ...DEFAULT, batches: {} };
}

export function loadArena(): ArenaState {
  if (typeof window === "undefined") return { ...DEFAULT, batches: {} };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return { ...DEFAULT, ...raw, batches: { ...(raw.batches ?? {}) } };
  } catch {
    return { ...DEFAULT, batches: {} };
  }
}

export function saveArena(s: ArenaState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export const BADGES: {
  id: string;
  name: string;
  desc: string;
  check: (s: ArenaState) => boolean;
}[] = [
  {
    id: "first-blood",
    name: "First Blood",
    desc: "Solve your first puzzle",
    check: (s) => s.correct >= 1,
  },
  { id: "streak-3", name: "Hat-trick", desc: "3-in-a-row streak", check: (s) => s.bestStreak >= 3 },
  { id: "streak-7", name: "On Fire", desc: "7-in-a-row streak", check: (s) => s.bestStreak >= 7 },
  { id: "xp-100", name: "Centurion", desc: "Earn 100 XP", check: (s) => s.xp >= 100 },
  { id: "xp-500", name: "Algo Sage", desc: "Earn 500 XP", check: (s) => s.xp >= 500 },
  {
    id: "tenacious",
    name: "Tenacious",
    desc: "Attempt 25 puzzles",
    check: (s) => s.attempts >= 25,
  },
  {
    id: "batch-clear",
    name: "Batch Clear",
    desc: "100% a batch on a single run",
    check: (s) => Object.values(s.batches).some((b) => b.total > 0 && b.bestCorrect === b.total),
  },
  {
    id: "completionist",
    name: "Completionist",
    desc: "Perfect 3 different batches",
    check: (s) =>
      Object.values(s.batches).filter((b) => b.total > 0 && b.bestCorrect === b.total).length >= 3,
  },
];

function applyBadges(s: ArenaState) {
  for (const b of BADGES) {
    if (b.check(s) && !s.badges.includes(b.id)) s.badges.push(b.id);
  }
}

/** Record a single answer (correct/incorrect) and return the updated state. */
export function recordResult(correct: boolean, xpDelta = 10): ArenaState {
  const s = loadArena();
  s.attempts += 1;
  if (correct) {
    s.correct += 1;
    s.xp += xpDelta;
    s.streak += 1;
    if (s.streak > s.bestStreak) s.bestStreak = s.streak;
  } else {
    s.streak = 0;
  }
  s.lastPlayedISO = new Date().toISOString();
  applyBadges(s);
  saveArena(s);
  return s;
}

/** Record the result of a complete batch run (called once when user finishes). */
export function recordBatchRun(batchId: string, total: number, correctInRun: number): ArenaState {
  const s = loadArena();
  const prev = s.batches[batchId] ?? { bestCorrect: 0, total, plays: 0, lastPlayedISO: null };
  s.batches[batchId] = {
    bestCorrect: Math.max(prev.bestCorrect, correctInRun),
    total,
    plays: prev.plays + 1,
    lastPlayedISO: new Date().toISOString(),
  };
  applyBadges(s);
  saveArena(s);
  return s;
}

export function resetArena() {
  saveArena({ ...DEFAULT, batches: {} });
}
