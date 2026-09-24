import { ListNotificationsDto } from './dto/list-notifications.dto';
import { SubscribeDto, UnsubscribeDto } from './dto/subscribe.dto';
import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notifications;
    constructor(notifications: NotificationService);
    vapidPublicKey(): {
        publicKey: string | null;
    };
    subscribe(userId: string, dto: SubscribeDto): Promise<{
        subscribed: boolean;
    }>;
    unsubscribe(userId: string, dto: UnsubscribeDto): Promise<{
        unsubscribed: boolean;
    }>;
    list(userId: string, query: ListNotificationsDto): Promise<{
        items: {
            id: string;
            userId: string;
            content: string;
            type: import("../../generated/prisma/enums").NotificationType;
            read: boolean;
            sentAt: Date;
        }[];
        total: number;
        unread: number;
        page: number;
        limit: number;
    }>;
    markAllRead(userId: string): Promise<{
        updated: number;
    }>;
    markRead(userId: string, id: string): Promise<{
        id: string;
        userId: string;
        content: string;
        type: import("../../generated/prisma/enums").NotificationType;
        read: boolean;
        sentAt: Date;
    }>;
}
