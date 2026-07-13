import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Minimal User row shape used by the service.
function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'user-1',
    email: 'test@lexi.app',
    passwordHash: 'hashed',
    provider: 'local',
    emailVerified: false,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    refreshToken: {
      create: jest.Mock;
    };
  };
  let jwt: { signAsync: jest.Mock };
  let config: { get: jest.Mock };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({ id: 'rt-1' }),
      },
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };
    // Return the supplied default for every key (JWT_ACCESS_EXPIRES, etc.).
    config = { get: jest.fn((_key: string, def: unknown) => def) };
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
    );
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('hashes the password and creates user with setting + streak', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashed-pw' as never);
      prisma.user.create.mockResolvedValue(
        makeUser({ passwordHash: 'hashed-pw' }),
      );

      const res = await service.register({
        email: 'test@lexi.app',
        password: 'Str0ngPass!',
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('Str0ngPass!', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@lexi.app',
          passwordHash: 'hashed-pw',
          setting: { create: {} },
          streak: { create: {} },
        },
      });
      // Sensitive fields must never leak to clients.
      expect(res.user).not.toHaveProperty('passwordHash');
      expect(res.user).not.toHaveProperty('failedLoginAttempts');
      expect(res.user).not.toHaveProperty('lockedUntil');
      expect(res.user.email).toBe('test@lexi.app');
    });

    it('rejects a duplicate email with 409', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      await expect(
        service.register({ email: 'test@lexi.app', password: 'Str0ngPass!' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns an access token and sanitized user on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const res = await service.login({
        email: 'test@lexi.app',
        password: 'Str0ngPass!',
      });

      expect(res.tokens.accessToken).toBe('signed.jwt.token');
      expect(res.tokens.refreshToken).toEqual(expect.any(String));
      expect(res.tokens.csrfToken).toEqual(expect.any(String));
      expect(res.user).not.toHaveProperty('passwordHash');
      expect(jwt.signAsync).toHaveBeenCalledWith(
        { sub: 'user-1', email: 'test@lexi.app' },
        { expiresIn: '15m' },
      );
      // A refresh token row is persisted (only its hash).
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
    });

    it('clears accumulated failures on successful login', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ failedLoginAttempts: 3 }),
      );
      mockedBcrypt.compare.mockResolvedValue(true as never);

      await service.login({ email: 'test@lexi.app', password: 'Str0ngPass!' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    });

    it('rejects an unknown email with 401 (no enumeration)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nope@lexi.app', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a wrong password with 401 and records the failed attempt', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ failedLoginAttempts: 1 }),
      );
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'test@lexi.app', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { failedLoginAttempts: 2 },
      });
    });

    it('locks the account on the 5th consecutive failed attempt', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ failedLoginAttempts: 4 }),
      );
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'test@lexi.app', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      const [call] = prisma.user.update.mock.calls[0] as [
        {
          where: { id: string };
          data: { failedLoginAttempts: number; lockedUntil: Date };
        },
      ];
      expect(call.where).toEqual({ id: 'user-1' });
      expect(call.data.failedLoginAttempts).toBe(0);
      expect(call.data.lockedUntil).toBeInstanceOf(Date);
      expect(call.data.lockedUntil.getTime()).toBeGreaterThan(Date.now());
    });

    it('rejects login while the account is locked with 403', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ lockedUntil: new Date(Date.now() + 60_000) }),
      );

      await expect(
        service.login({ email: 'test@lexi.app', password: 'Str0ngPass!' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      // Must not even reach the password check.
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('allows login again once the lock has expired', async () => {
      prisma.user.findUnique.mockResolvedValue(
        makeUser({ lockedUntil: new Date(Date.now() - 60_000) }),
      );
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const res = await service.login({
        email: 'test@lexi.app',
        password: 'Str0ngPass!',
      });
      expect(res.tokens.accessToken).toBe('signed.jwt.token');
    });
  });
});
