import { NextResponse } from 'next/server';

import { apiServer } from '@/lib/axios/axios';

interface IParams {
  blogId: string;
}

export const PATCH = async (
  req: Request,
  ctx: { params: Promise<IParams> },
) => {
  const { blogId } = await ctx.params;

  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  try {
    const res = await apiServer.patch(`/blogs/${blogId}/restore`, undefined, {
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
    console.log('[api proxy > restore blog by id error]:', error);
  }
};
