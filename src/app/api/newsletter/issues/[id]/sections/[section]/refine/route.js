import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { refineSelection } from '@/lib/content/openai';
import { getIssuesCollection } from '@/lib/content/issues';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function requireAdmin(request) {
  if (!ADMIN_TOKEN) return false;
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

const VALID_SECTIONS = new Set(['s1', 's2', 's3', 's4', 's5', 's6']);

export async function POST(request, context) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id, section } = await context.params;
    if (!VALID_SECTIONS.has(section)) {
      return NextResponse.json({ error: 'invalid_section' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const instruction =
      typeof body.instruction === 'string' && body.instruction.trim().length
        ? body.instruction.trim()
        : '';
    const mode =
      typeof body.mode === 'string' && body.mode.trim().length ? body.mode.trim() : undefined;

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

    const current = issue.sections?.[section]?.content || '';
    if (!current || !current.trim()) {
      return NextResponse.json({ error: 'empty_section' }, { status: 400 });
    }

    const result = await refineSelection({
      body: current,
      selection: null,
      mode,
      instruction,
    });

    const now = new Date();
    await col.updateOne(
      { _id: issue._id },
      {
        $set: {
          [`sections.${section}.content`]: result.body,
          [`sections.${section}.status`]: 'draft',
          [`sections.${section}.updatedAt`]: now,
          updatedAt: now,
        },
      },
    );

    return NextResponse.json({ content: result.body });
  } catch (error) {
    console.error('Section refine error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

