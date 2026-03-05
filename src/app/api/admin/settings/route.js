import { NextResponse } from 'next/server';
import { getGlobalSettings, updateGlobalSettings } from '@/lib/settings';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function requireAdmin(request) {
  if (!ADMIN_TOKEN) return false;
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

export async function GET(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const settings = await getGlobalSettings();
    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Admin settings GET error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const partial = {
      editorTheme: typeof body.editorTheme === 'string' ? body.editorTheme : undefined,
      footerBio: typeof body.footerBio === 'string' ? body.footerBio : undefined,
    };

    const settings = await updateGlobalSettings(partial);
    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Admin settings PATCH error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

