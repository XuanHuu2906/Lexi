import {
  ConflictException,
  ForbiddenException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
import { AuthService, REFRESH_REUSE_GRACE_MS } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

const dbURL = new URL(process.env.DATABASE_URL ?? 'http://invalid');
if (
  process.env.LEXI_AUTH_DB_TEST !== '1' ||
  dbURL.hostname !== '127.0.0.1' ||
  dbURL.pathname !== '/lexi_phase4_auth'
) {
  throw new Error('Run via npm run test:auth:db against a disposable DB only');
}
const hash = (raw: string) => createHash('sha256').update(raw).digest('hex');

describe('AuthService against disposable PostgreSQL', () => {
  const prisma = new PrismaService();
  const jwt = new JwtService({ secret: 'local-auth-db-test-signing-key' });
  const config = new ConfigService({
    JWT_ACCESS_EXPIRES: '15m',
    JWT_REFRESH_EXPIRES_DAYS: 30,
  });
  const auth = new AuthService(prisma, jwt, config);
  const password = 'Synthetic-password-123';
  const account = () =>
    auth.register({ email: `${randomUUID()}@example.invalid`, password });
  beforeAll(async () => {
    await prisma.$connect();
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });
  afterEach(() => jest.restoreAllMocks());

  it('issues opaque hash-only refresh token with expiry and signed access TTL', async () => {
    const result = await account();
    expect(Object.keys(result.user).sort()).toEqual([
      'createdAt',
      'email',
      'emailVerified',
      'id',
      'provider',
      'role',
      'updatedAt',
    ]);
    expect(result.tokens.refreshToken).toMatch(/^[a-f0-9]{64}$/);
    const row = await prisma.refreshToken.findUniqueOrThrow({
      where: { tokenHash: hash(result.tokens.refreshToken) },
    });
    expect(row.expiresAt.getTime()).toBeGreaterThan(Date.now() + 29 * 86400000);
    expect(row.tokenHash).not.toBe(result.tokens.refreshToken);
    const claims = jwt.verify<{ sub: string; exp: number; iat: number }>(
      result.tokens.accessToken,
    );
    expect(claims.sub).toBe(result.user.id);
    expect(claims.exp - claims.iat).toBe(result.tokens.accessExpiresIn);
    const next = await auth.refresh(result.tokens.refreshToken);
    expect(next.refreshToken).not.toBe(result.tokens.refreshToken);
    expect(
      (await prisma.refreshToken.findUniqueOrThrow({ where: { id: row.id } }))
        .revokedAt,
    ).not.toBeNull();
  });
  it('allows exactly one concurrent rotation without revoking the winner', async () => {
    const { user, tokens } = await account();
    const results = await Promise.allSettled(
      Array.from({ length: 5 }, () => auth.refresh(tokens.refreshToken)),
    );
    const winners = results.filter((r) => r.status === 'fulfilled');
    expect(winners).toHaveLength(1);
    for (const result of results)
      if (result.status === 'rejected')
        expect(result.reason).toBeInstanceOf(ConflictException);
    expect(
      await prisma.refreshToken.count({
        where: { userId: user.id, revokedAt: null },
      }),
    ).toBe(1);
    if (winners[0].status === 'fulfilled')
      await expect(
        auth.refresh(winners[0].value.refreshToken),
      ).resolves.toHaveProperty('accessToken');
  });
  it('commits replay revocation of all active user sessions outside the overlap window', async () => {
    const { user, tokens } = await account();
    await auth.refresh(tokens.refreshToken);
    await auth.login({ email: user.email, password });
    await prisma.refreshToken.update({
      where: { tokenHash: hash(tokens.refreshToken) },
      data: { revokedAt: new Date(Date.now() - REFRESH_REUSE_GRACE_MS - 1000) },
    });
    await expect(auth.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(
      await prisma.refreshToken.count({
        where: { userId: user.id, revokedAt: null },
      }),
    ).toBe(0);
  });
  it('rolls back consumption and activity when issuance fails', async () => {
    const { tokens } = await account();
    jest
      .spyOn(jwt, 'signAsync')
      .mockRejectedValueOnce(new Error('synthetic issuance failure'));
    await expect(auth.refresh(tokens.refreshToken)).rejects.toThrow(
      'synthetic issuance failure',
    );
    const row = await prisma.refreshToken.findUniqueOrThrow({
      where: { tokenHash: hash(tokens.refreshToken) },
    });
    expect(row.revokedAt).toBeNull();
    await expect(auth.refresh(tokens.refreshToken)).resolves.toHaveProperty(
      'refreshToken',
    );
  });
  it('logout is idempotent, rejects reuse and leaves the other session valid', async () => {
    const { user, tokens } = await account();
    const other = await auth.login({ email: user.email, password });
    await auth.logout(tokens.refreshToken);
    await auth.logout(tokens.refreshToken);
    await auth.logout('unknown');
    await expect(auth.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
      HttpException,
    );
    await expect(
      auth.refresh(other.tokens.refreshToken),
    ).resolves.toHaveProperty('accessToken');
    const row = await prisma.refreshToken.findUniqueOrThrow({
      where: { tokenHash: hash(tokens.refreshToken) },
    });
    expect(row.revokedAt).not.toBeNull();
  });
  it.each(['disabled', 'locked', 'expired'] as const)(
    'denies %s session refresh',
    async (state) => {
      const { user, tokens } = await account();
      if (state === 'expired')
        await prisma.refreshToken.update({
          where: { tokenHash: hash(tokens.refreshToken) },
          data: { expiresAt: new Date(0) },
        });
      else
        await prisma.user.update({
          where: { id: user.id },
          data:
            state === 'disabled'
              ? { disabledAt: new Date() }
              : { lockedUntil: new Date(Date.now() + 60000) },
        });
      await expect(auth.refresh(tokens.refreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      if (state !== 'expired')
        await expect(
          auth.login({ email: user.email, password }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    },
  );
  it('enforces five failures then allows login after lock expiry', async () => {
    const { user } = await account();
    for (let i = 0; i < 5; i++)
      await expect(
        auth.login({ email: user.email, password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      auth.login({ email: user.email, password }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await prisma.user.update({
      where: { id: user.id },
      data: { lockedUntil: new Date(0) },
    });
    await expect(
      auth.login({ email: user.email, password }),
    ).resolves.toHaveProperty('tokens');
  });
  it('counts concurrent password failures without losing increments', async () => {
    const { user } = await account();
    const results = await Promise.allSettled(
      Array.from({ length: 5 }, () =>
        auth.login({ email: user.email, password: 'wrong' }),
      ),
    );
    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(row.lockedUntil?.getTime()).toBeGreaterThan(Date.now());
    await expect(
      auth.login({ email: user.email, password }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('rolls back registration on token issuance failure', async () => {
    const email = `${randomUUID()}@example.invalid`;
    jest
      .spyOn(jwt, 'signAsync')
      .mockRejectedValueOnce(new Error('synthetic issuance failure'));
    await expect(auth.register({ email, password })).rejects.toThrow(
      'synthetic issuance failure',
    );
    expect(await prisma.user.findUnique({ where: { email } })).toBeNull();
  });
});
