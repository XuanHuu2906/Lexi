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
exports.CsrfGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const crypto_1 = require("crypto");
const auth_cookies_1 = require("../auth-cookies");
const public_decorator_1 = require("../decorators/public.decorator");
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
let CsrfGuard = class CsrfGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        if (SAFE_METHODS.has(req.method.toUpperCase())) {
            return true;
        }
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const cookies = (req.cookies ?? {});
        const cookieToken = cookies[auth_cookies_1.CSRF_COOKIE];
        const headerToken = req.headers[auth_cookies_1.CSRF_HEADER];
        if (!cookieToken ||
            typeof headerToken !== 'string' ||
            !this.safeEqual(cookieToken, headerToken)) {
            throw new common_1.ForbiddenException('Invalid or missing CSRF token');
        }
        return true;
    }
    safeEqual(a, b) {
        const ab = Buffer.from(a);
        const bb = Buffer.from(b);
        if (ab.length !== bb.length) {
            return false;
        }
        return (0, crypto_1.timingSafeEqual)(ab, bb);
    }
};
exports.CsrfGuard = CsrfGuard;
exports.CsrfGuard = CsrfGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], CsrfGuard);
//# sourceMappingURL=csrf.guard.js.map