"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, quizApi } from "@/lib/api";

export function useGenerateQuiz() {
  return useMutation({
    mutationFn: (count?: number) => quizApi.generateQuiz(count),
  });
}

export function useSubmitQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { quizId: string; answers: number[] }) =>
      quizApi.submitQuiz(vars.quizId, vars.answers),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.stats.all }),
  });
}
