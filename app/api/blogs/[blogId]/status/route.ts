import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PublishStatusEnum } from '@/lib/enums/publish-status.enum';
import { apiServer } from '@/lib/axios/axios';

interface IParams {
  blogId: string;
}

const BlogStatusSchema = z.object({
  status: z.nativeEnum(PublishStatusEnum),
});

export const PATCH = async (
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
    const body: unknown = await req.json();

    const validatedData = BlogStatusSchema.safeParse(body);

    if (!validatedData.success) {
      console.log(
        '[proxy: blogs/status]: validatedData: ',
        validatedData.error.issues,
      );

      return NextResponse.json(
        { message: 'Data invalid!', errors: validatedData.error.issues },
        { status: 400 },
      );
    }

    const res = await apiServer.patch(
      `/blogs/${blogId}/status`,
      { status: validatedData.data.status },
      {
        headers: {
          Authorization: authHeader,
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

    return NextResponse.json(res.data, { status: 200 });
  } catch (error: unknown) {
    console.log('[api proxy > update blog status error]:', error);
  }
};
