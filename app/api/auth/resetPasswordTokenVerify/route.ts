import { NextResponse } from 'next/server';

import { apiServer } from '@/lib/axios/axios';

import { z } from 'zod';

const schema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = schema.safeParse(body);
    if (!validated.success) {
      const errors = validated.error.issues.reduce(
        (acc, issue) => {
          const field = (issue.path[0] as string) ?? 'token';
          if (!acc[field]) acc[field] = [];
          acc[field].push(issue.message);
          return acc;
        },
        {} as Record<string, string[]>,
      );
      return NextResponse.json(
        { message: 'Validation failed', errors },
        { status: 400 },
      );
    }

    const res = await apiServer.post('/auth/resetPasswordTokenVerify', {
      token: validated.data.token,
    });

    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(res.data ?? {}, { status: res.status });
    }

    return NextResponse.json(res.data ?? {}, { status: res.status });
  } catch (error) {
    console.log('[api proxy > reset password token verify error]:', error);
  }
}
