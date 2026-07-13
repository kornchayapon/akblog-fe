import { NextResponse } from "next/server";

import { apiServer } from "@/lib/axios/axios";
import { CreateBlogSchema } from "@/modules/admin/blogs/schemas/blog-schema";

// get all blogs
export const GET = async (req: Request) => {
  const authHeader = req.headers.get('authorization');

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '1000';
  const withDeleted = searchParams.get('withDeleted') || 'false';
  const searchRaw = searchParams.get('search');
  const search = searchRaw?.trim() ?? '';
  const status = searchParams.get('status') || undefined;
  const sortBy = searchParams.get('sortBy') || undefined;
  const order = searchParams.get('order') || undefined;

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  const params: Record<string, string> = {
    page,
    limit,
    withDeleted,
  };
  if (search.length > 0) params.search = search;
  if (status) params.status = status;
  if (sortBy) params.sortBy = sortBy;
  if (order) params.order = order;

  try {
    const res = await apiServer.get('/blogs', {
      params,
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
    console.log('[api proxy > get all blogs error]:', error);
  }
};

// create blog
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

    const validatedData = CreateBlogSchema.safeParse(body);

    if (!validatedData.success) {
      console.log('[proxy: blogs]: validatedData: ', validatedData.error.issues);

      return NextResponse.json(
        { message: 'Data invalid!', errors: validatedData.error.issues },
        { status: 400 },
      );
    }

    const res = await apiServer.post('/blogs', body, {
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
   console.log('[api proxy > create blog error]:', error);
  }
};