import { StatsQueryDto } from './dto/stats-query.dto';
import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    overview(userId: string, query: StatsQueryDto): Promise<{
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
}
