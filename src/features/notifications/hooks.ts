'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  getNotificationPreferences,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from './api';
import type { NotificationListParams, NotificationPreferences } from '@/types/domain';

export function useNotifications(params: NotificationListParams) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => listNotifications(params),
  });
}

/**
 * Powers the navbar badge. The count rides along in the list `meta` (§10), so this is the
 * same endpoint with `size: 1` rather than an invented `/notifications/count`.
 */
export function useUnreadCount() {
  const params: NotificationListParams = { unreadOnly: true, page: 1, size: 1 };
  const query = useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => listNotifications(params),
    refetchInterval: 60_000,
  });
  return query.data?.meta.unreadCount ?? 0;
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.notifications.preferences,
    queryFn: getNotificationPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation<NotificationPreferences, unknown, Partial<NotificationPreferences>>({
    mutationFn: updateNotificationPreferences,
    onSuccess: (data) => queryClient.setQueryData(queryKeys.notifications.preferences, data),
  });
}
