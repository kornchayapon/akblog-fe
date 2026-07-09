import { NextResponse } from 'next/server';

import {
  isStaffFromCookies,
  staffForbiddenResponse,
} from '@/lib/auth/staff-cookie';
import { checkAxiosError } from '@/lib/functions/check-axios-error';
import { apiServer } from '@/lib/axios/axios';

// get all users
export const GET = async (req: Request) => {
  console.log('yes i do');
  
  if (await isStaffFromCookies()) {
    return staffForbiddenResponse();
  }

  const authHeader = req.headers.get('authorization');

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '1000';
  const withDeleted = searchParams.get('withDeleted') || 'false';

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  const params: Record<string, string> = {
    page,
    limit,
    withDeleted,
  };

  try {
    const res = await apiServer.get('/users', {
      params,
      headers: {
        Authorization: authHeader,
      },
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(res.data, { status: res.status });
    }

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    if (checkAxiosError(error)) {
      const status = error.response.status ?? 500;
      const data = error.response.data ?? {
        message: 'Backend Error, Get users error!',
      };

      return NextResponse.json(data, { status });
    }

    return NextResponse.json({ message: 'Get users error!' }, { status: 500 });
  }
};
