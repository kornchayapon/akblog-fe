import { NextResponse } from 'next/server';

import { apiServer } from '@/lib/axios/axios';

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Missing Authorization header' },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();

    const res = await apiServer.post('/otp/verify', body, {
      headers: {
        Authorization: authHeader,
      },
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(
        {
          message: res.data.detail,
        },
        { status: res.status },
      );
    }

    const { user } = res.data;
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.log('[api proxy > verify OTP error]:', error);
  }
}
