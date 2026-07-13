import { api } from "./client";
import {
  type BackendWord,
  type WordInput,
  fromWord,
  toWord,
} from "./mappers";
import type { ApiWord, Paginated } from "./types";

export interface ListWordsParams {
  search?: string;
  topic?: string;
  status?: "NEW" | "LEARNING" | "MASTERED";
  sort?: "newest" | "oldest";
  page?: number;
  limit?: number;
}

export async function listWords(
  params: ListWordsParams = {},
): Promise<Paginated<ApiWord>> {
  const res = await api.get<Paginated<BackendWord>>("/words", {
    query: { ...params },
  });
  return { ...res, items: res.items.map(toWord) };
}

/** AI dictionary lookup (guest-accessible, rate-limited). */
export interface LookupResult {
  term: string;
  partOfSpeech: string;
  phonetic: string;
  meaning: string;
  meaningEn: string;
  examples: { en: string; vi: string }[];
  synonyms: string[];
  antonyms: string[];
  contextNote: string;
}

export function lookupWord(
  term: string,
  level?: string,
): Promise<LookupResult> {
  return api.post<LookupResult>(
    "/words/lookup",
    { term, level },
    { public: true },
  );
}

/** One word in a batch lookup: its result, or an error if that word failed. */
export interface BatchLookupItem {
  term: string;
  result: LookupResult | null;
  error: string | null;
}

/**
 * Look up several words from one pasted string. The backend strips option
 * labels like "(A)" and dedupes, so "(A) infinitely (B) sincerely" → 2 cards.
 */
export function lookupWordsBatch(
  text: string,
  level?: string,
): Promise<{ items: BatchLookupItem[] }> {
  return api.post<{ items: BatchLookupItem[] }>(
    "/words/lookup-batch",
    { text, level },
    { public: true },
  );
}

/** AI validation + enrichment of a vocab entry (UC21, nothing saved). */
export interface VerifyWordResult {
  isValid: boolean;
  correctedTerm: string;
  meaningVerdict: "match" | "mismatch" | "none";
  partOfSpeech: string;
  phonetic: string;
  meaning: string;
  meaningEn: string;
  examples: { en: string; vi: string }[];
  synonyms: string[];
  antonyms: string[];
  contextNote: string;
}

export function verifyWord(
  term: string,
  meaning?: string,
  level?: string,
): Promise<VerifyWordResult> {
  return api.post<VerifyWordResult>("/words/verify", { term, meaning, level });
}

export async function createWord(input: WordInput): Promise<ApiWord> {
  const res = await api.post<BackendWord>("/words", fromWord(input));
  return toWord(res);
}

export interface QuickAddResult {
  word: ApiWord;
  synonyms: { word: string; meaning: string }[];
}

export async function quickAddWord(
  text: string,
  topic?: string,
): Promise<QuickAddResult> {
  const res = await api.post<{
    word: BackendWord;
    synonyms: { word: string; meaning: string }[];
  }>("/words/quick-add", { text, topic });
  return { word: toWord(res.word), synonyms: res.synonyms };
}

export function deleteWord(id: string): Promise<void> {
  return api.delete<void>(`/words/${id}`);
}

export interface GeneratedExample {
  en: string;
  vi: string;
}

export interface GenerateExamplesResult {
  word: ApiWord;
  generated: GeneratedExample[];
}

export async function generateWordExamples(
  id: string,
  count?: number,
): Promise<GenerateExamplesResult> {
  // The endpoint appends to the word and returns `{ generated, word }`.
  const res = await api.post<{
    generated: GeneratedExample[];
    word: BackendWord;
  }>(`/words/${id}/examples`, { count });
  return { word: toWord(res.word), generated: res.generated };
}
