import connectDB from '@/lib/mongodb';

const EVENTS_COLLECTION = 'events';
const CHAT_ANALYTICS_COLLECTION = 'chat_analytics';
const PUBLIC_SNAPSHOTS_COLLECTION = 'public_telemetry_snapshots';

let telemetryIndexesPromise: Promise<void> | null = null;

async function createTelemetryIndexes() {
  const db = await connectDB();

  const events = db.collection(EVENTS_COLLECTION);
  await events.createIndex({ receivedAt: -1 });
  await events.createIndex({ context: 1, receivedAt: -1 });
  await events.createIndex({ event: 1, receivedAt: -1 });
  await events.createIndex({ command: 1, receivedAt: -1 });
  await events.createIndex({ model: 1, receivedAt: -1 });
  await events.createIndex({ errorType: 1, receivedAt: -1 });
  await events.createIndex({ country: 1, receivedAt: -1 });
  await events.createIndex({ platform: 1, receivedAt: -1 });
  await events.createIndex({ version: 1, receivedAt: -1 });

  const chatAnalytics = db.collection(CHAT_ANALYTICS_COLLECTION);
  await chatAnalytics.createIndex({ timestamp: -1 });
  await chatAnalytics.createIndex({ slug: 1, timestamp: -1 });
  await chatAnalytics.createIndex({ model: 1, timestamp: -1 });

  const publicSnapshots = db.collection(PUBLIC_SNAPSHOTS_COLLECTION);
  await publicSnapshots.createIndex({ snapshotKey: 1, dataThrough: 1 }, { unique: true });
  await publicSnapshots.createIndex({ snapshotKey: 1, generatedAt: -1 });
}

// Safe to call from telemetry routes. Work is memoized per process.
export async function ensureTelemetryIndexes() {
  if (!telemetryIndexesPromise) {
    telemetryIndexesPromise = createTelemetryIndexes().catch((error) => {
      telemetryIndexesPromise = null;
      throw error;
    });
  }

  await telemetryIndexesPromise;
}
