import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function POST(request: NextRequest) {
  try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_TOKEN) {
      return NextResponse.json(
        { ok: false, error: 'admin_auth_not_configured' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    const email = body?.email;
    const password = body?.password;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { ok: false, error: 'invalid_credentials' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set(ADMIN_SESSION_COOKIE, ADMIN_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      { ok: false, error: 'internal_error' },
      { status: 500 }
    );
  }
}

