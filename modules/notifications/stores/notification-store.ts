import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Notification } from '@/lib/interfaces/notification';

interface NotificationState {
  /** Cached recent notifications */
  notifications: Notification[];
  /** Current unread count */
  unreadCount: number;
  /** Whether the notification panel is open */
  isPanelOpen: boolean;

  /* actions */
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  removeNotification: (id: number) => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isPanelOpen: false,

      setNotifications: (notifications) =>
        set({ notifications }, false, 'setNotifications'),

      addNotification: (notification) =>
        set(
          (state) => ({
            // Prepend new notification – avoid duplicates
            notifications: [
              notification,
              ...state.notifications.filter((n) => n.id !== notification.id),
            ],
          }),
          false,
          'addNotification',
        ),

      setUnreadCount: (count) =>
        set({ unreadCount: count }, false, 'setUnreadCount'),

      incrementUnreadCount: () =>
        set(
          (state) => ({ unreadCount: state.unreadCount + 1 }),
          false,
          'incrementUnreadCount',
        ),

      markAsRead: (id) =>
        set(
          (state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }),
          false,
          'markAsRead',
        ),

      markAllAsRead: () =>
        set(
          (state) => ({
            notifications: state.notifications.map((n) => ({
              ...n,
              readAt: n.readAt ?? new Date().toISOString(),
            })),
            unreadCount: 0,
          }),
          false,
          'markAllAsRead',
        ),

      setPanelOpen: (open) =>
        set({ isPanelOpen: open }, false, 'setPanelOpen'),

      togglePanel: () =>
        set(
          (state) => ({ isPanelOpen: !state.isPanelOpen }),
          false,
          'togglePanel',
        ),

      removeNotification: (id) =>
        set(
          (state) => {
            const removed = state.notifications.find((n) => n.id === id);
            const wasUnread = removed && !removed.readAt;
            return {
              notifications: state.notifications.filter((n) => n.id !== id),
              unreadCount: wasUnread
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount,
            };
          },
          false,
          'removeNotification',
        ),
    }),
    { name: 'notification-store' },
  ),
);
