import type { AiJsonSpec } from './types';
export interface QuizWordInput {
    term: string;
    meaning: string;
}
export interface QuizQuestion {
    term: string;
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
}
export interface QuizResult {
    questions: QuizQuestion[];
}
export declare function buildQuizSpec(words: QuizWordInput[]): AiJsonSpec;
