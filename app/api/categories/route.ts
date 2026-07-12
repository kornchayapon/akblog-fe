import { NextResponse } from 'next/server';

import { apiServer } from '@/lib/axios/axios';
import {
  isStaffFromCookies,
  staffForbiddenResponse,
} from '@/lib/auth/staff-cookie';

import {
  CreateCategorySchema,
  UpdateCategorySchema,
} from '@/modules/admin/categories/schemas/category-schema';

import { RemoveNullFields } from '@/lib/functions/remove-null-fields';

// get all categories
export const GET = async (req: Request) => {
  const authHeader = req.headers.get('authorization');

  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '1000';
  const withDeleted = searchParams.get('withDeleted') || 'false';
  const searchRaw = searchParams.get('search');
  const search = searchRaw?.trim() ?? '';

  const params: Record<string, string> = {
    page,
    limit,
    withDeleted,
  };
  if (search.length > 0) {
    params.search = search;
  }

  try {
    const res = await apiServer.get('/categories', {
      params,
      headers: authHeader ? { Authorization: authHeader } : undefined,
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
    console.log('[api proxy > get all categories error]:', error);
  }
};

// create category
export const POST = async (req: Request) => {
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

    // validation
    const validatedData = CreateCategorySchema.safeParse(body);

    if (!validatedData.success) {
      console.log(
        '[proxy: categories]: validatedDate: ',
        validatedData.error.issues,
      );

      return NextResponse.json(
        {
          message: 'Data invalid!',
          errors: validatedData.error.issues,
        },
        { status: 400 },
      );
    }

    // Forward to backend
    const res = await apiServer.post('/categories', body, {
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
    console.log('[api proxy > create category error]:', error);
  }
};

// update category
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

    // validation
    const validatedData = UpdateCategorySchema.safeParse(body);

    if (!validatedData.success) {
      console.log(
        '[proxy: categories]: validatedDate: ',
        validatedData.error.issues,
      );

      return NextResponse.json(
        {
          message: 'Data invalid!',
          errors: validatedData.error.issues,
        },
        { status: 400 },
      );
    }

    // remove null fields
    const userObj = RemoveNullFields(body, 'categoryId');

    console.log('[api/categories/route/patch]:', userObj);

    // send request to server
    const res = await apiServer.patch(
      `/categories/${body.categoryId}`,
      userObj,
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

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: unknown) {
    console.log('[api proxy > update category error]:', error);
  }
};
