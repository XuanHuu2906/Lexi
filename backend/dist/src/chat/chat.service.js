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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = class ChatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(userId, kind) {
        return this.prisma.chatThread.findMany({
            where: { userId, kind },
            select: {
                id: true,
                kind: true,
                title: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async get(userId, id) {
        const thread = await this.findOwned(userId, id);
        return {
            id: thread.id,
            kind: thread.kind,
            title: thread.title,
            messages: thread.messages,
            createdAt: thread.createdAt,
            updatedAt: thread.updatedAt,
        };
    }
    create(userId, dto) {
        return this.prisma.chatThread.create({
            data: {
                userId,
                kind: dto.kind,
                title: dto.title,
                messages: dto.messages,
            },
            select: { id: true, kind: true, title: true, updatedAt: true },
        });
    }
    async update(userId, id, dto) {
        await this.findOwned(userId, id);
        return this.prisma.chatThread.update({
            where: { id },
            data: {
                messages: dto.messages,
                ...(dto.title ? { title: dto.title } : {}),
            },
            select: { id: true, kind: true, title: true, updatedAt: true },
        });
    }
    async remove(userId, id) {
        await this.findOwned(userId, id);
        await this.prisma.chatThread.delete({ where: { id } });
        return { id };
    }
    async findOwned(userId, id) {
        const thread = await this.prisma.chatThread.findFirst({
            where: { id, userId },
        });
        if (!thread) {
            throw new common_1.NotFoundException('Chat thread not found');
        }
        return thread;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map