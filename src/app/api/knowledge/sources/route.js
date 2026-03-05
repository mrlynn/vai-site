import { NextResponse } from 'next/server';
import { getKnowledgeSourcesCollection } from '@/lib/knowledge/db';
import { buildSourceDocument } from '@/lib/knowledge/sourceModel';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const VALID_TYPES = ['file', 'url', 'codebase', 'text'];

function requireAdmin(request) {
  if (!ADMIN_TOKEN) return false;
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

export async function GET(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const col = await getKnowledgeSourcesCollection();
    const sources = await col.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ sources }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const type = body.type;
    const sourcePath =
      typeof body.sourcePath === 'string' ? body.sourcePath : body.sourcePath ?? null;
    const crawlDepth =
      typeof body.crawlDepth === 'number' && Number.isFinite(body.crawlDepth)
        ? body.crawlDepth
        : undefined;
    const maxPages =
      typeof body.maxPages === 'number' && Number.isFinite(body.maxPages)
        ? body.maxPages
        : undefined;
    const sameHostOnly = Boolean(body.sameHostOnly);
    const pathPrefix =
      typeof body.pathPrefix === 'string' && body.pathPrefix.trim().length > 0
        ? body.pathPrefix
        : undefined;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 },
      );
    }

    const col = await getKnowledgeSourcesCollection();
    const doc = buildSourceDocument({
      name,
      type,
      sourcePath,
      crawlDepth,
      maxPages,
      sameHostOnly,
      pathPrefix,
    });
    await col.insertOne(doc);

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

