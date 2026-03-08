import { NextResponse } from 'next/server';
import { DRAFT_SORT, dedupeDrafts, getDraftsCollection } from '@/lib/content/drafts';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function requireAdmin(request) {
  if (!ADMIN_TOKEN) {
    return false;
  }
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

export async function GET(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const col = await getDraftsCollection();
    const drafts = await col.find({}).sort(DRAFT_SORT).toArray();
    return NextResponse.json({ drafts: dedupeDrafts(drafts) });
  } catch (error) {
    console.error('Drafts GET error:', error);
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
    const now = new Date().toISOString();

    const draft = {
      id: body.id || crypto.randomUUID(),
      type: body.type || 'blog-post',
      title: body.title || 'Untitled',
      body: body.body || '',
      platform: body.platform || undefined,
      status: body.status || 'draft',
      createdAt: body.createdAt || now,
      updatedAt: now,
      plannedPublishAt: body.plannedPublishAt ?? null,
      channel: body.channel ?? null,
    };

    const col = await getDraftsCollection();
    await col.insertOne(draft);

    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    console.error('Drafts POST error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

