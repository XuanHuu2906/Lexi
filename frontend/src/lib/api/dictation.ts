import { api } from "./client";

// Request bodies match the backend DTOs; response shapes mirror the AI feature
// result interfaces (dictation sentence generation + Vietnamese mistake explain).

export interface GenerateDictationInput {
  level?: string;
  topics?: string[];
  count?: number;
}

export interface DictationSentencesResult {
  sentences: string[];
}

export function generateDictation(
  opts: GenerateDictationInput = {},
): Promise<DictationSentencesResult> {
  return api.post<DictationSentencesResult>("/dictation/generate", opts);
}

export interface DictationFeedbackResult {
  feedback: string; // Vietnamese
}

export function explainDictation(
  reference: string,
  attempt: string,
): Promise<DictationFeedbackResult> {
  return api.post<DictationFeedbackResult>("/dictation/explain", {
    reference,
    attempt,
  });
}
