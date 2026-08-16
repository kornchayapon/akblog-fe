import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';

export function getNotificationsBearerToken(
  request: NextRequest,
): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export function notificationsUnauthorized(): NextResponse {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

type ProxyMethod = 'GET' | 'PATCH' | 'DELETE';

/**
 * Forwards an authenticated request to the Nest notifications API.
 * Pass `backendPath` beginning with `/notifications`.
 */
export async function proxyNotificationsToBackend(
  request: NextRequest,
  options: {
    method: ProxyMethod;
    backendPath: string;
    logLabel: string;
  },
): Promise<NextResponse> {
  const token = getNotificationsBearerToken(request);
  if (!token) {
    return notificationsUnauthorized();
  }

  try {
    const response = await fetch(`${BACKEND_URL}${options.backendPath}`, {
      method: options.method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json().catch(() => null);
    return NextResponse.json(data ?? { message: response.statusText }, {
      status: response.status,
    });
  } catch (error) {
    console.error(`${options.logLabel}:`, error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
