import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ensureTelemetryIndexes } from '@/lib/telemetry/db';

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

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function optionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const normalized = Array.from(
    new Set(
      value
        .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
        .map((entry) => entry.trim())
    )
  );

  return normalized.length > 0 ? normalized : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function optionalBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

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
    const models = optionalStringArray(body.models);
    const modelCount = optionalNumber(body.modelCount) ?? models?.length;

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
      platform: optionalString(body.platform),
      context: optionalString(body.context),
      tab: optionalString(body.tab),
      model: optionalString(body.model),
      models,
      modelCount,
      modelRole: optionalString(body.modelRole),
      command: optionalString(body.command),
      locale: optionalString(body.locale),
      // Use-case analytics fields
      slug: optionalString(body.slug),
      queryLength: optionalNumber(body.queryLength),
      ctaType: optionalString(body.ctaType),
      filename: optionalString(body.filename),
      referrer: optionalString(body.referrer),
      userAgent: optionalString(body.userAgent),
      // Phase 3: CLI instrumentation fields
      embeddingModel: optionalString(body.embeddingModel),
      rerankModel: optionalString(body.rerankModel),
      llmModel: optionalString(body.llmModel),
      queryModel: optionalString(body.queryModel),
      docModel: optionalString(body.docModel),
      inputType: optionalString(body.inputType),
      chunkStrategy: optionalString(body.chunkStrategy),
      provider: optionalString(body.provider),
      transport: optionalString(body.transport),
      workflowName: optionalString(body.workflowName),
      packageName: optionalString(body.packageName),
      format: optionalString(body.format),
      durationMs: optionalNumber(body.durationMs),
      resultCount: optionalNumber(body.resultCount),
      docCount: optionalNumber(body.docCount),
      batchSize: optionalNumber(body.batchSize),
      chunkSize: optionalNumber(body.chunkSize),
      turnCount: optionalNumber(body.turnCount),
      errorType: optionalString(body.errorType),
      local: optionalBoolean(body.local),
      createIndex: optionalBoolean(body.createIndex),
      isBuiltin: optionalBoolean(body.isBuiltin),
      isCommunity: optionalBoolean(body.isCommunity),
      timestamp: optionalString(body.timestamp) || new Date().toISOString(),
      receivedAt: new Date(),
      country,
      region,
      city,
      ...(latitude !== undefined && longitude !== undefined
        ? { location: { type: 'Point', coordinates: [longitude, latitude] } }
        : {}),
    };

    await ensureTelemetryIndexes();
    const db = await connectDB();
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
