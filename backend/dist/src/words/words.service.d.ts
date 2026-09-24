import { AiService } from '../ai/ai.service';
import { DictionaryResult } from '../ai/features/dictionary';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWordDto } from './dto/create-word.dto';
import { GenerateExamplesDto } from './dto/generate-examples.dto';
import { ListWordsDto } from './dto/list-words.dto';
import { LookupBatchDto } from './dto/lookup-batch.dto';
import { LookupDto } from './dto/lookup.dto';
import { QuickAddDto } from './dto/quick-add.dto';
import { VerifyWordDto } from './dto/verify-word.dto';
export interface BatchLookupItem {
    term: string;
    result: DictionaryResult | null;
    error: string | null;
}
export declare class WordsService {
    private readonly prisma;
    private readonly ai;
    constructor(prisma: PrismaService, ai: AiService);
    lookup(dto: LookupDto): Promise<DictionaryResult>;
    lookupBatch(dto: LookupBatchDto): Promise<{
        items: BatchLookupItem[];
    }>;
    verify(dto: VerifyWordDto): Promise<import("../ai/features/vocab-verify").VocabVerifyResult>;
    create(userId: string, dto: CreateWordDto): Promise<{
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
    }>;
    quickAdd(userId: string, dto: QuickAddDto): Promise<{
        word: {
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
        };
        isToeicTerm: boolean;
        synonyms: {
            isToeic: boolean;
            word: string;
            meaning: string;
        }[];
    }>;
    private toeicTerms;
    private markToeic;
    list(userId: string, query: ListWordsDto): Promise<{
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
        total: number;
        page: number;
        limit: number;
    }>;
    getOne(userId: string, id: string): Promise<{
        reviewLogs: {
            id: string;
            userId: string;
            wordId: string;
            quality: number;
            reviewedAt: Date;
        }[];
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
    }>;
    remove(userId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    generateExamples(userId: string, id: string, dto: GenerateExamplesDto): Promise<{
        generated: import("../ai/features/examples").ExampleSentence[];
        word: {
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
        };
    }>;
}
