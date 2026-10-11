DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TYPE IF EXISTS "QuizStatus" CASCADE;

CREATE TYPE "QuizStatus"
AS ENUM (
    'IN_PROGRESS',
    'COMPLETED'
);

CREATE TABLE quiz_results (
    id TEXT PRIMARY KEY,

    "userId" TEXT NOT NULL,

    score INTEGER NOT NULL DEFAULT 0,

    total INTEGER NOT NULL,

    status "QuizStatus"
        NOT NULL DEFAULT 'IN_PROGRESS',

    questions JSONB,

    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "completedAt" TIMESTAMP(3),

    CONSTRAINT quiz_results_user_fkey
        FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX quiz_results_user_created_at_idx
ON quiz_results ("userId", "createdAt");