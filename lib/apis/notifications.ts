import apiClient from '@/lib/axios/axios';
import type {
  Notification,
  PaginatedNotifications,
} from '@/lib/interfaces/notification';

/* ─────────── queries ─────────── */

export async function fetchNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<PaginatedNotifications> {
  // Only send unreadOnly when true to avoid "false" string → true bug
  const query: Record<string, unknown> = {};
  if (params?.page) query.page = params.page;
  if (params?.limit) query.limit = params.limit;
  if (params?.unreadOnly) query.unreadOnly = true;

  const { data } = await apiClient.get<PaginatedNotifications>(
    '/notifications',
    { params: query },
  );
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ unreadCount: number }>(
    '/notifications/unread-count',
  );
  return typeof data?.unreadCount === 'number' ? data.unreadCount : 0;
}

/* ─────────── mutations ─────────── */

export async function markNotificationAsRead(
  id: number,
): Promise<Notification> {
  const { data } = await apiClient.patch<Notification>(
    `/notifications/${id}/read`,
  );
  return data;
}

export async function markAllNotificationsAsRead(): Promise<{
  affected: number;
}> {
  const { data } = await apiClient.patch<{ affected: number }>(
    '/notifications/read-all',
  );
  return data;
}

export async function deleteNotification(id: number): Promise<void> {
  await apiClient.delete(`/notifications/${id}`);
}
