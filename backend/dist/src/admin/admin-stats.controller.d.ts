import { AdminStatsService } from './admin-stats.service';
export declare class AdminStatsController {
    private readonly stats;
    constructor(stats: AdminStatsService);
    overview(): Promise<{
        totalUsers: number;
        activeUsers: number;
        totalWords: number;
        totalScenarios: number;
        lockedUsers: number;
    }>;
}
