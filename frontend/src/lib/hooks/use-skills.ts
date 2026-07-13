"use client";

import { useMutation } from "@tanstack/react-query";
import { skillsApi } from "@/lib/api";

/** Grammar Q&A chat — the client keeps history and passes it each turn. */
export function useAskGrammar() {
  return useMutation({
    mutationFn: (vars: {
      question: string;
      history?: skillsApi.ChatTurn[];
    }) => skillsApi.askGrammar(vars.question, vars.history),
  });
}

/** Ask Lexi — general-knowledge tutor chat; client keeps history per turn. */
export function useAskTutor() {
  return useMutation({
    mutationFn: (vars: {
      question: string;
      history?: skillsApi.ChatTurn[];
    }) => skillsApi.askTutor(vars.question, vars.history),
  });
}

export function useGradeWriting() {
  return useMutation({
    mutationFn: (text: string) => skillsApi.gradeWriting(text),
  });
}

export function useScorePronunciation() {
  return useMutation({
    mutationFn: (vars: skillsApi.ScorePronunciationInput) =>
      skillsApi.scorePronunciation(vars),
  });
}

/** UC07 — analyse a passage; returns hard words to highlight + save. */
export function useAnalyzeContext() {
  return useMutation({
    mutationFn: (vars: { passage: string; level?: string }) =>
      skillsApi.analyzeContext(vars.passage, vars.level),
  });
}
