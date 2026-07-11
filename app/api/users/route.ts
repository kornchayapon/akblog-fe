import { NextResponse } from 'next/server';

import {
  isStaffFromCookies,
  staffForbiddenResponse,
} from '@/lib/auth/staff-cookie';

import { apiServer } from '@/lib/axios/axios';

import {
  CreateUserSchema,
  UpdateUserSchema,
} from '@/modules/admin/users/schemas/user-schema';
import { RemoveNullFields } from '@/lib/functions/remove-null-fields';

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
      return NextResponse.json(
        {
          message: res.data.detail,
        },
        { status: res.status },
      );
    }

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    console.log('[api proxy > get all users error]:', error);
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
      console.log(
        '[proxy: users]: validatedData: ',
        validatedData.error.issues,
      );

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
      return NextResponse.json(
        {
          message: res.data.detail,
        },
        { status: res.status },
      );
    }

    return NextResponse.json(res.data, { status: 201 });
  } catch (error: unknown) {
    console.log('[api proxy > create user error]:', error);
  }
};

// update user
export const PATCH = async (req: Request) => {
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

    const validatedData = UpdateUserSchema.safeParse(body);

    if (!validatedData.success) {
      console.log(
        '[proxy: users]: validatedData: ',
        validatedData.error.issues,
      );

      return NextResponse.json(
        { message: 'Data invalid!', errors: validatedData.error.issues },
        { status: 400 },
      );
    }

    const userObj = RemoveNullFields(body, 'userId');

    console.log('[user patch]: ', body, userObj);

    const res = await apiServer.patch(`/users/${body.userId}`, userObj, {
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

    return NextResponse.json(res.data, { status: 200 });
  } catch (error: unknown) {
    console.log('[api proxy > update user error]:', error);
  }
};
