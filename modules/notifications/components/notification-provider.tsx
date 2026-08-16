'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useNotificationSocket } from '../hooks/use-notification-socket';
import { authStore } from '@/modules/front/auth/stores/auth-store';

/**
 * Wraps children and connects to the notification socket
 * when the user is authenticated.
 *
 * Place in layout files (guest + admin) so the socket
 * connection lives for the entire session.
 */
export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isAuth, setIsAuth] = useState(
    () => !!authStore.getState().accessToken,
  );

  useEffect(() => {
    // Subscribe to auth changes
    const unsub = authStore.subscribe((state) => {
      setIsAuth(!!state.accessToken);
    });

    return unsub;
  }, []);

  return (
    <>
      {isAuth && <NotificationSocketConnector />}
      {children}
    </>
  );
}

/** Internal component that manages the socket lifecycle. */
function NotificationSocketConnector() {
  useNotificationSocket();
  return null;
}
