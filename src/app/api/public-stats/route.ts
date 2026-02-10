import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection('events');

    // Get high-level stats only (no sensitive data)
    const [
      totalEvents,
      uniqueCountries,
      uniqueCities,
      contextBreakdown,
    ] = await Promise.all([
      // Total events all time
      collection.countDocuments(),

      // Unique countries
      collection.distinct('country', { country: { $exists: true, $ne: null } }),

      // Unique cities
      collection.distinct('city', { city: { $exists: true, $ne: null } }),

      // Context breakdown (cli vs playground vs desktop)
      collection.aggregate([
        { $match: { context: { $exists: true } } },
        { $group: { _id: '$context', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
    ]);

    // Calculate "developers" estimate
    // Rough heuristic: unique combinations of country+city as proxy for unique users
    const uniqueLocations = await collection.aggregate([
      { 
        $match: { 
          city: { $exists: true, $ne: null },
          country: { $exists: true, $ne: null } 
        } 
      },
      { 
        $group: { 
          _id: { city: '$city', country: '$country' } 
        } 
      },
      { $count: 'total' }
    ]).toArray();

    const locations = uniqueLocations[0]?.total || uniqueCities.length;

    // Format context breakdown
    const contexts: Record<string, number> = {};
    contextBreakdown.forEach((c) => {
      if (c._id) contexts[c._id] = c.count;
    });

    return NextResponse.json({
      totalEvents,
      countries: uniqueCountries.length,
      cities: uniqueCities.length,
      locations, // Unique city+country combos
      contexts,
      // Timestamp for freshness
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Public stats error:', error);
    // Return zeros on error so the page still renders
    return NextResponse.json({
      totalEvents: 0,
      countries: 0,
      cities: 0,
      locations: 0,
      contexts: {},
      generatedAt: new Date().toISOString(),
      error: true,
    });
  }
}
