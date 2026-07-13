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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DAY_MS = 24 * 60 * 60 * 1000;
let StatsService = class StatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async overview(userId, period = 'all') {
        const since = this.periodStart(period);
        const reviewWhere = {
            userId,
            ...(since ? { reviewedAt: { gte: since } } : {}),
        };
        const [byStatus, reviews, quizzes] = await Promise.all([
            this.prisma.word.groupBy({
                by: ['status'],
                where: { userId },
                _count: true,
            }),
            this.prisma.reviewLog.findMany({
                where: reviewWhere,
                select: { quality: true, reviewedAt: true },
            }),
            this.prisma.quizResult.findMany({
                where: {
                    userId,
                    status: 'COMPLETED',
                    ...(since ? { completedAt: { gte: since } } : {}),
                },
                select: { score: true, total: true },
            }),
        ]);
        const counts = {
            NEW: 0,
            LEARNING: 0,
            MASTERED: 0,
        };
        for (const g of byStatus) {
            counts[g.status] = g._count;
        }
        const totalWords = counts.NEW + counts.LEARNING + counts.MASTERED;
        const reviewsCount = reviews.length;
        const correct = reviews.filter((r) => r.quality >= 3).length;
        const retentionRate = reviewsCount
            ? Math.round((correct / reviewsCount) * 100)
            : 0;
        const activeDays = new Set(reviews.map((r) => this.utcDay(r.reviewedAt).getTime())).size;
        const quizCount = quizzes.length;
        const avgScorePercent = quizCount
            ? Math.round((quizzes.reduce((a, q) => a + (q.total ? q.score / q.total : 0), 0) /
                quizCount) *
                100)
            : 0;
        return {
            period,
            totalWords,
            mastered: counts.MASTERED,
            learning: counts.LEARNING,
            new: counts.NEW,
            retentionRate,
            reviewsCount,
            activeDays,
            quizzes: { count: quizCount, avgScorePercent },
        };
    }
    async weakness(userId) {
        const logs = await this.prisma.reviewLog.findMany({
            where: { userId },
            select: {
                quality: true,
                word: { select: { topic: true, term: true, meaning: true } },
            },
            orderBy: { reviewedAt: 'desc' },
            take: 1000,
        });
        const topics = new Map();
        const words = new Map();
        for (const l of logs) {
            const topic = l.word.topic ?? 'Uncategorised';
            const t = topics.get(topic) ?? { reviews: 0, correct: 0 };
            t.reviews++;
            if (l.quality >= 3)
                t.correct++;
            topics.set(topic, t);
            if (l.quality < 3) {
                const w = words.get(l.word.term) ?? {
                    term: l.word.term,
                    meaning: l.word.meaning,
                    fails: 0,
                };
                w.fails++;
                words.set(l.word.term, w);
            }
        }
        const weakTopics = [...topics.entries()]
            .map(([topic, t]) => ({
            topic,
            reviews: t.reviews,
            accuracy: Math.round((t.correct / t.reviews) * 100),
        }))
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 10);
        const weakWords = [...words.values()]
            .sort((a, b) => b.fails - a.fails)
            .slice(0, 10);
        return { weakTopics, weakWords };
    }
    periodStart(period) {
        if (period === 'week')
            return new Date(Date.now() - 7 * DAY_MS);
        if (period === 'month')
            return new Date(Date.now() - 30 * DAY_MS);
        return undefined;
    }
    utcDay(d) {
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map