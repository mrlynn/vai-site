import { NextResponse } from 'next/server';
import { sendNewsletterToActiveSubscribers } from '@/lib/newsletter/sender';

const NEWSLETTER_ADMIN_TOKEN = process.env.NEWSLETTER_ADMIN_TOKEN;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function isAuthorized(request) {
  // 1) Allow /admin UI via admin session cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMatch = cookieHeader.match(/vai_admin_token=([^;]+)/);
  if (cookieMatch && ADMIN_TOKEN && cookieMatch[1] === ADMIN_TOKEN) {
    return true;
  }

  // 2) Allow external tools via Bearer NEWSLETTER_ADMIN_TOKEN (optional)
  if (NEWSLETTER_ADMIN_TOKEN) {
    const header = request.headers.get('authorization') || request.headers.get('Authorization');
    if (header) {
      const [scheme, token] = header.split(' ');
      if (scheme === 'Bearer' && token && token === NEWSLETTER_ADMIN_TOKEN) {
        return true;
      }
    }
  }

  return false;
}

export async function POST(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    const subject = body?.subject;
    const htmlBody = body?.htmlBody;
    const textBody = body?.textBody;
    const dryRun = !!body?.dryRun;
    const limit = typeof body?.limit === 'number' ? body.limit : undefined;

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json(
        { ok: false, error: 'invalid_subject' },
        { status: 400 }
      );
    }

    if (!htmlBody && !textBody) {
      return NextResponse.json(
        { ok: false, error: 'missing_body' },
        { status: 400 }
      );
    }

    const result = await sendNewsletterToActiveSubscribers({
      subject: subject.trim(),
      htmlBody: typeof htmlBody === 'string' ? htmlBody : undefined,
      textBody: typeof textBody === 'string' ? textBody : undefined,
      dryRun,
      limit,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('Newsletter send pipeline error:', err);
    return NextResponse.json(
      { ok: false, error: 'internal_error' },
      { status: 500 }
    );
  }
}

