import { ConversationStatus, Prisma } from '../../generated/prisma/client';
import { AiService } from '../ai/ai.service';
import { ConversationSummary } from '../ai/features/conversation';
import { PrismaService } from '../prisma/prisma.service';
export interface TranscriptEntry {
    role: 'user' | 'assistant';
    content: string;
    feedback?: string;
    suggestion?: string;
}
export declare class ConversationService {
    private readonly prisma;
    private readonly ai;
    constructor(prisma: PrismaService, ai: AiService);
    start(userId: string, scenario: string): Promise<{
        id: string;
        scenario: string;
        status: ConversationStatus;
        opening: string;
    }>;
    reply(userId: string, id: string, message: string): Promise<import("../ai/features/conversation").ConversationTurnResult>;
    end(userId: string, id: string): Promise<{
        summary: ConversationSummary;
    }>;
    get(userId: string, id: string): Promise<{
        id: string;
        scenario: string;
        status: ConversationStatus;
        transcript: TranscriptEntry[];
        feedback: ConversationSummary | null;
        createdAt: Date;
    }>;
    list(userId: string): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: ConversationStatus;
        scenario: string;
    }[]>;
    private findOwned;
    private transcript;
}
