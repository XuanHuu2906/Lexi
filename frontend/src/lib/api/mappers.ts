// Two-way translation between the backend's wire shapes and the frontend's
// canonical types. Read paths use `toX`; create/update payloads use `fromX`.

import type {
  ApiGrammarRule,
  ApiWord,
  WordStatus,
} from "./types";

// ── Backend wire shapes (only the fields we read) ──
type BackendWordStatus = "NEW" | "LEARNING" | "MASTERED";

export interface BackendWord {
  id: string;
  term: string;
  meaning: string;
  phonetic: string | null;
  partOfSpeech: string | null;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  topic: string | null;
  note: string | null;
  status: BackendWordStatus;
  createdAt: string;
  srsData?: { nextReviewAt: string | null } | null;
}

export interface BackendGrammarRule {
  id: string;
  title: string | null;
  formula: string;
  explanation: string;
  examples: string[];
  createdAt: string;
}

const STATUS_TO_FE: Record<BackendWordStatus, WordStatus> = {
  NEW: "new",
  LEARNING: "due",
  MASTERED: "learned",
};

export function toWord(w: BackendWord): ApiWord {
  return {
    id: w.id,
    word: w.term,
    phonetic: w.phonetic,
    meaning: w.meaning,
    pos: w.partOfSpeech,
    status: STATUS_TO_FE[w.status] ?? "new",
    topic: w.topic,
    examples: w.examples ?? [],
    synonyms: w.synonyms ?? [],
    antonyms: w.antonyms ?? [],
    note: w.note,
    createdAt: w.createdAt,
    nextReviewAt: w.srsData?.nextReviewAt ?? null,
  };
}

/** Fields a Word create/update accepts (partial for PATCH). */
export interface WordInput {
  word: string;
  meaning: string;
  phonetic?: string | null;
  pos?: string | null;
  topic?: string | null;
  note?: string | null;
  examples?: string[];
  synonyms?: string[];
  antonyms?: string[];
}

export function fromWord(input: WordInput): Record<string, unknown> {
  return {
    term: input.word,
    meaning: input.meaning,
    phonetic: input.phonetic ?? undefined,
    partOfSpeech: input.pos ?? undefined,
    topic: input.topic ?? undefined,
    note: input.note ?? undefined,
    examples: input.examples,
    synonyms: input.synonyms,
    antonyms: input.antonyms,
  };
}

export function toGrammarRule(g: BackendGrammarRule): ApiGrammarRule {
  return {
    id: g.id,
    formula: g.formula,
    title: g.title,
    explanation: g.explanation,
    examples: g.examples ?? [],
    createdAt: g.createdAt,
  };
}

export interface GrammarInput {
  formula: string;
  explanation: string;
  title?: string | null;
  examples?: string[];
}

export function fromGrammarRule(input: GrammarInput): Record<string, unknown> {
  return {
    formula: input.formula,
    explanation: input.explanation,
    title: input.title ?? undefined,
    examples: input.examples,
  };
}
