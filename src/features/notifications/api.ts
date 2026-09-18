import { getOne, getPage, patchOne, sendVoid } from '@/lib/api-client';
import { cleanParams } from '@/utils/query-params';
import type { NotificationMeta, Page } from '@/types/api';
import type {
  Notification,
  NotificationListParams,
  NotificationPreferences,
} from '@/types/domain';

/** API_CONTRACT.md §10. */

export function listNotifications(
  params: NotificationListParams,
): Promise<Page<Notification, NotificationMeta>> {
  return getPage<Notification, NotificationMeta>('/notifications', {
    params: cleanParams(params),
  });
}

export function markNotificationRead(id: number): Promise<void> {
  return sendVoid('patch', `/notifications/${id}/read`);
}

export function markAllNotificationsRead(): Promise<void> {
  return sendVoid('patch', '/notifications/read-all');
}

export function getNotificationPreferences(): Promise<NotificationPreferences> {
  return getOne<NotificationPreferences>('/notifications/preferences');
}

export function updateNotificationPreferences(
  payload: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  return patchOne<NotificationPreferences, Partial<NotificationPreferences>>(
    '/notifications/preferences',
    payload,
  );
}
