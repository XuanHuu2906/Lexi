import { AuditAction, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListAuditDto } from './dto/list-audit.dto';
export interface AuditActor {
    userId: string;
    email: string;
}
export declare function auditActor(user: {
    userId: string;
    email: string;
}): AuditActor;
export interface AuditInput {
    action: AuditAction;
    target: string;
    reason?: string;
    before?: string;
    after?: string;
}
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(actor: AuditActor, input: AuditInput): Prisma.Prisma__AuditLogClient<{
        id: string;
        createdAt: Date;
        adminId: string | null;
        adminEmail: string;
        action: AuditAction;
        target: string;
        reason: string | null;
        before: string | null;
        after: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: Prisma.GlobalOmitConfig | undefined;
    }>;
    list(query: ListAuditDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            adminId: string | null;
            adminEmail: string;
            action: AuditAction;
            target: string;
            reason: string | null;
            before: string | null;
            after: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    admins(): Promise<string[]>;
}
