import { NotificationType } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { EmailService } from './email.service';
import { PushService } from './push.service';
export declare class NotificationService {
    private readonly prisma;
    private readonly push;
    private readonly email;
    private readonly logger;
    constructor(prisma: PrismaService, push: PushService, email: EmailService);
    vapidPublicKey(): {
        publicKey: string | null;
    };
    subscribe(userId: string, dto: SubscribeDto): Promise<{
        subscribed: boolean;
    }>;
    unsubscribe(userId: string, endpoint: string): Promise<{
        unsubscribed: boolean;
    }>;
    list(userId: string, query: ListNotificationsDto): Promise<{
        items: {
            id: string;
            type: NotificationType;
            userId: string;
            content: string;
            read: boolean;
            sentAt: Date;
        }[];
        total: number;
        unread: number;
        page: number;
        limit: number;
    }>;
    markRead(userId: string, id: string): Promise<{
        id: string;
        type: NotificationType;
        userId: string;
        content: string;
        read: boolean;
        sentAt: Date;
    }>;
    markAllRead(userId: string): Promise<{
        updated: number;
    }>;
    findDueUserIds(now?: Date): Promise<string[]>;
    private hhmmInZone;
    sendDueReminders(now?: Date): Promise<number>;
    remindUser(userId: string, now?: Date): Promise<{
        id: string;
        type: NotificationType;
        userId: string;
        content: string;
        read: boolean;
        sentAt: Date;
    } | undefined>;
    private formatHhmm;
}
