// app/api/pictures/route.ts

import { NextResponse } from 'next/server';
import { apiServer } from '@/lib/axios/axios';

// POST /api/pictures (for Upload)
export const POST = async (req: Request) => {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  try {
    const formData = await req.formData();

    // Forward formData to NestJS
    const res = await apiServer.post('/pictures/upload-files', formData, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'multipart/form-data',
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
    console.log('[api proxy > upload pictures error]:', error);
  }
};

// DELETE /api/pictures?id=... (No change needed here as it doesn't involve FormData)
export const DELETE = async (req: Request) => {
  // 1. Get Authorization Header from Client
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      { message: 'Authorization Header not found!' },
      { status: 401 },
    );
  }

  try {
    // 2. Get Query Parameter (id)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Picture ID not found!' },
        { status: 400 },
      );
    }

    // 3. Proxy DELETE Request to Nest.js Endpoint
    const res = await apiServer.delete(
      '/pictures', // Actual Nest.js Endpoint
      {
        params: { id }, // Pass id as Query Parameter
        headers: {
          Authorization: authHeader,
        },
        validateStatus: () => true,
      },
    );

    // 4. Forward Response back to Client
    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(
        {
          message: res.data.detail,
        },
        { status: res.status },
      );
    }

    // Return success status (200, 204) with no body
    return new NextResponse(null, { status: res.status });
  } catch (error: unknown) {
    console.log('[api proxy > delete picture error]:', error);
  }
};
