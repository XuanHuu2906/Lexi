import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { REMINDER_QUEUE } from './notification.constants';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PushService } from './push.service';
import { ReminderProducer } from './reminder.producer';
import { ReminderProcessor } from './reminder.processor';

// The reminder queue/worker only exist when REDIS_URL is configured. Without
// Redis the app still serves the notification API; only the scheduled reminder
// pipeline (UC18) is disabled.
const queueEnabled = !!process.env.REDIS_URL;

@Module({
  imports: queueEnabled
    ? [
        BullModule.registerQueue({
          name: REMINDER_QUEUE,
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5_000 },
            removeOnComplete: 1_000,
            removeOnFail: 5_000,
          },
        }),
      ]
    : [],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    PushService,
    EmailService,
    ...(queueEnabled ? [ReminderProducer, ReminderProcessor] : []),
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
