/**
 * BullMQ queue + job names for the reminder pipeline (UC18).
 *
 * The reminder flow has two job types on a single queue:
 *  - `sweep`         — a repeatable job (BullMQ Job Scheduler, every minute)
 *                      that finds users due for a reminder and fans out one
 *                      `send-reminder` job per user.
 *  - `send-reminder` — delivers a single user's reminder (in-app + push +
 *                      email) with retry/backoff on failure.
 */
export const REMINDER_QUEUE = 'reminders';

export const REMINDER_JOB = {
  sweep: 'sweep',
  send: 'send-reminder',
} as const;

/** Job Scheduler id for the every-minute sweep (idempotent upsert key). */
export const REMINDER_SWEEP_SCHEDULER = 'reminder-sweep';
