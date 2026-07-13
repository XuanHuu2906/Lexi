import { api } from "./client";

// Request bodies match the backend DTOs exactly; response shapes mirror the
// AI feature result interfaces.

export interface WritingIssue {
  original: string;
  correction: string;
  explanation: string; // Vietnamese
  type: string; // e.g. grammar, word choice, spelling
}

export interface WritingResult {
  correctedText: string;
  issues: WritingIssue[];
  overallComment: string; // Vietnamese
  score: number; // 0..10
}

export function gradeWriting(text: string): Promise<WritingResult> {
  return api.post<WritingResult>("/writing/grade", { text });
}

export interface PronunciationResult {
  score: number; // 0..100
  transcriptHeard: string;
  mispronounced: string[];
  feedback: string; // Vietnamese
}

export interface ScorePronunciationInput {
  referenceText: string;
  /** WAV recording — scored acoustically by Azure when present. */
  audio?: Blob;
  /** Fallback transcript (Web Speech API) — LLM text comparison. */
  recognizedText?: string;
}

/**
 * UC13 — score pronunciation. With `audio`, uploads the recording as multipart
 * for Azure assessment; otherwise sends `recognizedText` for the LLM fallback.
 */
export function scorePronunciation(
  input: ScorePronunciationInput,
): Promise<PronunciationResult> {
  if (input.audio) {
    const form = new FormData();
    form.append("referenceText", input.referenceText);
    form.append("audio", input.audio, "speech.wav");
    if (input.recognizedText) {
      form.append("recognizedText", input.recognizedText);
    }
    return api.post<PronunciationResult>("/pronunciation/score", form);
  }
  return api.post<PronunciationResult>("/pronunciation/score", {
    referenceText: input.referenceText,
    recognizedText: input.recognizedText,
  });
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface GrammarQaResult {
  answer: string;
}

export function askGrammar(
  question: string,
  history?: ChatTurn[],
): Promise<GrammarQaResult> {
  return api.post<GrammarQaResult>("/grammar-qa/ask", { question, history });
}

/** A vocabulary word Lexi suggests saving from its answer. */
export interface TutorSavableWord {
  term: string; // English word/phrase
  meaning: string; // short Vietnamese meaning
}

/** A grammar/usage point Lexi suggests saving from its answer. */
export interface TutorSavableGrammar {
  title: string; // short label
  rule: string; // clean, generalised restatement (fed to the grammar preview)
}

export interface TutorResult {
  answer: string;
  words: TutorSavableWord[]; // vocabulary worth saving (may be empty)
  grammar: TutorSavableGrammar[]; // grammar points worth saving (may be empty)
}

/** Ask Lexi — general-knowledge tutor chat (any topic, keeps context). */
export function askTutor(
  question: string,
  history?: ChatTurn[],
): Promise<TutorResult> {
  return api.post<TutorResult>("/tutor/ask", { question, history });
}

export interface ContextHighlight {
  word: string;
  meaning: string; // Vietnamese
  reason: string; // why it's hard at this level
}

export interface ContextAnalysis {
  highlights: ContextHighlight[];
  note: string; // overall note (e.g. when nothing is hard)
}

/** UC07 — highlight words worth learning in a passage at the learner's level. */
export function analyzeContext(
  passage: string,
  level?: string,
): Promise<ContextAnalysis> {
  return api.post<ContextAnalysis>("/context/analyze", { passage, level });
}
