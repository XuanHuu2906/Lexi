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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const auth_cookies_1 = require("../auth-cookies");
const prisma_service_1 = require("../../prisma/prisma.service");
const credentialSource = Symbol('validated-credential-source');
function extractCredential(req) {
    delete req[credentialSource];
    const cookies = (req.cookies ?? {});
    if (Object.prototype.hasOwnProperty.call(cookies, auth_cookies_1.ACCESS_COOKIE)) {
        req[credentialSource] = 'cookie';
        return typeof cookies[auth_cookies_1.ACCESS_COOKIE] === 'string'
            ? cookies[auth_cookies_1.ACCESS_COOKIE]
            : null;
    }
    const token = passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token)
        req[credentialSource] = 'bearer';
    return token;
}
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    prisma;
    constructor(config, prisma) {
        const secret = config.get('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET is not configured');
        }
        super({
            jwtFromRequest: extractCredential,
            passReqToCallback: true,
            algorithms: ['HS256'],
            ignoreExpiration: false,
            secretOrKey: secret,
        });
        this.prisma = prisma;
    }
    async validate(req, payload) {
        if (typeof payload?.sub !== 'string' ||
            !payload.sub ||
            !req[credentialSource]) {
            throw new common_1.UnauthorizedException();
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, disabledAt: true, lockedUntil: true },
        });
        if (!user ||
            user.disabledAt ||
            (user.lockedUntil && user.lockedUntil > new Date())) {
            throw new common_1.UnauthorizedException('Session expired');
        }
        return {
            userId: user.id,
            email: user.email,
            authMechanism: req[credentialSource],
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map