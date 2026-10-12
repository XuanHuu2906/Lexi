
DROP TABLE IF EXISTS settings CASCADE;
DROP TYPE IF EXISTS "CefrLevel" CASCADE;
DROP TYPE IF EXISTS "TtsVoice" CASCADE;

CREATE TYPE "CefrLevel"
AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

CREATE TYPE "TtsVoice"
AS ENUM ('EN_US', 'EN_GB');

CREATE TABLE settings (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE CASCADE,

    "dailyGoal" INTEGER NOT NULL DEFAULT 10,
    "cefrLevel" "CefrLevel" NOT NULL DEFAULT 'A2',

    topics TEXT[] NOT NULL DEFAULT '{}'::text[],

    "reminderTime" TEXT NOT NULL DEFAULT '20:00',
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "notifyEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "ttsVoice" "TtsVoice" NOT NULL DEFAULT 'EN_US',

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
