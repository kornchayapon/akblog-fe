import { NextResponse } from 'next/server';

import {
  isStaffFromCookies,
  staffForbiddenResponse,
} from '@/lib/auth/staff-cookie';
import { checkAxiosError } from '@/lib/functions/check-axios-error';
import { apiServer } from '@/lib/axios/axios';

interface IParams {
  userId: string;
}

export const PATCH = async (
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
    const res = await apiServer.patch(`/users/${userId}/restore`, undefined, {
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
    console.log('[api proxy > restore user error]:', error);
  }
};
