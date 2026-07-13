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
exports.AdminScenariosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("./audit.service");
let AdminScenariosService = class AdminScenariosService {
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
            ...(query.difficulty ? { difficulty: query.difficulty } : {}),
            ...(query.status ? { enabled: query.status === 'on' } : {}),
            ...(query.search
                ? {
                    OR: [
                        { name: { contains: query.search, mode: 'insensitive' } },
                        { description: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.conversationScenario.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.conversationScenario.count({ where }),
        ]);
        return { items, total, page, limit };
    }
    async create(actor, dto) {
        const name = dto.name.trim();
        await this.ensureUniqueName(name);
        const row = await this.prisma.conversationScenario.create({
            data: {
                name,
                description: dto.description.trim(),
                roleHint: dto.roleHint.trim(),
                difficulty: dto.difficulty,
            },
        });
        await this.audit.log(actor, {
            action: 'CREATE',
            target: `Tình huống: ${name}`,
        });
        return row;
    }
    async update(actor, id, dto) {
        const existing = await this.getOrThrow(id);
        const data = {};
        if (dto.name !== undefined) {
            const name = dto.name.trim();
            if (name.toLowerCase() !== existing.name.toLowerCase())
                await this.ensureUniqueName(name);
            data.name = name;
        }
        if (dto.description !== undefined)
            data.description = dto.description.trim();
        if (dto.roleHint !== undefined)
            data.roleHint = dto.roleHint.trim();
        if (dto.difficulty !== undefined)
            data.difficulty = dto.difficulty;
        const row = await this.prisma.conversationScenario.update({
            where: { id },
            data,
        });
        await this.audit.log(actor, {
            action: 'UPDATE',
            target: `Tình huống: ${row.name}`,
        });
        return row;
    }
    async remove(actor, id) {
        const existing = await this.getOrThrow(id);
        await this.prisma.conversationScenario.delete({ where: { id } });
        await this.audit.log(actor, {
            action: 'DELETE',
            target: `Tình huống: ${existing.name}`,
        });
        return { deleted: true };
    }
    async toggle(actor, id) {
        const existing = await this.getOrThrow(id);
        const enabled = !existing.enabled;
        const row = await this.prisma.conversationScenario.update({
            where: { id },
            data: { enabled },
        });
        await this.audit.log(actor, {
            action: 'TOGGLE',
            target: `Tình huống: ${existing.name}`,
            before: existing.enabled ? 'Hiển thị' : 'Đã ẩn',
            after: enabled ? 'Hiển thị' : 'Đã ẩn',
        });
        return row;
    }
    async duplicate(actor, id) {
        const existing = await this.getOrThrow(id);
        let name = `${existing.name} (bản sao)`;
        for (let n = 2; await this.nameTaken(name); n++) {
            name = `${existing.name} (bản sao ${n})`;
        }
        const row = await this.prisma.conversationScenario.create({
            data: {
                name,
                description: existing.description,
                roleHint: existing.roleHint,
                difficulty: existing.difficulty,
                enabled: false,
            },
        });
        await this.audit.log(actor, {
            action: 'CREATE',
            target: `Tình huống: ${name}`,
        });
        return row;
    }
    async ensureUniqueName(name) {
        if (await this.nameTaken(name)) {
            throw new common_1.ConflictException(`Tình huống "${name}" đã tồn tại.`);
        }
    }
    async nameTaken(name) {
        const row = await this.prisma.conversationScenario.findUnique({
            where: { name },
            select: { id: true },
        });
        return !!row;
    }
    async getOrThrow(id) {
        const row = await this.prisma.conversationScenario.findUnique({
            where: { id },
        });
        if (!row)
            throw new common_1.NotFoundException('Không tìm thấy tình huống.');
        return row;
    }
};
exports.AdminScenariosService = AdminScenariosService;
exports.AdminScenariosService = AdminScenariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], AdminScenariosService);
//# sourceMappingURL=admin-scenarios.service.js.map