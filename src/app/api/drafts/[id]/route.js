import { NextResponse } from 'next/server';
import { DRAFT_SORT, getDraftsCollection } from '@/lib/content/drafts';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function requireAdmin(request) {
  if (!ADMIN_TOKEN) {
    return false;
  }
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

export async function GET(_request, context) {
  try {
    const { id } = await context.params;
    const col = await getDraftsCollection();
    const draft = await col.find({ id }).sort(DRAFT_SORT).limit(1).next();
    if (!draft) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json(draft);
  } catch (error) {
    console.error('Draft GET error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const updates = await request.json().catch(() => ({}));
    const { id } = await context.params;
    const col = await getDraftsCollection();

    const now = new Date().toISOString();
    const result = await col.updateMany(
      { id },
      {
        $set: {
          ...updates,
          updatedAt: now,
        },
      },
    );

    if (!result.matchedCount) {
      // If the draft does not exist yet, create it instead of failing.
      const doc = {
        id,
        type: updates.type || 'blog-post',
        title: updates.title || 'Untitled',
        body: updates.body || '',
        platform: updates.platform || undefined,
        status: updates.status || 'draft',
        createdAt: now,
        updatedAt: now,
        plannedPublishAt: updates.plannedPublishAt ?? null,
        channel: updates.channel ?? null,
      };
      await col.insertOne(doc);
      return NextResponse.json(doc);
    }

    const draft = await col.find({ id }).sort(DRAFT_SORT).limit(1).next();
    return NextResponse.json(draft);
  } catch (error) {
    console.error('Draft PATCH error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const col = await getDraftsCollection();
    const result = await col.deleteMany({ id });
    if (!result.deletedCount) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Draft DELETE error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

