import { NextRequest } from 'next/server';
import { proxyNotificationsToBackend } from '@/lib/server/notifications-backend-proxy';

/**
 * GET /api/notifications/unread-count
 * Proxies to: GET /notifications/unread-count
 */
export async function GET(request: NextRequest) {
  return proxyNotificationsToBackend(request, {
    method: 'GET',
    backendPath: '/notifications/unread-count',
    logLabel: 'Unread count fetch error',
  });
}
