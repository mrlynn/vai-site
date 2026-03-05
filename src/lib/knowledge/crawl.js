import { createHash } from 'crypto';

function stripHtml(html) {
  let text = html;

  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  text = text.replace(
    /<\/(p|div|section|article|header|footer|nav|main|aside|h[1-6]|li|tr|td|th|blockquote|pre)>/gi,
    '\n',
  );
  text = text.replace(/<br\s*\/?>/gi, '\n');

  text = text.replace(/<[^>]+>/g, '');

  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&apos;/g, "'");

  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/[ \t]+/g, ' ');
  return text.trim();
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (match) {
    return match[1].replace(/<[^>]+>/g, '').trim();
  }
  return '';
}

export async function crawlUrl(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'vai-site/1.0' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (
    !contentType.includes('text/html') &&
    !contentType.includes('text/plain') &&
    !contentType.includes('text/')
  ) {
    throw new Error(`Unsupported content type for ${url}: ${contentType}. Expected HTML or text.`);
  }

  const html = await response.text();
  const title = extractTitle(html);
  const text = stripHtml(html);

  const etag = response.headers.get('etag');
  let fingerprint;
  if (etag) {
    fingerprint = etag;
  } else {
    const hash = createHash('sha256');
    hash.update(text);
    fingerprint = hash.digest('hex');
  }

  return { text, title, fingerprint };
}

