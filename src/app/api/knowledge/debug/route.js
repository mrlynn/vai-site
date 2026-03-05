import { NextResponse } from 'next/server';
import {
  getKnowledgeSourcesCollection,
  getKnowledgeChunksCollection,
  getKnowledgeVersionsCollection,
} from '@/lib/knowledge/db';
import { retrieveContextWithMetadata } from '@/lib/knowledge/retrieval';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function requireAdmin(request) {
  if (!ADMIN_TOKEN) return false;
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

export async function POST(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const query = typeof body.query === 'string' ? body.query.trim() : '';

    const sourcesCol = await getKnowledgeSourcesCollection();
    const chunksCol = await getKnowledgeChunksCollection();
    const versionsCol = await getKnowledgeVersionsCollection();

    const [sourceCount, chunkCount, versionCount, sampleSources] = await Promise.all([
      sourcesCol.countDocuments({}),
      chunksCol.countDocuments({}),
      versionsCol.countDocuments({}),
      sourcesCol
        .find({}, { projection: { id: 1, name: 1, type: 1, status: 1, tag: 1, chunkCount: 1 } })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
    ]);

    let sampleSearch = null;
    let searchError = null;

    if (query) {
      try {
        const chunks = await retrieveContextWithMetadata(query, { topK: 5 });
        sampleSearch = {
          query,
          count: chunks.length,
          chunks: chunks.slice(0, 5),
        };
      } catch (err) {
        searchError = err instanceof Error ? err.message : String(err);
      }
    }

    return NextResponse.json(
      {
        dbName: 'vai_telemetry',
        collections: {
          sources: 'knowledge_sources',
          chunks: 'knowledge_chunks',
          versions: 'knowledge_versions',
        },
        expectedVectorIndex: {
          collection: 'knowledge_chunks',
          field: 'embedding',
          indexName: 'vector_index',
        },
        counts: {
          sources: sourceCount,
          chunks: chunkCount,
          versions: versionCount,
        },
        sampleSources,
        sampleSearch,
        searchError,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

