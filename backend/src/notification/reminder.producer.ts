import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  REMINDER_JOB,
  REMINDER_QUEUE,
  REMINDER_SWEEP_SCHEDULER,
} from './notification.constants';

/**
 * UC18 — registers the every-minute reminder *sweep* as a BullMQ Job Scheduler
 * (repeatable job). This replaces the old `@nestjs/schedule` `@Cron` trigger:
 * BullMQ now owns the scheduling and enqueues a `sweep` job each minute, which
 * the worker fans out into per-user `send-reminder` jobs.
 *
 * `upsertJobScheduler` is idempotent, so repeated boots/restarts never create
 * duplicate schedulers.
 */
@Injectable()
export class ReminderProducer implements OnModuleInit {
  private readonly logger = new Logger(ReminderProducer.name);

  constructor(@InjectQueue(REMINDER_QUEUE) private readonly queue: Queue) {}

  async onModuleInit() {
    await this.queue.upsertJobScheduler(
      REMINDER_SWEEP_SCHEDULER,
      { pattern: '* * * * *' }, // every minute
      { name: REMINDER_JOB.sweep, data: {} },
    );
    this.logger.log('Reminder sweep scheduler registered (every minute)');
  }
}
