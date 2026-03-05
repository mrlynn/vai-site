import { NextResponse } from 'next/server';
import { getSubscribersCollection } from '@/lib/newsletter/subscribers';
import { logNewsletterEvent } from '@/lib/newsletter/events';
import { generateConfirmToken } from '@/lib/newsletter/tokens';
import { buildConfirmEmail, sendNewsletterEmail } from '@/lib/newsletter/emailTemplates';

const DEFAULT_SOURCE = 'footer';

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  // Simple email pattern, good enough for basic validation
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(trimmed);
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    const email = body?.email?.trim();
    const source = typeof body?.source === 'string' ? body.source : DEFAULT_SOURCE;

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: 'invalid_email' },
        { status: 400 }
      );
    }

    const subscribers = await getSubscribersCollection();

    const now = new Date();

    const existing = await subscribers.findOne({ email });

    const status = existing?.status || 'pending';
    const update = {
      email,
      status: status === 'active' ? 'active' : 'pending',
      source,
      updatedAt: now,
      createdAt: existing?.createdAt || now,
    };

    await subscribers.updateOne(
      { email },
      { $set: update },
      { upsert: true }
    );

    const token = await generateConfirmToken({ email, source });

    let baseUrl = 'http://localhost:3000';

    if (process.env.APP_BASE_URL) {
      baseUrl = process.env.APP_BASE_URL;
    } else if (process.env.NEXT_PUBLIC_APP_BASE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
    } else if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    const confirmUrl = `${baseUrl}/newsletter/confirm?token=${encodeURIComponent(
      token
    )}`;

    const { subject, text, html } = buildConfirmEmail({ email, confirmUrl });

    try {
      await sendNewsletterEmail({ to: email, subject, text, html });
    } catch (emailError) {
      console.error('Newsletter confirmation email error:', emailError);
      // Do not reveal provider errors to the client; they can retry later.
    }

    await logNewsletterEvent({
      email,
      type: 'subscribed',
      source,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    return NextResponse.json(
      { ok: false, error: 'internal_error' },
      { status: 500 }
    );
  }
}

