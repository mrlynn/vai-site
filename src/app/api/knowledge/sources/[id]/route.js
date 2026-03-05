import { NextResponse } from 'next/server';
import { getKnowledgeSourcesCollection, getKnowledgeChunksCollection, getKnowledgeVersionsCollection } from '@/lib/knowledge/db';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function requireAdmin(request) {
  if (!ADMIN_TOKEN) return false;
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

export async function GET(request, { params }) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    const col = await getKnowledgeSourcesCollection();
    const source = await col.findOne({ id });
    if (!source) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ source }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    const sources = await getKnowledgeSourcesCollection();
    const chunks = await getKnowledgeChunksCollection();
    const versions = await getKnowledgeVersionsCollection();

    await chunks.deleteMany({ sourceId: id });
    await versions.deleteMany({ sourceId: id });
    const result = await sources.deleteOne({ id });

    if (!result.deletedCount) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

