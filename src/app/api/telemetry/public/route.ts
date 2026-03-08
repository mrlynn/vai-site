import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ensureTelemetryIndexes } from '@/lib/telemetry/db';
import { getPublicTelemetryPayload } from '@/lib/telemetry/public-read-model';

export const dynamic = 'force-dynamic';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return false;
  }

  entry.count += 1;
  return entry.count > 300;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 600_000);

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.toString()) {
    return NextResponse.json(
      { error: 'This endpoint has a fixed contract and does not accept query parameters.' },
      { status: 400 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded.' },
      { status: 429 }
    );
  }

  try {
    await ensureTelemetryIndexes();
    const db = await connectDB();
    const payload = await getPublicTelemetryPayload(db);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Public telemetry route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
