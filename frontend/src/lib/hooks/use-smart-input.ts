"use client";

import { useMutation } from "@tanstack/react-query";
import { smartInputApi } from "@/lib/api";

/** AI classification of free-text quick-input (vocabulary vs grammar). */
export function useClassifyInput() {
  return useMutation({
    mutationFn: (text: string) => smartInputApi.classifyInput(text),
  });
}
