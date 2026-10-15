-- AlterTable
-- UC11 quiz rotation: mark which words have already been quizzed in the current
-- coverage cycle. The quiz generator only picks un-quizzed words (still ordered
-- by SRS priority), so every word is covered once before any repeats. When the
-- remaining un-quizzed words can't fill a quiz, the flag is reset for all of the
-- user's words and a new cycle begins.
ALTER TABLE "words"
    ADD COLUMN "quizzedInCycle" BOOLEAN NOT NULL DEFAULT false;
