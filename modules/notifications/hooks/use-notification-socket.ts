'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useNotificationStore } from '../stores/notification-store';
import { authStore } from '@/modules/front/auth/stores/auth-store';
import type { Notification } from '@/lib/interfaces/notification';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002';

/** Set to `true` in `.env.local` when no Socket.IO server is running (stops WS errors in the console). */
const WS_DISABLED =
  process.env.NEXT_PUBLIC_DISABLE_NOTIFICATION_SOCKET === 'true';

/**
 * Connects to the /notifications Socket.io namespace.
 * Listens for `notification` and `unreadCount` events and
 * updates the Zustand store so the UI reacts instantly.
 *
 * Connection is scheduled with `setTimeout(0)` so React 18 Strict Mode's
 * mount → cleanup → remount cycle does not disconnect a WebSocket that is
 * still handshaking (which triggers "WebSocket is closed before the connection is established").
 *
 * Returns a disconnect callback for manual teardown.
 */
export function useNotificationSocket() {
  const socketRef = useRef<Socket | null>(null);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (WS_DISABLED) return undefined;

    const token = authStore.getState().accessToken;
    if (!token) return undefined;

    let activeSocket: Socket | null = null;

    const timeoutId = window.setTimeout(() => {
      const t = authStore.getState().accessToken;
      if (!t) return;

      const socket = io(`${WS_URL}/notifications`, {
        auth: { token: t },
        // Polling first avoids some dev / proxy issues; then upgrades to WebSocket.
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      });

      socket.on('notification', (notification: Notification) => {
        addNotification(notification);
      });

      socket.on('unreadCount', ({ count }: { count: number }) => {
        setUnreadCount(typeof count === 'number' ? count : 0);
      });

      activeSocket = socket;
      socketRef.current = socket;
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      if (activeSocket) {
        activeSocket.disconnect();
        if (socketRef.current === activeSocket) {
          socketRef.current = null;
        }
      }
    };
  }, [addNotification, setUnreadCount]);

  return { disconnect };
}
