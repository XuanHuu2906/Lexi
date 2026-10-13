DROP TABLE IF EXISTS grammar_rules;

CREATE TABLE grammar_rules (
    id TEXT PRIMARY KEY,

    "userId" TEXT NOT NULL,

    title TEXT,
    formula TEXT NOT NULL,
    explanation TEXT NOT NULL,

    examples TEXT[]
        NOT NULL DEFAULT ARRAY[]::TEXT[],

    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "updatedAt" TIMESTAMP(3)
        NOT NULL,

    CONSTRAINT grammar_rules_user_fkey
        FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX grammar_rules_user_id_idx
    ON grammar_rules ("userId");