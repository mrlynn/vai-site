import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ensureTelemetryIndexes } from '@/lib/telemetry/db';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Temporary public counter feed; cache aggressively.

// Phase 1 contract note:
// This route is a bounded public counter feed for lightweight marketing/community surfaces.
// It is not the future public telemetry dashboard contract, and it must remain much narrower
// than the private admin stats route. The dedicated dashboard read model now lives on
// GET /api/telemetry/public and should evolve independently from this lightweight feed.

export async function GET() {
  try {
    await ensureTelemetryIndexes();
    const db = await connectDB();
    const collection = db.collection('events');
    const dataThrough = new Date();
    dataThrough.setUTCHours(0, 0, 0, 0);

    // Keep public data delayed and coarse even on this temporary feed.
    const rangeFilter = { receivedAt: { $lt: dataThrough } };

    const [
      totalEvents,
      uniqueCountries,
      contextBreakdown,
    ] = await Promise.all([
      collection.countDocuments(rangeFilter),

      collection.distinct('country', {
        ...rangeFilter,
        country: { $exists: true, $ne: null },
      }),

      collection
        .aggregate([
          { $match: { ...rangeFilter, context: { $exists: true } } },
          { $group: { _id: '$context', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
    ]);

    const contexts: Record<string, number> = {};
    contextBreakdown.forEach((c) => {
      if (c._id) contexts[c._id] = c.count;
    });

    return NextResponse.json({
      totalEvents,
      countries: uniqueCountries.length,
      contexts,
      dataThrough: dataThrough.toISOString().slice(0, 10),
    });
  } catch (error) {
    console.error('Public stats error:', error);
    return NextResponse.json({
      totalEvents: 0,
      countries: 0,
      contexts: {},
      dataThrough: new Date().toISOString().slice(0, 10),
      error: true,
    });
  }
}
