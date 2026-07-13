"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const email_service_1 = require("./email.service");
const notification_constants_1 = require("./notification.constants");
const notification_controller_1 = require("./notification.controller");
const notification_service_1 = require("./notification.service");
const push_service_1 = require("./push.service");
const reminder_producer_1 = require("./reminder.producer");
const reminder_processor_1 = require("./reminder.processor");
const queueEnabled = !!process.env.REDIS_URL;
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: queueEnabled
            ? [
                bullmq_1.BullModule.registerQueue({
                    name: notification_constants_1.REMINDER_QUEUE,
                    defaultJobOptions: {
                        attempts: 3,
                        backoff: { type: 'exponential', delay: 5_000 },
                        removeOnComplete: 1_000,
                        removeOnFail: 5_000,
                    },
                }),
            ]
            : [],
        controllers: [notification_controller_1.NotificationController],
        providers: [
            notification_service_1.NotificationService,
            push_service_1.PushService,
            email_service_1.EmailService,
            ...(queueEnabled ? [reminder_producer_1.ReminderProducer, reminder_processor_1.ReminderProcessor] : []),
        ],
        exports: [notification_service_1.NotificationService],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map