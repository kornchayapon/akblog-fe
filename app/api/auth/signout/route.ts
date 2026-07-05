import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { checkAxiosError } from '@/lib/functions/check-axios-error';
import { apiServer } from '@/lib/axios/axios';

export const POST = async () => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token');

  try {
    // Forward the refresh token to the backend
    const res = await apiServer.post(
      '/auth/signout',
      {},
      {
        headers: {
          Cookie: refreshToken ? `refresh_token=${refreshToken.value}` : '',
        },
      },
    );

    const data = res.data;

    // Error response
    if (res.status < 200 || res.status >= 300) {
      const response = NextResponse.json(data, { status: res.status });
      response.cookies.delete('refresh_token');
      return response;
    }

    const response = NextResponse.json(
      { message: 'Signed out' },
      { status: 200 },
    );

    response.cookies.delete('refresh_token');
    response.cookies.delete('user_role');

    return response;
  } catch (error: unknown) {
    // const err = error as AxiosError;
    // const status = err.response?.status;

    if (checkAxiosError(error)) {
      const status = error.response.status ?? 500;
      const data = error.response.data ?? { message: 'Refresh Token Error' };

      // if backend response 401
      if (status && status !== 401) {
        console.error('Logout error:', data);
      }
    }

    // Even if backend fails, we should clear the cookie on frontend
    const response = NextResponse.json(
      { message: 'Signed out (with backend error)' },
      { status: 200 },
    );

    response.cookies.delete('refresh_token');
    response.cookies.delete('user_role');

    return response;
  }
};
