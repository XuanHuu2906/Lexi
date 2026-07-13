export declare const AuthProvider: {
    readonly LOCAL: "LOCAL";
    readonly GOOGLE: "GOOGLE";
};
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];
export declare const CefrLevel: {
    readonly A1: "A1";
    readonly A2: "A2";
    readonly B1: "B1";
    readonly B2: "B2";
    readonly C1: "C1";
    readonly C2: "C2";
};
export type CefrLevel = (typeof CefrLevel)[keyof typeof CefrLevel];
export declare const TtsVoice: {
    readonly EN_US: "EN_US";
    readonly EN_GB: "EN_GB";
};
export type TtsVoice = (typeof TtsVoice)[keyof typeof TtsVoice];
export declare const WordStatus: {
    readonly NEW: "NEW";
    readonly LEARNING: "LEARNING";
    readonly MASTERED: "MASTERED";
};
export type WordStatus = (typeof WordStatus)[keyof typeof WordStatus];
export declare const ConversationStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly COMPLETED: "COMPLETED";
};
export type ConversationStatus = (typeof ConversationStatus)[keyof typeof ConversationStatus];
export declare const ChatKind: {
    readonly TUTOR: "TUTOR";
    readonly GRAMMAR: "GRAMMAR";
};
export type ChatKind = (typeof ChatKind)[keyof typeof ChatKind];
export declare const QuizStatus: {
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly COMPLETED: "COMPLETED";
};
export type QuizStatus = (typeof QuizStatus)[keyof typeof QuizStatus];
export declare const NotificationType: {
    readonly REVIEW_DUE: "REVIEW_DUE";
    readonly STREAK_RISK: "STREAK_RISK";
    readonly ENCOURAGEMENT: "ENCOURAGEMENT";
    readonly BADGE_EARNED: "BADGE_EARNED";
    readonly SYSTEM: "SYSTEM";
};
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
export declare const UserRole: {
    readonly LEARNER: "LEARNER";
    readonly ADMIN: "ADMIN";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const ScenarioDifficulty: {
    readonly EASY: "EASY";
    readonly MEDIUM: "MEDIUM";
    readonly HARD: "HARD";
};
export type ScenarioDifficulty = (typeof ScenarioDifficulty)[keyof typeof ScenarioDifficulty];
export declare const AuditAction: {
    readonly CREATE: "CREATE";
    readonly UPDATE: "UPDATE";
    readonly DELETE: "DELETE";
    readonly LOCK: "LOCK";
    readonly UNLOCK: "UNLOCK";
    readonly TOGGLE: "TOGGLE";
    readonly IMPORT: "IMPORT";
    readonly EXPORT: "EXPORT";
};
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];
