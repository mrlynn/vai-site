import { getKnowledgeChunksCollection, getKnowledgeSourcesCollection } from '@/lib/knowledge/db';

const DEFAULT_TOP_K = 8;
const DEFAULT_MIN_SCORE = 0.65;
const MAX_CONTEXT_CHARS = 8000;

export async function vectorSearch(request) {
  const { query, topK = DEFAULT_TOP_K, minScore = DEFAULT_MIN_SCORE, sourceIds, tags } = request;

  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error('VOYAGE_API_KEY is not set');

  const base = process.env.VOYAGE_API_BASE || 'https://api.voyageai.com/v1';
  const model = process.env.VOYAGE_MODEL || 'voyage-3';

  const embedRes = await fetch(`${base}/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ input: [query], model, input_type: 'query' }),
  });
  if (!embedRes.ok) {
    const err = await embedRes.text();
    throw new Error(`Voyage AI embedding error: ${embedRes.status} ${err}`);
  }
  const embedData = await embedRes.json();
  const queryVector = embedData.data[0].embedding;

  const numCandidates = Math.min(topK * 15, 1000);

  const vectorSearchStage = {
    index: 'vector_index',
    path: 'embedding',
    queryVector,
    numCandidates,
    limit: topK,
  };

  if (sourceIds && sourceIds.length > 0) {
    vectorSearchStage.filter = { sourceId: { $in: sourceIds } };
  }

  const pipeline = [
    { $vectorSearch: vectorSearchStage },
    { $addFields: { score: { $meta: 'vectorSearchScore' } } },
    { $match: { score: { $gte: minScore } } },
  ];

  const chunksCollection = await getKnowledgeChunksCollection();
  const rawResults = await chunksCollection.aggregate(pipeline).toArray();

  let results = rawResults;
  if (tags && tags.length > 0) {
    const sourcesCollection = await getKnowledgeSourcesCollection();
    const sourceIdsWithTags = await sourcesCollection
      .find({ tag: { $in: tags } }, { projection: { id: 1 } })
      .toArray();
    const taggedSourceIds = new Set(sourceIdsWithTags.map((s) => s.id));
    results = rawResults.filter((r) => taggedSourceIds.has(r.sourceId));
  }

  const uniqueSourceIds = [...new Set(results.map((r) => r.sourceId))];
  const sourcesCollection = await getKnowledgeSourcesCollection();
  const sources = await sourcesCollection
    .find({ id: { $in: uniqueSourceIds } }, { projection: { id: 1, tag: 1 } })
    .toArray();
  const sourceTagMap = new Map(sources.map((s) => [s.id, s.tag]));

  return results.map((r) => ({
    chunkId: r.id,
    sourceId: r.sourceId,
    sourceName: r.sourceName,
    originPath: r.originPath,
    content: r.content,
    score: r.score,
    tag: sourceTagMap.get(r.sourceId) || 'unknown',
  }));
}

export async function retrieveContext(query, options = {}) {
  const chunks = await vectorSearch({
    query,
    topK: options.topK ?? DEFAULT_TOP_K,
    minScore: options.minScore ?? DEFAULT_MIN_SCORE,
    sourceIds: options.sourceIds,
    tags: options.tags,
  });

  const contextStrings = [];
  let totalChars = 0;

  for (const chunk of chunks) {
    const formatted = `[Source: ${chunk.sourceName} | ${chunk.originPath}]\n${chunk.content}`;
    if (totalChars + formatted.length > MAX_CONTEXT_CHARS) break;
    contextStrings.push(formatted);
    totalChars += formatted.length;
  }

  return contextStrings;
}

export async function retrieveContextWithMetadata(query, options = {}) {
  return vectorSearch({
    query,
    topK: options.topK ?? DEFAULT_TOP_K,
    minScore: options.minScore ?? DEFAULT_MIN_SCORE,
    sourceIds: options.sourceIds,
    tags: options.tags,
  });
}

export async function retrieveTechnicalContext(query, options = {}) {
  return retrieveContext(query, {
    ...options,
    tags: options.tags ?? ['docs', 'codebase'],
  });
}

export async function retrieveAuthorStyleContext(query, options = {}) {
  return retrieveContext(query, {
    ...options,
    tags: options.tags ?? ['author-style'],
  });
}

