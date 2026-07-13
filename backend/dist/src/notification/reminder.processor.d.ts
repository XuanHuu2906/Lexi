import { WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { NotificationService } from './notification.service';
export declare class ReminderProcessor extends WorkerHost {
    private readonly notifications;
    private readonly queue;
    private readonly logger;
    constructor(notifications: NotificationService, queue: Queue);
    process(job: Job): Promise<unknown>;
    private handleSweep;
    private handleSend;
}
