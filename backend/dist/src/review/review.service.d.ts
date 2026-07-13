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
            status: WordStatus;
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
