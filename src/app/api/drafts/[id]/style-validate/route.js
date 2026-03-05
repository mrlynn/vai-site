import { NextResponse } from 'next/server';
import { getOpenAIClient, DEFAULT_MODEL } from '@/lib/content/openai';
import { getAuthorProfile, getAuthorRules } from '@/lib/content/authorStyle';

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

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const draftBody = typeof body.body === 'string' ? body.body.trim() : '';
    const authorId =
      typeof body.authorId === 'string' && body.authorId.trim()
        ? body.authorId.trim()
        : 'michael-lynn';

    if (!title || !draftBody) {
      return NextResponse.json(
        { error: 'title and body are required and must be non-empty strings' },
        { status: 400 },
      );
    }

    const [authorProfile, authorRules] = await Promise.all([
      getAuthorProfile(authorId),
      getAuthorRules(authorId),
    ]);

    const client = getOpenAIClient();

    const systemPrompt = `You are reviewing a draft for style, not facts.

You MUST return ONLY a JSON object with this shape:
{
  "rules": [
    {
      "id": "opening_value" | "concrete_example" | "tools" | "tradeoffs" | "anecdote_length" | "bridge" | "next_step",
      "passed": true | false,
      "notes": "short explanation"
    }
  ]
}

The rules are:
- opening_value: Opening explains reader value.
- concrete_example: At least one concrete example exists.
- tools: Tools or systems are referenced by name where useful.
- tradeoffs: Tradeoffs are mentioned, not just benefits.
- anecdote_length: Any anecdote is at most 3 sentences.
- bridge: There is a clear bridge sentence from story to concept.
- next_step: The section ends with a practical next step.`;

    const authorContext = [
      authorProfile ? `AUTHOR PROFILE:\n${authorProfile}` : '',
      authorRules ? `AUTHOR RULES (YAML):\n${JSON.stringify(authorRules, null, 2)}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const userContent = `TITLE:
${title}

BODY (Markdown):
${draftBody}

${authorContext}`;

    const completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0,
    });

    let raw = completion.choices[0]?.message?.content?.trim() ?? '';
    if (!raw) {
      return NextResponse.json(
        { error: 'Style validation returned an empty response' },
        { status: 500 },
      );
    }

    try {
      if (raw.startsWith('```')) {
        const firstBrace = raw.indexOf('{');
        const lastBrace = raw.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          raw = raw.slice(firstBrace, lastBrace + 1);
        }
      }
      const parsed = JSON.parse(raw);
      const rules = Array.isArray(parsed?.rules) ? parsed.rules : [];

      const normalized = rules.map((r, idx) => ({
        id:
          r.id === 'opening_value' ||
          r.id === 'concrete_example' ||
          r.id === 'tools' ||
          r.id === 'tradeoffs' ||
          r.id === 'anecdote_length' ||
          r.id === 'bridge' ||
          r.id === 'next_step'
            ? r.id
            : 'custom_' + (idx + 1).toString(),
        passed: typeof r.passed === 'boolean' ? r.passed : false,
        notes: typeof r.notes === 'string' ? r.notes : '',
      }));

      return NextResponse.json(
        {
          draftId: params.id,
          rules: normalized,
          checkedAt: new Date().toISOString(),
          model: completion.model,
          tokensUsed: completion.usage?.total_tokens ?? 0,
        },
        { status: 200 },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { error: 'Failed to parse style validation JSON', details: message },
        { status: 500 },
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Draft style-validate failed:', message);
    return NextResponse.json(
      { error: 'Draft style-validate failed', details: message },
      { status: 500 },
    );
  }
}

