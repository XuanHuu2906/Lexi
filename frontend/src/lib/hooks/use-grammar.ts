"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { grammarApi, queryKeys } from "@/lib/api";
import type { GrammarInput } from "@/lib/api";

export function useGrammar(params: grammarApi.ListGrammarParams = {}) {
  return useQuery({
    queryKey: queryKeys.grammar.list(params),
    queryFn: () => grammarApi.listGrammar(params),
  });
}

export function useCreateGrammar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GrammarInput) => grammarApi.createGrammar(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.grammar.all }),
  });
}

export function useDeleteGrammar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => grammarApi.deleteGrammar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.grammar.all }),
  });
}

/** AI-normalise a rough rule → formula/explanation/examples (not saved). */
export function usePreviewGrammar() {
  return useMutation({
    mutationFn: (rule: string) => grammarApi.previewGrammar(rule),
  });
}
