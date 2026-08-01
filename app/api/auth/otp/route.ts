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
    const rawBody = await req.text();
    const body = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {};

    const res = await apiServer.post('/otp/request', body, {
      headers: {
        Authorization: authHeader, // forward Bearer token
      },
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(res.data, { status: res.status });
    }

    const user = res.data;
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.log('[api proxy > request OTP error]:', error);
  }
}
