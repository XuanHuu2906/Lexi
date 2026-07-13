import type { AiJsonSpec, ChatMessage } from './types';
export interface TutorSavableWord {
    term: string;
    meaning: string;
}
export interface TutorSavableGrammar {
    title: string;
    rule: string;
}
export interface TutorResult {
    answer: string;
    words: TutorSavableWord[];
    grammar: TutorSavableGrammar[];
}
export declare function buildTutorSpec(history: ChatMessage[], question: string): AiJsonSpec;
