import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

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
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  // Simple stats endpoint for admin
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.BUGS_ADMIN_TOKEN;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const db = await getDb();
    const bugs = await db
      .collection('bugs')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const stats = await db.collection('bugs').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]).toArray();

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

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length < 5) {
      return NextResponse.json(
        { error: 'Title is required (min 5 characters)' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!body.description || typeof body.description !== 'string' || body.description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Description is required (min 10 characters)' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Get geo from Vercel headers
    const country = request.headers.get('x-vercel-ip-country') || undefined;
    const region = request.headers.get('x-vercel-ip-country-region') || undefined;

    // Build the bug document
    const bugId = `bug_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    
    const doc = {
      bugId,
      title: body.title.trim().slice(0, 200),
      description: body.description.trim().slice(0, 5000),
      stepsToReproduce: body.stepsToReproduce?.trim().slice(0, 2000) || null,
      
      // Environment
      appVersion: body.appVersion || null,
      cliVersion: body.cliVersion || null,
      platform: body.platform || null,
      arch: body.arch || null,
      nodeVersion: body.nodeVersion || null,
      electronVersion: body.electronVersion || null,
      
      // Context
      source: body.source || 'unknown', // 'desktop-app' | 'cli' | 'web'
      currentScreen: body.currentScreen || null,
      currentCommand: body.currentCommand || null,
      
      // Error details
      errorMessage: body.errorMessage?.slice(0, 1000) || null,
      errorStack: body.errorStack?.slice(0, 5000) || null,
      consoleLogs: body.consoleLogs?.slice(0, 10000) || null,
      
      // User info (optional)
      email: body.email?.trim().slice(0, 200) || null,
      
      // Screenshot (base64 or URL, limited size)
      screenshot: body.screenshot?.slice(0, 500000) || null, // ~500KB max
      
      // Metadata
      status: 'new',
      createdAt: new Date(),
      country,
      region,
      userAgent: request.headers.get('user-agent') || null,
    };

    const db = await getDb();
    await db.collection('bugs').insertOne(doc);

    // Generate GitHub issue URL for optional follow-up
    const githubIssueUrl = generateGitHubIssueUrl(doc);

    return NextResponse.json(
      { 
        ok: true, 
        bugId,
        message: 'Bug report submitted successfully',
        githubIssueUrl,
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

function generateGitHubIssueUrl(bug: Record<string, unknown>): string {
  const title = encodeURIComponent(`[Bug] ${bug.title}`);
  
  const body = encodeURIComponent(`## Description
${bug.description}

## Steps to Reproduce
${bug.stepsToReproduce || 'Not provided'}

## Environment
- **Source:** ${bug.source}
- **App Version:** ${bug.appVersion || 'N/A'}
- **CLI Version:** ${bug.cliVersion || 'N/A'}
- **Platform:** ${bug.platform || 'N/A'}
- **Arch:** ${bug.arch || 'N/A'}

## Error Details
${bug.errorMessage ? `\`\`\`\n${bug.errorMessage}\n\`\`\`` : 'No error message'}

---
*Bug ID: ${bug.bugId}*
`);

  return `https://github.com/mrlynn/voyageai-cli/issues/new?title=${title}&body=${body}&labels=bug`;
}
