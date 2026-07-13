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
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../generated/prisma/client");
const ai_service_1 = require("../ai/ai.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ConversationService = class ConversationService {
    prisma;
    ai;
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    async start(userId, scenario) {
        const opening = await this.ai.conversationOpen(scenario);
        const transcript = [
            { role: 'assistant', content: opening },
        ];
        const log = await this.prisma.conversationLog.create({
            data: {
                userId,
                scenario,
                transcript: transcript,
                status: client_1.ConversationStatus.ACTIVE,
            },
        });
        return {
            id: log.id,
            scenario,
            status: log.status,
            opening,
        };
    }
    async reply(userId, id, message) {
        const log = await this.findOwned(userId, id);
        if (log.status === client_1.ConversationStatus.COMPLETED) {
            throw new common_1.BadRequestException('This conversation has ended');
        }
        const transcript = this.transcript(log.transcript);
        const history = transcript.map((e) => ({
            role: e.role,
            content: e.content,
        }));
        const turn = await this.ai.conversationReply(log.scenario, history, message);
        transcript.push({ role: 'user', content: message });
        transcript.push({
            role: 'assistant',
            content: turn.reply,
            feedback: turn.feedback,
            suggestion: turn.suggestion,
        });
        await this.prisma.conversationLog.update({
            where: { id },
            data: { transcript: transcript },
        });
        return turn;
    }
    async end(userId, id) {
        const log = await this.findOwned(userId, id);
        if (log.status === client_1.ConversationStatus.COMPLETED) {
            throw new common_1.BadRequestException('This conversation has already ended');
        }
        const transcript = this.transcript(log.transcript);
        const summary = await this.ai.conversationSummary(log.scenario, transcript.map((e) => ({ role: e.role, content: e.content })));
        await this.prisma.conversationLog.update({
            where: { id },
            data: {
                status: client_1.ConversationStatus.COMPLETED,
                feedback: JSON.stringify(summary),
            },
        });
        return { summary };
    }
    async get(userId, id) {
        const log = await this.findOwned(userId, id);
        const feedback = log.feedback
            ? JSON.parse(log.feedback)
            : null;
        return {
            id: log.id,
            scenario: log.scenario,
            status: log.status,
            transcript: this.transcript(log.transcript),
            feedback,
            createdAt: log.createdAt,
        };
    }
    list(userId) {
        return this.prisma.conversationLog.findMany({
            where: { userId },
            select: {
                id: true,
                scenario: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOwned(userId, id) {
        const log = await this.prisma.conversationLog.findFirst({
            where: { id, userId },
        });
        if (!log) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return log;
    }
    transcript(json) {
        return (json ?? []);
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map