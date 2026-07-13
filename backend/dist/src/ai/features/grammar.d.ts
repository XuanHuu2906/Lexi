import type { AiJsonSpec } from './types';
export interface GrammarNormalizeResult {
    isValid: boolean;
    title: string;
    formula: string;
    explanation: string;
    examples: string[];
}
export declare function buildGrammarNormalizeSpec(rule: string): AiJsonSpec;
export interface GrammarExamplesResult {
    examples: string[];
}
export declare function buildGrammarExamplesSpec(formula: string, explanation: string, count?: number): AiJsonSpec;
