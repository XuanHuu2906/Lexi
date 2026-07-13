import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { User } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export type SafeUser = Omit<User, 'passwordHash' | 'failedLoginAttempts' | 'lockedUntil' | 'disabledAt' | 'disabledReason' | 'lastActiveAt'>;
export interface IssuedTokens {
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
    refreshDays: number;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        user: SafeUser;
        tokens: IssuedTokens;
    }>;
    login(dto: LoginDto): Promise<{
        user: SafeUser;
        tokens: IssuedTokens;
    }>;
    refresh(rawToken: string | undefined): Promise<IssuedTokens>;
    logout(rawToken: string | undefined): Promise<void>;
    private issueTokens;
    private signAccessToken;
    private createRefreshToken;
    private hashToken;
    private registerFailedAttempt;
    private sanitize;
}
