import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function isStaffFromCookies(): Promise<boolean> {
  const jar = await cookies();
  const role = jar.get('user_role')?.value?.toLowerCase();
  return role === 'staff';
}

export function staffForbiddenResponse(): NextResponse {
  return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
}
