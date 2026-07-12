import {
  isStaffFromCookies,
  staffForbiddenResponse,
} from '@/lib/auth/staff-cookie';
import { apiServer } from '@/lib/axios/axios';

import { NextResponse } from 'next/server';

// permanent delete category
interface IParams {
  categoryId: string;
}

export const DELETE = async (
  req: Request,
  ctx: { params: Promise<IParams> },
) => {
  if (await isStaffFromCookies()) {
    return staffForbiddenResponse();
  }

  const { categoryId } = await ctx.params;

  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  try {
    const res = await apiServer.delete(`/categories/${categoryId}/permanent`, {
      headers: { Authorization: authHeader },
      validateStatus: () => true,
    });

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
    console.log('[api proxy > permanent delete category error]:', error);
  }
};
