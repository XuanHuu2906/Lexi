"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { queryKeys, wordsApi } from "@/lib/api";
import type { WordInput } from "@/lib/api";

// Adding/removing a word also changes the review queue, dashboard stats and the
// streak/counts on `me`. Invalidate all of them so every screen updates live.
function invalidateWordDependents(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: queryKeys.words.all });
  qc.invalidateQueries({ queryKey: queryKeys.review.all });
  qc.invalidateQueries({ queryKey: queryKeys.stats.all });
  qc.invalidateQueries({ queryKey: queryKeys.me });
}

export function useWords(params: wordsApi.ListWordsParams = {}) {
  return useQuery({
    queryKey: queryKeys.words.list(params),
    queryFn: () => wordsApi.listWords(params),
    // Keep showing the current page while the next one (or a changed filter)
    // loads, so paging never flashes an empty list.
    placeholderData: keepPreviousData,
  });
}

export function useDeleteWord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => wordsApi.deleteWord(id),
    onSuccess: () => invalidateWordDependents(qc),
  });
}

export function useCreateWord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WordInput) => wordsApi.createWord(input),
    onSuccess: () => invalidateWordDependents(qc),
  });
}

/** Guest-accessible AI dictionary lookup (rate-limited, nothing saved). */
export function useLookup() {
  return useMutation({
    mutationFn: (vars: { term: string; level?: string }) =>
      wordsApi.lookupWord(vars.term, vars.level),
  });
}

/** Multi-word lookup: one pasted string → many word cards (rate-limited). */
export function useLookupBatch() {
  return useMutation({
    mutationFn: (vars: { text: string; level?: string }) =>
      wordsApi.lookupWordsBatch(vars.text, vars.level),
  });
}

/** Validate + enrich a vocab entry before saving (nothing persisted). */
export function useVerifyWord() {
  return useMutation({
    mutationFn: (vars: { term: string; meaning?: string; level?: string }) =>
      wordsApi.verifyWord(vars.term, vars.meaning, vars.level),
  });
}

export function useQuickAdd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { text: string; topic?: string }) =>
      wordsApi.quickAddWord(vars.text, vars.topic),
    onSuccess: () => invalidateWordDependents(qc),
  });
}

export function useGenerateWordExamples() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; count?: number }) =>
      wordsApi.generateWordExamples(vars.id, vars.count),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.words.all }),
  });
}
