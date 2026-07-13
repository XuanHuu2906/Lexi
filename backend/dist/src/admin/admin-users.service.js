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
exports.AdminUsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("./audit.service");
const USER_SELECT = {
    id: true,
    email: true,
    role: true,
    createdAt: true,
    lastActiveAt: true,
    disabledAt: true,
    disabledReason: true,
};
let AdminUsersService = class AdminUsersService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async list(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 7;
        const where = {
            ...(query.role ? { role: query.role } : {}),
            ...(query.status === 'active' ? { disabledAt: null } : {}),
            ...(query.status === 'locked' ? { disabledAt: { not: null } } : {}),
            ...(query.search
                ? { email: { contains: query.search, mode: 'insensitive' } }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                select: USER_SELECT,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);
        return { items, total, page, limit };
    }
    async getOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: USER_SELECT,
        });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng.');
        return user;
    }
    async lock(actor, id, reason) {
        if (id === actor.userId) {
            throw new common_1.ForbiddenException('Không thể tự khóa tài khoản của bạn.');
        }
        const user = await this.getOrThrow(id);
        if (user.disabledAt)
            return this.getOne(id);
        const updated = await this.prisma.user.update({
            where: { id },
            data: { disabledAt: new Date(), disabledReason: reason.trim() },
            select: USER_SELECT,
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId: id, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        await this.audit.log(actor, {
            action: 'LOCK',
            target: `Người dùng: ${user.email}`,
            reason: reason.trim(),
            before: 'active',
            after: 'locked',
        });
        return updated;
    }
    async unlock(actor, id, reason) {
        const user = await this.getOrThrow(id);
        if (!user.disabledAt)
            return this.getOne(id);
        const updated = await this.prisma.user.update({
            where: { id },
            data: { disabledAt: null, disabledReason: null },
            select: USER_SELECT,
        });
        await this.audit.log(actor, {
            action: 'UNLOCK',
            target: `Người dùng: ${user.email}`,
            reason: reason.trim(),
            before: 'locked',
            after: 'active',
        });
        return updated;
    }
    async getOrThrow(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, disabledAt: true },
        });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng.');
        return user;
    }
};
exports.AdminUsersService = AdminUsersService;
exports.AdminUsersService = AdminUsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], AdminUsersService);
//# sourceMappingURL=admin-users.service.js.map