import { AnswerDto } from './dto/answer.dto';
import { DueDto } from './dto/due.dto';
import { FlashcardsDto } from './dto/flashcards.dto';
import { ReviewService } from './review.service';
export declare class ReviewController {
    private readonly reviewService;
    constructor(reviewService: ReviewService);
    due(userId: string, query: DueDto): Promise<{
        items: ({
            srsData: {
                id: string;
                wordId: string;
                interval: number;
                easeFactor: number;
                repetitions: number;
                lastQuality: number | null;
                lastReviewedAt: Date | null;
                nextReviewAt: Date;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            term: string;
            meaning: string;
            phonetic: string | null;
            partOfSpeech: string | null;
            examples: string[];
            synonyms: string[];
            antonyms: string[];
            topic: string | null;
            note: string | null;
            status: import("../../generated/prisma/enums").WordStatus;
            quizzedInCycle: boolean;
        })[];
        count: number;
        total: number;
    }>;
    answer(userId: string, dto: AnswerDto): Promise<{
        srsData: {
            id: string;
            wordId: string;
            interval: number;
            easeFactor: number;
            repetitions: number;
            lastQuality: number | null;
            lastReviewedAt: Date | null;
            nextReviewAt: Date;
        };
        status: "LEARNING" | "MASTERED";
        nextReviewAt: Date;
    }>;
    flashcards(userId: string, query: FlashcardsDto): Promise<{
        mode: "match" | "fill" | "guess" | "listen";
        scope: "due" | "today";
        count: number;
        cards: ({
            wordId: string;
            term: string;
            meaning: string;
            phonetic: string | null;
            examples: string[];
        } | {
            cloze: string | null;
            wordId: string;
            term: string;
            meaning: string;
            phonetic: string | null;
            examples: string[];
        })[];
    }>;
}
