import { NextResponse } from 'next/server';

import { AxiosError } from 'axios';
import { apiServer } from '@/lib/axios/axios';

import { SignInSchema } from '@/modules/front/schemas/auth-schemas';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    console.log('[proxy: signin] body: ', body);

    // validation
    const validatedData = SignInSchema.safeParse(body);

    if (!validatedData.success) {
      console.log(
        '[proxy: signin]: validatedDate: ',
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
    const res = await apiServer.post('/auth/signin', validatedData.data);

    const data = res.data;

    console.log('[signin data]: ', data);

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(data, { status: res.status });
    }

    // Success Response
    const response = NextResponse.json(res.data, { status: res.status });

    // Smart Cookie Proxying
    const backendCookies = res.headers['set-cookie'];
    if (backendCookies) {
      backendCookies.forEach((cookie) => {
        response.headers.append('Set-Cookie', cookie);
      });
    }

    return response;
  } catch (error: unknown) {
    const err = error as AxiosError;
    const status = err.response?.status;
    const data = err.response?.data ?? { message: 'Error from Backend' };

    return NextResponse.json(data, { status });
  }
};
