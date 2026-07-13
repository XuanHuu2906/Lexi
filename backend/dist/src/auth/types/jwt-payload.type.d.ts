export interface JwtPayload {
    sub: string;
    email: string;
}
import { UserRole } from '../../../generated/prisma/client';
export interface AuthUser {
    userId: string;
    email: string;
    role?: UserRole;
}
