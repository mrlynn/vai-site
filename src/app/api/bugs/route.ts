import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import {
  BUG_PRIORITY_VALUES,
  BUG_STATUS_VALUES,
  buildBugDocument,
  buildBugQuery,
  createBugFingerprint,
  createBugGithubIssueUrl,
  ensureBugIndexes,
  getPersistedBugFields,
  normalizeOptionalString,
  normalizeOptionalStringList,
  validateBugReportInput,
} from '@/lib/bugs/schema';
import connectDB from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// Rate limiter - 10 bugs per hour per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return false;
  }

  entry.count++;
  return entry.count > 10;
}

// Clean up stale entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 600_000);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function isAuthorizedAdminRequest(request: NextRequest) {
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (isValidAdminSession(sessionToken)) {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.BUGS_ADMIN_TOKEN;
  if (!expectedToken || !authHeader?.startsWith('Bearer ')) {
    return false;
  }

  return authHeader.slice('Bearer '.length) === expectedToken;
}

function summarizeBuckets<T extends string>(items: Record<string, unknown>[], field: T) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const key = typeof item[field] === 'string' ? String(item[field]) : 'unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([key, count]) => ({ _id: key, count }))
    .sort((a, b) => b.count - a.count);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const db = await connectDB();
    await ensureBugIndexes(db);
    const query = buildBugQuery(new URL(request.url).searchParams);
    const bugs = await db
      .collection('bugs')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(250)
      .toArray();

    const stats = {
      status: summarizeBuckets(bugs, 'status'),
      priority: summarizeBuckets(bugs, 'priority'),
      source: summarizeBuckets(bugs, 'source'),
    };

    return NextResponse.json({ bugs, stats }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('Bugs GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 10 bug reports per hour.' },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    const body = await request.json();
    const validation = validateBugReportInput(body);

    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Get geo from Vercel headers
    const country = request.headers.get('x-vercel-ip-country') || undefined;
    const region = request.headers.get('x-vercel-ip-country-region') || undefined;

    const fingerprint = createBugFingerprint({
      title: validation.normalized.title || 'unknown',
      source: validation.normalized.source,
      platform: validation.normalized.platform,
      cliVersion: validation.normalized.cliVersion,
      appVersion: validation.normalized.appVersion,
      errorMessage: validation.normalized.errorMessage,
    });

    const { doc, bugId } = buildBugDocument(body, {
      country,
      region,
      userAgent: request.headers.get('user-agent'),
      fingerprint,
    });
    doc.githubIssueUrl = createBugGithubIssueUrl(doc);

    const db = await connectDB();
    await ensureBugIndexes(db);
    await db.collection('bugs').insertOne(doc);

    return NextResponse.json(
      {
        ok: true,
        bugId,
        message: 'Bug report submitted successfully',
        githubIssueUrl: doc.githubIssueUrl,
        canonicalEndpoint: 'https://vaicli.com/api/bugs',
        storedFields: getPersistedBugFields(doc),
        storedBug: {
          bugId: doc.bugId,
          title: doc.title,
          email: doc.email,
          source: doc.source,
          sessionId: doc.sessionId,
          userId: doc.userId,
          accountId: doc.accountId,
          status: doc.status,
          priority: doc.priority,
          appVersion: doc.appVersion,
          cliVersion: doc.cliVersion,
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('Bugs POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const body = await request.json();
    const bugId = normalizeOptionalString(body.bugId, 120);

    if (!bugId) {
      return NextResponse.json(
        { error: 'bugId is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const db = await connectDB();
    await ensureBugIndexes(db);
    const bugs = db.collection('bugs');
    const existing = await bugs.findOne({ bugId });

    if (!existing) {
      return NextResponse.json(
        { error: 'Bug not found' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const nextStatus = typeof body.status === 'string' ? body.status : null;
    const nextPriority = typeof body.priority === 'string' ? body.priority : null;
    const now = new Date();
    const update: Record<string, unknown> = {
      updatedAt: now,
      lastActivityAt: now,
    };
    const errors: string[] = [];

    if (nextStatus) {
      if (!BUG_STATUS_VALUES.includes(nextStatus as (typeof BUG_STATUS_VALUES)[number])) {
        errors.push(`Invalid status. Must be one of: ${BUG_STATUS_VALUES.join(', ')}`);
      } else {
        update.status = nextStatus;
      }
    }

    if (nextPriority) {
      if (!BUG_PRIORITY_VALUES.includes(nextPriority as (typeof BUG_PRIORITY_VALUES)[number])) {
        errors.push(`Invalid priority. Must be one of: ${BUG_PRIORITY_VALUES.join(', ')}`);
      } else {
        update.priority = nextPriority;
      }
    }

    if (body.assignee !== undefined) {
      update.assignee = normalizeOptionalString(body.assignee, 120);
    }

    if (body.resolution !== undefined) {
      update.resolution = normalizeOptionalString(body.resolution, 500);
    }

    if (body.githubIssueUrl !== undefined) {
      update.githubIssueUrl = normalizeOptionalString(body.githubIssueUrl, 500);
    }

    if (body.githubIssueNumber !== undefined) {
      update.githubIssueNumber =
        typeof body.githubIssueNumber === 'number' && Number.isFinite(body.githubIssueNumber)
          ? body.githubIssueNumber
          : null;
    }

    if (body.labels !== undefined) {
      update.labels = normalizeOptionalStringList(body.labels);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors[0] },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (Object.keys(update).length === 2) {
      return NextResponse.json(
        { error: 'No supported fields to update' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const updateOperation: Record<string, unknown> = {
      $set: update,
    };

    if (nextStatus && nextStatus !== existing.status) {
      updateOperation.$push = {
        statusHistory: {
          status: nextStatus,
          changedAt: now,
          note: `Status changed from ${existing.status || 'unknown'} to ${nextStatus}`,
        },
      };
    }

    const result = await bugs.updateOne({ bugId }, updateOperation as never);

    return NextResponse.json(
      {
        ok: true,
        bugId,
        updated: result.modifiedCount > 0,
        update,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('Bugs PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
