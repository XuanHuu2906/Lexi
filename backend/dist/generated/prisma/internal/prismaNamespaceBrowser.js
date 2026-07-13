"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonNullValueFilter = exports.NullsOrder = exports.QueryMode = exports.JsonNullValueInput = exports.NullableJsonNullValueInput = exports.SortOrder = exports.PushSubscriptionScalarFieldEnum = exports.NotificationScalarFieldEnum = exports.UserBadgeScalarFieldEnum = exports.BadgeScalarFieldEnum = exports.StreakScalarFieldEnum = exports.ChatThreadScalarFieldEnum = exports.ConversationLogScalarFieldEnum = exports.QuizResultScalarFieldEnum = exports.GrammarRuleScalarFieldEnum = exports.AuditLogScalarFieldEnum = exports.ConversationScenarioScalarFieldEnum = exports.ToeicWordScalarFieldEnum = exports.ReviewLogScalarFieldEnum = exports.SrsDataScalarFieldEnum = exports.WordScalarFieldEnum = exports.SettingScalarFieldEnum = exports.RefreshTokenScalarFieldEnum = exports.UserScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.Decimal = void 0;
const runtime = __importStar(require("@prisma/client/runtime/index-browser"));
exports.Decimal = runtime.Decimal;
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    User: 'User',
    RefreshToken: 'RefreshToken',
    Setting: 'Setting',
    Word: 'Word',
    SrsData: 'SrsData',
    ReviewLog: 'ReviewLog',
    ToeicWord: 'ToeicWord',
    ConversationScenario: 'ConversationScenario',
    AuditLog: 'AuditLog',
    GrammarRule: 'GrammarRule',
    QuizResult: 'QuizResult',
    ConversationLog: 'ConversationLog',
    ChatThread: 'ChatThread',
    Streak: 'Streak',
    Badge: 'Badge',
    UserBadge: 'UserBadge',
    Notification: 'Notification',
    PushSubscription: 'PushSubscription'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.UserScalarFieldEnum = {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    provider: 'provider',
    emailVerified: 'emailVerified',
    role: 'role',
    failedLoginAttempts: 'failedLoginAttempts',
    lockedUntil: 'lockedUntil',
    disabledAt: 'disabledAt',
    disabledReason: 'disabledReason',
    lastActiveAt: 'lastActiveAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.RefreshTokenScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    tokenHash: 'tokenHash',
    expiresAt: 'expiresAt',
    revokedAt: 'revokedAt',
    createdAt: 'createdAt'
};
exports.SettingScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    dailyGoal: 'dailyGoal',
    cefrLevel: 'cefrLevel',
    topics: 'topics',
    reminderTime: 'reminderTime',
    timeZone: 'timeZone',
    notifyEnabled: 'notifyEnabled',
    ttsVoice: 'ttsVoice',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.WordScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    term: 'term',
    meaning: 'meaning',
    phonetic: 'phonetic',
    partOfSpeech: 'partOfSpeech',
    examples: 'examples',
    synonyms: 'synonyms',
    antonyms: 'antonyms',
    topic: 'topic',
    note: 'note',
    status: 'status',
    quizzedInCycle: 'quizzedInCycle',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.SrsDataScalarFieldEnum = {
    id: 'id',
    wordId: 'wordId',
    interval: 'interval',
    easeFactor: 'easeFactor',
    repetitions: 'repetitions',
    lastQuality: 'lastQuality',
    lastReviewedAt: 'lastReviewedAt',
    nextReviewAt: 'nextReviewAt'
};
exports.ReviewLogScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    wordId: 'wordId',
    quality: 'quality',
    reviewedAt: 'reviewedAt'
};
exports.ToeicWordScalarFieldEnum = {
    id: 'id',
    term: 'term',
    display: 'display',
    pos: 'pos',
    ipa: 'ipa',
    meaning: 'meaning',
    group: 'group',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.ConversationScenarioScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    roleHint: 'roleHint',
    difficulty: 'difficulty',
    enabled: 'enabled',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.AuditLogScalarFieldEnum = {
    id: 'id',
    adminId: 'adminId',
    adminEmail: 'adminEmail',
    action: 'action',
    target: 'target',
    reason: 'reason',
    before: 'before',
    after: 'after',
    createdAt: 'createdAt'
};
exports.GrammarRuleScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    title: 'title',
    formula: 'formula',
    explanation: 'explanation',
    examples: 'examples',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.QuizResultScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    score: 'score',
    total: 'total',
    status: 'status',
    questions: 'questions',
    createdAt: 'createdAt',
    completedAt: 'completedAt'
};
exports.ConversationLogScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    scenario: 'scenario',
    transcript: 'transcript',
    feedback: 'feedback',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.ChatThreadScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    kind: 'kind',
    title: 'title',
    messages: 'messages',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.StreakScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    currentStreak: 'currentStreak',
    longestStreak: 'longestStreak',
    streakFreezes: 'streakFreezes',
    lastActiveDate: 'lastActiveDate'
};
exports.BadgeScalarFieldEnum = {
    id: 'id',
    code: 'code',
    name: 'name',
    description: 'description',
    condition: 'condition',
    icon: 'icon',
    createdAt: 'createdAt'
};
exports.UserBadgeScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    badgeId: 'badgeId',
    earnedAt: 'earnedAt'
};
exports.NotificationScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    content: 'content',
    type: 'type',
    read: 'read',
    sentAt: 'sentAt'
};
exports.PushSubscriptionScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    endpoint: 'endpoint',
    p256dh: 'p256dh',
    auth: 'auth',
    createdAt: 'createdAt'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.NullableJsonNullValueInput = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull
};
exports.JsonNullValueInput = {
    JsonNull: exports.JsonNull
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.JsonNullValueFilter = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull,
    AnyNull: exports.AnyNull
};
//# sourceMappingURL=prismaNamespaceBrowser.js.map