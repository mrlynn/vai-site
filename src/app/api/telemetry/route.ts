import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return false;
  }

  entry.count++;
  if (entry.count > 100) {
    return true;
  }

  return false;
}

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 600_000); // every 10 minutes

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Rate limit check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 100 events per hour.' },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.event || typeof body.event !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: event' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!body.version || typeof body.version !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: version' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Get geo from Vercel headers (privacy-safe, no full IP stored)
    const country = request.headers.get('x-vercel-ip-country') || undefined;
    const region = request.headers.get('x-vercel-ip-country-region') || undefined;
    const city = request.headers.get('x-vercel-ip-city')
      ? decodeURIComponent(request.headers.get('x-vercel-ip-city')!)
      : undefined;
    const latitude = request.headers.get('x-vercel-ip-latitude')
      ? parseFloat(request.headers.get('x-vercel-ip-latitude')!)
      : undefined;
    const longitude = request.headers.get('x-vercel-ip-longitude')
      ? parseFloat(request.headers.get('x-vercel-ip-longitude')!)
      : undefined;

    // Build the telemetry document
    const doc = {
      event: body.event,
      version: body.version,
      platform: body.platform || undefined,
      context: body.context || undefined,
      tab: body.tab || undefined,
      model: body.model || undefined,
      command: body.command || undefined,
      locale: body.locale || undefined,
      // Use-case analytics fields
      slug: body.slug || undefined,
      queryLength: body.queryLength || undefined,
      ctaType: body.ctaType || undefined,
      filename: body.filename || undefined,
      referrer: body.referrer || undefined,
      userAgent: body.userAgent || undefined,
      timestamp: body.timestamp || new Date().toISOString(),
      receivedAt: new Date(),
      country,
      region,
      city,
      ...(latitude !== undefined && longitude !== undefined
        ? { location: { type: 'Point', coordinates: [longitude, latitude] } }
        : {}),
    };

    const db = await getDb();
    await db.collection('events').insertOne(doc);

    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('Telemetry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
