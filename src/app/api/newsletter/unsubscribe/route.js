import { NextResponse } from 'next/server';
import { getSubscribersCollection } from '@/lib/newsletter/subscribers';
import { logNewsletterEvent } from '@/lib/newsletter/events';
import { verifyUnsubscribeToken } from '@/lib/newsletter/tokens';

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

    const verification = await verifyUnsubscribeToken(token);

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
      return NextResponse.json(
        { ok: false, error: 'invalid_token', reason: 'invalid' },
        { status: 400 }
      );
    }

    await subscribers.updateOne(
      { email },
      {
        $set: {
          status: 'unsubscribed',
          unsubscribedAt: now,
          updatedAt: now,
        },
      }
    );

    await logNewsletterEvent({
      email,
      type: 'unsubscribed',
      source: source || existing.source || 'unknown',
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Newsletter unsubscribe error:', err);
    return NextResponse.json(
      { ok: false, error: 'internal_error' },
      { status: 500 }
    );
  }
}

