export const dynamic = 'force-dynamic';

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY!;
const VOYAGE_BASE_URL = process.env.VOYAGE_BASE_URL!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

let cachedClient: MongoClient | null = null;
async function getClient() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
  }
  return cachedClient;
}

const SLUG_MODELS: Record<string, string> = {
  devdocs: 'voyage-code-3',
  legal: 'voyage-law-2',
  finance: 'voyage-finance-2',
  healthcare: 'voyage-4-large',
};

const SLUG_PERSONAS: Record<string, string> = {
  devdocs: 'You are a helpful developer documentation assistant.',
  legal: 'You are a knowledgeable legal documentation assistant specializing in contracts, compliance, and regulatory matters.',
  finance: 'You are a financial documentation assistant specializing in earnings analysis, risk management, and regulatory compliance.',
  healthcare: 'You are a clinical documentation assistant specializing in treatment guidelines, drug references, and care protocols.',
};

async function embedQuery(text: string, slug: string): Promise<number[]> {
  const model = SLUG_MODELS[slug] || 'voyage-code-3';
  const res = await fetch(new URL('embeddings', VOYAGE_BASE_URL).toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ model, input: [text] }),
  });
  if (!res.ok) throw new Error(`Voyage error: ${res.status}`);
  const data = await res.json();
  return data.data[0].embedding;
}

async function vectorSearch(slug: string, embedding: number[]) {
  const client = await getClient();
  const col = client.db('vai').collection(`${slug}_chatbot`);
  const results = await col
    .aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: embedding,
          numCandidates: 100,
          limit: 8,
        },
      },
      { $project: { text: 1, source: 1, score: { $meta: 'vectorSearchScore' } } },
    ])
    .toArray();
  return results;
}

export async function POST(request: Request) {
  try {
    const { message, slug, history = [] } = await request.json();

    if (!message || !slug) {
      return new Response(JSON.stringify({ error: 'message and slug required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Embed the query
    const embedding = await embedQuery(message, slug);

    // 2. Vector search
    const docs = await vectorSearch(slug, embedding);
    const context = docs.map((d) => `[Source: ${d.source}]\n${d.text}`).join('\n\n---\n\n');

    // 3. Build messages for Claude
    const persona = SLUG_PERSONAS[slug] || SLUG_PERSONAS.devdocs;
    const systemPrompt = `${persona} Answer questions based ONLY on the provided documentation context. If the context doesn't contain relevant information, say so honestly. Be concise but thorough. Use markdown formatting for code blocks and lists when appropriate.

Documentation context:
${context}`;

    const messages = [
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role,
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    // 4. Stream from Anthropic
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
        stream: true,
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return new Response(JSON.stringify({ error: `Anthropic error: ${err}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get geo info for analytics
    const reqHeaders = request.headers;
    const country = reqHeaders.get('x-vercel-ip-country') || undefined;
    const city = reqHeaders.get('x-vercel-ip-city')
      ? decodeURIComponent(reqHeaders.get('x-vercel-ip-city')!)
      : undefined;

    const startTime = Date.now();

    // 5. Transform SSE stream to text stream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        const reader = anthropicRes.body!.getReader();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (
                  parsed.type === 'content_block_delta' &&
                  parsed.delta?.type === 'text_delta'
                ) {
                  fullResponse += parsed.delta.text;
                  controller.enqueue(encoder.encode(parsed.delta.text));
                }
              } catch {
                // skip unparseable lines
              }
            }
          }
        } finally {
          controller.close();

          // Fire-and-forget chat analytics (awaited for Vercel serverless)
          try {
            const client = await getClient();
            const analyticsCol = client.db('vai').collection('chat_analytics');
            const wordCount = fullResponse.split(/\s+/).filter(Boolean).length;
            await analyticsCol.insertOne({
              slug,
              model: 'claude-sonnet-4-20250514',
              queryLength: message.length,
              responseTokensEstimate: Math.round(wordCount * 1.3),
              contextChunks: docs.length,
              sources: docs.map((d) => d.source as string),
              latencyMs: Date.now() - startTime,
              timestamp: new Date(),
              country,
              city,
            });
          } catch (e) {
            console.error('Chat analytics write failed:', e);
          }
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
