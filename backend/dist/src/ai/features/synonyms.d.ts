import type { AiJsonSpec } from './types';
export interface SynonymItem {
    word: string;
    meaning: string;
}
export interface SynonymResult {
    word: string;
    synonyms: SynonymItem[];
}
export declare function buildSynonymsSpec(word: string, opts?: {
    meaning?: string;
    limit?: number;
}): AiJsonSpec;
