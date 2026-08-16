import { NextRequest } from 'next/server';
import { proxyNotificationsToBackend } from '@/lib/server/notifications-backend-proxy';

/**
 * DELETE /api/notifications/:id
 * Proxies to: DELETE /notifications/:id
 * Success: 204 No Content. Not found / no access: 404. Invalid id: 400.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyNotificationsToBackend(request, {
    method: 'DELETE',
    backendPath: `/notifications/${id}`,
    logLabel: 'Delete notification error',
  });
}
