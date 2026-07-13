"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const prisma_service_1 = require("./prisma/prisma.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    app.use((0, cookie_parser_1.default)());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.get(prisma_service_1.PrismaService).enableShutdownHooks(app);
    const corsOrigin = config.get('CORS_ORIGIN', '*');
    const origins = corsOrigin.split(',').map((o) => o.trim());
    const allowAll = origins.includes('*');
    app.enableCors({
        origin: allowAll ? '*' : origins,
        credentials: !allowAll,
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Lexi API')
        .setDescription('Backend REST API for the Lexi English-learning app')
        .setVersion('1.0')
        .addBearerAuth()
        .addCookieAuth('access_token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = config.get('PORT', 3000);
    await app.listen(port);
    logger.log(`Server running on http://localhost:${port}`);
    logger.log(`Swagger docs on http://localhost:${port}/docs`);
}
void bootstrap();
//# sourceMappingURL=main.js.map