"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileAuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const public_decorator_1 = require("./decorators/public.decorator");
const mobile_auth_dto_1 = require("./dto/mobile-auth.dto");
const tokenSchema = {
    type: 'object',
    required: ['accessToken', 'refreshToken', 'accessExpiresIn'],
    properties: {
        accessToken: { type: 'string', description: 'Short-lived Bearer JWT' },
        refreshToken: { type: 'string', description: 'Opaque rotating credential' },
        accessExpiresIn: { type: 'integer', example: 900 },
    },
};
const envelopeSchema = (withUser) => ({
    type: 'object',
    properties: {
        success: { type: 'boolean', example: true },
        data: {
            ...tokenSchema,
            properties: {
                ...tokenSchema.properties,
                ...(withUser
                    ? {
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                email: { type: 'string' },
                                provider: { type: 'string' },
                                emailVerified: { type: 'boolean' },
                                role: { type: 'string' },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' },
                            },
                        },
                    }
                    : {}),
            },
        },
    },
});
let MobileAuthController = class MobileAuthController {
    auth;
    constructor(auth) {
        this.auth = auth;
    }
    async register(dto) {
        const { user, tokens } = await this.auth.register(dto);
        return { user, ...this.nativeTokens(tokens) };
    }
    async login(dto) {
        const { user, tokens } = await this.auth.login(dto);
        return { user, ...this.nativeTokens(tokens) };
    }
    async refresh(dto) {
        return this.nativeTokens(await this.auth.refresh(dto.refreshToken));
    }
    async logout(dto) {
        await this.auth.logout(dto.refreshToken);
        return { message: 'Logged out' };
    }
    nativeTokens(tokens) {
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accessExpiresIn: tokens.accessExpiresIn,
        };
    }
};
exports.MobileAuthController = MobileAuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Register native account; no cookies' }),
    (0, swagger_1.ApiCreatedResponse)({ schema: envelopeSchema(true) }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mobile_auth_dto_1.MobileRegisterDto]),
    __metadata("design:returntype", Promise)
], MobileAuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Log in native client using shared account/lockout policy',
    }),
    (0, swagger_1.ApiOkResponse)({ schema: envelopeSchema(true) }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mobile_auth_dto_1.MobileLoginDto]),
    __metadata("design:returntype", Promise)
], MobileAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(200),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Atomically consume and rotate native refresh credential',
    }),
    (0, swagger_1.ApiOkResponse)({ schema: envelopeSchema(false) }),
    (0, swagger_1.ApiConflictResponse)({
        description: 'Concurrent/recently consumed refresh; never blindly retry the old credential',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mobile_auth_dto_1.MobileRefreshDto]),
    __metadata("design:returntype", Promise)
], MobileAuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(200),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60_000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'Revoke exactly the supplied refresh credential; access JWT not required',
    }),
    (0, swagger_1.ApiOkResponse)({
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: { message: { type: 'string', example: 'Logged out' } },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mobile_auth_dto_1.MobileRefreshDto]),
    __metadata("design:returntype", Promise)
], MobileAuthController.prototype, "logout", null);
exports.MobileAuthController = MobileAuthController = __decorate([
    (0, swagger_1.ApiTags)('native-auth'),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid credential shape' }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Invalid credentials or session expired',
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({ description: 'Rate limited; honor Retry-After' }),
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('auth/mobile'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], MobileAuthController);
//# sourceMappingURL=mobile-auth.controller.js.map