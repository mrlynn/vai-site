import { NextRequest, NextResponse } from 'next/server';
import { getSubscribersCollection } from '@/lib/newsletter/subscribers';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function GET(request: NextRequest) {
  try {
    if (!ADMIN_TOKEN) {
      return NextResponse.json(
        { ok: false, error: 'admin_auth_not_configured' },
        { status: 500 }
      );
    }

    const cookie = request.cookies.get('vai_admin_token')?.value;
    if (!cookie || cookie !== ADMIN_TOKEN) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const col = await getSubscribersCollection();

    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ];

    const agg = await col.aggregate(pipeline).toArray();

    const counts: Record<string, number> = {};
    for (const row of agg) {
      counts[row._id || 'unknown'] = row.count || 0;
    }

    return NextResponse.json({
      ok: true,
      counts,
      total: Object.values(counts).reduce((sum, n) => sum + n, 0),
    });
  } catch (err) {
    console.error('Newsletter admin summary error:', err);
    return NextResponse.json(
      { ok: false, error: 'internal_error' },
      { status: 500 }
    );
  }
}

