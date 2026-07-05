import { apiServer } from '@/lib/axios/axios';
import { checkAxiosError } from '@/lib/functions/check-axios-error';

import { NextResponse } from 'next/server';

export const GET = async (req: Request) => {
  const authHeader = req.headers.get('authorization');

  console.log('[api/auth/me]: authHeader', authHeader);

  if (!authHeader) {
    const res401 = NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );

    res401.cookies.delete('user_role');
    return res401;
  }

  try {
    const res = await apiServer.get('/auth/me', {
      headers: {
        Authorization: authHeader,
      },
      validateStatus: () => true,
    });

    const user = res.data; // data is user

    console.log('[api/auth/me]: server get', user);

    // Error response
    if (res.status < 200 || res.status >= 300) {
      const errRes = NextResponse.json(user, { status: res.status });
      if (res.status === 401) errRes.cookies.delete('user_role');
    }

    const response = NextResponse.json(user, { status: res.status });

    // Set user_role cookie for middleware
    if (user?.role) {
      response.cookies.set('user_role', user.role, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return response;
  } catch (error: unknown) {
    if (checkAxiosError(error)) {
      const status = error.response.status ?? 500;
      const data = error.response.data ?? { message: 'Backend Error, Fetch user error (me)!' };

      return NextResponse.json(data, { status });
    }

    console.error('[api/auth/me - error]:', error);

    return NextResponse.json(
      { message: 'Fetch user error (me)!' },
      { status: 500 },
    );
  }
};
