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
exports.GrammarService = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("../ai/ai.service");
const prisma_service_1 = require("../prisma/prisma.service");
let GrammarService = class GrammarService {
    prisma;
    ai;
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    preview(rule) {
        return this.ai.normalizeGrammar(rule.trim());
    }
    create(userId, dto) {
        return this.prisma.grammarRule.create({
            data: {
                userId,
                title: dto.title,
                formula: dto.formula,
                explanation: dto.explanation,
                examples: dto.examples ?? [],
            },
        });
    }
    async list(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {
            userId,
            ...(query.search
                ? {
                    OR: [
                        { title: { contains: query.search, mode: 'insensitive' } },
                        { formula: { contains: query.search, mode: 'insensitive' } },
                        { explanation: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.grammarRule.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.grammarRule.count({ where }),
        ]);
        return { items, total, page, limit };
    }
    async getOne(userId, id) {
        const rule = await this.prisma.grammarRule.findFirst({
            where: { id, userId },
        });
        if (!rule) {
            throw new common_1.NotFoundException('Grammar rule not found');
        }
        return rule;
    }
    async update(userId, id, dto) {
        await this.getOne(userId, id);
        return this.prisma.grammarRule.update({ where: { id }, data: dto });
    }
    async remove(userId, id) {
        await this.getOne(userId, id);
        await this.prisma.grammarRule.delete({ where: { id } });
        return { deleted: true };
    }
    async generateExamples(userId, id, dto) {
        const rule = await this.getOne(userId, id);
        const result = await this.ai.grammarExamples(rule.formula, rule.explanation, dto.count);
        const updated = await this.prisma.grammarRule.update({
            where: { id },
            data: { examples: [...rule.examples, ...result.examples] },
        });
        return { generated: result.examples, rule: updated };
    }
};
exports.GrammarService = GrammarService;
exports.GrammarService = GrammarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], GrammarService);
//# sourceMappingURL=grammar.service.js.map