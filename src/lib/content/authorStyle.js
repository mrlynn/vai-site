import { promises as fs } from 'fs';
import path from 'path';

const authorCache = new Map();

function getAuthorRootDir(authorId) {
  const cwd = process.cwd();
  return path.join(cwd, 'memory-bank', 'authors', authorId);
}

function getLegacyRootDir() {
  const cwd = process.cwd();
  return path.join(cwd, 'memory-bank');
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readTextFile(maybePaths) {
  for (const p of maybePaths) {
    if (await fileExists(p)) {
      const raw = await fs.readFile(p, 'utf8');
      const trimmed = raw.trim();
      if (trimmed.length === 0) continue;
      return trimmed;
    }
  }
  return null;
}

async function readJsonFile(maybePaths) {
  const text = await readTextFile(maybePaths);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function readYamlFile(maybePaths) {
  const text = await readTextFile(maybePaths);
  if (!text) return null;

  try {
    const yamlModule = await import('yaml');
    return yamlModule.parse(text);
  } catch {
    return null;
  }
}

function getCandidatePaths(authorId, fileName) {
  const authorRoot = getAuthorRootDir(authorId);
  const legacyRoot = getLegacyRootDir();

  const candidates = [path.join(authorRoot, fileName)];

  if (authorId === 'michael-lynn') {
    candidates.push(path.join(legacyRoot, fileName));
  }

  return candidates;
}

export async function getAuthorProfile(authorId) {
  const cached = authorCache.get(authorId) || {};
  if (cached.profile !== undefined) {
    return cached.profile || '';
  }

  const candidates = getCandidatePaths(authorId, 'authorProfile.md');
  const text = await readTextFile(candidates);

  const next = { ...cached, profile: text || '' };
  authorCache.set(authorId, next);

  return next.profile || '';
}

export async function getAuthorRules(authorId) {
  const cached = authorCache.get(authorId) || {};
  if (cached.rules !== undefined) {
    return cached.rules || null;
  }

  const candidates = getCandidatePaths(authorId, 'authorRules.yaml');
  const parsed = await readYamlFile(candidates);

  const next = { ...cached, rules: parsed || null };
  authorCache.set(authorId, next);

  return next.rules || null;
}

export async function getAnecdotePatterns(authorId) {
  const cached = authorCache.get(authorId) || {};
  if (cached.anecdotePatterns !== undefined) {
    return cached.anecdotePatterns || null;
  }

  const candidates = getCandidatePaths(authorId, 'anecdotePatterns.yaml');
  const parsed = await readYamlFile(candidates);

  const next = { ...cached, anecdotePatterns: parsed || null };
  authorCache.set(authorId, next);

  return next.anecdotePatterns || null;
}

export async function getCanonicalExcerpts(authorId) {
  const cached = authorCache.get(authorId) || {};
  if (cached.canonicalExcerpts !== undefined) {
    return cached.canonicalExcerpts || '';
  }

  const candidates = getCandidatePaths(authorId, 'canonicalExcerpts.md');
  const text = await readTextFile(candidates);

  const next = { ...cached, canonicalExcerpts: text || '' };
  authorCache.set(authorId, next);

  return next.canonicalExcerpts || '';
}

export async function getAuthorAnecdotes(authorId) {
  const cached = authorCache.get(authorId) || {};
  if (cached.anecdotes !== undefined) {
    return cached.anecdotes || [];
  }

  const candidates = getCandidatePaths(authorId, 'authorAnecdotes.json');
  const parsed = await readJsonFile(candidates);

  let anecdotes = null;
  if (Array.isArray(parsed)) {
    anecdotes = parsed;
  } else if (parsed && typeof parsed === 'object') {
    anecdotes = [parsed];
  }

  const next = { ...cached, anecdotes: anecdotes || [] };
  authorCache.set(authorId, next);

  return next.anecdotes || [];
}

export function clearAuthorStyleCache() {
  authorCache.clear();
}

