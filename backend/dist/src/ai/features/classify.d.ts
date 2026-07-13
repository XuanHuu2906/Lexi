import type { AiJsonSpec } from './types';
export interface ClassifyResult {
    type: 'vocabulary' | 'grammar' | 'unknown';
    confidence: number;
    term: string;
    meaning: string;
    rule: string;
    reason: string;
}
export declare function buildClassifySpec(input: string): AiJsonSpec;
