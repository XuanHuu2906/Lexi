import type { AiJsonSpec } from './types';
export interface PronunciationResult {
    score: number;
    transcriptHeard: string;
    mispronounced: string[];
    feedback: string;
}
export declare function buildPronunciationSpec(reference: string, recognized: string): AiJsonSpec;
export interface AzureWordScore {
    word: string;
    accuracy: number;
    errorType: string;
}
export interface AzureAssessment {
    accuracy: number;
    fluency: number;
    completeness: number;
    pronunciation: number;
    transcript: string;
    words: AzureWordScore[];
}
export declare function buildPronunciationFeedbackSpec(reference: string, a: AzureAssessment): AiJsonSpec;
export declare function buildAzureFeedbackFallback(a: AzureAssessment, mispronounced: string[]): string;
