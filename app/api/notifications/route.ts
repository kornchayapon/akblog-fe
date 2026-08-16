import { NextRequest } from 'next/server';
import { proxyNotificationsToBackend } from '@/lib/server/notifications-backend-proxy';

/**
 * GET /api/notifications
 * Query: page, limit, sortBy, order, unreadOnly
 * Proxies to: GET /notifications
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = new URLSearchParams();
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const sortBy = searchParams.get('sortBy');
  const order = searchParams.get('order');
  const unreadOnly = searchParams.get('unreadOnly');

  if (page) query.set('page', page);
  if (limit) query.set('limit', limit);
  if (sortBy) query.set('sortBy', sortBy);
  if (order) query.set('order', order);
  if (unreadOnly === 'true') query.set('unreadOnly', 'true');

  const qs = query.toString();
  const backendPath = qs
    ? `/notifications?${qs}`
    : '/notifications';

  return proxyNotificationsToBackend(request, {
    method: 'GET',
    backendPath,
    logLabel: 'Notifications fetch error',
  });
}
