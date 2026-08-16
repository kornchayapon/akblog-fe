import { NextRequest } from 'next/server';
import { proxyNotificationsToBackend } from '@/lib/server/notifications-backend-proxy';

/**
 * PATCH /api/notifications/read-all
 * Proxies to: PATCH /notifications/read-all
 */
export async function PATCH(request: NextRequest) {
  return proxyNotificationsToBackend(request, {
    method: 'PATCH',
    backendPath: '/notifications/read-all',
    logLabel: 'Mark all read error',
  });
}
