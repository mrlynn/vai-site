import { NextResponse } from 'next/server';
import { getDraftsCollection } from '@/lib/content/drafts';
import { factCheckDraft } from '@/lib/content/openai';
import { getCoreVaiKnowledge } from '@/lib/content/knowledgeContext';

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

    const body = await request.json().catch(() => ({}));
    const overrideBody = typeof body.body === 'string' ? body.body : null;
    const note = typeof body.note === 'string' ? body.note : undefined;
    const extraContext =
      Array.isArray(body.knowledgeContext) && body.knowledgeContext.every((s) => typeof s === 'string')
        ? body.knowledgeContext
        : [];

    const col = await getDraftsCollection();
    const draft = await col.findOne({ id: params.id });

    if (!draft) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const title = typeof draft.title === 'string' ? draft.title : '';
    const draftBody = overrideBody !== null ? overrideBody : typeof draft.body === 'string' ? draft.body : '';

    if (!title.trim() || !draftBody.trim()) {
      return NextResponse.json(
        { error: 'title and body are required for fact-check' },
        { status: 400 },
      );
    }

    const baseContext = getCoreVaiKnowledge();
    const knowledgeContext = extraContext.length ? baseContext.concat(extraContext) : baseContext;

    const result = await factCheckDraft({
      title,
      body: draftBody,
      knowledgeContext,
      note,
    });

    return NextResponse.json(
      {
        draftId: draft.id,
        claims: result.claims,
        tokensUsed: result.tokensUsed,
        model: result.model,
        checkedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Draft fact-check error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'fact_check_failed', details: message },
      { status: 500 },
    );
  }
}

