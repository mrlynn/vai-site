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
      // Game telemetry
      gameSessionCount,
      gameOverCount,
      gameAvgScore,
      gameHighScores,
      gameAvgDuration,
      gameTotalPlayTimeMs,
      gameByCountry,
      gameByTrigger,
      gameDailyActivity,
      gameScoreDistribution,
      gameWaveDistribution,
      // Phase 3 aggregations
      commandBreakdown,
      commandTiming,
      pipelineStrategies,
      modelDistribution,
      modelTimeline,
      asymmetricPairs,
      workflowRuns,
      workflowInstalls,
      workflowOrigin,
      errorsByCommand,
      errorsByType,
      dailyErrors,
      errorsByVersion,
      contextTimeline,
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

      // ── Game telemetry aggregations ──

      // gameSessionCount
      collection.countDocuments({ ...rangeFilter, event: 'vsi_game_start' }),

      // gameOverCount
      collection.countDocuments({ ...rangeFilter, event: 'vsi_game_over' }),

      // gameAvgScore
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'vsi_game_over', score: { $exists: true } } },
          { $group: { _id: null, avg: { $avg: '$score' } } },
        ])
        .toArray(),

      // gameHighScores (top 10)
      collection
        .find({ event: 'vsi_game_over', score: { $exists: true } })
        .sort({ score: -1 })
        .limit(10)
        .project({ _id: 0, score: 1, wave: 1, durationMs: 1, receivedAt: 1, country: 1, platform: 1 })
        .toArray(),

      // gameAvgDuration
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'vsi_game_over', durationMs: { $exists: true } } },
          { $group: { _id: null, avg: { $avg: '$durationMs' } } },
        ])
        .toArray(),

      // gameTotalPlayTimeMs
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'vsi_game_over', durationMs: { $exists: true } } },
          { $group: { _id: null, total: { $sum: '$durationMs' } } },
        ])
        .toArray(),

      // gameByCountry
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'vsi_game_start', country: { $exists: true, $ne: null } } },
          { $group: { _id: '$country', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ])
        .toArray(),

      // gameByTrigger
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'vsi_game_start', trigger: { $exists: true } } },
          { $group: { _id: '$trigger', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // gameDailyActivity
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: { $in: ['vsi_game_start', 'vsi_game_over'] } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$receivedAt' } },
              starts: { $sum: { $cond: [{ $eq: ['$event', 'vsi_game_start'] }, 1, 0] } },
              ends: { $sum: { $cond: [{ $eq: ['$event', 'vsi_game_over'] }, 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),

      // gameScoreDistribution
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'vsi_game_over', score: { $exists: true } } },
          {
            $bucket: {
              groupBy: '$score',
              boundaries: [0, 500, 1000, 2000, 5000, Infinity],
              default: 'other',
              output: { count: { $sum: 1 } },
            },
          },
        ])
        .toArray(),

      // gameWaveDistribution
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'vsi_game_over', wave: { $exists: true } } },
          { $group: { _id: '$wave', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ])
        .toArray(),

      // ── Phase 3: CLI telemetry aggregations ──

      // commandBreakdown: cli_* events (excluding cli_command), grouped by event
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: { $regex: /^cli_/, $ne: 'cli_command' } } },
          { $group: { _id: '$event', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // commandTiming: events with durationMs, avg/max per event
      collection
        .aggregate([
          { $match: { ...rangeFilter, durationMs: { $exists: true, $type: 'number' } } },
          {
            $group: {
              _id: '$event',
              avgMs: { $avg: '$durationMs' },
              maxMs: { $max: '$durationMs' },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // pipelineStrategies: cli_pipeline events grouped by chunkStrategy
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'cli_pipeline', chunkStrategy: { $exists: true, $ne: null } } },
          { $group: { _id: '$chunkStrategy', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // modelDistribution: events with model field, grouped by model
      collection
        .aggregate([
          { $match: { ...rangeFilter, model: { $exists: true, $ne: null } } },
          { $group: { _id: '$model', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // modelTimeline: daily counts per model
      collection
        .aggregate([
          { $match: { ...rangeFilter, model: { $exists: true, $ne: null } } },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$receivedAt' } },
                model: '$model',
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.date': 1 } },
        ])
        .toArray(),

      // asymmetricPairs: cli_query events with both model and rerankModel
      collection
        .aggregate([
          {
            $match: {
              ...rangeFilter,
              event: 'cli_query',
              model: { $exists: true, $ne: null },
              rerankModel: { $exists: true, $ne: null },
            },
          },
          {
            $group: {
              _id: { embedModel: '$model', rerankModel: '$rerankModel' },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // workflowRuns: cli_workflow_run + playground_workflow_run by workflowName
      collection
        .aggregate([
          {
            $match: {
              ...rangeFilter,
              event: { $in: ['cli_workflow_run', 'playground_workflow_run'] },
              workflowName: { $exists: true, $ne: null },
            },
          },
          { $group: { _id: '$workflowName', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // workflowInstalls: cli_workflow_install by packageName
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'cli_workflow_install' } },
          { $group: { _id: '$workflowName', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // workflowOrigin: builtin vs community counts
      collection
        .aggregate([
          {
            $match: {
              ...rangeFilter,
              event: { $in: ['cli_workflow_run', 'playground_workflow_run'] },
            },
          },
          {
            $group: {
              _id: null,
              builtin: { $sum: { $cond: [{ $eq: ['$isBuiltin', true] }, 1, 0] } },
              community: { $sum: { $cond: [{ $eq: ['$isCommunity', true] }, 1, 0] } },
              other: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ['$isBuiltin', true] },
                        { $ne: ['$isCommunity', true] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ])
        .toArray(),

      // errorsByCommand: cli_error events grouped by command
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'cli_error', command: { $exists: true, $ne: null } } },
          { $group: { _id: '$command', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // errorsByType: cli_error events grouped by errorType
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'cli_error', errorType: { $exists: true, $ne: null } } },
          { $group: { _id: '$errorType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // dailyErrors: cli_error daily counts
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'cli_error' } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$receivedAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),

      // errorsByVersion: cli_error grouped by version
      collection
        .aggregate([
          { $match: { ...rangeFilter, event: 'cli_error', version: { $exists: true, $ne: null } } },
          { $group: { _id: '$version', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),

      // contextTimeline: daily counts per context
      collection
        .aggregate([
          { $match: { ...rangeFilter, context: { $exists: true, $ne: null } } },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$receivedAt' } },
                context: '$context',
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.date': 1 } },
        ])
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
      game: {
        sessionCount: gameSessionCount,
        gameOverCount,
        avgScore: Math.round((gameAvgScore as any[])[0]?.avg || 0),
        highScores: gameHighScores,
        avgDurationMs: Math.round((gameAvgDuration as any[])[0]?.avg || 0),
        totalPlayTimeMs: (gameTotalPlayTimeMs as any[])[0]?.total || 0,
        byCountry: (gameByCountry as any[]).map((e: any) => ({ country: e._id, count: e.count })),
        byTrigger: (gameByTrigger as any[]).map((e: any) => ({ trigger: e._id, count: e.count })),
        dailyActivity: (gameDailyActivity as any[]).map((e: any) => ({ date: e._id, starts: e.starts, ends: e.ends })),
        scoreDistribution: (gameScoreDistribution as any[]).map((e: any) => {
          const labels: Record<string, string> = { '0': '0-500', '500': '500-1K', '1000': '1K-2K', '2000': '2K-5K', '5000': '5K+' };
          return { bucket: labels[String(e._id)] || String(e._id), count: e.count };
        }),
        waveDistribution: (gameWaveDistribution as any[]).map((e: any) => ({ wave: e._id, count: e.count })),
      },
      commands: {
        commandBreakdown: (commandBreakdown as any[]).map((e: any) => ({ event: e._id, count: e.count })),
        commandTiming: (commandTiming as any[]).map((e: any) => ({
          event: e._id,
          avgMs: Math.round(e.avgMs),
          maxMs: Math.round(e.maxMs),
          count: e.count,
        })),
        pipelineStrategies: (pipelineStrategies as any[]).map((e: any) => ({ strategy: e._id, count: e.count })),
      },
      models: {
        modelDistribution: (modelDistribution as any[]).map((e: any) => ({ model: e._id, count: e.count })),
        modelTimeline: (modelTimeline as any[]).map((e: any) => ({
          date: e._id.date,
          model: e._id.model,
          count: e.count,
        })),
        asymmetricPairs: (asymmetricPairs as any[]).map((e: any) => ({
          embedModel: e._id.embedModel,
          rerankModel: e._id.rerankModel,
          count: e.count,
        })),
      },
      workflows: {
        workflowRuns: (workflowRuns as any[]).map((e: any) => ({ workflowName: e._id, count: e.count })),
        workflowInstalls: (workflowInstalls as any[]).map((e: any) => ({ packageName: e._id, count: e.count })),
        workflowOrigin: (workflowOrigin as any[])[0] || { builtin: 0, community: 0, other: 0 },
      },
      errors: {
        errorsByCommand: (errorsByCommand as any[]).map((e: any) => ({ command: e._id, count: e.count })),
        errorsByType: (errorsByType as any[]).map((e: any) => ({ errorType: e._id, count: e.count })),
        dailyErrors: (dailyErrors as any[]).map((e: any) => ({ date: e._id, count: e.count })),
        errorsByVersion: (errorsByVersion as any[]).map((e: any) => ({ version: e._id, count: e.count })),
      },
      contextTimeline: (contextTimeline as any[]).map((e: any) => ({
        date: e._id.date,
        context: e._id.context,
        count: e.count,
      })),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
