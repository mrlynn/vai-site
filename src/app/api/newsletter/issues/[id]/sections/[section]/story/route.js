import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getOpenAIClient, DEFAULT_MODEL, normalizeAuthorPunctuation } from '@/lib/content/openai';
import { getIssuesCollection } from '@/lib/content/issues';
import { getAuthorStyleSummary } from '@/lib/content/authorProfile';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function requireAdmin(request) {
  if (!ADMIN_TOKEN) return false;
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

// For now we only support author-story transformation for the "From the Field" section (s1).
const STORY_SECTION = 's1';

export async function POST(request, context) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id, section } = await context.params;
    if (section !== STORY_SECTION) {
      return NextResponse.json({ error: 'unsupported_section' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
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

    const draft = issue.sections?.s1?.content || '';
    if (!draft.trim()) {
      return NextResponse.json({ error: 'empty_section' }, { status: 400 });
    }

    const client = getOpenAIClient();
    const styleSummary = getAuthorStyleSummary();

    const title = `Vector Log #${issue.issueNumber}${issue.theme ? ` — ${issue.theme}` : ''}`;

    const systemPrompt = `You are Michael Lynn's editorial co-writer for the "From the Field" feature in Vector Log, a newsletter for practicing software engineers.

Write in Michael's voice and structure using the following style profile:

${styleSummary}

Your job is to take a rough draft or bullet notes and turn them into a cohesive 400–700 word narrative that:
- opens with the real problem, failure mode, or observation
- tells a specific story grounded in Michael's actual work with vai (voyageai-cli), Voyage models, and MongoDB Atlas
- weaves in concrete details (CLI commands, Atlas behavior, debugging moments) instead of abstract marketing language
- closes with a clear takeaway and next step for the reader.

Do not invent fictional biographical details. It's okay to slightly embellish for narrative flow, but stay true to the technical context.`;

    const userPrompt = `NEWSLETTER ISSUE TITLE:
${title}

RAW DRAFT / NOTES FOR "FROM THE FIELD":
${draft}

TASK:
Rewrite this into a polished, single continuous story for the "From the Field" section, in Michael's voice and style as described.

Constraints:
- Use Markdown.
- Aim for 400–700 words.
- Keep it focused and concrete; no generic AI hype, no filler.
- You may lightly re-order points to improve narrative flow, but preserve the core ideas and opinions in the draft.`;

    const completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });

    let content = completion.choices[0]?.message?.content?.trim() || '';
    if (!content) {
      return NextResponse.json({ error: 'empty_response' }, { status: 500 });
    }

    // Strip fenced code block wrappers if the model wraps the whole thing.
    if (content.startsWith('```')) {
      const firstFence = content.indexOf('\n');
      const lastFence = content.lastIndexOf('```');
      if (firstFence !== -1 && lastFence !== -1 && lastFence > firstFence) {
        content = content.slice(firstFence + 1, lastFence).trim();
      }
    }

    const normalized = normalizeAuthorPunctuation(content);
    const now = new Date();

    await col.updateOne(
      { _id: issue._id },
      {
        $set: {
          'sections.s1.content': normalized,
          'sections.s1.status': 'draft',
          'sections.s1.updatedAt': now,
          updatedAt: now,
        },
      },
    );

    return NextResponse.json({ content: normalized });
  } catch (error) {
    console.error('Section story error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

