import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { REMINDER_JOB, REMINDER_QUEUE } from './notification.constants';
import { NotificationService } from './notification.service';

interface SendReminderData {
  userId: string;
}

/**
 * UC18 — BullMQ worker for the reminder queue. Runs in-process alongside the
 * API (registered as a NestJS provider). Handles two job types:
 *
 *  - `sweep`         : find users due right now and enqueue one `send-reminder`
 *                      job per user (fan-out). Does NOT deliver anything itself.
 *  - `send-reminder` : deliver a single user's reminder. Throwing lets BullMQ
 *                      retry with backoff (see queue defaultJobOptions).
 *
 * Concurrency + a limiter (configured on the queue registration) protect the
 * downstream email/push providers from bursts when many users share a time.
 */
@Processor(REMINDER_QUEUE, {
  concurrency: 5,
  limiter: { max: 10, duration: 1000 },
})
export class ReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(ReminderProcessor.name);

  constructor(
    private readonly notifications: NotificationService,
    @InjectQueue(REMINDER_QUEUE) private readonly queue: Queue,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case REMINDER_JOB.sweep:
        return this.handleSweep();
      case REMINDER_JOB.send:
        return this.handleSend(job as Job<SendReminderData>);
      default:
        this.logger.warn(`Unknown reminder job: ${job.name}`);
        return undefined;
    }
  }

  /** Fan out: enqueue one `send-reminder` job per due user. */
  private async handleSweep(): Promise<{ enqueued: number }> {
    const now = new Date();
    const userIds = await this.notifications.findDueUserIds(now);
    if (!userIds.length) return { enqueued: 0 };

    // Minute bucket → dedupe repeat sweeps within the same minute via jobId.
    const bucket = Math.floor(now.getTime() / 60_000);
    await this.queue.addBulk(
      userIds.map((userId) => ({
        name: REMINDER_JOB.send,
        data: { userId } satisfies SendReminderData,
        opts: { jobId: `reminder:${userId}:${bucket}` },
      })),
    );
    this.logger.log(`Sweep enqueued ${userIds.length} reminder(s)`);
    return { enqueued: userIds.length };
  }

  /** Deliver a single reminder (in-app + push + email). */
  private async handleSend(job: Job<SendReminderData>): Promise<void> {
    await this.notifications.remindUser(job.data.userId);
  }
}
