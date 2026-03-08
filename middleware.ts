import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isAdminAuthConfigured, isValidAdminSession } from '@/lib/admin-auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');
  const isAdminLogin = pathname.startsWith('/admin/login');

  if (isAdminRoute && !isAdminLogin) {
    if (!isAdminAuthConfigured()) {
      // If admin auth is not configured, fail closed.
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (!isValidAdminSession(cookie)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};

