import { NextResponse } from 'next/server';

import {
  isStaffFromCookies,
  staffForbiddenResponse,
} from '@/lib/auth/staff-cookie';
import { checkAxiosError } from '@/lib/functions/check-axios-error';
import { apiServer } from '@/lib/axios/axios';

import { CreateUserSchema } from '@/modules/admin/users/schemas/user-schema';

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

// create user
export const POST = async (req: Request) => {
  if (await isStaffFromCookies()) {
    return staffForbiddenResponse();
  }

  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();

    const validatedData = CreateUserSchema.safeParse(body);

    if (!validatedData.success) {
      console.log('[proxy: users]: validatedData: ', validatedData.error.issues);

      return NextResponse.json(
        { message: 'Data invalid!', errors: validatedData.error.issues },
        { status: 400 },
      );
    }

    const res = await apiServer.post('/users', body, {
      headers: {
        Authorization: authHeader,
      },
      validateStatus: () => true,
    });

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(res.data, { status: res.status });
    }

    return NextResponse.json(res.data, { status: 201 });
  } catch (error: unknown) {
    if (checkAxiosError(error)) {
      const status = error.response.status ?? 500;
      const data = error.response.data ?? {
        message: 'Backend Error, Create user error!',
      };

      return NextResponse.json(data, { status });
    }

    return NextResponse.json(
      { message: 'Create user error!' },
      { status: 500 },
    );
  }
};
