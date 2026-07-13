export declare enum ReviewRating {
    FORGOT = "forgot",
    HARD = "hard",
    GOOD = "good",
    EASY = "easy"
}
export declare const RATING_QUALITY: Record<ReviewRating, number>;
export declare class AnswerDto {
    wordId: string;
    rating: ReviewRating;
}
