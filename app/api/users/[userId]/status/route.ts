import { NextResponse } from 'next/server';

import {
  isStaffFromCookies,
  staffForbiddenResponse,
} from '@/lib/auth/staff-cookie';
import { apiServer } from '@/lib/axios/axios';

// update user status
export const PATCH = async (req: Request) => {
  console.log('update user status ******');

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

    console.log('[update user status]:', body);

    // const validatedData = UpdateUserSchema.safeParse(body);

    // if (!validatedData.success) {
    //   console.log(
    //     '[proxy: users]: validatedData: ',
    //     validatedData.error.issues,
    //   );

    //   return NextResponse.json(
    //     { message: 'Data invalid!', errors: validatedData.error.issues },
    //     { status: 400 },
    //   );
    // }

    // const userObj = RemoveNullFields(body, 'userId');

    // console.log('[user patch]: ', body, userObj);

    const res = await apiServer.patch(
      `/users/${body.userId}/status`,
      { active: body.active },
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
    console.log('[api proxy > update user error]:', error);
  }
};
