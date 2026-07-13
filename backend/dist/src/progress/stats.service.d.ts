import { PrismaService } from '../prisma/prisma.service';
import { StatsPeriod } from './dto/stats-query.dto';
export declare class StatsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    overview(userId: string, period?: StatsPeriod): Promise<{
        period: "week" | "month" | "all";
        totalWords: number;
        mastered: number;
        learning: number;
        new: number;
        retentionRate: number;
        reviewsCount: number;
        activeDays: number;
        quizzes: {
            count: number;
            avgScorePercent: number;
        };
    }>;
    weakness(userId: string): Promise<{
        weakTopics: {
            topic: string;
            reviews: number;
            accuracy: number;
        }[];
        weakWords: {
            term: string;
            meaning: string;
            fails: number;
        }[];
    }>;
    private periodStart;
    private utcDay;
}
