import { UserRole } from '../../generated/prisma/client';
import type { AuthUser } from '../auth/types/jwt-payload.type';
import { AdminUsersService } from './admin-users.service';
import { ListAdminUsersDto, LockUserDto } from './dto/user.dto';
export declare class AdminUsersController {
    private readonly users;
    constructor(users: AdminUsersService);
    list(query: ListAdminUsersDto): Promise<{
        items: {
            id: string;
            email: string;
            role: UserRole;
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
        role: UserRole;
        disabledAt: Date | null;
        disabledReason: string | null;
        lastActiveAt: Date;
        createdAt: Date;
    }>;
    lock(user: AuthUser, id: string, dto: LockUserDto): Promise<{
        id: string;
        email: string;
        role: UserRole;
        disabledAt: Date | null;
        disabledReason: string | null;
        lastActiveAt: Date;
        createdAt: Date;
    }>;
    unlock(user: AuthUser, id: string, dto: LockUserDto): Promise<{
        id: string;
        email: string;
        role: UserRole;
        disabledAt: Date | null;
        disabledReason: string | null;
        lastActiveAt: Date;
        createdAt: Date;
    }>;
}
