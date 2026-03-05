const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

function requireUnsplashKey() {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    throw new Error('UNSPLASH_ACCESS_KEY environment variable is not set');
  }
  return key;
}

export async function searchUnsplash(query, perPage = 12) {
  const accessKey = requireUnsplashKey();

  async function runSearch(q) {
    const url = new URL(`${UNSPLASH_BASE_URL}/search/photos`);
    url.searchParams.set('query', q);
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('orientation', 'landscape');
    url.searchParams.set('content_filter', 'high');
    url.searchParams.set('client_id', accessKey);

    const res = await fetch(url.toString(), {
      headers: {
        'Accept-Version': 'v1',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Unsplash error: ${res.status} ${text}`);
    }

    const data = await res.json();
    return Array.isArray(data.results) ? data.results : [];
  }

  let results = await runSearch(query);

  if (results.length === 0 && query.length > 30) {
    const simplified = query
      .split(/[,:\-]/)[0]
      .split(/\s+/)
      .slice(0, 3)
      .join(' ')
      .trim();

    if (simplified && simplified !== query) {
      const fallbackResults = await runSearch(simplified);
      if (fallbackResults.length > 0) {
        results = fallbackResults;
      }
    }
  }

  return results;
}

