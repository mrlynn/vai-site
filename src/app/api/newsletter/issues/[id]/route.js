import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getIssuesCollection } from '@/lib/content/issues';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function requireAdmin(request) {
  if (!ADMIN_TOKEN) return false;
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

export async function GET(request, context) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const col = await getIssuesCollection();

    const asObjectId = ObjectId.isValid(id) ? new ObjectId(id) : null;
    const asNumber = Number.isFinite(Number(id)) ? Number(id) : null;
    const query =
      asObjectId && asNumber !== null
        ? { $or: [{ _id: asObjectId }, { issueNumber: asNumber }] }
        : asObjectId
          ? { _id: asObjectId }
          : asNumber !== null
            ? { issueNumber: asNumber }
            : { issueNumber: -1 };
    const issue = await col.findOne(query);
    if (!issue) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error('Issue GET error:', error);
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
    const col = await getIssuesCollection();

    const asObjectId = ObjectId.isValid(id) ? new ObjectId(id) : null;
    const asNumber = Number.isFinite(Number(id)) ? Number(id) : null;
    const query =
      asObjectId && asNumber !== null
        ? { $or: [{ _id: asObjectId }, { issueNumber: asNumber }] }
        : asObjectId
          ? { _id: asObjectId }
          : asNumber !== null
            ? { issueNumber: asNumber }
            : { issueNumber: -1 };

    // Resolve the canonical document first so we can always update by _id.
    const existing = await col.findOne(query);
    if (!existing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const now = new Date();
    const $set = {
      updatedAt: now,
    };

    if (updates.publishDate) {
      $set.publishDate = new Date(updates.publishDate);
    }
    if (typeof updates.theme === 'string') {
      $set.theme = updates.theme;
    }
    if (typeof updates.status === 'string') {
      $set.status = updates.status;
    }
    if (updates.sections) {
      Object.entries(updates.sections).forEach(([key, value]) => {
        if (!value) return;
        const sectionPath = `sections.${key}`;
        const sectionUpdate = {
          ...(value.content !== undefined ? { content: value.content } : {}),
          ...(value.status !== undefined ? { status: value.status } : {}),
          ...(value.sources !== undefined ? { sources: value.sources } : {}),
          ...(value.tipTopic !== undefined ? { tipTopic: value.tipTopic } : {}),
          updatedAt: now,
        };
        // eslint-disable-next-line no-param-reassign
        $set[sectionPath] = sectionUpdate;
      });
    }

    await col.updateOne({ _id: existing._id }, { $set });
    const updated = await col.findOne({ _id: existing._id });

    return NextResponse.json(updated || existing);
  } catch (error) {
    console.error('Issue PATCH error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

