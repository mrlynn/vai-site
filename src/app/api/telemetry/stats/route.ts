import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Check API key
  const apiKey = request.nextUrl.searchParams.get('API_KEY');
  const expectedKey = process.env.TELEMETRY_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const collection = db.collection('events');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run all aggregations in parallel
    const [
      totalEvents,
      eventsByType,
      eventsByVersion,
      eventsByPlatform,
      dailyActive,
    ] = await Promise.all([
      // Total events
      collection.countDocuments(),

      // Events by type
      collection
        .aggregate([
          { $group: { _id: '$event', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // Events by version
      collection
        .aggregate([
          { $group: { _id: '$version', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ])
        .toArray(),

      // Events by platform
      collection
        .aggregate([
          { $match: { platform: { $exists: true, $ne: null } } },
          { $group: { _id: '$platform', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // Daily active (last 30 days)
      collection
        .aggregate([
          { $match: { receivedAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$receivedAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: -1 } },
        ])
        .toArray(),
    ]);

    return NextResponse.json({
      totalEvents,
      eventsByType: eventsByType.map((e) => ({ type: e._id, count: e.count })),
      eventsByVersion: eventsByVersion.map((e) => ({ version: e._id, count: e.count })),
      eventsByPlatform: eventsByPlatform.map((e) => ({ platform: e._id, count: e.count })),
      dailyActive: dailyActive.map((e) => ({ date: e._id, count: e.count })),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
