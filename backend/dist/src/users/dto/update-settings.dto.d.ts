import { CefrLevel, TtsVoice } from '../../../generated/prisma/client';
export declare class UpdateSettingsDto {
    dailyGoal?: number;
    cefrLevel?: CefrLevel;
    topics?: string[];
    reminderTime?: string;
    timeZone?: string;
    notifyEnabled?: boolean;
    ttsVoice?: TtsVoice;
}
