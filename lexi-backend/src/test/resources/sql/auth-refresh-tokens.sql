DROP TABLE IF EXISTS refresh_tokens;

CREATE TABLE refresh_tokens (
    id TEXT PRIMARY KEY,

    "userId" TEXT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    "tokenHash" TEXT NOT NULL UNIQUE,

    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    "createdAt" TIMESTAMP(3) NOT NULL
);