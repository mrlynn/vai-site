import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Check API key via query param or Authorization header
  const apiKey =
    request.nextUrl.searchParams.get('API_KEY') ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  const expectedKey = process.env.TELEMETRY_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Optional time range filter
  const days = parseInt(request.nextUrl.searchParams.get('days') || '30', 10);

  try {
    const db = await getDb();
    const collection = db.collection('events');

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const rangeFilter = { receivedAt: { $gte: cutoff } };

    const chatCol = db.collection('chat_analytics');
    const chatRangeFilter = { timestamp: { $gte: cutoff } };

    const [
      totalEvents,
      totalEventsInRange,
      eventsByType,
      eventsByVersion,
      eventsByPlatform,
      eventsByCountry,
      eventsByContext,
      eventsByTab,
      eventsByCommand,
      eventsByCity,
      cityLocations,
      dailyActivity,
      hourlyDistribution,
      recentEvents,
      useCasePageViews,
      useCaseChatQueries,
      useCaseChatModels,
      useCaseDownloads,
      useCaseCtaClicks,
      useCaseChatTopSources,
      useCaseDailyChat,
      useCaseAvgLatency,
      recentChatQueries,
    ] = await Promise.all([
      // Total events (all time)
      collection.countDocuments(),

      // Total events in range
      collection.countDocuments(rangeFilter),

      // Events by type (in range)
      collection
        .aggregate([
          { $match: rangeFilter },
          { $group: { _id: '$event', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // Events by version (in range)
      collection
        .aggregate([
          { $match: rangeFilter },
          { $group: { _id: '$version', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ])
        .toArray(),

      // Events by platform
      collection
        .aggregate([
          { $match: { ...rangeFilter, platform: { $exists: true, $ne: null } } },
          { $group: { _id: '$platform', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // Events by country
      collection
        .aggregate([
          { $match: { ...rangeFilter, country: { $exists: true, $ne: null } } },
          { $group: { _id: '$country', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 30 },
        ])
        .toArray(),

      // Events by context (cli vs playground vs desktop)
      collection
        .aggregate([
          { $match: rangeFilter },
          { $group: { _id: '$context', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // Playground tab usage
      collection
        .aggregate([
          { $match: { ...rangeFilter, tab: { $exists: true, $ne: null } } },
          { $group: { _id: '$tab', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // CLI command usage
      collection
        .aggregate([
          { $match: { ...rangeFilter, command: { $exists: true, $ne: null } } },
          { $group: { _id: '$command', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 30 },
        ])
        .toArray(),

      // Events by city
      collection
        .aggregate([
          { $match: { ...rangeFilter, city: { $exists: true, $ne: null } } },
          {
            $group: {
              _id: { city: '$city', region: '$region', country: '$country' },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 50 },
        ])
        .toArray(),

      // City locations (for map markers) — get one lat/lng per city
      collection
        .aggregate([
          {
            $match: {
              ...rangeFilter,
              city: { $exists: true, $ne: null },
              location: { $exists: true },
            },
          },
          {
            $group: {
              _id: { city: '$city', country: '$country' },
              count: { $sum: 1 },
              lat: { $first: { $arrayElemAt: ['$location.coordinates', 1] } },
              lng: { $first: { $arrayElemAt: ['$location.coordinates', 0] } },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 100 },
        ])
        .toArray(),

      // Daily activity (in range)
      collection
        .aggregate([
          { $match: rangeFilter },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$receivedAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),

      // Hourly distribution (in range)
      collection
        .aggregate([
          { $match: rangeFilter },
          {
            $group: {
              _id: { $hour: '$receivedAt' },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),

      // Recent events (last 50)
      collection
        .find({})
        .sort({ receivedAt: -1 })
        .limit(50)
        .project({ _id: 0 })
        .toArray(),

      // Use case page views by slug
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'usecase_page_view' } },
          { $group: { _id: '$slug', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // Chat queries by slug (from chat_analytics)
      chatCol
        .aggregate([
          { $match: chatRangeFilter },
          { $group: { _id: '$slug', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // Chat model usage
      chatCol
        .aggregate([
          { $match: chatRangeFilter },
          { $group: { _id: '$model', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // Sample doc downloads by slug
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'usecase_sample_docs_download' } },
          { $group: { _id: '$slug', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // CTA clicks by type and slug
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'usecase_cta_click' } },
          { $group: { _id: { ctaType: '$ctaType', slug: '$slug' }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // Top retrieved source docs
      chatCol
        .aggregate([
          { $match: chatRangeFilter },
          { $unwind: '$sources' },
          { $group: { _id: { source: '$sources', slug: '$slug' }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ])
        .toArray(),

      // Daily chat query volume
      chatCol
        .aggregate([
          { $match: chatRangeFilter },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),

      // Average chat latency by slug
      chatCol
        .aggregate([
          { $match: chatRangeFilter },
          {
            $group: {
              _id: '$slug',
              avgLatency: { $avg: '$latencyMs' },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // Recent chat queries (last 50)
      chatCol
        .find({})
        .sort({ timestamp: -1 })
        .limit(50)
        .project({ _id: 0, embedding: 0 })
        .toArray(),
    ]);

    return NextResponse.json({
      meta: {
        days,
        totalEventsAllTime: totalEvents,
        totalEventsInRange,
        generatedAt: new Date().toISOString(),
      },
      eventsByType: eventsByType.map((e) => ({ type: e._id, count: e.count })),
      eventsByVersion: eventsByVersion.map((e) => ({ version: e._id, count: e.count })),
      eventsByPlatform: eventsByPlatform.map((e) => ({ platform: e._id, count: e.count })),
      eventsByCountry: eventsByCountry.map((e) => ({ country: e._id, count: e.count })),
      eventsByContext: eventsByContext.map((e) => ({ context: e._id || 'unknown', count: e.count })),
      eventsByTab: eventsByTab.map((e) => ({ tab: e._id, count: e.count })),
      eventsByCommand: eventsByCommand.map((e) => ({ command: e._id, count: e.count })),
      eventsByCity: eventsByCity.map((e) => ({
        city: e._id.city,
        region: e._id.region,
        country: e._id.country,
        count: e.count,
      })),
      cityLocations: cityLocations.map((e) => ({
        city: e._id.city,
        country: e._id.country,
        count: e.count,
        lat: e.lat,
        lng: e.lng,
      })),
      dailyActivity: dailyActivity.map((e) => ({ date: e._id, count: e.count })),
      hourlyDistribution: hourlyDistribution.map((e) => ({ hour: e._id, count: e.count })),
      recentEvents,
      useCasePageViews: useCasePageViews.map((e) => ({ slug: e._id, count: e.count })),
      useCaseChatQueries: useCaseChatQueries.map((e) => ({ slug: e._id, count: e.count })),
      useCaseChatModels: useCaseChatModels.map((e) => ({ model: e._id, count: e.count })),
      useCaseDownloads: useCaseDownloads.map((e) => ({ slug: e._id, count: e.count })),
      useCaseCtaClicks: useCaseCtaClicks.map((e) => ({
        ctaType: e._id.ctaType,
        slug: e._id.slug,
        count: e.count,
      })),
      useCaseChatTopSources: useCaseChatTopSources.map((e) => ({
        source: e._id.source,
        slug: e._id.slug,
        count: e.count,
      })),
      useCaseDailyChat: useCaseDailyChat.map((e) => ({ date: e._id, count: e.count })),
      useCaseAvgLatency: useCaseAvgLatency.map((e) => ({
        slug: e._id,
        avgLatency: Math.round(e.avgLatency),
        count: e.count,
      })),
      recentChatQueries,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
