export interface Sm2State {
    interval: number;
    easeFactor: number;
    repetitions: number;
}
export interface Sm2Result extends Sm2State {
    nextReviewAt: Date;
}
export declare const MAX_INTERVAL = 21;
export declare const MAX_EASE = 2.5;
export declare function sm2(prev: Sm2State, quality: number, now?: Date): Sm2Result;
