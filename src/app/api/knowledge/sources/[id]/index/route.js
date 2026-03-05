import { NextResponse } from 'next/server';
import { getKnowledgeSourcesCollection } from '@/lib/knowledge/db';
import { ingestSource } from '@/lib/knowledge/ingestion';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function requireAdmin(request) {
  if (!ADMIN_TOKEN) return false;
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

export async function POST(request, { params }) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const sources = await getKnowledgeSourcesCollection();
    const source = await sources.findOne({ id });
    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    if (source.status === 'indexing') {
      return NextResponse.json(
        { error: 'Source is already being indexed' },
        { status: 409 },
      );
    }

    const result = await ingestSource(id);

    return NextResponse.json(
      { message: 'Indexing complete', result },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

