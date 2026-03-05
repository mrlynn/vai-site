import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { factCheckDraft } from '@/lib/content/openai';
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
    const note =
      typeof body.note === 'string' && body.note.trim().length ? body.note.trim() : '';

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

    const content = issue.sections?.[section]?.content || '';
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'empty_section' }, { status: 400 });
    }

    const title = `Vector Log #${issue.issueNumber}${
      issue.theme ? ` — ${issue.theme}` : ''
    }`;

    const result = await factCheckDraft({
      title,
      body: content,
      knowledgeContext: undefined,
      note,
    });

    return NextResponse.json({ claims: result.claims });
  } catch (error) {
    console.error('Section fact-check error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

