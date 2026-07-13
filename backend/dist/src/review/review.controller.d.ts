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
                interval: number;
                easeFactor: number;
                repetitions: number;
                id: string;
                lastQuality: number | null;
                lastReviewedAt: Date | null;
                nextReviewAt: Date;
                wordId: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            meaning: string;
            term: string;
            examples: string[];
            userId: string;
            note: string | null;
            partOfSpeech: string | null;
            phonetic: string | null;
            synonyms: string[];
            antonyms: string[];
            topic: string | null;
            status: import("../../generated/prisma/enums").WordStatus;
            quizzedInCycle: boolean;
        })[];
        count: number;
        total: number;
    }>;
    answer(userId: string, dto: AnswerDto): Promise<{
        srsData: {
            interval: number;
            easeFactor: number;
            repetitions: number;
            id: string;
            lastQuality: number | null;
            lastReviewedAt: Date | null;
            nextReviewAt: Date;
            wordId: string;
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
