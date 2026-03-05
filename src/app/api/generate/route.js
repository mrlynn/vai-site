import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/content/openai';
import { VALID_CONTENT_TYPES } from '@/lib/content/prompts';

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

    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
    const contentType = body.contentType;
    const platform = typeof body.platform === 'string' ? body.platform : undefined;
    const additionalInstructions =
      typeof body.additionalInstructions === 'string' ? body.additionalInstructions : undefined;
    const knowledgeContext =
      Array.isArray(body.knowledgeContext) && body.knowledgeContext.every((s) => typeof s === 'string')
        ? body.knowledgeContext
        : undefined;

    if (!topic) {
      return NextResponse.json(
        { error: 'topic is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!contentType || !VALID_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: `contentType must be one of: ${VALID_CONTENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await generateContent({
      contentType,
      topic,
      platform,
      additionalInstructions,
      knowledgeContext,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Content generation failed:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Content generation failed', details: message },
      { status: 500 }
    );
  }
}

