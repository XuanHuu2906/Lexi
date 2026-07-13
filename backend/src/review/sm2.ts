// SM-2 spaced-repetition algorithm (SuperMemo 2), the basis of Anki — tuned for
// a short study window so every word is revisited several times instead of being
// flung weeks away after a couple of easy reviews.
//
// Pure function — no I/O — so it is trivially unit-testable.

export interface Sm2State {
  interval: number; // days until the previous scheduling
  easeFactor: number; // >= 1.3
  repetitions: number; // consecutive correct reviews
}

export interface Sm2Result extends Sm2State {
  nextReviewAt: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Interval (days) after the 1st and 2nd correct reviews — compressed from the
 *  classic 1 → 6 so new words are seen densely before they start spacing out. */
const FIRST_INTERVAL = 1;
const SECOND_INTERVAL = 3;

/** Global "interval modifier" (à la Anki): pulls the whole growth curve inward
 *  so reviews stay more frequent. Applied only to the multiplicative phase. */
const INTERVAL_MODIFIER = 0.7;

/** Hard ceiling on the interval: no word is ever pushed out further than this,
 *  so within a ~3-week study window every word comes back at least a few times. */
export const MAX_INTERVAL = 21;

/** Ease bounds. Capped at 2.5 (the default) so no word can drift far out; the
 *  SM-2 floor of 1.3 keeps a hard word from collapsing to nothing. */
const MIN_EASE = 1.3;
export const MAX_EASE = 2.5;

/**
 * Given the prior SRS state and the recall quality (0–5), compute the next
 * interval, ease factor, repetition count, and due date.
 *
 * quality: 0–2 = incorrect (reset), 3 = hard, 4 = good, 5 = easy.
 */
export function sm2(
  prev: Sm2State,
  quality: number,
  now: Date = new Date(),
): Sm2Result {
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  let { interval, easeFactor, repetitions } = prev;

  if (q < 3) {
    // Failed recall — relearn from the start (back tomorrow).
    repetitions = 0;
    interval = FIRST_INTERVAL;
  } else {
    if (repetitions === 0) {
      interval = FIRST_INTERVAL;
    } else if (repetitions === 1) {
      interval = SECOND_INTERVAL;
    } else {
      // Uses the ease factor from *before* this review's update, then damps the
      // whole thing with the global modifier.
      interval = Math.round(interval * easeFactor * INTERVAL_MODIFIER);
    }
    repetitions += 1;
  }

  // Never schedule further out than the study window allows.
  interval = Math.min(interval, MAX_INTERVAL);

  // Update ease factor and clamp to [1.3, 2.5].
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  easeFactor = Math.max(MIN_EASE, Math.min(MAX_EASE, easeFactor));
  easeFactor = Math.round(easeFactor * 100) / 100;

  const nextReviewAt = new Date(now.getTime() + interval * DAY_MS);
  return { interval, easeFactor, repetitions, nextReviewAt };
}
