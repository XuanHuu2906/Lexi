import { UserRole } from '../../../generated/prisma/client';
export declare class ListAdminUsersDto {
    search?: string;
    status?: 'active' | 'locked';
    role?: UserRole;
    page?: number;
    limit?: number;
}
export declare class LockUserDto {
    reason: string;
}
