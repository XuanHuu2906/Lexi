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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../generated/prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("./email.service");
const push_service_1 = require("./push.service");
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    push;
    email;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(prisma, push, email) {
        this.prisma = prisma;
        this.push = push;
        this.email = email;
    }
    vapidPublicKey() {
        return { publicKey: this.push.getPublicKey() };
    }
    async subscribe(userId, dto) {
        await this.prisma.pushSubscription.upsert({
            where: { endpoint: dto.endpoint },
            update: { userId, p256dh: dto.keys.p256dh, auth: dto.keys.auth },
            create: {
                userId,
                endpoint: dto.endpoint,
                p256dh: dto.keys.p256dh,
                auth: dto.keys.auth,
            },
        });
        return { subscribed: true };
    }
    async unsubscribe(userId, endpoint) {
        await this.prisma.pushSubscription.deleteMany({
            where: { userId, endpoint },
        });
        return { unsubscribed: true };
    }
    async list(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const [items, total, unread] = await this.prisma.$transaction([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { sentAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, read: false } }),
        ]);
        return { items, total, unread, page, limit };
    }
    async markRead(userId, id) {
        const notif = await this.prisma.notification.findFirst({
            where: { id, userId },
            select: { id: true },
        });
        if (!notif) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }
    async markAllRead(userId) {
        const { count } = await this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
        return { updated: count };
    }
    async findDueUserIds(now = new Date()) {
        const settings = await this.prisma.setting.findMany({
            where: { notifyEnabled: true },
            select: { userId: true, reminderTime: true, timeZone: true },
        });
        const hhmmByZone = new Map();
        const due = [];
        for (const s of settings) {
            if (this.hhmmInZone(now, s.timeZone, hhmmByZone) === s.reminderTime) {
                due.push(s.userId);
            }
        }
        return due;
    }
    hhmmInZone(now, timeZone, cache) {
        const cached = cache.get(timeZone);
        if (cached !== undefined)
            return cached;
        let hhmm;
        try {
            hhmm = new Intl.DateTimeFormat('en-GB', {
                timeZone,
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23',
            }).format(now);
        }
        catch {
            hhmm = '';
        }
        cache.set(timeZone, hhmm);
        return hhmm;
    }
    async sendDueReminders(now = new Date()) {
        const userIds = await this.findDueUserIds(now);
        let sent = 0;
        for (const userId of userIds) {
            try {
                await this.remindUser(userId, now);
                sent++;
            }
            catch (err) {
                this.logger.warn(`Reminder for ${userId} failed: ${String(err)}`);
            }
        }
        if (userIds.length) {
            this.logger.log(`Sent ${sent}/${userIds.length} reminders at ${this.formatHhmm(now)}`);
        }
        return sent;
    }
    async remindUser(userId, now = new Date()) {
        const [user, dueCount, streak] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true },
            }),
            this.prisma.word.count({
                where: { userId, srsData: { is: { nextReviewAt: { lte: now } } } },
            }),
            this.prisma.streak.findUnique({ where: { userId } }),
        ]);
        if (!user)
            return;
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const streakActiveToday = streak?.lastActiveDate != null && streak.lastActiveDate >= today;
        const streakAtRisk = (streak?.currentStreak ?? 0) > 0 && !streakActiveToday;
        let content;
        let type;
        if (dueCount > 0) {
            content = `Bạn có ${dueCount} từ cần ôn hôm nay. Học một chút nhé!`;
            type = client_1.NotificationType.REVIEW_DUE;
        }
        else if (streakAtRisk) {
            content = `Đừng để mất chuỗi ${streak.currentStreak} ngày! Ôn tập ngay để giữ streak.`;
            type = client_1.NotificationType.STREAK_RISK;
        }
        else {
            content = 'Dành vài phút học tiếng Anh hôm nay nhé!';
            type = client_1.NotificationType.ENCOURAGEMENT;
        }
        const notif = await this.prisma.notification.create({
            data: { userId, content, type },
        });
        await this.push.sendToUser(userId, {
            title: 'Lexi',
            body: content,
            url: '/review',
        });
        await this.email.send(user.email, 'Nhắc học Lexi', `<p>${content}</p><p><a href="https://lexi.app/review">Vào ôn tập →</a></p>`);
        return notif;
    }
    formatHhmm(d) {
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        push_service_1.PushService,
        email_service_1.EmailService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map