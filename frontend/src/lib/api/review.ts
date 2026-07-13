import { api } from "./client";
import { type BackendWord, toWord } from "./mappers";
import type { ApiWord } from "./types";

export type ReviewRating = "forgot" | "hard" | "good" | "easy";
export type FlashcardMode = "guess" | "listen" | "fill" | "match";
export type FlashcardScope = "due" | "today";

export interface DueReviews {
  items: ApiWord[];
  count: number;
  total: number;
}

/** Words currently due for spaced-repetition review. */
export async function getDueReviews(limit?: number): Promise<DueReviews> {
  const res = await api.get<{
    items: BackendWord[];
    count: number;
    total: number;
  }>("/review/due", { query: { limit } });
  return { ...res, items: res.items.map(toWord) };
}

export interface AnswerResult {
  srsData: unknown;
  status: "NEW" | "LEARNING" | "MASTERED";
  nextReviewAt: string;
}

/** Grade one review; the backend advances the SM-2 schedule. */
export function submitReviewAnswer(
  wordId: string,
  rating: ReviewRating,
): Promise<AnswerResult> {
  return api.post<AnswerResult>("/review/answer", { wordId, rating });
}

export interface Flashcard {
  wordId: string;
  term: string;
  meaning: string;
  phonetic: string | null;
  examples: string[];
  options?: string[];
  answerIndex?: number;
  cloze?: string | null;
}

export interface FlashcardSet {
  mode: FlashcardMode;
  // The scope actually served — may differ from what was requested when
  // "today" falls back to the due deck because no words were added today.
  scope: FlashcardScope;
  count: number;
  cards: Flashcard[];
}

export function getFlashcards(
  mode?: FlashcardMode,
  limit?: number,
  scope?: FlashcardScope,
): Promise<FlashcardSet> {
  return api.get<FlashcardSet>("/review/flashcards", {
    query: { mode, limit, scope },
  });
}
