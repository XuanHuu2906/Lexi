import type { AiJsonSpec, CefrLevel } from './types';
export interface DictationSentencesResult {
    sentences: string[];
}
export interface DictationFeedbackResult {
    feedback: string;
}
export declare function buildDictationSentencesSpec(opts?: {
    level?: CefrLevel;
    topics?: string[];
    count?: number;
}): AiJsonSpec;
export declare function buildDictationFeedbackSpec(reference: string, attempt: string): AiJsonSpec;
