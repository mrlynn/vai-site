import { NextResponse } from 'next/server';
import { getIssuesCollection } from '@/lib/content/issues';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

function requireAdmin(request) {
  if (!ADMIN_TOKEN) return false;
  const cookie = request.cookies.get('vai_admin_token')?.value;
  return cookie === ADMIN_TOKEN;
}

export async function GET(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const col = await getIssuesCollection();
    const issues = await col
      .find({})
      .project({
        issueNumber: 1,
        publishDate: 1,
        theme: 1,
        status: 1,
        updatedAt: 1,
      })
      .sort({ issueNumber: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Issues GET error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!requireAdmin(request)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const payload = await request.json().catch(() => ({}));
    const col = await getIssuesCollection();

    const now = new Date();

    // Auto-increment issueNumber by looking at the latest one.
    const last = await col.find().sort({ issueNumber: -1 }).limit(1).next();
    const nextIssueNumber = (last?.issueNumber || 0) + 1;

    const doc = {
      issueNumber: payload.issueNumber || nextIssueNumber,
      publishDate: payload.publishDate ? new Date(payload.publishDate) : now,
      theme: payload.theme || '',
      status: payload.status || 'draft',
      sections: {
        s1: {
          content: payload.sections?.s1?.content || '',
          status: payload.sections?.s1?.status || 'draft',
          enabled: payload.sections?.s1?.enabled !== false,
          updatedAt: now,
        },
        s2: {
          content: payload.sections?.s2?.content || '',
          status: payload.sections?.s2?.status || 'draft',
          sources: payload.sections?.s2?.sources || [],
          enabled: payload.sections?.s2?.enabled !== false,
          updatedAt: now,
        },
        s3: {
          content: payload.sections?.s3?.content || '',
          status: payload.sections?.s3?.status || 'draft',
          enabled: payload.sections?.s3?.enabled !== false,
          updatedAt: now,
        },
        s4: {
          content: payload.sections?.s4?.content || '',
          status: payload.sections?.s4?.status || 'draft',
          tipTopic: payload.sections?.s4?.tipTopic || '',
          enabled: payload.sections?.s4?.enabled !== false,
          updatedAt: now,
        },
        s5: {
          content: payload.sections?.s5?.content || '',
          status: payload.sections?.s5?.status || 'draft',
          enabled: payload.sections?.s5?.enabled !== false,
          updatedAt: now,
        },
        s6: {
          content: payload.sections?.s6?.content || '',
          status: payload.sections?.s6?.status || 'draft',
          enabled: !!payload.sections?.s6?.enabled,
          updatedAt: now,
        },
      },
      generationLog: [],
      buttondownId: payload.buttondownId || null,
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    };

    const result = await col.insertOne(doc);
    return NextResponse.json({ ...doc, _id: result.insertedId });
  } catch (error) {
    console.error('Issues POST error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

