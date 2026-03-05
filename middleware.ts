import { NextRequest, NextResponse } from 'next/server';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLogin = pathname.startsWith('/admin/login');

  if (isAdminRoute && !isAdminLogin) {
    if (!ADMIN_TOKEN) {
      // If admin auth is not configured, fail closed.
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const cookie = request.cookies.get('vai_admin_token')?.value;

    if (!cookie || cookie !== ADMIN_TOKEN) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

