"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const BCRYPT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                setting: { create: {} },
                streak: { create: {} },
            },
        });
        const tokens = await this.issueTokens(user);
        return { user: this.sanitize(user), tokens };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        const invalid = () => new common_1.UnauthorizedException('Invalid email or password');
        if (!user || !user.passwordHash) {
            throw invalid();
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new common_1.ForbiddenException(`Account temporarily locked. Try again after ${user.lockedUntil.toISOString()}`);
        }
        if (user.disabledAt) {
            throw new common_1.ForbiddenException('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
        }
        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok) {
            await this.registerFailedAttempt(user.id, user.failedLoginAttempts);
            throw invalid();
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null, lastActiveAt: new Date() },
        });
        const tokens = await this.issueTokens(user);
        return { user: this.sanitize(user), tokens };
    }
    async refresh(rawToken) {
        const expired = () => new common_1.UnauthorizedException('Session expired');
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
        if (user.disabledAt) {
            throw expired();
        }
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
    async logout(rawToken) {
        if (!rawToken) {
            return;
        }
        const tokenHash = this.hashToken(rawToken);
        await this.prisma.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    async issueTokens(user) {
        const accessToken = await this.signAccessToken(user.id, user.email);
        const refreshDays = this.config.get('JWT_REFRESH_EXPIRES_DAYS', 30);
        const refreshToken = await this.createRefreshToken(user.id, refreshDays);
        const csrfToken = (0, crypto_1.randomBytes)(32).toString('hex');
        return { accessToken, refreshToken, csrfToken, refreshDays };
    }
    signAccessToken(sub, email) {
        const payload = { sub, email };
        return this.jwt.signAsync(payload, {
            expiresIn: this.config.get('JWT_ACCESS_EXPIRES', '15m'),
        });
    }
    async createRefreshToken(userId, refreshDays) {
        const raw = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: { userId, tokenHash: this.hashToken(raw), expiresAt },
        });
        return raw;
    }
    hashToken(raw) {
        return (0, crypto_1.createHash)('sha256').update(raw).digest('hex');
    }
    async registerFailedAttempt(userId, current) {
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
    sanitize(user) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map