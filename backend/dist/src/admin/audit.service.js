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
exports.AuditService = void 0;
exports.auditActor = auditActor;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function auditActor(user) {
    return { userId: user.userId, email: user.email };
}
let AuditService = class AuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    log(actor, input) {
        return this.prisma.auditLog.create({
            data: {
                adminId: actor.userId,
                adminEmail: actor.email,
                action: input.action,
                target: input.target,
                reason: input.reason,
                before: input.before,
                after: input.after,
            },
        });
    }
    async list(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {
            ...(query.admin ? { adminEmail: query.admin } : {}),
            ...(query.action ? { action: query.action } : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return { items, total, page, limit };
    }
    async admins() {
        const rows = await this.prisma.auditLog.findMany({
            distinct: ['adminEmail'],
            select: { adminEmail: true },
            orderBy: { adminEmail: 'asc' },
        });
        return rows.map((r) => r.adminEmail);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map