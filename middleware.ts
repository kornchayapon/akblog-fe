import { NextRequest, NextResponse } from 'next/server';

import { isStaffRestrictedAdminPath } from './lib/constants/staff-restricted-admin';

const ALLOWED_ROLES = ['admin', 'staff'];

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // check the permission
  if (pathname.startsWith('/admin')) {
    const userRole = request.cookies.get('user_role')?.value?.toLowerCase();

    if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    if (userRole === 'staff' && isStaffRestrictedAdminPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
};


// Config to match only relevant paths for performance
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

