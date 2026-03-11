import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import connectDB from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// Admin-only live telemetry feed.
// Returns recent events with geo data for the real-time map dashboard.

export type LiveEvent = {
  id: string;
  event: string;
  version?: string;
  platform?: string;
  context?: string;
  model?: string;
  command?: string;
  country?: string;
  city?: string;
  coords?: [number, number]; // [longitude, latitude] — GeoJSON order
  durationMs?: number;
  receivedAt: string; // ISO string
};

export async function GET(request: NextRequest) {
  const apiKey =
    request.nextUrl.searchParams.get('API_KEY') ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  const expectedKey = process.env.TELEMETRY_API_KEY;
  const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const hasValidAdminSession = isValidAdminSession(adminToken);
  const hasValidApiKey = Boolean(expectedKey && apiKey === expectedKey);

  if (!hasValidAdminSession && !hasValidApiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawLimit = parseInt(request.nextUrl.searchParams.get('limit') || '100', 10);
  const limit = Math.min(Math.max(1, rawLimit), 500);

  const sinceParam = request.nextUrl.searchParams.get('since');

  // Default window: last 10 minutes on initial load.
  // When polling, caller passes ?since=<ISO> to get only new events.
  const cutoff = sinceParam
    ? new Date(sinceParam)
    : (() => {
        const t = new Date();
        t.setMinutes(t.getMinutes() - 10);
        return t;
      })();

  try {
    const db = await connectDB();
    const docs = await db
      .collection('events')
      .find(
        { receivedAt: { $gt: cutoff } },
        {
          projection: {
            _id: 1,
            event: 1,
            version: 1,
            platform: 1,
            context: 1,
            model: 1,
            models: 1,
            command: 1,
            country: 1,
            city: 1,
            location: 1,
            durationMs: 1,
            receivedAt: 1,
          },
        }
      )
      .sort({ receivedAt: -1 })
      .limit(limit)
      .toArray();

    const events: LiveEvent[] = docs.map((doc) => ({
      id: doc._id.toString(),
      event: doc.event as string,
      version: doc.version as string | undefined,
      platform: doc.platform as string | undefined,
      context: doc.context as string | undefined,
      model: (doc.model as string | undefined) ?? (doc.models as string[] | undefined)?.[0],
      command: doc.command as string | undefined,
      country: doc.country as string | undefined,
      city: doc.city as string | undefined,
      coords:
        doc.location?.coordinates &&
        Array.isArray(doc.location.coordinates) &&
        doc.location.coordinates.length === 2
          ? [doc.location.coordinates[0] as number, doc.location.coordinates[1] as number]
          : undefined,
      durationMs: doc.durationMs as number | undefined,
      receivedAt: (doc.receivedAt as Date).toISOString(),
    }));

    return NextResponse.json({ events, serverTime: new Date().toISOString() });
  } catch (error) {
    console.error('Live telemetry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
