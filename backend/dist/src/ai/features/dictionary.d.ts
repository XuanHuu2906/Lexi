import type { AiJsonSpec, CefrLevel } from './types';
export interface DictionaryExample {
    en: string;
    vi: string;
}
export interface DictionaryResult {
    term: string;
    partOfSpeech: string;
    phonetic: string;
    meaning: string;
    meaningEn: string;
    examples: DictionaryExample[];
    synonyms: string[];
    antonyms: string[];
    contextNote: string;
}
export declare function buildDictionarySpec(term: string, opts?: {
    level?: CefrLevel;
}): AiJsonSpec;
