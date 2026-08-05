import { NextResponse } from 'next/server';

import { apiServer } from '@/lib/axios/axios';

type RouteParams = {
  params: Promise<{ blogId: string }>;
};

type QueryParams = Readonly<{
  limit?: string;
  page?: string;
  sortBy?: string;
  orderBy?: string;
  withDeleted?: string;
}>;

export const GET = async (req: Request, { params }: RouteParams) => {
  const { blogId } = await params;
  const authHeader = req.headers.get('authorization');
  const { searchParams } = new URL(req.url);

  const query: QueryParams = {
    limit: searchParams.get('limit') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    sortBy: searchParams.get('sortBy') ?? undefined,
    orderBy: searchParams.get('orderBy') ?? undefined,
    withDeleted: searchParams.get('withDeleted') ?? undefined,
  };

  try {
    const res = await apiServer.get(`/guest/comments/${blogId}`, {
      params: query,
      headers: authHeader
        ? {
            Authorization: authHeader,
          }
        : undefined,
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
    console.log('[api proxy > get comments error]:', error);
  }
};
