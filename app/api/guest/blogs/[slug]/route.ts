import { NextResponse } from 'next/server';

import { apiServer } from '@/lib/axios/axios';

interface IParams {
  slug: string;
}

export const GET = async (_req: Request, ctx: { params: Promise<IParams> }) => {
  const { slug } = await ctx.params;
  const trimmed = slug?.trim();
  if (!trimmed) {
    return NextResponse.json({ message: 'Invalid slug' }, { status: 400 });
  }

  try {
    const res = await apiServer.get(`/guest/${encodeURIComponent(trimmed)}`, {
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
    console.log('[api proxy > get blogs by slug guest error]:', error);
  }
};
