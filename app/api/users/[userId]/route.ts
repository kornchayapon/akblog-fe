import { NextResponse } from 'next/server';

import {
  isStaffFromCookies,
  staffForbiddenResponse,
} from '@/lib/auth/staff-cookie';
import { apiServer } from '@/lib/axios/axios';

// get user by id
interface IParams {
  userId: string;
}

export const GET = async (req: Request, ctx: { params: Promise<IParams> }) => {
  if (await isStaffFromCookies()) {
    return staffForbiddenResponse();
  }

  const { userId } = await ctx.params;

  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  try {
    const res = await apiServer.get(`/users/${userId}`, {
      headers: { Authorization: authHeader },
      validateStatus: () => true,
    });

    // Error Response??
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
    console.log('[api proxy > get user by id error]:', error);
  }
};

// soft delete user
export const DELETE = async (
  req: Request,
  ctx: { params: Promise<IParams> },
) => {
  if (await isStaffFromCookies()) {
    return staffForbiddenResponse();
  }

  const { userId } = await ctx.params;

  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  try {
    const res = await apiServer.delete(`/users/${userId}`, {
      headers: { Authorization: authHeader },
      validateStatus: () => true,
    });

    // Error Response??
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
    console.log('[api proxy > soft delete user error]:', error);
  }
};

