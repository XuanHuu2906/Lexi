import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        provider: import("../../generated/prisma/enums").AuthProvider;
        emailVerified: boolean;
        role: import("../../generated/prisma/enums").UserRole;
        createdAt: Date;
        updatedAt: Date;
        setting: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            dailyGoal: number;
            cefrLevel: import("../../generated/prisma/enums").CefrLevel;
            topics: string[];
            reminderTime: string;
            timeZone: string;
            notifyEnabled: boolean;
            ttsVoice: import("../../generated/prisma/enums").TtsVoice;
        } | null;
        streak: {
            id: string;
            userId: string;
            currentStreak: number;
            longestStreak: number;
            streakFreezes: number;
            lastActiveDate: Date | null;
        } | null;
    }>;
    updateSettings(userId: string, dto: UpdateSettingsDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        dailyGoal: number;
        cefrLevel: import("../../generated/prisma/enums").CefrLevel;
        topics: string[];
        reminderTime: string;
        timeZone: string;
        notifyEnabled: boolean;
        ttsVoice: import("../../generated/prisma/enums").TtsVoice;
    }>;
}
