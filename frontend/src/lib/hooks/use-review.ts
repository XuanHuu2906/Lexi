"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, reviewApi } from "@/lib/api";

export function useDueReviews(limit = 50) {
  return useQuery({
    queryKey: queryKeys.review.due,
    queryFn: () => reviewApi.getDueReviews(limit),
  });
}

export function useFlashcards(
  mode: reviewApi.FlashcardMode = "guess",
  limit = 20,
  scope: reviewApi.FlashcardScope = "due",
) {
  return useQuery({
    queryKey: [...queryKeys.review.flashcards, mode, limit, scope],
    // Backend 400s when the user has no words yet — surface as empty, don't retry.
    retry: false,
    queryFn: () => reviewApi.getFlashcards(mode, limit, scope),
  });
}

export function useSubmitReviewAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { wordId: string; rating: reviewApi.ReviewRating }) =>
      reviewApi.submitReviewAnswer(vars.wordId, vars.rating),
    // Answering reschedules the word, moves stats and can bump the streak.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.review.all });
      qc.invalidateQueries({ queryKey: queryKeys.stats.all });
      qc.invalidateQueries({ queryKey: queryKeys.words.all });
      qc.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}
