DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "AuthProvider" CASCADE;

CREATE TYPE "AuthProvider"
    AS ENUM ('LOCAL', 'GOOGLE');

CREATE TYPE "UserRole"
    AS ENUM ('LEARNER', 'ADMIN');

CREATE TABLE users (
    id TEXT PRIMARY KEY,

    email TEXT NOT NULL UNIQUE,

    "passwordHash" TEXT,

    provider "AuthProvider"
        NOT NULL DEFAULT 'LOCAL',

    "emailVerified" BOOLEAN
        NOT NULL DEFAULT FALSE,

    role "UserRole"
        NOT NULL DEFAULT 'LEARNER',

    "failedLoginAttempts" INTEGER
        NOT NULL DEFAULT 0,

    "lockedUntil" TIMESTAMP(3),

    "disabledAt" TIMESTAMP(3),

    "disabledReason" TEXT,

    "lastActiveAt" TIMESTAMP(3)
        NOT NULL,

    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "updatedAt" TIMESTAMP(3)
        NOT NULL
);

INSERT INTO users (
    id,
    email,
    "passwordHash",
    provider,
    "emailVerified",
    role,
    "failedLoginAttempts",
    "lastActiveAt",
    "createdAt",
    "updatedAt"
)
VALUES (
    'cm_test_existing_user',
    'existing@lexi.test',
    'hashed-password',
    'LOCAL',
    FALSE,
    'LEARNER',
    0,
    '2026-10-04 12:00:00',
    '2026-10-04 12:00:00',
    '2026-10-04 12:00:00'
);

CREATE TYPE "CefrLevel"
AS ENUM (
    'A1',
    'A2',
    'B1',
    'B2',
    'C1',
    'C2'
);

CREATE TYPE "TtsVoice"
AS ENUM (
    'EN_US',
    'EN_GB'
);

CREATE TABLE settings (
    id TEXT PRIMARY KEY,

    "userId" TEXT NOT NULL UNIQUE,

    "dailyGoal" INTEGER NOT NULL DEFAULT 10,

    "cefrLevel" "CefrLevel"
        NOT NULL DEFAULT 'A2',

    topics TEXT[]
        NOT NULL DEFAULT ARRAY[]::TEXT[],

    "reminderTime" TEXT
        NOT NULL DEFAULT '20:00',

    "timeZone" TEXT
        NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',

    "notifyEnabled" BOOLEAN
        NOT NULL DEFAULT TRUE,

    "ttsVoice" "TtsVoice"
        NOT NULL DEFAULT 'EN_US',

    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "updatedAt" TIMESTAMP(3)
        NOT NULL,

    CONSTRAINT settings_user_fkey
        FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE
);

INSERT INTO settings (
    id,
    "userId",
    "dailyGoal",
    "reminderTime",
    "timeZone",
    "notifyEnabled",
    "createdAt",
    "updatedAt"
)
VALUES (
    'cm_test_existing_setting',
    'cm_test_existing_user',
    10,
    '20:00',
    'Asia/Ho_Chi_Minh',
    TRUE,
    '2026-10-04 12:00:00',
    '2026-10-04 12:00:00'
);

CREATE TABLE streaks (
    id TEXT PRIMARY KEY,

    "userId" TEXT NOT NULL UNIQUE,

    "currentStreak" INTEGER NOT NULL DEFAULT 0,

    "longestStreak" INTEGER NOT NULL DEFAULT 0,

    "streakFreezes" INTEGER NOT NULL DEFAULT 0,

    "lastActiveDate" TIMESTAMP(3),

    CONSTRAINT streaks_user_fkey
        FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE
);

INSERT INTO streaks (
    id,
    "userId",
    "currentStreak",
    "longestStreak",
    "streakFreezes",
    "lastActiveDate"
)
VALUES (
    'cm_test_existing_streak',
    'cm_test_existing_user',
    3,
    7,
    1,
    '2026-10-04 12:00:00'
);

CREATE TYPE "WordStatus"
AS ENUM (
    'NEW',
    'LEARNING',
    'MASTERED'
);

CREATE TABLE words (
    id TEXT PRIMARY KEY,

    "userId" TEXT NOT NULL,

    term TEXT NOT NULL,
    meaning TEXT NOT NULL,

    phonetic TEXT,
    "partOfSpeech" TEXT,

    examples TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    synonyms TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    antonyms TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

    topic TEXT,
    note TEXT,

    status "WordStatus"
        NOT NULL DEFAULT 'NEW',

    "quizzedInCycle" BOOLEAN
        NOT NULL DEFAULT FALSE,

    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "updatedAt" TIMESTAMP(3)
        NOT NULL,

    CONSTRAINT words_user_fkey
        FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT words_user_term_key
        UNIQUE ("userId", term)
);

CREATE TABLE srs_data (
    id TEXT PRIMARY KEY,

    "wordId" TEXT NOT NULL UNIQUE,

    interval INTEGER NOT NULL DEFAULT 1,

    "easeFactor" DOUBLE PRECISION
        NOT NULL DEFAULT 2.5,

    repetitions INTEGER
        NOT NULL DEFAULT 0,

    "lastQuality" INTEGER,

    "lastReviewedAt" TIMESTAMP(3),

    "nextReviewAt" TIMESTAMP(3)
        NOT NULL,

    CONSTRAINT srs_data_word_fkey
        FOREIGN KEY ("wordId")
        REFERENCES words(id)
        ON DELETE CASCADE
);

CREATE INDEX srs_data_next_review_at_idx
ON srs_data ("nextReviewAt");

INSERT INTO words (
    id,
    "userId",
    term,
    meaning,
    "quizzedInCycle",
    "createdAt",
    "updatedAt"
)
VALUES (
    'cm_test_word_1',
    'cm_test_existing_user',
    'architecture',
    'kiến trúc',
    FALSE,
    '2026-10-04 12:00:00',
    '2026-10-04 12:00:00'
);

INSERT INTO srs_data (
    id,
    "wordId",
    interval,
    "easeFactor",
    repetitions,
    "lastQuality",
    "lastReviewedAt",
    "nextReviewAt"
)
VALUES (
    'cm_test_srs_1',
    'cm_test_word_1',
    3,
    2.4,
    2,
    4,
    '2026-10-04 12:00:00',
    '2026-10-07 12:00:00'
);

CREATE TABLE review_logs (
    id TEXT PRIMARY KEY,

    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,

    quality INTEGER NOT NULL,

    "reviewedAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT review_logs_user_fkey
        FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT review_logs_word_fkey
        FOREIGN KEY ("wordId")
        REFERENCES words(id)
        ON DELETE CASCADE
);

CREATE INDEX review_logs_user_reviewed_at_idx
ON review_logs ("userId", "reviewedAt");

CREATE INDEX review_logs_word_id_idx
ON review_logs ("wordId");

INSERT INTO words (
    id,
    "userId",
    term,
    meaning,
    "quizzedInCycle",
    "createdAt",
    "updatedAt"
)
VALUES
(
    'cm_test_word_2',
    'cm_test_existing_user',
    'database',
    'cơ sở dữ liệu',
    FALSE,
    '2026-10-04 12:00:00',
    '2026-10-04 12:00:00'
),
(
    'cm_test_word_3',
    'cm_test_existing_user',
    'transaction',
    'giao dịch',
    FALSE,
    '2026-10-04 12:00:00',
    '2026-10-04 12:00:00'
);

INSERT INTO review_logs (
    id,
    "userId",
    "wordId",
    quality,
    "reviewedAt"
)
VALUES
(
    'cm_review_1',
    'cm_test_existing_user',
    'cm_test_word_1',
    4,
    '2026-10-05 10:00:00'
),
(
    'cm_review_2',
    'cm_test_existing_user',
    'cm_test_word_1',
    5,
    '2026-10-06 10:00:00'
),
(
    'cm_review_3',
    'cm_test_existing_user',
    'cm_test_word_2',
    3,
    '2026-10-06 11:00:00'
),
(
    'cm_review_4',
    'cm_test_existing_user',
    'cm_test_word_3',
    4,
    '2026-10-06 12:00:00'
);