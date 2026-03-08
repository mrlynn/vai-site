import type { Db } from 'mongodb';
import { buildModelRefsExpression } from '@/lib/telemetry/aggregation';

const PUBLIC_WINDOW_DAYS = 30;
const GENERAL_THRESHOLD = 25;
const EXACT_THRESHOLD = 50;
const MAX_EXACT_ITEMS = 8;
const SNAPSHOT_KEY = 'public-telemetry-v1';
const SNAPSHOT_SCHEMA_VERSION = 1;
const SNAPSHOT_COLLECTION = 'public_telemetry_snapshots';

const PUBLIC_COMMAND_ALLOWLIST = new Set([
  'about',
  'app',
  'benchmark',
  'bug',
  'chunk',
  'completions',
  'config',
  'content',
  'demo',
  'doctor',
  'embed',
  'estimate',
  'eval',
  'explain',
  'generate',
  'help',
  'index',
  'ingest',
  'init',
  'mcp',
  'models',
  'ping',
  'pipeline',
  'query',
  'quickstart',
  'rerank',
  'search',
  'similarity',
  'store',
  'telemetry',
  'workflow',
]);

type CountRow = {
  label: string;
  count: number;
};

type PublicTelemetryPayload = {
  meta: {
    schemaVersion: number;
    windowDays: number;
    dataThrough: string;
    generatedAt: string;
  };
  kpis: {
    totalEvents: number;
    activeSurfaces: number;
    countries: number;
  };
  dailyActivity: Array<{ date: string; count: number }>;
  surfaceMix: CountRow[];
  featureAreaMix: CountRow[];
  platformMix: CountRow[];
  versionMix: CountRow[];
  errorTrend: Array<{ date: string; count: number }>;
  errorCategories: CountRow[];
  topCommands: CountRow[];
  topModels: CountRow[];
};

type PublicTelemetrySnapshotDoc = {
  snapshotKey: string;
  schemaVersion: number;
  dataThrough: string;
  generatedAt: string;
  payload: PublicTelemetryPayload;
};

let snapshotBuildPromise: Promise<PublicTelemetryPayload> | null = null;

function startOfCurrentUtcDay(now = new Date()) {
  const date = new Date(now);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function getPublicTelemetryWindow(now = new Date()) {
  const cutoffExclusive = startOfCurrentUtcDay(now);
  const windowStart = new Date(cutoffExclusive);
  windowStart.setUTCDate(windowStart.getUTCDate() - PUBLIC_WINDOW_DAYS);

  const dataThroughDate = new Date(cutoffExclusive);
  dataThroughDate.setUTCDate(dataThroughDate.getUTCDate() - 1);

  return {
    cutoffExclusive,
    windowStart,
    dataThrough: dataThroughDate.toISOString().slice(0, 10),
  };
}

function toCountRows(input: Map<string, number>) {
  return Array.from(input.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function groupCounts<T extends string>(
  rows: Array<{ count: number } & Record<T, string | null | undefined>>,
  selector: (value: string | null | undefined) => string,
  key: T
) {
  const grouped = new Map<string, number>();

  rows.forEach((row) => {
    const label = selector(row[key]);
    grouped.set(label, (grouped.get(label) || 0) + row.count);
  });

  return toCountRows(grouped);
}

function collapseSparseCounts(rows: CountRow[], threshold: number, maxItems?: number) {
  const sorted = [...rows].sort((a, b) => b.count - a.count);
  const kept: CountRow[] = [];
  let otherCount = 0;

  sorted.forEach((row) => {
    if (row.count < threshold) {
      otherCount += row.count;
      return;
    }

    if (maxItems && kept.length >= maxItems) {
      otherCount += row.count;
      return;
    }

    kept.push(row);
  });

  if (otherCount >= threshold) {
    kept.push({ label: 'Other', count: otherCount });
  }

  return kept;
}

function normalizeContext(value: string | null | undefined) {
  if (!value) return 'other';

  switch (value) {
    case 'cli':
      return 'cli';
    case 'electron':
    case 'desktop':
      return 'desktop';
    case 'web':
      return 'web';
    case 'playground':
      return 'playground';
    default:
      return 'other';
  }
}

function mapFeatureArea(eventName: string | null | undefined) {
  if (!eventName) return 'other';
  if (eventName.startsWith('usecase_')) return 'docs/site';
  if (eventName.includes('workflow')) return 'workflows';
  if (eventName.includes('chat')) return 'chat';
  if (eventName.includes('rerank')) return 'rerank';
  if (eventName.includes('search') || eventName.includes('query')) return 'search';
  if (
    eventName.includes('embed') ||
    eventName.includes('ingest') ||
    eventName.includes('pipeline') ||
    eventName.includes('similarity') ||
    eventName.includes('index') ||
    eventName.includes('store')
  ) {
    return 'embeddings';
  }
  if (
    eventName === 'desktop_launch' ||
    eventName === 'cli_command' ||
    eventName === 'cli_models' ||
    eventName === 'cli_init' ||
    eventName === 'cli_ping'
  ) {
    return 'lifecycle';
  }
  return 'other';
}

function normalizePlatform(value: string | null | undefined) {
  if (!value) return 'Other';

  const platform = value.toLowerCase();
  if (platform.includes('darwin') || platform.includes('mac')) return 'macOS';
  if (platform.includes('win')) return 'Windows';
  if (platform.includes('linux')) return 'Linux';
  return 'Other';
}

function parseSemver(value: string | null | undefined) {
  if (!value) return null;

  const match = value.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    raw: value,
  };
}

function compareSemver(
  left: { major: number; minor: number; patch: number },
  right: { major: number; minor: number; patch: number }
) {
  if (left.major !== right.major) return left.major - right.major;
  if (left.minor !== right.minor) return left.minor - right.minor;
  return left.patch - right.patch;
}

function bucketVersion(value: string | null | undefined, latest: ReturnType<typeof parseSemver>) {
  const parsed = parseSemver(value);
  if (!parsed || !latest) return 'other';
  if (compareSemver(parsed, latest) === 0) return 'latest supported';
  if (parsed.major === latest.major && parsed.minor >= latest.minor - 1) return 'recent supported';
  return 'older';
}

function normalizeErrorCategory(value: string | null | undefined) {
  if (!value) return 'other';

  const errorType = value.toLowerCase();
  if (errorType.includes('auth') || errorType.includes('token') || errorType.includes('credential') || errorType.includes('api key')) {
    return 'auth';
  }
  if (errorType.includes('rate')) return 'rate limit';
  if (
    errorType.includes('timeout') ||
    errorType.includes('network') ||
    errorType.includes('fetch') ||
    errorType.includes('connection') ||
    errorType.includes('http')
  ) {
    return 'network';
  }
  if (
    errorType.includes('config') ||
    errorType.includes('env') ||
    errorType.includes('missing')
  ) {
    return 'config';
  }
  if (
    errorType.includes('validation') ||
    errorType.includes('invalid') ||
    errorType.includes('parse') ||
    errorType.includes('argument')
  ) {
    return 'input';
  }
  return 'runtime';
}

function normalizeCommandName(value: string | null | undefined) {
  if (!value) return null;

  const normalized = value.trim().split(/\s+/)[0]?.toLowerCase();
  if (!normalized || !PUBLIC_COMMAND_ALLOWLIST.has(normalized)) {
    return null;
  }

  return normalized;
}

function isFirstPartyModel(value: string | null | undefined) {
  if (!value) return false;
  return value.startsWith('voyage-') || value.startsWith('rerank-');
}

async function buildPublicTelemetryPayload(db: Db): Promise<PublicTelemetryPayload> {
  const { cutoffExclusive, windowStart, dataThrough } = getPublicTelemetryWindow();
  const generatedAt = new Date().toISOString();
  const rangeFilter = { receivedAt: { $gte: windowStart, $lt: cutoffExclusive } };
  const collection = db.collection('events');

  const [
    totalEvents,
    uniqueCountries,
    dailyActivity,
    eventsByContext,
    eventsByType,
    eventsByPlatform,
    eventsByVersion,
    dailyErrors,
    errorsByType,
    commandEvents,
    modelEvents,
  ] = await Promise.all([
    collection.countDocuments(rangeFilter),
    collection.distinct('country', { ...rangeFilter, country: { $exists: true, $ne: null } }),
    collection
      .aggregate([
        { $match: rangeFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$receivedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
    collection
      .aggregate([
        { $match: { ...rangeFilter, context: { $exists: true, $ne: null } } },
        { $group: { _id: '$context', count: { $sum: 1 } } },
      ])
      .toArray(),
    collection
      .aggregate([
        { $match: rangeFilter },
        { $group: { _id: '$event', count: { $sum: 1 } } },
      ])
      .toArray(),
    collection
      .aggregate([
        { $match: { ...rangeFilter, platform: { $exists: true, $ne: null } } },
        { $group: { _id: '$platform', count: { $sum: 1 } } },
      ])
      .toArray(),
    collection
      .aggregate([
        { $match: { ...rangeFilter, version: { $exists: true, $ne: null } } },
        { $group: { _id: '$version', count: { $sum: 1 } } },
      ])
      .toArray(),
    collection
      .aggregate([
        { $match: { ...rangeFilter, $or: [{ event: 'cli_error' }, { errorType: { $exists: true, $ne: null } }] } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$receivedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
    collection
      .aggregate([
        { $match: { ...rangeFilter, errorType: { $exists: true, $ne: null } } },
        { $group: { _id: '$errorType', count: { $sum: 1 } } },
      ])
      .toArray(),
    collection
      .aggregate([
        { $match: { ...rangeFilter, event: 'cli_command', command: { $exists: true, $ne: null } } },
        { $group: { _id: '$command', count: { $sum: 1 } } },
      ])
      .toArray(),
    collection
      .aggregate([
        { $match: rangeFilter },
        { $project: { refs: buildModelRefsExpression() } },
        { $unwind: '$refs' },
        { $group: { _id: '$refs.model', count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const groupedSurfaceMix = groupCounts(
    eventsByContext.map((row) => ({ context: row._id, count: row.count })),
    normalizeContext,
    'context'
  );
  const surfaceMix = collapseSparseCounts(groupedSurfaceMix, GENERAL_THRESHOLD);

  const featureAreaMix = collapseSparseCounts(
    groupCounts(
      eventsByType.map((row) => ({ event: row._id, count: row.count })),
      mapFeatureArea,
      'event'
    ),
    GENERAL_THRESHOLD
  );

  const platformMix = collapseSparseCounts(
    groupCounts(
      eventsByPlatform.map((row) => ({ platform: row._id, count: row.count })),
      normalizePlatform,
      'platform'
    ),
    GENERAL_THRESHOLD
  );

  const latestVersion = eventsByVersion
    .map((row) => parseSemver(row._id))
    .filter((row): row is NonNullable<ReturnType<typeof parseSemver>> => Boolean(row))
    .sort((a, b) => compareSemver(b, a))[0] || null;

  const versionMix = collapseSparseCounts(
    groupCounts(
      eventsByVersion.map((row) => ({ version: row._id, count: row.count })),
      (value) => bucketVersion(value, latestVersion),
      'version'
    ),
    GENERAL_THRESHOLD
  );

  const errorCategories = collapseSparseCounts(
    groupCounts(
      errorsByType.map((row) => ({ errorType: row._id, count: row.count })),
      normalizeErrorCategory,
      'errorType'
    ),
    GENERAL_THRESHOLD
  );

  const topCommands = collapseSparseCounts(
    toCountRows(
      commandEvents.reduce<Map<string, number>>((map, row) => {
        const normalized = normalizeCommandName(row._id);
        if (!normalized) return map;
        map.set(normalized, (map.get(normalized) || 0) + row.count);
        return map;
      }, new Map<string, number>())
    ),
    EXACT_THRESHOLD,
    MAX_EXACT_ITEMS
  );

  const topModels = collapseSparseCounts(
    toCountRows(
      modelEvents.reduce<Map<string, number>>((map, row) => {
        if (!isFirstPartyModel(row._id)) return map;
        map.set(row._id, (map.get(row._id) || 0) + row.count);
        return map;
      }, new Map<string, number>())
    ),
    EXACT_THRESHOLD,
    MAX_EXACT_ITEMS
  );

  return {
    meta: {
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      windowDays: PUBLIC_WINDOW_DAYS,
      dataThrough,
      generatedAt,
    },
    kpis: {
      totalEvents,
      activeSurfaces: groupedSurfaceMix.filter((row) => row.count > 0).length,
      countries: uniqueCountries.length,
    },
    dailyActivity: dailyActivity.map((row) => ({ date: row._id, count: row.count })),
    surfaceMix,
    featureAreaMix,
    platformMix,
    versionMix,
    errorTrend: dailyErrors.map((row) => ({ date: row._id, count: row.count })),
    errorCategories,
    topCommands,
    topModels,
  };
}

async function getFreshSnapshot(db: Db, dataThrough: string) {
  const snapshotCollection = db.collection<PublicTelemetrySnapshotDoc>(SNAPSHOT_COLLECTION);
  return snapshotCollection.findOne({
    snapshotKey: SNAPSHOT_KEY,
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    dataThrough,
  });
}

async function getLatestSnapshot(db: Db) {
  const snapshotCollection = db.collection<PublicTelemetrySnapshotDoc>(SNAPSHOT_COLLECTION);
  return snapshotCollection.findOne(
    { snapshotKey: SNAPSHOT_KEY },
    { sort: { generatedAt: -1 } }
  );
}

async function storeSnapshot(db: Db, payload: PublicTelemetryPayload) {
  const snapshotCollection = db.collection<PublicTelemetrySnapshotDoc>(SNAPSHOT_COLLECTION);
  const doc: PublicTelemetrySnapshotDoc = {
    snapshotKey: SNAPSHOT_KEY,
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    dataThrough: payload.meta.dataThrough,
    generatedAt: payload.meta.generatedAt,
    payload,
  };

  await snapshotCollection.updateOne(
    { snapshotKey: SNAPSHOT_KEY, dataThrough: payload.meta.dataThrough },
    { $set: doc },
    { upsert: true }
  );
}

async function buildAndStoreSnapshot(db: Db) {
  const payload = await buildPublicTelemetryPayload(db);
  await storeSnapshot(db, payload);
  return payload;
}

export async function getPublicTelemetryPayload(db: Db) {
  const { dataThrough } = getPublicTelemetryWindow();
  const freshSnapshot = await getFreshSnapshot(db, dataThrough);
  if (freshSnapshot?.payload) {
    return freshSnapshot.payload;
  }

  const staleSnapshot = await getLatestSnapshot(db);

  if (!snapshotBuildPromise) {
    snapshotBuildPromise = buildAndStoreSnapshot(db).finally(() => {
      snapshotBuildPromise = null;
    });
  }

  try {
    return await snapshotBuildPromise;
  } catch (error) {
    if (staleSnapshot?.payload) {
      return staleSnapshot.payload;
    }
    throw error;
  }
}

export function getPublicTelemetrySnapshotCollectionName() {
  return SNAPSHOT_COLLECTION;
}
