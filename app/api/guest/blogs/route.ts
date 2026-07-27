import { apiServer } from '@/lib/axios/axios';
import { NextResponse } from 'next/server';

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '1000';
  const withDeleted = searchParams.get('withDeleted') || 'false';
  const status = searchParams.get('status') || undefined;

  try {
    const res = await apiServer.get('/guest', {
      params: {
        page,
        limit,
        withDeleted,
        status,
      },
      validateStatus: () => true,
    });

    console.log('proxy fetch guest blogs work ...');

    // Error response?
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
    console.log('[api proxy > get all blogs guest error]:', error);
  }
};
