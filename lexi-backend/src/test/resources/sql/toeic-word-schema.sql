
DROP TABLE IF EXISTS toeic_words;

CREATE TABLE toeic_words (
    id TEXT PRIMARY KEY,

    term TEXT NOT NULL UNIQUE,

    display TEXT,
    pos TEXT,
    ipa TEXT,
    meaning TEXT,
    "group" TEXT,

    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "updatedAt" TIMESTAMP(3)
        NOT NULL
);
