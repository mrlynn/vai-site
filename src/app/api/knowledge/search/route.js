import { NextResponse } from 'next/server';
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

    if (!body.query || typeof body.query !== 'string' || body.query.trim() === '') {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const topK =
      typeof body.topK === 'number' && Number.isFinite(body.topK)
        ? Math.min(body.topK, 20)
        : undefined;
    const minScore =
      typeof body.minScore === 'number' && Number.isFinite(body.minScore)
        ? body.minScore
        : undefined;
    const sourceIds = Array.isArray(body.sourceIds) ? body.sourceIds : undefined;
    const tags = Array.isArray(body.tags) ? body.tags : undefined;

    const chunks = await retrieveContextWithMetadata(body.query.trim(), {
      topK,
      minScore,
      sourceIds,
      tags,
    });

    return NextResponse.json(
      {
        chunks,
        count: chunks.length,
        queryEmbedded: true,
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('index') && message.includes('not found')) {
      return NextResponse.json(
        { error: 'No vector search index found. Index a source first to create the index.' },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

