import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Rate limiter: 20 requests/IP/hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return false;
  }
  entry.count++;
  return entry.count > 20;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 600_000);

const VOYAGE_BASE = 'https://api.voyageai.com/v1';
const MODELS = ['voyage-4-large', 'voyage-4', 'voyage-4-lite'] as const;
const COST_PER_MILLION: Record<string, number> = {
  'voyage-4-large': 0.12,
  'voyage-4': 0.06,
  'voyage-4-lite': 0.02,
};
const CONTROL_TEXT = 'The recipe calls for two cups of flour and three eggs mixed in a large bowl.';

interface EmbedResponse {
  data: Array<{ embedding: number[] }>;
  usage: { total_tokens: number };
}

async function embed(
  model: string,
  input: string[],
  inputType: 'document' | 'query',
  apiKey: string,
): Promise<EmbedResponse> {
  const res = await fetch(`${VOYAGE_BASE}/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, input, input_type: inputType }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Voyage API error (${res.status}): ${text}`);
  }
  return res.json();
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// PCA via power iteration to get top 2 components
function pcaProject2D(vectors: number[][]): Array<{ x: number; y: number }> {
  const n = vectors.length;
  if (n === 0) return [];
  const dim = vectors[0].length;

  // Center the data
  const mean = new Float64Array(dim);
  for (const v of vectors) for (let i = 0; i < dim; i++) mean[i] += v[i] / n;
  const centered = vectors.map((v) => v.map((val, i) => val - mean[i]));

  function powerIteration(data: number[][], deflated?: number[]): number[] {
    let pc = new Float64Array(dim);
    for (let i = 0; i < dim; i++) pc[i] = Math.random() - 0.5;

    for (let iter = 0; iter < 100; iter++) {
      const newPc = new Float64Array(dim);
      for (const row of data) {
        let dot = 0;
        for (let i = 0; i < dim; i++) dot += row[i] * pc[i];
        for (let i = 0; i < dim; i++) newPc[i] += dot * row[i];
      }
      // Deflate
      if (deflated) {
        let proj = 0;
        for (let i = 0; i < dim; i++) proj += newPc[i] * deflated[i];
        for (let i = 0; i < dim; i++) newPc[i] -= proj * deflated[i];
      }
      let norm = 0;
      for (let i = 0; i < dim; i++) norm += newPc[i] * newPc[i];
      norm = Math.sqrt(norm);
      if (norm < 1e-10) break;
      for (let i = 0; i < dim; i++) pc[i] = newPc[i] / norm;
    }
    return Array.from(pc);
  }

  const pc1 = powerIteration(centered);
  const pc2 = powerIteration(centered, pc1);

  return centered.map((row) => {
    let x = 0, y = 0;
    for (let i = 0; i < dim; i++) {
      x += row[i] * pc1[i];
      y += row[i] * pc2[i];
    }
    return { x, y };
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 20 requests per hour.' },
        { status: 429 },
      );
    }

    const apiKey = process.env.VOYAGE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const body = await request.json();
    const documentText = String(body.documentText || '').slice(0, 2000);
    const queryText = String(body.queryText || '').slice(0, 2000);

    if (!documentText || !queryText) {
      return NextResponse.json(
        { error: 'Both documentText and queryText are required' },
        { status: 400 },
      );
    }

    // 6 calls for 3 models × 2 input types + 1 control call = 7 total, all parallel
    type EmbedResult = { model: string; type: 'document' | 'query' | 'control'; embedding: number[]; tokens: number };

    const calls: Promise<EmbedResult>[] = MODELS.flatMap((model) => [
      embed(model, [documentText], 'document', apiKey).then((r) => ({
        model,
        type: 'document' as const,
        embedding: r.data[0].embedding,
        tokens: r.usage.total_tokens,
      })),
      embed(model, [queryText], 'query', apiKey).then((r) => ({
        model,
        type: 'query' as const,
        embedding: r.data[0].embedding,
        tokens: r.usage.total_tokens,
      })),
    ]);

    // Control: embed with voyage-4-large as document
    calls.push(
      embed('voyage-4-large', [CONTROL_TEXT], 'document', apiKey).then((r) => ({
        model: 'voyage-4-large',
        type: 'control' as const,
        embedding: r.data[0].embedding,
        tokens: r.usage.total_tokens,
      })),
    );

    const results = await Promise.all(calls);

    // Build labeled vectors
    interface LabeledVector {
      label: string;
      type: 'document' | 'query' | 'control';
      model: string;
      embedding: number[];
    }

    const labeled: LabeledVector[] = results.map((r) => ({
      label:
        r.type === 'control'
          ? 'Control'
          : `${r.model.replace('voyage-', 'v')} (${r.type === 'document' ? 'doc' : 'query'})`,
      type: r.type,
      model: r.model,
      embedding: r.embedding,
    }));

    // Pairwise similarities
    const similarities: Array<{ a: string; b: string; similarity: number }> = [];
    for (let i = 0; i < labeled.length; i++) {
      for (let j = i + 1; j < labeled.length; j++) {
        similarities.push({
          a: labeled[i].label,
          b: labeled[j].label,
          similarity: Math.round(cosine(labeled[i].embedding, labeled[j].embedding) * 10000) / 10000,
        });
      }
    }

    // PCA projection
    const projected = pcaProject2D(labeled.map((l) => l.embedding));
    const projection = labeled.map((l, i) => ({
      label: l.label,
      type: l.type,
      model: l.model,
      x: Math.round(projected[i].x * 10000) / 10000,
      y: Math.round(projected[i].y * 10000) / 10000,
    }));

    // Embeddings metadata (group by model)
    const embeddingsMap = new Map<string, { docTokens: number; queryTokens: number }>();
    for (const r of results) {
      if (r.type === 'control') continue;
      const existing = embeddingsMap.get(r.model) || { docTokens: 0, queryTokens: 0 };
      if (r.type === 'document') existing.docTokens = r.tokens;
      else existing.queryTokens = r.tokens;
      embeddingsMap.set(r.model, existing);
    }

    const embeddings = MODELS.map((model) => {
      const info = embeddingsMap.get(model)!;
      const cpm = COST_PER_MILLION[model];
      return {
        model,
        documentTokens: info.docTokens,
        queryTokens: info.queryTokens,
        costPerMillion: cpm,
        documentCost: (info.docTokens / 1_000_000) * cpm,
        queryCost: (info.queryTokens / 1_000_000) * cpm,
      };
    });

    // Insight metrics
    const findSim = (a: string, b: string) =>
      similarities.find(
        (s) => (s.a === a && s.b === b) || (s.a === b && s.b === a),
      )?.similarity ?? 0;

    const crossModelSimilarity = findSim('v4-large (doc)', 'v4-lite (query)');
    const sameModelSimilarity = findSim('v4-large (doc)', 'v4-large (query)');
    const qualityRetention =
      sameModelSimilarity > 0
        ? Math.round((crossModelSimilarity / sameModelSimilarity) * 10000) / 100
        : 0;

    // Symmetric: voyage-4-large for both doc+query at 1M queries
    // Asymmetric: voyage-4-large for docs, voyage-4-lite for queries
    const symmetric = (COST_PER_MILLION['voyage-4-large'] / 1_000_000) * 1_000_000; // $0.12 per 1M
    const asymmetric =
      COST_PER_MILLION['voyage-4-large'] * 0 + // docs already indexed
      (COST_PER_MILLION['voyage-4-lite'] / 1_000_000) * 1_000_000; // $0.02 per 1M queries
    const savingsPercent = Math.round(((symmetric - asymmetric) / symmetric) * 10000) / 100;

    return NextResponse.json({
      embeddings,
      similarities,
      projection,
      insight: {
        crossModelSimilarity,
        sameModelSimilarity,
        qualityRetention,
        savingsPercent,
        monthlyAt1M: {
          symmetric: Math.round(symmetric * 100) / 100,
          asymmetric: Math.round(asymmetric * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error('Shared space error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
