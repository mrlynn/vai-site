import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getOpenAIClient, DEFAULT_MODEL } from '@/lib/content/openai';
import { getIssuesCollection } from '@/lib/content/issues';
import { NEWSLETTER_SYSTEM_PROMPT, buildIssueUserPrompt } from '@/lib/newsletter/prompts';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function requireAdmin(request) {
  if (!ADMIN_TOKEN) return false;
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

function parseSections(markdown) {
  const markers = [
    { key: 's1', label: 'SECTION 1: FROM THE FIELD' },
    { key: 's2', label: 'SECTION 2: AI NEWS ROUNDUP' },
    { key: 's3', label: 'SECTION 3: DEVELOPER INTELLIGENCE' },
    { key: 's4', label: 'SECTION 4: VAI PRODUCT TIP' },
    { key: 's5', label: 'SECTION 5: CALL TO ACTION' },
    { key: 's6', label: "SECTION 6: WHAT I'M READING" },
  ];

  const result = { s1: '', s2: '', s3: '', s4: '', s5: '', s6: '' };

  const endMarker = '=== END OF ISSUE ===';
  const endIdx = markdown.indexOf(endMarker);
  const body = endIdx === -1 ? markdown : markdown.slice(0, endIdx);

  markers.forEach((marker, idx) => {
    const markerText = `=== ${marker.label} ===`;
    const start = body.indexOf(markerText);
    if (start === -1) return;
    const from = start + markerText.length;
    const nextMarker = markers[idx + 1];
    const nextText = nextMarker ? `=== ${nextMarker.label} ===` : null;
    const end = nextText ? body.indexOf(nextText, from) : body.length;
    const raw = body.slice(from, end === -1 ? body.length : end);
    result[marker.key] = raw.trim();
  });

  return result;
}

export async function POST(request, context) {
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

    const client = getOpenAIClient();

    const publishDate =
      issue.publishDate instanceof Date ? issue.publishDate : new Date(issue.publishDate || Date.now());

    const userPrompt = buildIssueUserPrompt({
      issueNumber: issue.issueNumber,
      publishDate,
      theme: issue.theme || '',
      section1Draft: issue.sections?.s1?.content || '',
    });

    const completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: NEWSLETTER_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'empty_response' }, { status: 500 });
    }

    const sections = parseSections(content);
    const now = new Date();

    const update = {
      $set: {
        'sections.s1.content': sections.s1 || issue.sections?.s1?.content || '',
        'sections.s1.status': 'draft',
        'sections.s1.updatedAt': now,
        'sections.s2.content': sections.s2 || issue.sections?.s2?.content || '',
        'sections.s2.status': 'draft',
        'sections.s2.updatedAt': now,
        'sections.s3.content': sections.s3 || issue.sections?.s3?.content || '',
        'sections.s3.status': 'draft',
        'sections.s3.updatedAt': now,
        'sections.s4.content': sections.s4 || issue.sections?.s4?.content || '',
        'sections.s4.status': 'draft',
        'sections.s4.updatedAt': now,
        'sections.s5.content': sections.s5 || issue.sections?.s5?.content || '',
        'sections.s5.status': 'draft',
        'sections.s5.updatedAt': now,
        'sections.s6.content': sections.s6 || issue.sections?.s6?.content || '',
        'sections.s6.status': 'draft',
        'sections.s6.updatedAt': now,
        updatedAt: now,
      },
      $push: {
        generationLog: {
          timestamp: now,
          model: completion.model,
          tokensUsed: completion.usage?.total_tokens ?? 0,
          kind: 'full_issue',
        },
      },
    };

    const { value } = await col.findOneAndUpdate(query, update, { returnDocument: 'after' });

    return NextResponse.json(value || issue);
  } catch (error) {
    console.error('Issue generate error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

