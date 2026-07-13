declare const CEFR: readonly ["A1", "A2", "B1", "B2", "C1", "C2"];
type Cefr = (typeof CEFR)[number];
export declare class AnalyzeContextDto {
    passage: string;
    level?: Cefr;
}
export {};
