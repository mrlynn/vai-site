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

const VOYAGE_BASE = (process.env.VOYAGE_BASE_URL || 'https://api.voyageai.com/v1').replace(/\/+$/, '');
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

function shortName(model: string): string {
  return model.replace('voyage-', 'v');
}

// PCA via power iteration to get top 2 components
function pcaProject2D(vectors: number[][]): Array<{ x: number; y: number }> {
  const n = vectors.length;
  if (n === 0) return [];
  const dim = vectors[0].length;

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
    const textA = String(body.textA || '').slice(0, 2000);
    const textB = String(body.textB || '').slice(0, 2000);

    if (!textA || !textB) {
      return NextResponse.json(
        { error: 'Both textA and textB are required' },
        { status: 400 },
      );
    }

    // --- Panel 1: Same-text cross-model agreement ---
    // Embed textA with all 3 models using input_type "document"
    const panel1Results = await Promise.all(
      MODELS.map((model) => embed(model, [textA], 'document', apiKey))
    );

    // 3×3 similarity matrix
    const panel1Vectors = MODELS.map((model, i) => ({
      label: shortName(model),
      vector: panel1Results[i].data[0].embedding,
    }));

    const modelAgreementPairs: Array<{ a: string; b: string; similarity: number }> = [];
    for (let i = 0; i < panel1Vectors.length; i++) {
      for (let j = i + 1; j < panel1Vectors.length; j++) {
        modelAgreementPairs.push({
          a: panel1Vectors[i].label,
          b: panel1Vectors[j].label,
          similarity: Math.round(cosine(panel1Vectors[i].vector, panel1Vectors[j].vector) * 10000) / 10000,
        });
      }
    }
    const agreementSims = modelAgreementPairs.map((s) => s.similarity);

    // --- Panel 2: Two texts + control, all models ---
    // Embed textB and control with all 3 models (all "document" type)
    const panel2Results = await Promise.all(
      MODELS.flatMap((model) => [
        embed(model, [textB], 'document', apiKey),
        embed(model, [CONTROL_TEXT], 'document', apiKey),
      ])
    );

    // Build 9-vector set: textA(3) + textB(3) + control(3)
    interface LabeledVector {
      label: string;
      group: string;
      model: string;
      vector: number[];
    }

    const allVectors: LabeledVector[] = [
      ...MODELS.map((model, i) => ({
        label: `A: ${shortName(model)}`,
        group: 'Text A',
        model,
        vector: panel1Results[i].data[0].embedding,
      })),
      ...MODELS.map((model, i) => ({
        label: `B: ${shortName(model)}`,
        group: 'Text B',
        model,
        vector: panel2Results[i * 2].data[0].embedding,
      })),
      ...MODELS.map((model, i) => ({
        label: `Ctrl: ${shortName(model)}`,
        group: 'Control',
        model,
        vector: panel2Results[i * 2 + 1].data[0].embedding,
      })),
    ];

    // Full 9×9 similarity matrix
    const fullMatrixPairs: Array<{ a: string; b: string; similarity: number }> = [];
    for (let i = 0; i < allVectors.length; i++) {
      for (let j = i + 1; j < allVectors.length; j++) {
        fullMatrixPairs.push({
          a: allVectors[i].label,
          b: allVectors[j].label,
          similarity: Math.round(cosine(allVectors[i].vector, allVectors[j].vector) * 10000) / 10000,
        });
      }
    }

    // PCA projection for scatter plot
    const projected = pcaProject2D(allVectors.map((v) => v.vector));
    const projection = allVectors.map((v, i) => ({
      label: v.label,
      group: v.group,
      model: v.model,
      x: Math.round(projected[i].x * 10000) / 10000,
      y: Math.round(projected[i].y * 10000) / 10000,
    }));

    // --- Panel 3: Retrieval proof ---
    // Embed textA as document with v4-large (already have from panel1)
    const docAsLarge = panel1Results[0].data[0].embedding;

    // Embed textB as query with v4-lite and v4-large
    const [queryAsLite, queryAsLarge] = await Promise.all([
      embed('voyage-4-lite', [textB], 'query', apiKey),
      embed('voyage-4-large', [textB], 'query', apiKey),
    ]);

    const similarityCheap = Math.round(cosine(docAsLarge, queryAsLite.data[0].embedding) * 10000) / 10000;
    const similarityExpensive = Math.round(cosine(docAsLarge, queryAsLarge.data[0].embedding) * 10000) / 10000;
    const qualityRetained = similarityExpensive > 0
      ? Math.round((similarityCheap / similarityExpensive) * 10000) / 100
      : 0;

    return NextResponse.json({
      modelAgreement: {
        text: textA.slice(0, 100) + (textA.length > 100 ? '...' : ''),
        matrix: modelAgreementPairs,
        labels: panel1Vectors.map((v) => v.label),
        minSimilarity: Math.min(...agreementSims),
        avgSimilarity: Math.round((agreementSims.reduce((a, b) => a + b, 0) / agreementSims.length) * 10000) / 10000,
      },
      fullComparison: {
        matrix: fullMatrixPairs,
        labels: allVectors.map((v) => v.label),
        groups: allVectors.map((v) => v.group),
        projection,
      },
      retrieval: {
        docModel: 'voyage-4-large',
        queryModelCheap: 'voyage-4-lite',
        queryModelExpensive: 'voyage-4-large',
        similarityCheap,
        similarityExpensive,
        qualityRetained,
        costSavingsPercent: 83.33,
        monthlyAt1M: {
          symmetric: 0.12,
          asymmetric: 0.02,
        },
      },
      costs: MODELS.map((model) => ({
        model,
        costPerMillion: COST_PER_MILLION[model],
      })),
    });
  } catch (error) {
    console.error('Shared space error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
