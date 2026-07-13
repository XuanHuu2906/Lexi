import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export interface PushPayload {
    title: string;
    body: string;
    url?: string;
}
export declare class PushService implements OnModuleInit {
    private readonly config;
    private readonly prisma;
    private readonly logger;
    private enabled;
    constructor(config: ConfigService, prisma: PrismaService);
    onModuleInit(): void;
    getPublicKey(): string | null;
    sendToUser(userId: string, payload: PushPayload): Promise<void>;
}
