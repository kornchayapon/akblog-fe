import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { checkAxiosError } from '@/lib/functions/check-axios-error';
import { apiServer } from '@/lib/axios/axios';

export const POST = async () => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token');

  if (!refreshToken) {
    return NextResponse.json({ message: 'Token not found' }, { status: 401 });
  }

  try {
    const res = await apiServer.post(
      '/auth/refresh',
      {},
      {
        headers: {
          Cookie: `refresh_token=${encodeURIComponent(refreshToken.value)}`,
        },
        validateStatus: () => true,
      },
    );

    const data = res.data;

    // Error response
    if (res.status < 200 || res.status >= 300) {
      const response = NextResponse.json(data, { status: res.status });
      response.cookies.delete('refresh_token');
      return response;
    }

    // Success response
    const response = NextResponse.json(data, { status: res.status });

    // Smart Cookie Proxying
    const backendCookies = res.headers['set-cookie'];
    if (backendCookies) {
      backendCookies.forEach((cookie) => {
        response.headers.append('Set-Cookie', cookie);
      });
    }

    return response;
  } catch (error: unknown) {
    if (checkAxiosError(error)) {
      const status = error.response.status ?? 500;
      const data = error.response.data ?? { message: 'Refresh Token Error' };

      return NextResponse.json(data, { status });
    }

    console.error('[api/auth/me - error]:', error);

    return NextResponse.json(
      { message: 'Refresh token error!' },
      { status: 500 },
    );
  }
};
