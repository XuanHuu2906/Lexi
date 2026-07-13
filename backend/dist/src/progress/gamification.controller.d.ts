import { GamificationService } from './gamification.service';
export declare class GamificationController {
    private readonly gamification;
    constructor(gamification: GamificationService);
    streak(userId: string): Promise<{
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
    badges(userId: string): Promise<{
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
}
