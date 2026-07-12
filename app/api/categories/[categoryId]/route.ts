import { NextResponse } from "next/server";

import { isStaffFromCookies, staffForbiddenResponse } from "@/lib/auth/staff-cookie";
import { apiServer } from "@/lib/axios/axios";

interface IParams {
  categoryId: string;
}

// get category by id
export const GET = async (req: Request, ctx: { params: Promise<IParams> }) => {
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
    const res = await apiServer.get(`/categories/${categoryId}`, {
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
    console.log('[api proxy > get category by id error]:', error);
  }
};