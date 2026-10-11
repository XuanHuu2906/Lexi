DROP TABLE IF EXISTS conversation_logs CASCADE;
DROP TYPE IF EXISTS "ConversationStatus" CASCADE;

CREATE TYPE "ConversationStatus"
AS ENUM (
    'ACTIVE',
    'COMPLETED'
);

CREATE TABLE conversation_logs (
    id TEXT PRIMARY KEY,

    "userId" TEXT NOT NULL,

    scenario TEXT NOT NULL,

    transcript JSONB
        NOT NULL DEFAULT '[]'::jsonb,

    feedback TEXT,

    status "ConversationStatus"
        NOT NULL DEFAULT 'ACTIVE',

    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "updatedAt" TIMESTAMP(3)
        NOT NULL,

    CONSTRAINT conversation_logs_user_fkey
        FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX conversation_logs_user_id_idx
ON conversation_logs ("userId");