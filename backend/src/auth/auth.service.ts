import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import type { SignOptions } from 'jsonwebtoken';
import type { Prisma, User } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.type';

const BCRYPT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
// Deny overlapping refreshes without revoking the winner's replacement token.
// This window NEVER reissues credentials or extends the consumed token lifetime.
export const REFRESH_REUSE_GRACE_MS = 5_000;

/** User fields safe to return to clients. */
export type SafeUser = Omit<
  User,
  | 'passwordHash'
  | 'failedLoginAttempts'
  | 'lockedUntil'
  | 'disabledAt'
  | 'disabledReason'
  | 'lastActiveAt'
>;

/** Shared issuance result projected into cookie or native JSON transport. */
export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  refreshDays: number;
  accessExpiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ user: SafeUser; tokens: IssuedTokens }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    try {
      return await this.prisma.$transaction(async (db) => {
        const user = await db.user.create({
          data: {
            email: dto.email,
            passwordHash,
            setting: { create: {} },
            streak: { create: {} },
          },
        });
        const tokens = await this.issueTokens(user, db);
        return { user: this.sanitize(user), tokens };
      });
    } catch (error: unknown) {
      // Concurrent registration can pass the precheck but lose the unique insert.
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async login(
    dto: LoginDto,
  ): Promise<{ user: SafeUser; tokens: IssuedTokens }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // Same message whether the email or password is wrong (no user enumeration).
    const invalid = () =>
      new UnauthorizedException('Invalid email or password');

    if (!user || !user.passwordHash) {
      throw invalid();
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(
        `Account temporarily locked. Try again after ${user.lockedUntil.toISOString()}`,
      );
    }

    // Admin-imposed lock (UCA06): stays until an admin unlocks the account.
    if (user.disabledAt) {
      throw new ForbiddenException(
        'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
      );
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      await this.registerFailedAttempt(user.id);
      throw invalid();
    }

    return this.prisma.$transaction(async (db) => {
      await db.$queryRaw`SELECT id FROM users WHERE id = ${user.id} FOR UPDATE`;
      const current = await db.user.findUnique({ where: { id: user.id } });
      if (!current || current.passwordHash !== user.passwordHash)
        throw invalid();
      if (
        current.disabledAt ||
        (current.lockedUntil && current.lockedUntil > new Date())
      ) {
        throw new ForbiddenException('Account locked');
      }
      await db.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastActiveAt: new Date(),
        },
      });
      const tokens = await this.issueTokens(current, db);
      return { user: this.sanitize(current), tokens };
    });
  }

  /**
   * Rotate a refresh token: validate the presented token, revoke it, and issue
   * a fresh set. Detects reuse of an already-rotated token (possible theft) and
   * revokes all active refresh credentials for the user after the overlap window.
   */
  async refresh(rawToken: string | undefined): Promise<IssuedTokens> {
    const expired = () => new UnauthorizedException('Session expired');
    if (!rawToken) {
      throw expired();
    }

    const tokenHash = this.hashToken(rawToken);
    const initial = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!initial) throw expired();

    const outcome = await this.prisma.$transaction(async (db) => {
      // Per-user DB lock also serializes replay revocation against another session's
      // rotation. No in-process lock/cache: works across multiple server instances.
      await db.$queryRaw`SELECT id FROM users WHERE id = ${initial.userId} FOR UPDATE`;
      const record = await db.refreshToken.findUnique({ where: { tokenHash } });
      const now = new Date();
      if (!record) return { kind: 'expired' } as const;
      if (record.revokedAt) {
        if (
          now.getTime() - record.revokedAt.getTime() <=
          REFRESH_REUSE_GRACE_MS
        ) {
          return { kind: 'concurrent' } as const;
        }
        await db.refreshToken.updateMany({
          where: { userId: record.userId, revokedAt: null },
          data: { revokedAt: now },
        });
        // Throw OUTSIDE the transaction so the replay revocation commits.
        return { kind: 'expired' } as const;
      }
      const user = await db.user.findUnique({ where: { id: record.userId } });
      if (
        record.expiresAt <= now ||
        !user ||
        user.disabledAt ||
        (user.lockedUntil && user.lockedUntil > now)
      ) {
        return { kind: 'expired' } as const;
      }
      const consumed = await db.refreshToken.updateMany({
        where: { id: record.id, revokedAt: null, expiresAt: { gt: now } },
        data: { revokedAt: now },
      });
      if (consumed.count !== 1) return { kind: 'concurrent' } as const;
      await db.user.update({
        where: { id: user.id },
        data: { lastActiveAt: now },
      });
      return {
        kind: 'issued',
        tokens: await this.issueTokens(user, db),
      } as const;
    });
    if (outcome.kind === 'concurrent') {
      throw new ConflictException(
        'Refresh credential already consumed; sign in again if the new credential is unavailable',
      );
    }
    if (outcome.kind === 'expired') throw expired();
    return outcome.tokens;
  }

  /** Idempotently revoke exactly this credential. DB errors propagate: never claim false success. */
  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) {
      return;
    }
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(
    user: User,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<IssuedTokens> {
    const accessToken = await this.signAccessToken(user.id, user.email);
    const claims = this.jwt.decode<{ iat?: number; exp?: number }>(accessToken);
    if (
      !Number.isInteger(claims?.iat) ||
      !Number.isInteger(claims?.exp) ||
      Number(claims.exp) <= Number(claims.iat)
    ) {
      throw new InternalServerErrorException(
        'Invalid access token lifetime configuration',
      );
    }
    const accessExpiresIn = Number(claims.exp) - Number(claims.iat);
    const refreshDays = this.config.get<number>('JWT_REFRESH_EXPIRES_DAYS', 30);
    const refreshToken = await this.createRefreshToken(
      user.id,
      refreshDays,
      db,
    );
    const csrfToken = randomBytes(32).toString('hex');
    return {
      accessToken,
      refreshToken,
      csrfToken,
      refreshDays,
      accessExpiresIn,
    };
  }

  private signAccessToken(sub: string, email: string): Promise<string> {
    const payload: JwtPayload = { sub, email };
    return this.jwt.signAsync(payload, {
      expiresIn: this.config.get<string>(
        'JWT_ACCESS_EXPIRES',
        '15m',
      ) as SignOptions['expiresIn'],
    });
  }

  /** Create + persist a refresh token; only its SHA-256 hash is stored. */
  private async createRefreshToken(
    userId: string,
    refreshDays: number,
    db: Prisma.TransactionClient,
  ): Promise<string> {
    const raw = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);
    await db.refreshToken.create({
      data: { userId, tokenHash: this.hashToken(raw), expiresAt },
    });
    return raw;
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private async registerFailedAttempt(userId: string): Promise<void> {
    await this.prisma.$transaction(async (db) => {
      await db.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user || (user.lockedUntil && user.lockedUntil > new Date())) return;
      const attempts = user.failedLoginAttempts + 1;
      await db.user.update({
        where: { id: userId },
        data:
          attempts >= MAX_FAILED_ATTEMPTS
            ? {
                failedLoginAttempts: 0,
                lockedUntil: new Date(Date.now() + LOCK_DURATION_MS),
              }
            : { failedLoginAttempts: attempts },
      });
    });
  }

  private sanitize(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      provider: user.provider,
      emailVerified: user.emailVerified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
