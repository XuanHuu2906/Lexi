"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = exports.ScenarioDifficulty = exports.UserRole = exports.NotificationType = exports.QuizStatus = exports.ChatKind = exports.ConversationStatus = exports.WordStatus = exports.TtsVoice = exports.CefrLevel = exports.AuthProvider = void 0;
exports.AuthProvider = {
    LOCAL: 'LOCAL',
    GOOGLE: 'GOOGLE'
};
exports.CefrLevel = {
    A1: 'A1',
    A2: 'A2',
    B1: 'B1',
    B2: 'B2',
    C1: 'C1',
    C2: 'C2'
};
exports.TtsVoice = {
    EN_US: 'EN_US',
    EN_GB: 'EN_GB'
};
exports.WordStatus = {
    NEW: 'NEW',
    LEARNING: 'LEARNING',
    MASTERED: 'MASTERED'
};
exports.ConversationStatus = {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED'
};
exports.ChatKind = {
    TUTOR: 'TUTOR',
    GRAMMAR: 'GRAMMAR'
};
exports.QuizStatus = {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED'
};
exports.NotificationType = {
    REVIEW_DUE: 'REVIEW_DUE',
    STREAK_RISK: 'STREAK_RISK',
    ENCOURAGEMENT: 'ENCOURAGEMENT',
    BADGE_EARNED: 'BADGE_EARNED',
    SYSTEM: 'SYSTEM'
};
exports.UserRole = {
    LEARNER: 'LEARNER',
    ADMIN: 'ADMIN'
};
exports.ScenarioDifficulty = {
    EASY: 'EASY',
    MEDIUM: 'MEDIUM',
    HARD: 'HARD'
};
exports.AuditAction = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOCK: 'LOCK',
    UNLOCK: 'UNLOCK',
    TOGGLE: 'TOGGLE',
    IMPORT: 'IMPORT',
    EXPORT: 'EXPORT'
};
//# sourceMappingURL=enums.js.map