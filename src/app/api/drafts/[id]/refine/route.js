import { NextResponse } from 'next/server';
import { getDraftsCollection } from '@/lib/content/drafts';
import { refineSelection } from '@/lib/content/openai';

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

    const draftBody = typeof body.body === 'string' ? body.body : '';
    const selection = body.selection;
    const mode = typeof body.mode === 'string' ? body.mode : 'clarify';
    const instruction =
      typeof body.instruction === 'string' && body.instruction.trim().length > 0
        ? body.instruction
        : undefined;

    if (!draftBody.trim()) {
      return NextResponse.json(
        { error: 'body is required' },
        { status: 400 }
      );
    }

    const result = await refineSelection({ body: draftBody, selection, mode, instruction });

    const col = await getDraftsCollection();
    const now = new Date().toISOString();

    const { value } = await col.findOneAndUpdate(
      { id: params.id },
      {
        $set: {
          body: result.body,
          updatedAt: now,
        },
      },
      { returnDocument: 'after' }
    );

    const draftDoc =
      value ||
      {
        id: params.id,
        body: result.body,
        updatedAt: now,
      };

    return NextResponse.json({
      ok: true,
      draft: draftDoc,
      tokensUsed: result.tokensUsed,
      model: result.model,
    });
  } catch (error) {
    console.error('Draft refine error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'refine_failed', details: message },
      { status: 500 }
    );
  }
}

