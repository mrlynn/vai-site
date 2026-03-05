import { NextResponse } from 'next/server';
import { generateTopicIdeas } from '@/lib/content/openai';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function requireAdmin(request) {
  if (!ADMIN_TOKEN) return false;
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

export async function POST(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

    if (!prompt) {
      return NextResponse.json(
        { error: 'prompt is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const result = await generateTopicIdeas(prompt);

    return NextResponse.json(
      { topics: result.topics, tokensUsed: result.tokensUsed, model: result.model },
      { status: 200 }
    );
  } catch (error) {
    console.error('Topic generation failed:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Topic generation failed', details: message },
      { status: 500 }
    );
  }
}

