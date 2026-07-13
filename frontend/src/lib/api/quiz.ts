import { api } from "./client";

export interface QuizQuestion {
  index: number;
  term: string;
  question: string;
  options: string[];
  userAnswer?: number | null;
  answerIndex?: number; // only present once completed
  explanation?: string; // only present once completed
}

export interface GeneratedQuiz {
  quizId: string;
  total: number;
  questions: QuizQuestion[];
}

export interface QuizState {
  quizId: string;
  total: number;
  score: number;
  status: "IN_PROGRESS" | "COMPLETED";
  questions: QuizQuestion[];
}

export interface QuizResult {
  quizId: string;
  score: number;
  total: number;
  results: {
    index: number;
    correct: boolean;
    yourAnswer: number;
    answerIndex: number;
    explanation: string;
  }[];
}

export function generateQuiz(count?: number): Promise<GeneratedQuiz> {
  return api.post<GeneratedQuiz>("/quiz/generate", { count });
}

export function getQuiz(id: string): Promise<QuizState> {
  return api.get<QuizState>(`/quiz/${id}`);
}

export function submitQuiz(
  quizId: string,
  answers: number[],
): Promise<QuizResult> {
  return api.post<QuizResult>("/quiz/submit", { quizId, answers });
}

export function saveQuizProgress(
  id: string,
  answers: number[],
): Promise<{ saved: boolean }> {
  return api.patch<{ saved: boolean }>(`/quiz/${id}/progress`, { answers });
}
