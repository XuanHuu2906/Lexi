import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(userId: string): Promise<{
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
