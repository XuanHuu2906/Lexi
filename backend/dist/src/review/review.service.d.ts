import { WordStatus } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AnswerDto } from './dto/answer.dto';
import { FlashcardMode, FlashcardScope } from './dto/flashcards.dto';
export declare class ReviewService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    due(userId: string, limit?: number): Promise<{
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
            status: WordStatus;
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
    flashcards(userId: string, mode?: FlashcardMode, limit?: number, scope?: FlashcardScope): Promise<{
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
    private buildOptions;
    private buildCloze;
    private shuffle;
    private escapeRegExp;
}
