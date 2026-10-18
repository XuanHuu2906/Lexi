import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { MobileAuthController } from './mobile-auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { PrismaService } from '../prisma/prisma.service';
import { WordsController } from '../words/words.controller';
import { WordsService } from '../words/words.service';
import { ReviewController } from '../review/review.controller';
import { ReviewService } from '../review/review.service';
import { UsersController } from '../users/users.controller';
import { UsersService } from '../users/users.service';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';

// Real HTTP, JWT signature verification, Passport/CSRF/throttle/validation/filter.
// Persistence is replaced here; refresh DB atomicity is tested separately.
describe('Native and web auth HTTP boundaries', () => {
  let app: INestApplication;
  const jwt = new JwtService({
    secret: 'integration-only-never-use-in-production',
  });
  const user = {
    id: 'test-user',
    email: 'fixture@example.invalid',
    disabledAt: null,
    lockedUntil: null,
  };
  const prisma = { user: { findUnique: jest.fn() } };
  const tokens = {
    accessToken: 'synthetic-access',
    refreshToken: 'a'.repeat(64),
    csrfToken: 'synthetic-csrf',
    refreshDays: 30,
    accessExpiresIn: 900,
  };
  const auth = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };
  const words = { create: jest.fn() };
  const review = { answer: jest.fn() };
  const users = { getProfile: jest.fn(), updateSettings: jest.fn() };
  let bearer: string;

  beforeEach(async () => {
    jest.resetAllMocks();
    prisma.user.findUnique.mockResolvedValue(user);
    auth.register.mockResolvedValue({
      user: { id: user.id, email: user.email },
      tokens,
    });
    auth.login.mockResolvedValue({
      user: { id: user.id, email: user.email },
      tokens,
    });
    auth.refresh.mockResolvedValue(tokens);
    auth.logout.mockResolvedValue(undefined);
    words.create.mockResolvedValue({ id: 'word' });
    review.answer.mockResolvedValue({ status: 'LEARNING' });
    users.getProfile.mockResolvedValue({ id: user.id });
    users.updateSettings.mockResolvedValue({ dailyGoal: 10 });
    bearer = jwt.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' },
    );
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }])],
      controllers: [
        AuthController,
        MobileAuthController,
        WordsController,
        ReviewController,
        UsersController,
      ],
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: { get: () => 'integration-only-never-use-in-production' },
        },
        { provide: PrismaService, useValue: prisma },
        { provide: AuthService, useValue: auth },
        { provide: WordsService, useValue: words },
        { provide: ReviewService, useValue: review },
        { provide: UsersService, useValue: users },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: CsrfGuard },
      ],
    }).compile();
    app = module.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });
  afterEach(async () => {
    await app.close();
    jest.restoreAllMocks();
  });

  it.each([
    ['post', '/words', { term: 'apple', meaning: 'fruit' }, 201],
    ['post', '/review/answer', { wordId: 'word', rating: 'good' }, 201],
    ['patch', '/users/me/settings', { dailyGoal: 10 }, 200],
  ] as const)(
    'AUTH-04 Bearer permits %s %s without cookies or CSRF',
    async (method, path, body, status) => {
      await request(app.getHttpServer())
        [method](path)
        .set('Authorization', `Bearer ${bearer}`)
        .send(body)
        .expect(status);
    },
  );
  it('AUTH-01 cookie mutation with valid CSRF succeeds', async () => {
    await request(app.getHttpServer())
      .post('/words')
      .set('Cookie', [`access_token=${bearer}`, 'csrf_token=nonce'])
      .set('X-CSRF-Token', 'nonce')
      .send({ term: 'apple', meaning: 'fruit' })
      .expect(201);
  });
  it.each([undefined, 'Bearer forged', 'Bearer '])(
    'AUTH-02/03 cookies never bypass CSRF via %s',
    async (header) => {
      const req = request(app.getHttpServer())
        .post('/words')
        .set('Cookie', `access_token=${bearer}`)
        .set('X-Client-Type', 'native');
      if (header) req.set('Authorization', header);
      await req.send({ term: 'apple', meaning: 'fruit' }).expect(403);
      expect(words.create).not.toHaveBeenCalled();
    },
  );
  it.each(['invalid', ''])(
    'invalid/empty cookie never falls back to valid Bearer',
    async (cookie) => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', `access_token=${cookie}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(401);
    },
  );
  it('AUTH-09 disables an already-issued valid JWT immediately', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      disabledAt: new Date(),
    });
    await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${bearer}`)
      .expect(401);
  });
  it('rejects empty/forged/expired/deleted-user JWTs', async () => {
    const expired = jwt.sign({ sub: user.id }, { expiresIn: -1 });
    for (const token of ['', 'invalid', expired]) {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    }
    prisma.user.findUnique.mockResolvedValue(null);
    await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${bearer}`)
      .expect(401);
  });
  it.each([
    ['register', 201],
    ['login', 200],
  ] as const)(
    'native %s exposes only safe user and native tokens',
    async (action, status) => {
      const res = await request(app.getHttpServer())
        .post(`/auth/mobile/${action}`)
        .send({ email: user.email, password: 'test-password' })
        .expect(status);
      expect(res.headers['cache-control']).toBe('no-store');
      expect(res.headers['set-cookie']).toBeUndefined();
      expect(res.body).toEqual({
        success: true,
        data: {
          user: { id: user.id, email: user.email },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          accessExpiresIn: 900,
        },
      });
    },
  );
  it('native refresh/logout need only a validated refresh credential, not access JWT', async () => {
    const refreshed = await request(app.getHttpServer())
      .post('/auth/mobile/refresh')
      .send({ refreshToken: tokens.refreshToken })
      .expect(200);
    expect(refreshed.headers['set-cookie']).toBeUndefined();
    expect(Object.keys(refreshed.body.data).sort()).toEqual([
      'accessExpiresIn',
      'accessToken',
      'refreshToken',
    ]);
    const logout = await request(app.getHttpServer())
      .post('/auth/mobile/logout')
      .send({ refreshToken: tokens.refreshToken })
      .expect(200);
    expect(logout.body.data).toEqual({ message: 'Logged out' });
    expect(auth.logout).toHaveBeenCalledWith(tokens.refreshToken);
  });
  it('rejects malformed native bodies and returns no-store even on validation errors', async () => {
    for (const body of [
      {},
      { refreshToken: 'bad' },
      { refreshToken: tokens.refreshToken, userId: 'other' },
    ]) {
      const res = await request(app.getHttpServer())
        .post('/auth/mobile/refresh')
        .send(body)
        .expect(400);
      expect(res.headers['cache-control']).toBe('no-store');
    }
    await request(app.getHttpServer())
      .post('/auth/mobile/register')
      .send({ email: user.email, password: '短'.repeat(30) })
      .expect(400);
    await request(app.getHttpServer())
      .post('/auth/mobile/register')
      .send({ email: user.email, password: 'short' })
      .expect(400);
    expect(auth.refresh).not.toHaveBeenCalled();
    expect(auth.register).not.toHaveBeenCalled();
  });
  it('native login is rate limited', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer())
        .post('/auth/mobile/login')
        .send({ email: user.email, password: 'test-password' })
        .expect(200);
    }
    const limited = await request(app.getHttpServer())
      .post('/auth/mobile/login')
      .send({ email: user.email, password: 'test-password' })
      .expect(429);
    expect(limited.headers['cache-control']).toBe('no-store');
  });
  it('AUTH-12 redacts auth failure diagnostics and query strings', async () => {
    const logged = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    auth.login.mockRejectedValue(
      new Error('synthetic-password synthetic-access synthetic-refresh'),
    );
    const res = await request(app.getHttpServer())
      .post('/auth/mobile/login?token=synthetic-query-secret')
      .send({ email: user.email, password: 'synthetic-password' })
      .expect(500);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.body.path).toBe('/auth/mobile/login');
    expect(JSON.stringify(res.body)).not.toContain('synthetic-');
    expect(logged).toHaveBeenCalledWith('Authentication request failed (500)');
    expect(JSON.stringify(logged.mock.calls)).not.toContain('synthetic-');
  });
  it('AUTH-11 web register/login/refresh/logout retain their cookie/body contract', async () => {
    for (const [action, status] of [
      ['register', 201],
      ['login', 200],
    ] as const) {
      const res = await request(app.getHttpServer())
        .post(`/auth/${action}`)
        .send({ email: user.email, password: 'test-password' })
        .expect(status);
      expect(Object.keys(res.body.data).sort()).toEqual(['csrfToken', 'user']);
      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies.find((c) => c.startsWith('access_token='))).toContain(
        'HttpOnly',
      );
      expect(cookies.find((c) => c.startsWith('refresh_token='))).toContain(
        'Path=/api/auth',
      );
    }
    const refreshed = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', `refresh_token=${tokens.refreshToken}`)
      .expect(200);
    expect(refreshed.body.data).toEqual({ csrfToken: tokens.csrfToken });
    expect(auth.refresh).toHaveBeenCalledWith(tokens.refreshToken);
    const out = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', `refresh_token=${tokens.refreshToken}`)
      .expect(200);
    expect(out.body.data.message).toBe('Logged out');
    expect(out.headers['set-cookie']).toHaveLength(3);
  });
});
