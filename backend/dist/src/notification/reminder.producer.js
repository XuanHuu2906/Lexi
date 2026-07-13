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
var ReminderProducer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderProducer = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
const notification_constants_1 = require("./notification.constants");
let ReminderProducer = ReminderProducer_1 = class ReminderProducer {
    queue;
    logger = new common_1.Logger(ReminderProducer_1.name);
    constructor(queue) {
        this.queue = queue;
    }
    async onModuleInit() {
        await this.queue.upsertJobScheduler(notification_constants_1.REMINDER_SWEEP_SCHEDULER, { pattern: '* * * * *' }, { name: notification_constants_1.REMINDER_JOB.sweep, data: {} });
        this.logger.log('Reminder sweep scheduler registered (every minute)');
    }
};
exports.ReminderProducer = ReminderProducer;
exports.ReminderProducer = ReminderProducer = ReminderProducer_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(notification_constants_1.REMINDER_QUEUE)),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], ReminderProducer);
//# sourceMappingURL=reminder.producer.js.map