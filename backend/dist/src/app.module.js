"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const redis_config_1 = require("./config/redis.config");
const env_validation_1 = require("./config/env.validation");
const prisma_module_1 = require("./prisma/prisma.module");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const ai_module_1 = require("./ai/ai.module");
const words_module_1 = require("./words/words.module");
const grammar_module_1 = require("./grammar/grammar.module");
const smart_input_module_1 = require("./smart-input/smart-input.module");
const review_module_1 = require("./review/review.module");
const conversation_module_1 = require("./conversation/conversation.module");
const chat_module_1 = require("./chat/chat.module");
const skills_module_1 = require("./skills/skills.module");
const context_module_1 = require("./context/context.module");
const progress_module_1 = require("./progress/progress.module");
const notification_module_1 = require("./notification/notification.module");
const admin_module_1 = require("./admin/admin.module");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const csrf_guard_1 = require("./auth/guards/csrf.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validate: env_validation_1.validateEnv,
            }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
            schedule_1.ScheduleModule.forRoot(),
            ...(process.env.REDIS_URL
                ? [
                    bullmq_1.BullModule.forRoot({
                        connection: (0, redis_config_1.redisConnectionFromUrl)(process.env.REDIS_URL),
                    }),
                ]
                : []),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            ai_module_1.AiModule,
            words_module_1.WordsModule,
            grammar_module_1.GrammarModule,
            smart_input_module_1.SmartInputModule,
            review_module_1.ReviewModule,
            conversation_module_1.ConversationModule,
            chat_module_1.ChatModule,
            skills_module_1.SkillsModule,
            context_module_1.ContextModule,
            progress_module_1.ProgressModule,
            notification_module_1.NotificationModule,
            admin_module_1.AdminModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: csrf_guard_1.CsrfGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map