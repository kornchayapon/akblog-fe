import { NextResponse } from 'next/server';

import {
  isStaffFromCookies,
  staffForbiddenResponse,
} from '@/lib/auth/staff-cookie';

import { apiServer } from '@/lib/axios/axios';
import { RemoveNullFields } from '@/lib/functions/remove-null-fields';

import {
  CreateTagSchema,
  UpdateTagSchema,
} from '@/modules/admin/tags/schemas/tag-schema';

// get all tags
export const GET = async (req: Request) => {
  const authHeader = req.headers.get('authorization');

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '1000';
  const withDeleted = searchParams.get('withDeleted') || 'false';
  const searchRaw = searchParams.get('search');
  const search = searchRaw?.trim() ?? '';

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
  if (search.length > 0) {
    params.search = search;
  }

  try {
    const res = await apiServer.get('/tags', {
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
    console.log('[api proxy > get all tags error]:', error);
  }
};

// create tag
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

    const validatedData = CreateTagSchema.safeParse(body);

    if (!validatedData.success) {
      console.log('[proxy: tags]: validatedData: ', validatedData.error.issues);

      return NextResponse.json(
        { message: 'Data invalid!', errors: validatedData.error.issues },
        { status: 400 },
      );
    }

    const res = await apiServer.post('/tags', body, {
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
    console.log('[api proxy > create tag error]:', error);
  }
};

// update tag
export const PATCH = async (req: Request) => {
  if (await isStaffFromCookies()) {
    return staffForbiddenResponse();
  }

  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();

    const validatedData = UpdateTagSchema.safeParse(body);

    if (!validatedData.success) {
      console.log('[proxy: tags]: validatedData: ', validatedData.error.issues);

      return NextResponse.json(
        { message: 'Data invalid!', errors: validatedData.error.issues },
        { status: 400 },
      );
    }

    const userObj = RemoveNullFields(body, 'tagId');

    console.log('[api/tags/route/patch]:', userObj);

    const res = await apiServer.patch(`/tags/${body.tagId}`, userObj, {
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
    console.log('[api proxy > update tag error]:', error);
  }
};
