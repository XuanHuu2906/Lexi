import { ChatService } from './chat.service';
import { CreateChatThreadDto, ListChatThreadsDto, UpdateChatThreadDto } from './dto/chat.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    list(userId: string, query: ListChatThreadsDto): import("../../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        kind: import("../../generated/prisma/enums").ChatKind;
    }[]>;
    get(userId: string, id: string): Promise<{
        id: string;
        kind: import("../../generated/prisma/enums").ChatKind;
        title: string;
        messages: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(userId: string, dto: CreateChatThreadDto): import("../../generated/prisma/models").Prisma__ChatThreadClient<{
        id: string;
        updatedAt: Date;
        title: string;
        kind: import("../../generated/prisma/enums").ChatKind;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    update(userId: string, id: string, dto: UpdateChatThreadDto): Promise<{
        id: string;
        updatedAt: Date;
        title: string;
        kind: import("../../generated/prisma/enums").ChatKind;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
    }>;
}
