import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationType } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { EmailService } from './email.service';
import { PushService } from './push.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
    private readonly email: EmailService,
  ) {}

  vapidPublicKey() {
    return { publicKey: this.push.getPublicKey() };
  }

  /** Store (or refresh) a Web Push subscription for the user. */
  async subscribe(userId: string, dto: SubscribeDto) {
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

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
    return { unsubscribed: true };
  }

  /** UC18 — in-app notification centre. */
  async list(userId: string, query: ListNotificationsDto) {
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

  async markRead(userId: string, id: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { updated: count };
  }

  /**
   * UC18 — find users whose reminder time matches `now` *in their own
   * timezone* and who have notifications enabled. Used by the BullMQ sweep job
   * to fan out one `send-reminder` job per user.
   *
   * Because each user's `reminderTime` is relative to their `timeZone`, we can't
   * filter on a single server-computed HH:mm. We load enabled settings and
   * compare against the current HH:mm in each user's zone (formatters cached per
   * zone — typically one zone for the whole user base).
   */
  async findDueUserIds(now: Date = new Date()): Promise<string[]> {
    const settings = await this.prisma.setting.findMany({
      where: { notifyEnabled: true },
      select: { userId: true, reminderTime: true, timeZone: true },
    });
    const hhmmByZone = new Map<string, string>();
    const due: string[] = [];
    for (const s of settings) {
      if (this.hhmmInZone(now, s.timeZone, hhmmByZone) === s.reminderTime) {
        due.push(s.userId);
      }
    }
    return due;
  }

  /** Current "HH:mm" (24h) in an IANA timezone; memoised per zone per call. */
  private hhmmInZone(
    now: Date,
    timeZone: string,
    cache: Map<string, string>,
  ): string {
    const cached = cache.get(timeZone);
    if (cached !== undefined) return cached;
    let hhmm: string;
    try {
      hhmm = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23', // 00–23, never "24:00"
      }).format(now);
    } catch {
      // Unknown timezone (shouldn't happen — DTO validates) → treat as never
      // due rather than firing at the wrong time.
      hhmm = '';
    }
    cache.set(timeZone, hhmm);
    return hhmm;
  }

  /**
   * UC18 — reminder sweep that reminds due users inline (sequential). Kept for
   * tests and as a fallback when the BullMQ queue is disabled; the production
   * path fans out via the queue instead (see ReminderProcessor).
   */
  async sendDueReminders(now: Date = new Date()): Promise<number> {
    const userIds = await this.findDueUserIds(now);
    let sent = 0;
    for (const userId of userIds) {
      try {
        await this.remindUser(userId, now);
        sent++;
      } catch (err) {
        this.logger.warn(`Reminder for ${userId} failed: ${String(err)}`);
      }
    }
    if (userIds.length) {
      this.logger.log(
        `Sent ${sent}/${userIds.length} reminders at ${this.formatHhmm(now)}`,
      );
    }
    return sent;
  }

  /** Build a context-aware reminder and deliver it via in-app + push + email. */
  async remindUser(userId: string, now: Date = new Date()) {
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
    if (!user) return;

    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const streakActiveToday =
      streak?.lastActiveDate != null && streak.lastActiveDate >= today;
    const streakAtRisk = (streak?.currentStreak ?? 0) > 0 && !streakActiveToday;

    let content: string;
    let type: NotificationType;
    if (dueCount > 0) {
      content = `Bạn có ${dueCount} từ cần ôn hôm nay. Học một chút nhé!`;
      type = NotificationType.REVIEW_DUE;
    } else if (streakAtRisk) {
      content = `Đừng để mất chuỗi ${streak!.currentStreak} ngày! Ôn tập ngay để giữ streak.`;
      type = NotificationType.STREAK_RISK;
    } else {
      content = 'Dành vài phút học tiếng Anh hôm nay nhé!';
      type = NotificationType.ENCOURAGEMENT;
    }

    const notif = await this.prisma.notification.create({
      data: { userId, content, type },
    });

    await this.push.sendToUser(userId, {
      title: 'Lexi',
      body: content,
      url: '/review',
    });
    await this.email.send(
      user.email,
      'Nhắc học Lexi',
      `<p>${content}</p><p><a href="https://lexi.app/review">Vào ôn tập →</a></p>`,
    );

    return notif;
  }

  private formatHhmm(d: Date): string {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
}
