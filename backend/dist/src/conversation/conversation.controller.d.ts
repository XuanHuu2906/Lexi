import { ConversationService } from './conversation.service';
import { ReplyConversationDto, StartConversationDto } from './dto/conversation.dto';
export declare class ConversationController {
    private readonly conversationService;
    constructor(conversationService: ConversationService);
    start(userId: string, dto: StartConversationDto): Promise<{
        id: string;
        scenario: string;
        status: import("../../generated/prisma/enums").ConversationStatus;
        opening: string;
    }>;
    reply(userId: string, id: string, dto: ReplyConversationDto): Promise<import("../ai/features/conversation").ConversationTurnResult>;
    end(userId: string, id: string): Promise<{
        summary: import("../ai/features/conversation").ConversationSummary;
    }>;
    list(userId: string): import("../../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("../../generated/prisma/enums").ConversationStatus;
        scenario: string;
    }[]>;
    get(userId: string, id: string): Promise<{
        id: string;
        scenario: string;
        status: import("../../generated/prisma/enums").ConversationStatus;
        transcript: import("./conversation.service").TranscriptEntry[];
        feedback: import("../ai/features/conversation").ConversationSummary | null;
        createdAt: Date;
    }>;
}
