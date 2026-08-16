'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/lib/apis/notifications';
import { checkAxiosError } from '@/lib/functions/check-axios-error';
import { useNotificationStore } from '../stores/notification-store';
import { authStore } from '@/modules/guest/auth/stores/auth-store';

/* ─────────────── query keys ─────────────── */

export const NOTIFICATIONS_KEY = ['notifications'] as const;
export const UNREAD_COUNT_KEY = ['notifications', 'unread-count'] as const;

function deleteNotificationErrorMessage(error: unknown): string {
  if (checkAxiosError(error)) {
    const status = error.response.status;
    const fromApi = error.response.data?.message;
    if (fromApi) return fromApi;
    if (status === 404) {
      return 'Notification not found or you do not have permission.';
    }
    if (status === 400) {
      return 'Invalid notification ID.';
    }
  }
  return 'Unable to delete notification.';
}

/* ─────────────── hooks ─────────────── */

/**
 * Fetch paginated notification history.
 * On success the Zustand store is hydrated with page-1 data
 * so the bell panel reflects server state.
 */
export function useNotifications(
  page = 1,
  limit = 20,
  unreadOnly = false,
) {
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const accessToken = authStore((s) => s.accessToken);

  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, page, limit, unreadOnly],
    queryFn: async () => {
      const data = await fetchNotifications({ page, limit, unreadOnly });
      // Sync first page to store for real-time merging
      if (page === 1 && !unreadOnly) {
        setNotifications(data.results);
      }
      return data;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch unread count and hydrate the store.
 */
export function useUnreadCount() {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const accessToken = authStore((s) => s.accessToken);

  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: async () => {
      const count = await fetchUnreadCount();
      const value = typeof count === 'number' ? count : 0;
      setUnreadCount(value);
      return value;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60, // poll every minute as fallback
    refetchOnWindowFocus: true,
  });
}

/**
 * Mark a single notification as read.
 * Optimistic update via Zustand store.
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: (id: number) => {
      markAsRead(id);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

/**
 * Mark every unread notification as read.
 * Optimistic update via Zustand store.
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: () => {
      markAllAsRead();
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

/**
 * Delete a notification. Optimistic update via Zustand store.
 * On error (404/400) shows toast.
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const removeNotification = useNotificationStore(
    (s) => s.removeNotification,
  );

  return useMutation({
    mutationFn: deleteNotification,
    onMutate: (id: number) => {
      removeNotification(id);
    },
    onSuccess: () => {
      toast.success('Notification deleted');
    },
    onError: (error: unknown) => {
      toast.error(deleteNotificationErrorMessage(error));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}
