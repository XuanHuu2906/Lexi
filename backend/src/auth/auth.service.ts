import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import type { SignOptions } from 'jsonwebtoken';
import type { User } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.type';

const BCRYPT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

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

/** Freshly minted credentials to be written into cookies by the controller. */
export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  refreshDays: number;
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
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        setting: { create: {} }, // schema defaults
        streak: { create: {} },
      },
    });
    // TODO(Phase 10): send a confirmation email via Resend once RESEND_KEY is set.
    const tokens = await this.issueTokens(user);
    return { user: this.sanitize(user), tokens };
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
      await this.registerFailedAttempt(user.id, user.failedLoginAttempts);
      throw invalid();
    }

    // Success — refresh the activity stamp and clear any accumulated failures.
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastActiveAt: new Date() },
    });

    const tokens = await this.issueTokens(user);
    return { user: this.sanitize(user), tokens };
  }

  /**
   * Rotate a refresh token: validate the presented token, revoke it, and issue
   * a fresh set. Detects reuse of an already-rotated token (possible theft) and
   * revokes the whole family as a precaution.
   */
  async refresh(rawToken: string | undefined): Promise<IssuedTokens> {
    const expired = () => new UnauthorizedException('Session expired');
    if (!rawToken) {
      throw expired();
    }

    const tokenHash = this.hashToken(rawToken);
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!record) {
      throw expired();
    }

    // Reuse of an already-revoked token → treat as compromise, revoke the
    // user's whole token family.
    if (record.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw expired();
    }

    if (record.expiresAt < new Date()) {
      throw expired();
    }

    const user = await this.prisma.user.findUnique({
      where: { id: record.userId },
    });
    if (!user) {
      throw expired();
    }

    // An admin-disabled account cannot refresh (locking also revokes its tokens,
    // but check defensively in case a valid token predates the lock).
    if (user.disabledAt) {
      throw expired();
    }

    // Rotate: revoke the old token, bump activity, then mint a fresh set.
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    return this.issueTokens(user);
  }

  /** Revoke the presented refresh token (best-effort; logout must always succeed). */
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

  private async issueTokens(user: User): Promise<IssuedTokens> {
    const accessToken = await this.signAccessToken(user.id, user.email);
    const refreshDays = this.config.get<number>('JWT_REFRESH_EXPIRES_DAYS', 30);
    const refreshToken = await this.createRefreshToken(user.id, refreshDays);
    const csrfToken = randomBytes(32).toString('hex');
    return { accessToken, refreshToken, csrfToken, refreshDays };
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
  ): Promise<string> {
    const raw = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: this.hashToken(raw), expiresAt },
    });
    return raw;
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private async registerFailedAttempt(
    userId: string,
    current: number,
  ): Promise<void> {
    const attempts = current + 1;
    const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
    await this.prisma.user.update({
      where: { id: userId },
      data: shouldLock
        ? {
            failedLoginAttempts: 0,
            lockedUntil: new Date(Date.now() + LOCK_DURATION_MS),
          }
        : { failedLoginAttempts: attempts },
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
