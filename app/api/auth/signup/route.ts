import { NextResponse } from 'next/server';

import { SignUpSchema } from "@/modules/guest/schemas/auth-schemas";

import { apiServer } from '@/lib/axios/axios';
import { checkAxiosError } from '@/lib/functions/check-axios-error';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    console.log('[proxy: signup] body: ', body);

    // validation
    const validatedData = SignUpSchema.safeParse(body);

    if (!validatedData.success) {
      console.log(
        '[proxy: signup]: validatedDate: ',
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

    // send request to server
    const res = await apiServer.post('/auth/signup', validatedData.data);

    const data = res.data;

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(data, { status: res.status });
    }

    // Success Response
    const response = NextResponse.json(data, { status: res.status });

    // Smart Cookie Proxying
    const backendCookies = res.headers['set-cookie'];
    if (backendCookies) {
      backendCookies.forEach((cookie) => {
        response.headers.append('Set-Cookie', cookie);
      });
    }

    return response;
  } catch (error: unknown) {
    if (checkAxiosError(error)) {
      const status = error.response.status ?? 500;
      const data = error.response.data ?? { message: 'Backend Error, Sign up error!' };

      return NextResponse.json(data, { status });
    }

    console.error('[SIGNUP_FATAL_ERROR]:', error);

    return NextResponse.json(
      { message: 'Sign up error!' },
      { status: 500 },
    );
  }
}