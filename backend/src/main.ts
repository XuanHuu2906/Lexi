import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Parse cookies so the JWT strategy + CSRF guard can read the auth cookies.
  app.use(cookieParser());

  // Global input validation — strip unknown props, reject on extras, coerce types.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Consistent success / error envelopes.
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Close the DB pool cleanly on shutdown.
  app.get(PrismaService).enableShutdownHooks(app);

  // CORS for the Next.js frontend. Accepts a comma-separated list so a single
  // deploy can serve the production domain plus Vercel preview URLs. `*` (the
  // default) allows any origin but then credentials must be disabled per spec.
  const corsOrigin = config.get<string>('CORS_ORIGIN', '*');
  const origins = corsOrigin.split(',').map((o) => o.trim());
  const allowAll = origins.includes('*');
  app.enableCors({
    origin: allowAll ? '*' : origins,
    credentials: !allowAll,
  });

  // Swagger API docs at /docs.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Lexi API')
    .setDescription('Backend REST API for the Lexi English-learning app')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
  logger.log(`Swagger docs on http://localhost:${port}/docs`);
}
void bootstrap();
