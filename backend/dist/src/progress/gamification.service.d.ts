import { PrismaService } from '../prisma/prisma.service';
export declare class GamificationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStreak(userId: string): Promise<{
        currentStreak: number;
        longestStreak: number;
        streakFreezes: number;
        lastActiveDate: Date | null;
        today: {
            wordsReviewed: number;
            dailyGoal: number;
            goalMet: boolean;
        };
    }>;
    getBadges(userId: string): Promise<{
        newlyEarned: string[];
        badges: {
            code: string;
            name: string;
            description: string;
            icon: string | null;
            earned: boolean;
            earnedAt: Date | null;
        }[];
    }>;
    checkBadges(userId: string): Promise<string[]>;
    private updateStreak;
    private utcDay;
    private diffDays;
}
