import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { redisConnectionFromUrl } from './config/redis.config';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { WordsModule } from './words/words.module';
import { GrammarModule } from './grammar/grammar.module';
import { SmartInputModule } from './smart-input/smart-input.module';
import { ReviewModule } from './review/review.module';
import { ConversationModule } from './conversation/conversation.module';
import { ChatModule } from './chat/chat.module';
import { SkillsModule } from './skills/skills.module';
import { ContextModule } from './context/context.module';
import { ProgressModule } from './progress/progress.module';
import { NotificationModule } from './notification/notification.module';
import { AdminModule } from './admin/admin.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CsrfGuard } from './auth/guards/csrf.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // Default rate limit: 60 requests / minute / IP (tighter per-route overrides
    // via @Throttle, e.g. guest word lookup).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ScheduleModule.forRoot(),
    // Reminder job queue (BullMQ). Only wired when REDIS_URL is set — otherwise
    // the app boots without the queue (reminders fall back to being disabled).
    ...(process.env.REDIS_URL
      ? [
          BullModule.forRoot({
            connection: redisConnectionFromUrl(process.env.REDIS_URL),
          }),
        ]
      : []),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    AiModule,
    WordsModule,
    GrammarModule,
    SmartInputModule,
    ReviewModule,
    ConversationModule,
    ChatModule,
    SkillsModule,
    ContextModule,
    ProgressModule,
    NotificationModule,
    AdminModule,
  ],
  providers: [
    // Guard order: rate limit → auth (opt out with @Public()) → CSRF on
    // mutating requests. CSRF runs last so unauthenticated calls get 401
    // before a 403, and it also honours @Public().
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
  ],
})
export class AppModule {}
