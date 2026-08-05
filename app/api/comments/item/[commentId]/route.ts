import { NextResponse } from 'next/server';
import { z } from 'zod';

import { COMMENT_MAX_LENGTH } from '@/lib/constants/comment';
import { apiServer } from '@/lib/axios/axios';

const UpdateCommentSchema = z.object({
  content: z.string().min(1).max(COMMENT_MAX_LENGTH),
  blog: z.number().int().positive(),
});

type RouteParams = {
  params: Promise<{ commentId: string }>;
};

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
    const body = await req.json();
    const validatedData = UpdateCommentSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: 'Data invalid!', errors: validatedData.error.issues },
        { status: 400 },
      );
    }

    const res = await apiServer.patch(
      `/comments/${commentId}`,
      validatedData.data,
      {
        headers: { Authorization: authHeader },
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
    console.log('[api proxy > update comment error]:', error);
  }
};

export const DELETE = async (req: Request, { params }: RouteParams) => {
  const { commentId } = await params;
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  try {
    const res = await apiServer.delete(`/comments/${commentId}`, {
      headers: { Authorization: authHeader },
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
    console.log('[api proxy > delete comment error]:', error);
  }
};
