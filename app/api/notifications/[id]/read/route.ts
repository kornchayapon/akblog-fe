import { NextRequest } from 'next/server';
import { proxyNotificationsToBackend } from '@/lib/server/notifications-backend-proxy';

/**
 * PATCH /api/notifications/:id/read
 * Proxies to: PATCH /notifications/:id/read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyNotificationsToBackend(request, {
    method: 'PATCH',
    backendPath: `/notifications/${id}/read`,
    logLabel: 'Mark notification read error',
  });
}
