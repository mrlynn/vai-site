import connectDB from '@/lib/mongodb';

const SOURCES_COLLECTION = 'knowledge_sources';
const CHUNKS_COLLECTION = 'knowledge_chunks';
const VERSIONS_COLLECTION = 'knowledge_versions';

export async function getKnowledgeSourcesCollection() {
  const db = await connectDB();
  return db.collection(SOURCES_COLLECTION);
}

export async function getKnowledgeChunksCollection() {
  const db = await connectDB();
  return db.collection(CHUNKS_COLLECTION);
}

export async function getKnowledgeVersionsCollection() {
  const db = await connectDB();
  return db.collection(VERSIONS_COLLECTION);
}

// Utility to ensure basic indexes exist. Safe to call occasionally.
export async function ensureKnowledgeIndexes() {
  const sources = await getKnowledgeSourcesCollection();
  await sources.createIndex({ id: 1 }, { unique: true });
  await sources.createIndex({ status: 1, tag: 1 });

  const chunks = await getKnowledgeChunksCollection();
  await chunks.createIndex({ sourceId: 1 });
  await chunks.createIndex({ sourceId: 1, originPath: 1 });

  const versions = await getKnowledgeVersionsCollection();
  await versions.createIndex({ sourceId: 1, createdAt: -1 });
}

