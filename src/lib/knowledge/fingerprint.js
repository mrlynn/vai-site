import { createHash } from 'crypto';
import { readFile } from 'fs/promises';

export async function fingerprintFile(filePath) {
  const content = await readFile(filePath);
  const hash = createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

export async function fingerprintUrl(url) {
  try {
    const headResponse = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'vai-site/1.0' },
    });

    const etag = headResponse.headers.get('etag');
    if (etag) {
      return { fingerprint: etag, etag };
    }
  } catch {
    // ignore and fall through
  }

  const response = await fetch(url, {
    headers: { 'User-Agent': 'vai-site/1.0' },
  });
  const text = await response.text();
  const hash = createHash('sha256');
  hash.update(text);
  const fingerprint = hash.digest('hex');

  const etag = response.headers.get('etag');
  return { fingerprint: etag ?? fingerprint, etag };
}

