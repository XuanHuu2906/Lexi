import type { AiJsonSpec } from './types';
export interface WritingIssue {
    original: string;
    correction: string;
    explanation: string;
    type: string;
}
export interface WritingResult {
    correctedText: string;
    issues: WritingIssue[];
    overallComment: string;
    score: number;
}
export declare function buildWritingSpec(text: string): AiJsonSpec;
