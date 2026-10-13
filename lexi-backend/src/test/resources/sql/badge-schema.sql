
DROP TABLE IF EXISTS user_badges;
DROP TABLE IF EXISTS badges;

CREATE TABLE badges (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    condition TEXT NOT NULL,
    icon TEXT,
    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_badges (
    id TEXT PRIMARY KEY,

    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,

    "earnedAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT user_badges_user_fkey
        FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT user_badges_badge_fkey
        FOREIGN KEY ("badgeId")
        REFERENCES badges(id)
        ON DELETE CASCADE,

    CONSTRAINT user_badges_user_badge_key
        UNIQUE ("userId", "badgeId")
);

CREATE INDEX user_badges_user_id_idx
    ON user_badges ("userId");
