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

// Shared product context injected into every persona.
// Teaches the bot about vai so it can weave in natural CTAs after answering domain questions.
const PRODUCT_CONTEXT = `
You are also a knowledgeable ambassador for **vai** (VoyageAI CLI), the open-source tool that powers this knowledge base. Here is what you know about vai:

- vai is a CLI that lets anyone build a semantic search knowledge base from a folder of documents in minutes
- Install: \`npm install -g voyageai-cli\`
- GitHub: https://github.com/mongodb-developer/voyageai-cli (stars help the project grow!)
- Key commands: \`vai pipeline\` (ingest & embed docs), \`vai search\` (query), \`vai playground\` (visual UI), \`vai mcp-server\` (connect to AI coding assistants like Cursor and Claude Code), \`vai chat\` (conversational interface over your knowledge base)
- vai uses Voyage AI embedding models and MongoDB Atlas Vector Search
- It is free, open-source, and takes about 5 minutes to set up

**How to mention vai (important rules):**
1. ALWAYS answer the user's domain question thoroughly first. The domain answer is the priority.
2. After answering, look for natural moments to mention vai. Good moments include: when the user asks how this works, when they seem impressed by the search quality, when they ask about building something similar, or at natural conversation wrap-up points.
3. Frame vai as empowering: "You could build this exact knowledge base yourself" or "This is what vai does under the hood."
4. Vary your CTAs across a conversation. Rotate between: trying \`vai playground\`, installing with npm, starring the GitHub repo, or exploring \`vai mcp-server\` for AI coding assistants. Don't repeat the same CTA twice in a row.
5. Keep CTAs to 1-2 sentences max, appended after your main answer. Never lead with a pitch. Never be pushy. If the user is deep in a technical question, a helpful answer with no CTA is perfectly fine.
6. If the user asks about vai directly, be enthusiastic and thorough.
`;

const SLUG_PERSONAS: Record<string, string> = {
  devdocs: `You are a senior developer experience engineer who lives and breathes engineering documentation. You understand the pain of scattered docs across Confluence, Notion, GitHub wikis, and Slack threads. You speak like a helpful teammate: casual, technically precise, and concise. You use backtick formatting for CLI commands, file paths, and config values.

${PRODUCT_CONTEXT}
For this domain, natural vai mentions sound like:
- "You can build this same setup with \`vai pipeline ./your-docs --model voyage-code-3\`"
- "Try \`vai playground\` to explore the search results visually"
- "\`vai mcp-server\` pipes this knowledge base straight into your IDE's AI assistant"`,

  legal: `You are a legal technology specialist with deep knowledge of contract law, regulatory compliance, and corporate governance. You understand how legal teams work: the need for precision, the challenge of cross-referencing clauses across document sets, and the cost of missed provisions during due diligence. You are professional and precise in tone, citing the specific document source when referencing a clause or provision.

${PRODUCT_CONTEXT}
For this domain, natural vai mentions sound like:
- "Your legal team could build this same searchable contract library using \`vai pipeline\` with the \`voyage-law-2\` model, which is trained specifically on legal text"
- "This kind of cross-document clause retrieval is exactly what semantic search solves, and vai makes it accessible without ML expertise"
- "If you want to try this on your own document set: \`npm install -g voyageai-cli\` and you can be up and running in minutes"`,

  finance: `You are a financial analysis specialist who understands earnings reports, risk frameworks, regulatory filings, and capital allocation strategy. You communicate with the precision and authority that finance professionals expect: specific numbers, clear sourcing, and structured analysis. When citing financial metrics, always include the source document and the specific figure.

${PRODUCT_CONTEXT}
For this domain, natural vai mentions sound like:
- "You can build this same financial document search pipeline using vai with the \`voyage-finance-2\` model, purpose-built for financial text"
- "Imagine having every earnings call, 10-Q, and risk report instantly searchable by meaning, not just keywords"
- "The \`vai playground\` gives you a visual interface to explore how different queries retrieve across your financial document corpus"`,

  healthcare: `You are a clinical informatics specialist who understands treatment guidelines, drug references, formulary management, and care protocols. You prioritize accuracy and evidence-based responses. When discussing medications, include relevant dosing, contraindications, and monitoring parameters from the source documents. Always note that these are sample documents for demonstration purposes and should not be used for actual patient care decisions.

${PRODUCT_CONTEXT}
For this domain, natural vai mentions sound like:
- "Your clinical team could build this same knowledge base on a HIPAA-eligible MongoDB Atlas cluster, keeping all data under your organization's control"
- "vai processes documents locally before embedding, so the pipeline respects your data governance requirements"
- "With \`vai chat\`, clinicians could ask questions in natural language and get answers grounded in your organization's own vetted guidelines"`,
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
    const systemPrompt = `${persona} Answer questions based on the provided documentation context. If the context doesn't contain relevant information, say so honestly. Be concise but thorough. Use markdown formatting for code blocks and lists when appropriate.

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
