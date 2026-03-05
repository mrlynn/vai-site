import { NextResponse } from 'next/server';
import { getDraftsCollection } from '@/lib/content/drafts';
import { suggestHookTitle } from '@/lib/content/openai';

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
    const currentTitle = typeof body.title === 'string' ? body.title : '';
    const overrideBody = typeof body.body === 'string' ? body.body : null;
    const channel = typeof body.channel === 'string' ? body.channel : undefined;

    const col = await getDraftsCollection();
    const draft = await col.findOne({ id: params.id });

    if (!draft) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const baseTitle = currentTitle || (typeof draft.title === 'string' ? draft.title : '');
    const draftBody =
      overrideBody !== null ? overrideBody : typeof draft.body === 'string' ? draft.body : '';

    if (!draftBody.trim()) {
      return NextResponse.json(
        { error: 'body is required to suggest a title' },
        { status: 400 },
      );
    }

    const result = await suggestHookTitle({
      title: baseTitle,
      body: draftBody,
      channel: channel || draft.channel || draft.platform || '',
    });

    return NextResponse.json(
      {
        draftId: draft.id,
        suggestedTitle: result.title,
        tokensUsed: result.tokensUsed,
        model: result.model,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Suggest title error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'suggest_title_failed', details: message },
      { status: 500 },
    );
  }
}

