import { NextResponse } from 'next/server';
import { searchUnsplash } from '@/lib/unsplash';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('query') || '').trim();
    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const perPage = Number(searchParams.get('per_page') || '12');
    const limit = Number.isFinite(perPage) && perPage > 0 ? perPage : 12;

    const results = await searchUnsplash(query, limit);

    const images = results.map((img) => ({
      id: img.id,
      url: img.urls?.regular,
      thumbUrl: img.urls?.thumb,
      alt: img.alt_description || img.description || '',
      photographer: img.user?.name,
      photographerUrl: img.user?.links?.html,
      unsplashUrl: img.links?.html,
    }));

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Unsplash search failed:', message);
    return NextResponse.json(
      { error: 'Unsplash search failed', details: message },
      { status: 500 },
    );
  }
}

