import { ChatKind, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatThreadDto, UpdateChatThreadDto } from './dto/chat.dto';
export declare class ChatService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(userId: string, kind: ChatKind): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        kind: ChatKind;
    }[]>;
    get(userId: string, id: string): Promise<{
        id: string;
        kind: ChatKind;
        title: string;
        messages: import("@prisma/client/runtime/client").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(userId: string, dto: CreateChatThreadDto): Prisma.Prisma__ChatThreadClient<{
        id: string;
        updatedAt: Date;
        title: string;
        kind: ChatKind;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: Prisma.GlobalOmitConfig | undefined;
    }>;
    update(userId: string, id: string, dto: UpdateChatThreadDto): Promise<{
        id: string;
        updatedAt: Date;
        title: string;
        kind: ChatKind;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
    }>;
    private findOwned;
}
