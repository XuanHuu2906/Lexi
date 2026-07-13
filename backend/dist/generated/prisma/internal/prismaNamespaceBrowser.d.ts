import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models';
export type * from './prismaNamespace';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly RefreshToken: "RefreshToken";
    readonly Setting: "Setting";
    readonly Word: "Word";
    readonly SrsData: "SrsData";
    readonly ReviewLog: "ReviewLog";
    readonly ToeicWord: "ToeicWord";
    readonly ConversationScenario: "ConversationScenario";
    readonly AuditLog: "AuditLog";
    readonly GrammarRule: "GrammarRule";
    readonly QuizResult: "QuizResult";
    readonly ConversationLog: "ConversationLog";
    readonly ChatThread: "ChatThread";
    readonly Streak: "Streak";
    readonly Badge: "Badge";
    readonly UserBadge: "UserBadge";
    readonly Notification: "Notification";
    readonly PushSubscription: "PushSubscription";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly passwordHash: "passwordHash";
    readonly provider: "provider";
    readonly emailVerified: "emailVerified";
    readonly role: "role";
    readonly failedLoginAttempts: "failedLoginAttempts";
    readonly lockedUntil: "lockedUntil";
    readonly disabledAt: "disabledAt";
    readonly disabledReason: "disabledReason";
    readonly lastActiveAt: "lastActiveAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const RefreshTokenScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly tokenHash: "tokenHash";
    readonly expiresAt: "expiresAt";
    readonly revokedAt: "revokedAt";
    readonly createdAt: "createdAt";
};
export type RefreshTokenScalarFieldEnum = (typeof RefreshTokenScalarFieldEnum)[keyof typeof RefreshTokenScalarFieldEnum];
export declare const SettingScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly dailyGoal: "dailyGoal";
    readonly cefrLevel: "cefrLevel";
    readonly topics: "topics";
    readonly reminderTime: "reminderTime";
    readonly timeZone: "timeZone";
    readonly notifyEnabled: "notifyEnabled";
    readonly ttsVoice: "ttsVoice";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type SettingScalarFieldEnum = (typeof SettingScalarFieldEnum)[keyof typeof SettingScalarFieldEnum];
export declare const WordScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly term: "term";
    readonly meaning: "meaning";
    readonly phonetic: "phonetic";
    readonly partOfSpeech: "partOfSpeech";
    readonly examples: "examples";
    readonly synonyms: "synonyms";
    readonly antonyms: "antonyms";
    readonly topic: "topic";
    readonly note: "note";
    readonly status: "status";
    readonly quizzedInCycle: "quizzedInCycle";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type WordScalarFieldEnum = (typeof WordScalarFieldEnum)[keyof typeof WordScalarFieldEnum];
export declare const SrsDataScalarFieldEnum: {
    readonly id: "id";
    readonly wordId: "wordId";
    readonly interval: "interval";
    readonly easeFactor: "easeFactor";
    readonly repetitions: "repetitions";
    readonly lastQuality: "lastQuality";
    readonly lastReviewedAt: "lastReviewedAt";
    readonly nextReviewAt: "nextReviewAt";
};
export type SrsDataScalarFieldEnum = (typeof SrsDataScalarFieldEnum)[keyof typeof SrsDataScalarFieldEnum];
export declare const ReviewLogScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly wordId: "wordId";
    readonly quality: "quality";
    readonly reviewedAt: "reviewedAt";
};
export type ReviewLogScalarFieldEnum = (typeof ReviewLogScalarFieldEnum)[keyof typeof ReviewLogScalarFieldEnum];
export declare const ToeicWordScalarFieldEnum: {
    readonly id: "id";
    readonly term: "term";
    readonly display: "display";
    readonly pos: "pos";
    readonly ipa: "ipa";
    readonly meaning: "meaning";
    readonly group: "group";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ToeicWordScalarFieldEnum = (typeof ToeicWordScalarFieldEnum)[keyof typeof ToeicWordScalarFieldEnum];
export declare const ConversationScenarioScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly roleHint: "roleHint";
    readonly difficulty: "difficulty";
    readonly enabled: "enabled";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ConversationScenarioScalarFieldEnum = (typeof ConversationScenarioScalarFieldEnum)[keyof typeof ConversationScenarioScalarFieldEnum];
export declare const AuditLogScalarFieldEnum: {
    readonly id: "id";
    readonly adminId: "adminId";
    readonly adminEmail: "adminEmail";
    readonly action: "action";
    readonly target: "target";
    readonly reason: "reason";
    readonly before: "before";
    readonly after: "after";
    readonly createdAt: "createdAt";
};
export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum];
export declare const GrammarRuleScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly title: "title";
    readonly formula: "formula";
    readonly explanation: "explanation";
    readonly examples: "examples";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type GrammarRuleScalarFieldEnum = (typeof GrammarRuleScalarFieldEnum)[keyof typeof GrammarRuleScalarFieldEnum];
export declare const QuizResultScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly score: "score";
    readonly total: "total";
    readonly status: "status";
    readonly questions: "questions";
    readonly createdAt: "createdAt";
    readonly completedAt: "completedAt";
};
export type QuizResultScalarFieldEnum = (typeof QuizResultScalarFieldEnum)[keyof typeof QuizResultScalarFieldEnum];
export declare const ConversationLogScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly scenario: "scenario";
    readonly transcript: "transcript";
    readonly feedback: "feedback";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ConversationLogScalarFieldEnum = (typeof ConversationLogScalarFieldEnum)[keyof typeof ConversationLogScalarFieldEnum];
export declare const ChatThreadScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly kind: "kind";
    readonly title: "title";
    readonly messages: "messages";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ChatThreadScalarFieldEnum = (typeof ChatThreadScalarFieldEnum)[keyof typeof ChatThreadScalarFieldEnum];
export declare const StreakScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly currentStreak: "currentStreak";
    readonly longestStreak: "longestStreak";
    readonly streakFreezes: "streakFreezes";
    readonly lastActiveDate: "lastActiveDate";
};
export type StreakScalarFieldEnum = (typeof StreakScalarFieldEnum)[keyof typeof StreakScalarFieldEnum];
export declare const BadgeScalarFieldEnum: {
    readonly id: "id";
    readonly code: "code";
    readonly name: "name";
    readonly description: "description";
    readonly condition: "condition";
    readonly icon: "icon";
    readonly createdAt: "createdAt";
};
export type BadgeScalarFieldEnum = (typeof BadgeScalarFieldEnum)[keyof typeof BadgeScalarFieldEnum];
export declare const UserBadgeScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly badgeId: "badgeId";
    readonly earnedAt: "earnedAt";
};
export type UserBadgeScalarFieldEnum = (typeof UserBadgeScalarFieldEnum)[keyof typeof UserBadgeScalarFieldEnum];
export declare const NotificationScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly content: "content";
    readonly type: "type";
    readonly read: "read";
    readonly sentAt: "sentAt";
};
export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum];
export declare const PushSubscriptionScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly endpoint: "endpoint";
    readonly p256dh: "p256dh";
    readonly auth: "auth";
    readonly createdAt: "createdAt";
};
export type PushSubscriptionScalarFieldEnum = (typeof PushSubscriptionScalarFieldEnum)[keyof typeof PushSubscriptionScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const JsonNullValueInput: {
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
    readonly AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
