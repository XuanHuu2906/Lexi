import type { AiJsonSpec, CefrLevel } from './types';
export interface HighlightWord {
    word: string;
    meaning: string;
    reason: string;
}
export interface ContextResult {
    highlights: HighlightWord[];
    note: string;
}
export declare function buildContextSpec(passage: string, opts?: {
    level?: CefrLevel;
}): AiJsonSpec;
