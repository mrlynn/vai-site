// Light JS port of vai-dashboard's KnowledgeSource helpers.

import crypto from 'crypto';

function inferTag(type, name) {
  const lowerName = (name || '').toLowerCase();

  if (type === 'url') return 'web';
  if (type === 'codebase') return 'codebase';
  if (type === 'text') return 'pasted';

  if (lowerName.includes('author-style') || lowerName.includes('author style')) {
    return 'author-style';
  }

  // file — use 'docs' as default
  return 'docs';
}

export function buildSourceDocument(input) {
  const now = new Date().toISOString();
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const type = input.type;
  const sourcePath =
    typeof input.sourcePath === 'string' || input.sourcePath === null
      ? input.sourcePath
      : null;

  const crawlDepth =
    typeof input.crawlDepth === 'number' && Number.isFinite(input.crawlDepth) && input.crawlDepth >= 0
      ? input.crawlDepth
      : 0;
  const maxPages =
    typeof input.maxPages === 'number' && Number.isFinite(input.maxPages) && input.maxPages > 0
      ? input.maxPages
      : 20;
  const sameHostOnly = Boolean(input.sameHostOnly);
  const pathPrefix =
    typeof input.pathPrefix === 'string' && input.pathPrefix.trim().length > 0
      ? input.pathPrefix.trim()
      : null;

  return {
    id: crypto.randomUUID(),
    name,
    type,
    sourcePath,
    fingerprint: null,
    status: 'pending',
    chunkCount: 0,
    documentCount: 0,
    lastIndexedAt: null,
    createdAt: now,
    updatedAt: now,
    errorMessage: null,
    tag: inferTag(type, name),
    indexState: undefined,
    crawlConfig:
      type === 'url'
        ? {
            crawlDepth,
            maxPages,
            sameHostOnly,
            pathPrefix,
          }
        : undefined,
  };
}

