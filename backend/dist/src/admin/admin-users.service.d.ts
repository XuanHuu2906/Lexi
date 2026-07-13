import { PrismaService } from '../prisma/prisma.service';
import { AuditActor, AuditService } from './audit.service';
import { ListAdminUsersDto } from './dto/user.dto';
export declare class AdminUsersService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(query: ListAdminUsersDto): Promise<{
        items: {
            id: string;
            email: string;
            role: import("../../generated/prisma/enums").UserRole;
            disabledAt: Date | null;
            disabledReason: string | null;
            lastActiveAt: Date;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getOne(id: string): Promise<{
        id: string;
        email: string;
        role: import("../../generated/prisma/enums").UserRole;
        disabledAt: Date | null;
        disabledReason: string | null;
        lastActiveAt: Date;
        createdAt: Date;
    }>;
    lock(actor: AuditActor, id: string, reason: string): Promise<{
        id: string;
        email: string;
        role: import("../../generated/prisma/enums").UserRole;
        disabledAt: Date | null;
        disabledReason: string | null;
        lastActiveAt: Date;
        createdAt: Date;
    }>;
    unlock(actor: AuditActor, id: string, reason: string): Promise<{
        id: string;
        email: string;
        role: import("../../generated/prisma/enums").UserRole;
        disabledAt: Date | null;
        disabledReason: string | null;
        lastActiveAt: Date;
        createdAt: Date;
    }>;
    private getOrThrow;
}
