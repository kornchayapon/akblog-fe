import { NextResponse } from 'next/server';

import { apiServer } from '@/lib/axios/axios';

interface IParams {
  slug: string;
}
export const GET = async (req: Request, ctx: { params: Promise<IParams> }) => {
  const { slug } = await ctx.params;
  const trimmed = slug?.trim();
  if (!trimmed) {
    return NextResponse.json({ message: 'Invalid slug' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);

  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '1000';
  const withDeleted = searchParams.get('withDeleted') || 'false';
  const status = searchParams.get('status') || undefined;

  try {
    const res = await apiServer.get(
      `/guest/${encodeURIComponent(trimmed)}/category`,
      {
        params: {
          page,
          limit,
          withDeleted,
          status,
        },
        validateStatus: () => true,
      },
    );

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
    console.log('[api proxy > get blogs by slug category guest error]:', error);
  }
};
