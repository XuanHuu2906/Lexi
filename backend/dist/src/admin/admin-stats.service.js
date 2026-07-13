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
exports.AdminStatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminStatsService = class AdminStatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async overview() {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [totalUsers, activeUsers, totalWords, totalScenarios, lockedUsers] = await this.prisma.$transaction([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { lastActiveAt: { gte: since } } }),
            this.prisma.toeicWord.count(),
            this.prisma.conversationScenario.count(),
            this.prisma.user.count({ where: { disabledAt: { not: null } } }),
        ]);
        return { totalUsers, activeUsers, totalWords, totalScenarios, lockedUsers };
    }
};
exports.AdminStatsService = AdminStatsService;
exports.AdminStatsService = AdminStatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminStatsService);
//# sourceMappingURL=admin-stats.service.js.map