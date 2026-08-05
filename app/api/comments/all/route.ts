import { NextResponse } from 'next/server';

import { apiServer } from '@/lib/axios/axios';

type QueryParams = Readonly<{
  limit?: string;
  page?: string;
  sortBy?: string;
  orderBy?: string;
  withDeleted?: string;
  search?: string;
}>;

// get all comments (admin)
export const GET = async (req: Request) => {
  const authHeader = req.headers.get('authorization');
  const { searchParams } = new URL(req.url);

  const searchRaw = searchParams.get('search');
  const searchTrimmed = searchRaw?.trim() ?? '';

  const query: QueryParams = {
    limit: searchParams.get('limit') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    sortBy: searchParams.get('sortBy') ?? undefined,
    orderBy: searchParams.get('orderBy') ?? undefined,
    withDeleted: searchParams.get('withDeleted') ?? undefined,
    ...(searchTrimmed.length > 0 ? { search: searchTrimmed } : {}),
  };

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  try {
    const res = await apiServer.get('/comments', {
      params: query,
      headers: {
        Authorization: authHeader,
      },
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
    console.log('[api proxy > get admin comment error]:', error);
  }
};
