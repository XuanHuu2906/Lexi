import { api } from "./client";

/** AI classification of free-text quick-input (nothing is saved here). */
export interface ClassifyResult {
  type: "vocabulary" | "grammar" | "unknown";
  confidence: number;
  term: string;
  meaning: string;
  rule: string;
  reason: string;
}

export function classifyInput(text: string): Promise<ClassifyResult> {
  return api.post<ClassifyResult>("/smart-input/classify", { text });
}
