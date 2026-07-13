import { AuditAction } from '../../../generated/prisma/client';
export declare class ListAuditDto {
    admin?: string;
    action?: AuditAction;
    page?: number;
    limit?: number;
}
