import type { AiJsonSpec, CefrLevel } from './types';
export interface VocabVerifyResult {
    isValid: boolean;
    correctedTerm: string;
    meaningVerdict: 'match' | 'mismatch' | 'none';
    partOfSpeech: string;
    phonetic: string;
    meaning: string;
    meaningEn: string;
    examples: {
        en: string;
        vi: string;
    }[];
    synonyms: string[];
    antonyms: string[];
    contextNote: string;
}
export declare function buildVocabVerifySpec(term: string, opts?: {
    userMeaning?: string;
    level?: CefrLevel;
}): AiJsonSpec;
