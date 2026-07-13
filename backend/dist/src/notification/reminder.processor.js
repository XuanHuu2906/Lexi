"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReminderProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
const notification_constants_1 = require("./notification.constants");
const notification_service_1 = require("./notification.service");
let ReminderProcessor = ReminderProcessor_1 = class ReminderProcessor extends bullmq_1.WorkerHost {
    notifications;
    queue;
    logger = new common_1.Logger(ReminderProcessor_1.name);
    constructor(notifications, queue) {
        super();
        this.notifications = notifications;
        this.queue = queue;
    }
    async process(job) {
        switch (job.name) {
            case notification_constants_1.REMINDER_JOB.sweep:
                return this.handleSweep();
            case notification_constants_1.REMINDER_JOB.send:
                return this.handleSend(job);
            default:
                this.logger.warn(`Unknown reminder job: ${job.name}`);
                return undefined;
        }
    }
    async handleSweep() {
        const now = new Date();
        const userIds = await this.notifications.findDueUserIds(now);
        if (!userIds.length)
            return { enqueued: 0 };
        const bucket = Math.floor(now.getTime() / 60_000);
        await this.queue.addBulk(userIds.map((userId) => ({
            name: notification_constants_1.REMINDER_JOB.send,
            data: { userId },
            opts: { jobId: `reminder:${userId}:${bucket}` },
        })));
        this.logger.log(`Sweep enqueued ${userIds.length} reminder(s)`);
        return { enqueued: userIds.length };
    }
    async handleSend(job) {
        await this.notifications.remindUser(job.data.userId);
    }
};
exports.ReminderProcessor = ReminderProcessor;
exports.ReminderProcessor = ReminderProcessor = ReminderProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(notification_constants_1.REMINDER_QUEUE, {
        concurrency: 5,
        limiter: { max: 10, duration: 1000 },
    }),
    __param(1, (0, bullmq_1.InjectQueue)(notification_constants_1.REMINDER_QUEUE)),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        bullmq_2.Queue])
], ReminderProcessor);
//# sourceMappingURL=reminder.processor.js.map