import { AuditService } from './audit.service';
import { ListAuditDto } from './dto/list-audit.dto';
export declare class AdminAuditController {
    private readonly audit;
    constructor(audit: AuditService);
    list(query: ListAuditDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            reason: string | null;
            action: import("../../generated/prisma/enums").AuditAction;
            adminEmail: string;
            target: string;
            before: string | null;
            after: string | null;
            adminId: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    admins(): Promise<string[]>;
}
