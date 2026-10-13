
DROP TABLE IF EXISTS conversation_scenarios;

DROP TYPE IF EXISTS "ScenarioDifficulty";

CREATE TYPE "ScenarioDifficulty"
AS ENUM ('EASY', 'MEDIUM', 'HARD');

CREATE TABLE conversation_scenarios (
    id TEXT PRIMARY KEY,

    name TEXT NOT NULL UNIQUE,

    description TEXT NOT NULL,

    "roleHint" TEXT NOT NULL,

    difficulty "ScenarioDifficulty"
        NOT NULL DEFAULT 'EASY',

    enabled BOOLEAN
        NOT NULL DEFAULT TRUE,

    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "updatedAt" TIMESTAMP(3)
        NOT NULL
);
