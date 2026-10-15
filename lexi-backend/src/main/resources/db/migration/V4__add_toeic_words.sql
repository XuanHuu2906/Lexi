-- CreateTable
CREATE TABLE "toeic_words" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "display" TEXT,
    "pos" TEXT,
    "ipa" TEXT,
    "meaning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "toeic_words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "toeic_words_term_key" ON "toeic_words"("term");
