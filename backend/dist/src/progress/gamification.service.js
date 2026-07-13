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
exports.GamificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DAY_MS = 24 * 60 * 60 * 1000;
let GamificationService = class GamificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStreak(userId) {
        const { streak, wordsToday, goal, goalMet } = await this.updateStreak(userId);
        await this.checkBadges(userId);
        return {
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            streakFreezes: streak.streakFreezes,
            lastActiveDate: streak.lastActiveDate,
            today: { wordsReviewed: wordsToday, dailyGoal: goal, goalMet },
        };
    }
    async getBadges(userId) {
        const newlyEarned = await this.checkBadges(userId);
        const [badges, earned] = await Promise.all([
            this.prisma.badge.findMany({ orderBy: { createdAt: 'asc' } }),
            this.prisma.userBadge.findMany({ where: { userId } }),
        ]);
        const earnedAt = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));
        return {
            newlyEarned,
            badges: badges.map((b) => ({
                code: b.code,
                name: b.name,
                description: b.description,
                icon: b.icon,
                earned: earnedAt.has(b.id),
                earnedAt: earnedAt.get(b.id) ?? null,
            })),
        };
    }
    async checkBadges(userId) {
        const [wordCount, quizzes, convCount, streak, allBadges, earnedRows] = await Promise.all([
            this.prisma.word.count({ where: { userId } }),
            this.prisma.quizResult.findMany({
                where: { userId, status: 'COMPLETED' },
                select: { score: true, total: true },
            }),
            this.prisma.conversationLog.count({
                where: { userId, status: 'COMPLETED' },
            }),
            this.prisma.streak.findUnique({ where: { userId } }),
            this.prisma.badge.findMany(),
            this.prisma.userBadge.findMany({
                where: { userId },
                select: { badgeId: true },
            }),
        ]);
        const earnedIds = new Set(earnedRows.map((r) => r.badgeId));
        const hasPerfectQuiz = quizzes.some((q) => q.total > 0 && q.score === q.total);
        const longest = streak?.longestStreak ?? 0;
        const met = {
            first_word: wordCount >= 1,
            word_collector_50: wordCount >= 50,
            streak_7: longest >= 7,
            streak_30: longest >= 30,
            quiz_perfect: hasPerfectQuiz,
            first_conversation: convCount >= 1,
        };
        const toAward = allBadges.filter((b) => !earnedIds.has(b.id) && met[b.code]);
        if (toAward.length) {
            await this.prisma.userBadge.createMany({
                data: toAward.map((b) => ({ userId, badgeId: b.id })),
                skipDuplicates: true,
            });
        }
        return toAward.map((b) => b.code);
    }
    async updateStreak(userId) {
        const [streak, setting] = await Promise.all([
            this.prisma.streak.upsert({
                where: { userId },
                update: {},
                create: { userId },
            }),
            this.prisma.setting.findUnique({
                where: { userId },
                select: { dailyGoal: true },
            }),
        ]);
        const goal = setting?.dailyGoal ?? 10;
        const now = new Date();
        const today = this.utcDay(now);
        const todaysLogs = await this.prisma.reviewLog.findMany({
            where: { userId, reviewedAt: { gte: today } },
            select: { wordId: true },
        });
        const wordsToday = new Set(todaysLogs.map((l) => l.wordId)).size;
        const goalMet = wordsToday >= goal;
        let { currentStreak, longestStreak, streakFreezes } = streak;
        let lastActiveDate = streak.lastActiveDate;
        const last = lastActiveDate ? this.utcDay(lastActiveDate) : null;
        const gap = last ? this.diffDays(today, last) : null;
        let changed = false;
        if (goalMet && gap !== 0) {
            if (gap === 1) {
                currentStreak += 1;
            }
            else if (gap !== null && gap >= 2) {
                const missed = gap - 1;
                if (streakFreezes >= missed) {
                    streakFreezes -= missed;
                    currentStreak += 1;
                }
                else {
                    currentStreak = 1;
                }
            }
            else {
                currentStreak = 1;
            }
            lastActiveDate = today;
            longestStreak = Math.max(longestStreak, currentStreak);
            changed = true;
        }
        else if (!goalMet && gap !== null && gap >= 2) {
            const missed = gap - 1;
            if (streakFreezes >= missed) {
                streakFreezes -= missed;
            }
            else if (currentStreak !== 0) {
                currentStreak = 0;
            }
            changed = true;
        }
        const updated = changed
            ? await this.prisma.streak.update({
                where: { userId },
                data: { currentStreak, longestStreak, streakFreezes, lastActiveDate },
            })
            : streak;
        return { streak: updated, wordsToday, goal, goalMet };
    }
    utcDay(d) {
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    }
    diffDays(a, b) {
        return Math.round((a.getTime() - b.getTime()) / DAY_MS);
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GamificationService);
//# sourceMappingURL=gamification.service.js.map