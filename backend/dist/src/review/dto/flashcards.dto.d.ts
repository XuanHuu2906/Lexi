export declare const FLASHCARD_MODES: readonly ["guess", "listen", "fill", "match"];
export type FlashcardMode = (typeof FLASHCARD_MODES)[number];
export declare const FLASHCARD_SCOPES: readonly ["due", "today"];
export type FlashcardScope = (typeof FLASHCARD_SCOPES)[number];
export declare class FlashcardsDto {
    mode?: FlashcardMode;
    scope?: FlashcardScope;
    limit?: number;
}
