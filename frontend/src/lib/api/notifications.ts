import { api } from "./client";

export type NotificationType =
  | "REVIEW_DUE"
  | "STREAK_RISK"
  | "ENCOURAGEMENT"
  | "BADGE_EARNED"
  | "SYSTEM";

export interface NotificationItem {
  id: string;
  userId: string;
  content: string;
  type: NotificationType;
  read: boolean;
  sentAt: string;
}

export interface NotificationList {
  items: NotificationItem[];
  total: number;
  unread: number;
  page: number;
  limit: number;
}

export function getVapidPublicKey(): Promise<{ publicKey: string }> {
  return api.get<{ publicKey: string }>("/notifications/vapid-public-key");
}

/** Web Push subscription payload (from PushSubscription.toJSON()). */
export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export function subscribePush(
  sub: PushSubscriptionInput,
): Promise<{ subscribed: boolean }> {
  return api.post<{ subscribed: boolean }>("/notifications/subscribe", sub);
}

export function unsubscribePush(
  endpoint: string,
): Promise<{ unsubscribed: boolean }> {
  return api.delete<{ unsubscribed: boolean }>("/notifications/subscribe", {
    body: { endpoint },
  });
}

export function listNotifications(
  page?: number,
  limit?: number,
): Promise<NotificationList> {
  return api.get<NotificationList>("/notifications", { query: { page, limit } });
}

export function markNotificationRead(id: string): Promise<unknown> {
  return api.patch<unknown>(`/notifications/${id}/read`);
}

export function markAllNotificationsRead(): Promise<{ updated: number }> {
  return api.patch<{ updated: number }>("/notifications/read-all");
}
