import { NextResponse } from 'next/server';
import { apiServer } from '@/lib/axios/axios';

// permanent delete blog
interface IParams {
  blogId: string;
}

export const DELETE = async (
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
    const res = await apiServer.delete(`/blogs/${blogId}/permanent`, {
      headers: { Authorization: authHeader },
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(res.data, { status: res.status });
    }

    return NextResponse.json(res.data, { status: 200 });
  } catch (error: unknown) {
    console.log('[api proxy > permanent delete blog error]:', error);
  }
};
