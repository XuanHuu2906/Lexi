DROP TABLE IF EXISTS chat_threads CASCADE;
DROP TYPE IF EXISTS "ChatKind" CASCADE;

CREATE TYPE "ChatKind"
AS ENUM ('TUTOR', 'GRAMMAR');

CREATE TABLE chat_threads (
    id TEXT PRIMARY KEY,

    "userId" TEXT NOT NULL,

    kind "ChatKind" NOT NULL,

    title TEXT NOT NULL,

    messages JSONB
        NOT NULL DEFAULT '[]'::jsonb,

    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "updatedAt" TIMESTAMP(3)
        NOT NULL,

    CONSTRAINT chat_threads_userId_fkey
        FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "chat_threads_userId_kind_updatedAt_idx"
ON chat_threads ("userId", kind, "updatedAt");