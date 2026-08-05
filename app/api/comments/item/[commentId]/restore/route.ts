import { NextResponse } from 'next/server';

import { apiServer } from '@/lib/axios/axios';

interface RouteParams {
  params: Promise<{ commentId: string }>;
}

// restore soft-deleted comment (admin)
export const PATCH = async (req: Request, { params }: RouteParams) => {
  const { commentId } = await params;
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  try {
    const res = await apiServer.patch(
      `/comments/${commentId}/restore`,
      undefined,
      {
        headers: { Authorization: authHeader },
        validateStatus: () => true,
      },
    );

    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(res.data, { status: res.status });
    }

    return NextResponse.json(res.data, { status: 200 });
  } catch (error: unknown) {
    console.log('[api proxy > restore comment error]:', error);
  }
};
