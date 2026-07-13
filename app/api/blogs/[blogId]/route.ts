import { NextResponse } from 'next/server';

import { apiServer } from '@/lib/axios/axios';

// get blog by id
interface IParams {
  blogId: string;
}

export const GET = async (req: Request, ctx: { params: Promise<IParams> }) => {
  const { blogId } = await ctx.params;

  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  try {
    const res = await apiServer.get(`/blogs/${blogId}`, {
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
    console.log('[api proxy > get blog by id error]:', error);
  }
};
