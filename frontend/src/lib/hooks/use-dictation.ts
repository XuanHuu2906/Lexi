"use client";

import { useMutation } from "@tanstack/react-query";
import { dictationApi } from "@/lib/api";

/** Generate a batch of sentences to dictate (snapshotted into page state). */
export function useGenerateDictation() {
  return useMutation({
    mutationFn: (vars: dictationApi.GenerateDictationInput) =>
      dictationApi.generateDictation(vars),
  });
}

/** Explain a dictation mistake in Vietnamese — only called when the diff isn't perfect. */
export function useExplainDictation() {
  return useMutation({
    mutationFn: (vars: { reference: string; attempt: string }) =>
      dictationApi.explainDictation(vars.reference, vars.attempt),
  });
}
