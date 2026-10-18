import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ChildProcess, fork } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { MobileAuthController } from '../src/auth/mobile-auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { CsrfGuard } from '../src/auth/guards/csrf.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

const dbURL = new URL(process.env.DATABASE_URL ?? 'http://invalid');
if (
  process.env.LEXI_AUTH_DB_TEST !== '1' ||
  dbURL.hostname !== '127.0.0.1' ||
  dbURL.pathname !== '/lexi_phase4_auth'
) {
  throw new Error('Disposable test DB required');
}

describe('Real Next /api rewrite -> Nest auth -> PostgreSQL', () => {
  let app: INestApplication;
  let proxy: ChildProcess;
  let origin: string;
  const prisma = new PrismaService();
  beforeAll(async () => {
    const config = new ConfigService({
      JWT_SECRET: 'synthetic-next-auth-test-secret',
      JWT_ACCESS_EXPIRES: '15m',
      JWT_REFRESH_EXPIRES_DAYS: 30,
    });
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }])],
      controllers: [AuthController, MobileAuthController, UsersController],
      providers: [
        AuthService,
        UsersService,
        JwtStrategy,
        { provide: ConfigService, useValue: config },
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: new JwtService({ secret: config.get('JWT_SECRET') }),
        },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: CsrfGuard },
      ],
    }).compile();
    app = module.createNestApplication({ logger: false });
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
    await app.listen(0, '127.0.0.1');
    proxy = fork(resolve(__dirname, 'next-auth-proxy.cjs'), [], {
      execArgv: [],
      windowsHide: true,
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      env: {
        ...process.env,
        NODE_ENV: 'development',
        NEXT_TELEMETRY_DISABLED: '1',
        BACKEND_URL: await app.getUrl(),
      },
    });
    origin = await new Promise<string>((resolveReady, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Next proxy startup timed out')),
        60000,
      );
      proxy.once('error', reject);
      proxy.once('exit', () => {
        clearTimeout(timeout);
        reject(new Error('Next proxy exited before readiness'));
      });
      proxy.once('message', (value: { port?: number; error?: string }) => {
        clearTimeout(timeout);
        if (value.port) resolveReady(`http://127.0.0.1:${value.port}`);
        else reject(new Error(value.error ?? 'Invalid proxy readiness'));
      });
    });
  }, 90000);
  afterAll(async () => {
    if (proxy && proxy.exitCode === null) {
      await new Promise<void>((done) => {
        const timeout = setTimeout(() => {
          proxy.kill();
          done();
        }, 5000);
        proxy.once('exit', () => {
          clearTimeout(timeout);
          done();
        });
        if (proxy.connected) proxy.send('close');
        else proxy.kill();
      });
    }
    await app?.close();
    await prisma.$disconnect();
  });

  it('preserves browser cookie paths, CSRF, refresh/logout and shares the native account', async () => {
    const account = {
      email: `${randomUUID()}@example.invalid`,
      password: 'Synthetic-password-123',
    };
    const web = request.agent(origin);
    const registration = await web
      .post('/api/auth/register')
      .send(account)
      .expect(201);
    const cookies = registration.headers['set-cookie'] as unknown as string[];
    expect(
      cookies.find((value) => value.startsWith('refresh_token=')),
    ).toContain('Path=/api/auth');
    expect(
      cookies.find((value) => value.startsWith('access_token=')),
    ).toContain('HttpOnly');
    expect(registration.body.data).not.toHaveProperty('accessToken');
    const id = registration.body.data.user.id as string;
    const me = await web.get('/api/users/me').expect(200);
    expect(me.body.data.id).toBe(id);
    await web
      .patch('/api/users/me/settings')
      .send({ dailyGoal: 12 })
      .expect(403);
    await web
      .patch('/api/users/me/settings')
      .set('Authorization', 'Bearer forged')
      .send({ dailyGoal: 12 })
      .expect(403);
    await web
      .patch('/api/users/me/settings')
      .set('X-CSRF-Token', registration.body.data.csrfToken)
      .send({ dailyGoal: 12 })
      .expect(200);
    const login = await web.post('/api/auth/login').send(account).expect(200);
    expect(login.body.data.user.id).toBe(id);
    const refreshed = await web.post('/api/auth/refresh').expect(200);
    await web
      .patch('/api/users/me/settings')
      .set('X-CSRF-Token', refreshed.body.data.csrfToken)
      .send({ dailyGoal: 13 })
      .expect(200);

    const native = await request(app.getHttpServer())
      .post('/auth/mobile/login')
      .send(account)
      .expect(200);
    expect(native.body.data.user.id).toBe(id);
    expect(native.headers['set-cookie']).toBeUndefined();
    const nativeMe = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${native.body.data.accessToken}`)
      .expect(200);
    expect(nativeMe.body.data.setting.dailyGoal).toBe(13);
    await request(app.getHttpServer())
      .patch('/users/me/settings')
      .set('Authorization', `Bearer ${native.body.data.accessToken}`)
      .send({ dailyGoal: 14 })
      .expect(200);
    const webMe = await web.get('/api/users/me').expect(200);
    expect(webMe.body.data.setting.dailyGoal).toBe(14);

    await web.post('/api/auth/logout').expect(200);
    await web.get('/api/users/me').expect(401);
    await web.post('/api/auth/refresh').expect(401);
    const next = await request(app.getHttpServer())
      .post('/auth/mobile/refresh')
      .send({ refreshToken: native.body.data.refreshToken })
      .expect(200);
    await request(app.getHttpServer())
      .post('/auth/mobile/logout')
      .send({ refreshToken: next.body.data.refreshToken })
      .expect(200);
  });
});
