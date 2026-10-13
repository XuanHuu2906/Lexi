DROP TABLE IF EXISTS push_subscriptions;

CREATE TABLE push_subscriptions (
    id TEXT PRIMARY KEY,

    "userId" TEXT NOT NULL,

    endpoint TEXT NOT NULL UNIQUE,

    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,

    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT push_subscriptions_user_fkey
        FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX push_subscriptions_user_id_idx
    ON push_subscriptions ("userId");