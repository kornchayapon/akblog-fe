import { NextResponse } from 'next/server';
import { z } from 'zod';

import { COMMENT_MAX_LENGTH } from '@/lib/constants/comment';
import { apiServer } from '@/lib/axios/axios';


const CreateCommentSchema = z.object({
  content: z.string().min(1).max(COMMENT_MAX_LENGTH),
  blog: z.number().int().positive(),
  parentId: z.number().int().positive().optional(),
});

// create comment
export const POST = async (req: Request) => {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();

    const validatedData = CreateCommentSchema.safeParse(body);

    if (!validatedData.success) {
      console.log('[proxy: comments]: validatedData: ', validatedData.error.issues);

      return NextResponse.json(
        { message: 'Data invalid!', errors: validatedData.error.issues },
        { status: 400 },
      );
    }

    const res = await apiServer.post('/comments', validatedData.data, {
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

    return NextResponse.json(res.data, { status: 201 });
  } catch (error: unknown) {
    console.log('[api proxy > create comment error]:', error);
  }
};
