import { CreateWordDto } from './dto/create-word.dto';
import { GenerateExamplesDto } from './dto/generate-examples.dto';
import { ListWordsDto } from './dto/list-words.dto';
import { LookupBatchDto } from './dto/lookup-batch.dto';
import { LookupDto } from './dto/lookup.dto';
import { QuickAddDto } from './dto/quick-add.dto';
import { VerifyWordDto } from './dto/verify-word.dto';
import { WordsService } from './words.service';
export declare class WordsController {
    private readonly wordsService;
    constructor(wordsService: WordsService);
    lookup(dto: LookupDto): Promise<import("../ai/features/dictionary").DictionaryResult>;
    lookupBatch(dto: LookupBatchDto): Promise<{
        items: import("./words.service").BatchLookupItem[];
    }>;
    create(userId: string, dto: CreateWordDto): Promise<{
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
    }>;
    verify(dto: VerifyWordDto): Promise<import("../ai/features/vocab-verify").VocabVerifyResult>;
    quickAdd(userId: string, dto: QuickAddDto): Promise<{
        word: {
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
        };
        isToeicTerm: boolean;
        synonyms: {
            isToeic: boolean;
            word: string;
            meaning: string;
        }[];
    }>;
    list(userId: string, query: ListWordsDto): Promise<{
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
        total: number;
        page: number;
        limit: number;
    }>;
    getOne(userId: string, id: string): Promise<{
        reviewLogs: {
            id: string;
            wordId: string;
            userId: string;
            reviewedAt: Date;
            quality: number;
        }[];
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
    }>;
    remove(userId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    generateExamples(userId: string, id: string, dto: GenerateExamplesDto): Promise<{
        generated: import("../ai/features/examples").ExampleSentence[];
        word: {
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
        };
    }>;
}
