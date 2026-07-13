import type { AiJsonSpec } from './types';
export interface ExampleSentence {
    en: string;
    vi: string;
}
export interface ExampleResult {
    word: string;
    examples: ExampleSentence[];
}
export declare function buildExamplesSpec(word: string, opts?: {
    meaning?: string;
    topics?: string[];
    count?: number;
}): AiJsonSpec;
