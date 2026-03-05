import { NextResponse } from 'next/server';
import { getPlanCollection } from '@/lib/content/plan';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

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

    const col = await getPlanCollection();
    const items = await col.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ items }, { status: 200 });
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
    const items = Array.isArray(body?.items) ? body.items : null;
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'items must be a non-empty array' },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const toInsert = items.map((item) => {
      const channel =
        item.channel !== undefined && item.channel !== null && String(item.channel).trim() !== ''
          ? String(item.channel).trim()
          : null;
      const articleCount =
        typeof item.articleCount === 'number' && item.articleCount >= 0
          ? Math.min(item.articleCount, 99)
          : 1;
      return {
        id: item.id || crypto.randomUUID(),
        topicTitle: typeof item.topicTitle === 'string' ? item.topicTitle.trim() : 'Untitled',
        summary: typeof item.summary === 'string' ? item.summary.trim() : '',
        keywords: Array.isArray(item.keywords) ? item.keywords : undefined,
        channel: channel ?? null,
        articleCount,
        status: item.status || 'planned',
        createdAt: item.createdAt || now,
        updatedAt: now,
      };
    });

    const col = await getPlanCollection();
    await col.insertMany(toInsert);
    return NextResponse.json({ items: toInsert }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

