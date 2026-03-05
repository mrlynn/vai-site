import { NextResponse } from 'next/server';
import { getSubscribersCollection } from '@/lib/newsletter/subscribers';
import { logNewsletterEvent } from '@/lib/newsletter/events';
import { verifyConfirmToken, generateUnsubscribeToken } from '@/lib/newsletter/tokens';
import { buildWelcomeEmail, sendNewsletterEmail } from '@/lib/newsletter/emailTemplates';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const token = body?.token;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'invalid_token', reason: 'invalid' },
        { status: 400 }
      );
    }

    const verification = await verifyConfirmToken(token);

    if (!verification.ok) {
      return NextResponse.json(
        { ok: false, error: 'invalid_token', reason: verification.reason },
        { status: 400 }
      );
    }

    const email = verification.email;
    const source = verification.source;

    const subscribers = await getSubscribersCollection();
    const now = new Date();

    const existing = await subscribers.findOne({ email });

    if (!existing) {
      // Subscriber record missing; do not leak details, just treat as invalid
      return NextResponse.json(
        { ok: false, error: 'invalid_token', reason: 'invalid' },
        { status: 400 }
      );
    }

    await subscribers.updateOne(
      { email },
      {
        $set: {
          status: 'active',
          confirmedAt: existing.confirmedAt || now,
          updatedAt: now,
        },
      }
    );

    await logNewsletterEvent({
      email,
      type: 'confirmed',
      source: source || existing.source || 'unknown',
    });

    let baseUrl = 'http://localhost:3000';

    if (process.env.APP_BASE_URL) {
      baseUrl = process.env.APP_BASE_URL;
    } else if (process.env.NEXT_PUBLIC_APP_BASE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
    } else if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    const unsubscribeToken = await generateUnsubscribeToken({
      email,
      source: source || existing.source || 'unknown',
    });
    const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(
      unsubscribeToken
    )}`;

    try {
      const { subject, text, html } = buildWelcomeEmail({ email, unsubscribeUrl });
      await sendNewsletterEmail({ to: email, subject, text, html });
    } catch (emailError) {
      console.error('Newsletter welcome email error:', emailError);
      // Confirmation is still considered successful even if welcome email fails.
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Newsletter confirm error:', err);
    return NextResponse.json(
      { ok: false, error: 'internal_error' },
      { status: 500 }
    );
  }
}

