// Groq client for generating dynamic quiz questions.
//
// SECURITY NOTE
// -------------
// The key is now proxy-called through a TanStack server function.
// For production, the GROQ_API_KEY secret can be configured without
// shipping the token to the client bundle.

import { createServerFn } from "@tanstack/react-start";
import type { Quiz } from "./arenaContent";

const fetchGroqCompletionsServer = createServerFn({ method: "POST" })
  .inputValidator((d: { system: string; user: string; model: string }) => d)
  .handler(async ({ data }) => {
    const apiKey =
      process.env.GROQ_API_KEY ||
      process.env.VITE_GROQ_API_KEY ||
      import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set on the server.");
    }

    const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: data.model,
        temperature: 1.05,
        top_p: 0.95,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: data.system },
          { role: "user", content: data.user },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Groq server error ${res.status}: ${text.slice(0, 200)}`);
    }

    return res.json();
  });

// Per-topic memory of recently-seen question stems. Persisted to sessionStorage
// so reloads don't immediately re-issue the same questions, but cleared when
// the tab closes (so over time the pool refreshes naturally).
const SEEN_KEY_PREFIX = "dsa-vis-seen-quiz-v1:";
const MAX_SEEN_PER_TOPIC = 60;

function loadSeen(topicKey: string): string[] {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SEEN_KEY_PREFIX + topicKey);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveSeen(topicKey: string, list: string[]) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      SEEN_KEY_PREFIX + topicKey,
      JSON.stringify(list.slice(-MAX_SEEN_PER_TOPIC)),
    );
  } catch {
    /* quota / disabled — ignore */
  }
}

function normalizeStem(q: string): string {
  return q
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

export type QuizGenParams = {
  /** Free-form natural-language description used inside the prompt. */
  topic: string;
  /** A short, stable id (e.g. batch.id) used as the key for the "seen" cache. */
  topicKey?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  count: number;
  signal?: AbortSignal;
};

export function isGroqConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GROQ_API_KEY) || import.meta.env.PROD;
}

/** Clear the per-topic seen-cache (useful for a "reset" button). */
export function clearSeenForTopic(topicKey: string) {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(SEEN_KEY_PREFIX + topicKey);
  }
}

/**
 * Ask Groq for a batch of multiple-choice DSA questions.
 * Returns parsed Quiz items or throws on any failure (caller should fall back).
 */
export async function generateQuizQuestions(p: QuizGenParams): Promise<Quiz[]> {
  const model = (import.meta.env.VITE_GROQ_MODEL as string | undefined) ?? "llama-3.1-8b-instant";
  const topicKey = p.topicKey ?? p.topic;
  const seen = loadSeen(topicKey);

  // Random nonce to defeat any caching and to make the model take a different
  // sampling path each call.
  const nonce = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  const system = [
    "You are a DSA quiz generator.",
    "Always reply with strict JSON matching the schema the user provides — no prose, no markdown fences.",
    "Questions must be technically correct, unambiguous, and have exactly one right answer.",
    "Crucially: never reuse a question phrasing the user lists under AVOID.",
    "Vary scenarios, vocabulary, numbers, examples and the angle of the question every time.",
  ].join(" ");

  const avoidBlock = seen.length
    ? `\n\nAVOID (do NOT reproduce or trivially rephrase any of these — pick fresh angles):\n- ${seen
        .slice(-30)
        .join("\n- ")}`
    : "";

  const user = `Generate ${p.count} ${p.difficulty}-level multiple-choice questions about ${p.topic}.
Each question must have exactly 4 options. The "correct" field must be the EXACT string of the right option.
Diversity requirements:
  • Cover at least ${Math.min(p.count, 4)} different sub-topics inside the broader area.
  • Mix question styles: definitions, complexity reasoning, "which of these is true", short trace/scenario, contrasting two algorithms.
  • Use varied numeric examples (don't always pick n=5 or [1,2,3]).
  • Avoid generic openers like "What is the time complexity of …" more than once per batch.
Random seed for variation (use it to diversify, do not echo it): ${nonce}
${avoidBlock}

Return ONLY this JSON shape (no extra keys, no commentary):
{
  "questions": [
    {
      "id": "string-unique-per-question",
      "question": "string",
      "options": ["string","string","string","string"],
      "correct": "string (one of options, verbatim)",
      "explain": "1-2 sentence explanation"
    }
  ]
}`;

  // Call the server proxy securely
  const data = await fetchGroqCompletionsServer({
    data: { system, user, model },
  });
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned empty content");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Groq response was not valid JSON");
  }

  const list = (parsed as { questions?: unknown }).questions;
  if (!Array.isArray(list)) throw new Error("Groq JSON missing `questions` array");

  // Validate, dedupe against the seen-set, dedupe within the batch.
  const out: Quiz[] = [];
  const usedStems = new Set<string>(seen.map(normalizeStem));
  for (let i = 0; i < list.length; i++) {
    const q = list[i] as Partial<Quiz> & { options?: unknown };
    if (
      typeof q.question !== "string" ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      !q.options.every((o) => typeof o === "string") ||
      typeof q.correct !== "string" ||
      typeof q.explain !== "string"
    ) {
      continue; // skip malformed entries
    }
    if (!q.options.includes(q.correct)) continue;

    const stem = normalizeStem(q.question);
    if (!stem || usedStems.has(stem)) continue; // drop duplicates
    usedStems.add(stem);

    out.push({
      id: typeof q.id === "string" && q.id ? q.id : `ai-${nonce}-${i}`,
      question: q.question,
      options: q.options as string[],
      correct: q.correct,
      explain: q.explain,
    });
  }

  if (out.length === 0) throw new Error("Groq returned no usable questions");

  // Persist newly seen stems so the next call can avoid them.
  saveSeen(topicKey, [...seen, ...out.map((q) => q.question)]);

  return out;
}
