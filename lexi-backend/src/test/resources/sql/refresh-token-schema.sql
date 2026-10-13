DROP TABLE IF EXISTS refresh_tokens;

CREATE TABLE refresh_tokens (
    id TEXT PRIMARY KEY,

    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL UNIQUE,

    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT refresh_tokens_user_fkey
        FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX refresh_tokens_userId_idx
    ON refresh_tokens ("userId");