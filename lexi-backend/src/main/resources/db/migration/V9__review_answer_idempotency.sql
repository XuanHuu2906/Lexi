CREATE TABLE review_answer_idempotency (
    "userId" TEXT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    "requestKey" VARCHAR(128) NOT NULL,

    "wordId" TEXT NOT NULL,

    rating VARCHAR(16) NOT NULL,

    -- Snapshot của response sau khi review thành công
    "srsId" TEXT,
    "interval" INTEGER,
    "easeFactor" DOUBLE PRECISION,
    repetitions INTEGER,
    "lastQuality" INTEGER,
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "wordStatus" VARCHAR(16),

    "createdAt" TIMESTAMP(3)
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT review_answer_idempotency_pk
        PRIMARY KEY ("userId", "requestKey")
);