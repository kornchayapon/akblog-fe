import { NextResponse } from 'next/server';

import { apiServer } from '@/lib/axios/axios';

import { z } from 'zod';

const githubSigninSchema = z.object({
  code: z.string().min(1, 'GitHub code is invalid'),
  redirectUri: z.url({ message: 'Invalid redirectUri format' }).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validated = githubSigninSchema.safeParse(body);

    if (!validated.success) {
      const errors = validated.error.issues.reduce(
        (acc, issue) => {
          const field = issue.path[0] as string;

          if (!acc[field]) acc[field] = [];
          acc[field].push(issue.message);

          return acc;
        },
        {} as Record<string, string[]>,
      );

      return NextResponse.json(
        {
          message: 'Data validation failed',
          errors,
        },
        { status: 400 },
      );
    }

    const res = await apiServer.post('/auth/github', validated.data, {
      // Let us handle non-2xx ourselves
      validateStatus: () => true,
    });

    const data = res.data;

    // Error response?
    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(
        {
          message: res.data.detail,
        },
        { status: res.status },
      );
    }

    const response = NextResponse.json(data, { status: res.status });

    const backendCookies = res.headers['set-cookie'];
    if (backendCookies) {
      backendCookies.forEach((cookie) => {
        response.headers.append('Set-Cookie', cookie);
      });
    }

    return response;
  } catch (error: unknown) {
    console.log('[api proxy > github auth error]:', error);
  }
}
