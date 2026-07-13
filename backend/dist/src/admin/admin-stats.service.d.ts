import { PrismaService } from '../prisma/prisma.service';
export declare class AdminStatsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    overview(): Promise<{
        totalUsers: number;
        activeUsers: number;
        totalWords: number;
        totalScenarios: number;
        lockedUsers: number;
    }>;
}
