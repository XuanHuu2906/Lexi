import { AuditService } from './audit.service';
import { ListAuditDto } from './dto/list-audit.dto';
export declare class AdminAuditController {
    private readonly audit;
    constructor(audit: AuditService);
    list(query: ListAuditDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            adminId: string | null;
            adminEmail: string;
            action: import("../../generated/prisma/enums").AuditAction;
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
