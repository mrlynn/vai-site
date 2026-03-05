import OpenAI from 'openai';
import { buildContentPrompt, VALID_CONTENT_TYPES } from '@/lib/content/prompts';

let clientInstance = null;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  if (!clientInstance) {
    clientInstance = new OpenAI({ apiKey });
  }
  return clientInstance;
}

export const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

export function normalizeAuthorPunctuation(text) {
  if (!text) return text;
  return text.replace(/\u2014/g, '-').replace(/\u2013/g, '-');
}

export async function generateContent(request) {
  const { contentType, topic, platform, knowledgeContext, additionalInstructions } = request;

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    throw new Error('topic is required');
  }

  if (!VALID_CONTENT_TYPES.includes(contentType)) {
    throw new Error(`contentType must be one of: ${VALID_CONTENT_TYPES.join(', ')}`);
  }

  const client = getOpenAIClient();

  const { system, user } = buildContentPrompt({
    contentType,
    topic: topic.trim(),
    platform,
    knowledgeContext,
    additionalInstructions,
  });

  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned an empty response');
  }

  const now = new Date().toISOString();

  const draft = {
    id: crypto.randomUUID(),
    type: contentType,
    title: normalizeAuthorPunctuation(topic.trim()),
    body: normalizeAuthorPunctuation(content),
    platform,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    plannedPublishAt: null,
    channel: platform || null,
  };

  return {
    draft,
    tokensUsed: completion.usage?.total_tokens ?? 0,
    model: completion.model,
  };
}

export async function generateTopicIdeas(prompt) {
  const client = getOpenAIClient();

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('prompt is required');
  }

  const systemPrompt = `You are a content strategist. The user will provide a request describing the kind of content they want: themes, keywords, audience, and details.
Respond with ONLY a JSON array of topic ideas. Each item must have: "title" (string), "summary" (string, 1-2 sentences), and optionally "keywords" (array of strings).
Generate 8-15 diverse, specific topics that match the request. No other text before or after the JSON array.`;

  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt.trim() },
    ],
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error('OpenAI returned an empty response');
  }

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('Expected a JSON array of topics');
  }

  const topics = parsed
    .filter((t) => t && typeof t.title === 'string' && typeof t.summary === 'string')
    .map((t) => ({
      id: crypto.randomUUID(),
      title: t.title.trim(),
      summary: t.summary.trim(),
      keywords: Array.isArray(t.keywords)
        ? t.keywords.filter((k) => typeof k === 'string')
        : undefined,
    }))
    .filter((t) => t.title.length > 0);

  return {
    topics,
    tokensUsed: completion.usage?.total_tokens ?? 0,
    model: completion.model,
  };
}

export async function refineSelection({ body, selection, mode, instruction }) {
  const client = getOpenAIClient();

  const hasSelection =
    selection &&
    typeof selection.start === 'number' &&
    typeof selection.end === 'number' &&
    selection.start >= 0 &&
    selection.end <= body.length &&
    selection.end > selection.start;

  const finalSelection = hasSelection ? selection : { start: 0, end: body.length };

  if (!body || !finalSelection) {
    throw new Error('Invalid selection for refine');
  }

  const selected = body.slice(finalSelection.start, finalSelection.end);
  const before = body.slice(0, finalSelection.start);
  const after = body.slice(finalSelection.end);

  let finalInstruction =
    typeof instruction === 'string' && instruction.trim().length > 0
      ? instruction.trim()
      : 'Improve clarity and flow.';

  if (!instruction || !instruction.trim()) {
    if (mode === 'shorten') {
      finalInstruction = 'Rewrite this text to be shorter and more concise, preserving key meaning.';
    } else if (mode === 'expand') {
      finalInstruction = 'Expand this text with a bit more detail and one concrete example.';
    } else if (mode === 'more_technical') {
      finalInstruction =
        'Rewrite this text for a more technical developer audience, using precise terminology but staying clear.';
    } else if (mode === 'add_cta') {
      finalInstruction =
        'Rewrite this text to end with a clear, specific call to action for the reader.';
    }
  }

  const systemPrompt = `You are an assistant helping edit part of a longer developer-focused draft.
You will receive a selected span of text from within a larger article and an instruction.
Return ONLY the rewritten version of the selection, not the full article. Do not add surrounding context.`;

  const userPrompt = `FULL CONTEXT (for reference only):
${body}

---

SELECTED TEXT TO REWRITE:
${selected}

---

INSTRUCTION:
${finalInstruction}`;

  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.6,
  });

  const replacement = completion.choices[0]?.message?.content?.trim();
  if (!replacement) {
    throw new Error('OpenAI returned an empty response for refine');
  }

  const normalizedReplacement = normalizeAuthorPunctuation(replacement);
  const newBody = `${before}${normalizedReplacement}${after}`;

  return {
    body: newBody,
    replacement: normalizedReplacement,
    tokensUsed: completion.usage?.total_tokens ?? 0,
    model: completion.model,
  };
}

export async function factCheckDraft({ title, body, knowledgeContext, note }) {
  const client = getOpenAIClient();

  const safeTitle = typeof title === 'string' ? title.trim() : '';
  const safeBody = typeof body === 'string' ? body.trim() : '';
  const contextArray = Array.isArray(knowledgeContext) ? knowledgeContext : [];
  const reviewerNote = typeof note === 'string' && note.trim() ? note.trim() : '';

  if (!safeTitle || !safeBody) {
    throw new Error('title and body are required for factCheckDraft');
  }

  const systemPrompt = `You are a strict fact checker for technical content about developer tools, RAG systems, and related topics.
You will receive:
- Article title
- Article body (Markdown)
- Retrieved context excerpts from trusted documentation and sources.

Your job:
- Identify distinct factual claims in the article (not trivial statements like headings or obvious definitions).
- For each claim, determine whether it is supported, partially supported, unsupported, or contradictory relative to the context.
- If the context does not clearly support the claim, treat it as unsupported (do not guess).
- Do NOT invent new facts; only reason about what is explicitly or clearly implied by the context.

Return ONLY a JSON object with this shape:
{
  "claims": [
    {
      "id": 1,
      "text": "string, the claim as written or lightly paraphrased",
      "verdict": "supported | partially_supported | unsupported | contradictory",
      "severity": "low | medium | high",
      "explanation": "short explanation citing which parts of the context support or conflict",
      "suggestedFix": "optional short suggestion on how to rewrite, or empty string if not needed"
    }
  ]
}

If there are no factual claims to check, return {"claims": []}.`;

  const contextBlock =
    contextArray && contextArray.length
      ? contextArray.join('\n\n---\n\n')
      : 'No external knowledge context was provided. Base your verdicts only on the internal consistency of the draft and clearly label uncertain claims as unsupported.';

  const userContent = `TITLE:
${safeTitle}

BODY (Markdown):
${safeBody}

CONTEXT:
${contextBlock}

${reviewerNote ? `REVIEWER NOTE (from human editor):\n${reviewerNote}` : ''}`;

  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0,
  });

  let raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error('OpenAI returned an empty response from factCheckDraft');
  }

  let parsed;
  try {
    if (raw.startsWith('```')) {
      const firstBrace = raw.indexOf('{');
      const lastBrace = raw.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        raw = raw.slice(firstBrace, lastBrace + 1);
      }
    }
    parsed = JSON.parse(raw);
  } catch (error) {
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = raw.slice(firstBrace, lastBrace + 1);
      try {
        parsed = JSON.parse(candidate);
      } catch (innerError) {
        throw new Error(
          `Failed to parse fact check JSON: ${innerError instanceof Error ? innerError.message : String(
            innerError,
          )}; raw: ${raw.slice(0, 200)}...`,
        );
      }
    } else {
      throw new Error(
        `Failed to parse fact check JSON: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const claims = Array.isArray(parsed?.claims) ? parsed.claims : [];

  const normalizedClaims = claims
    .map((c, idx) => ({
      id: typeof c.id === 'number' ? c.id : idx + 1,
      text: typeof c.text === 'string' ? c.text : '',
      verdict: c.verdict || 'unsupported',
      severity: c.severity || 'medium',
      explanation: typeof c.explanation === 'string' ? c.explanation : '',
      suggestedFix: typeof c.suggestedFix === 'string' ? c.suggestedFix : undefined,
    }))
    .filter((c) => c.text && c.explanation);

  return {
    claims: normalizedClaims,
    tokensUsed: completion.usage?.total_tokens ?? 0,
    model: completion.model,
  };
}

export async function suggestHookTitle({ title, body, channel }) {
  const client = getOpenAIClient();

  const safeTitle = typeof title === 'string' ? title.trim() : '';
  const safeBody = typeof body === 'string' ? body.trim() : '';
  const safeChannel = typeof channel === 'string' ? channel.trim() : '';

  if (!safeBody) {
    throw new Error('body is required for suggestHookTitle');
  }

  const systemPrompt = `You are an expert editor writing compelling, hook-based titles for long-form content aimed at developers.

Rules:
- Output ONLY a single title string, no quotes, no extra commentary.
- The title should be specific, concrete, and curiosity-driven without being clickbait.
- Prefer clarity over hype. Avoid words like "ultimate", "insane", "mind-blowing".
- Make sure the title accurately reflects the content and target channel.
- Length target: ideally 60 characters or fewer when possible, but never truncate meaning just to hit a number.`;

  const userPrompt = `CURRENT TITLE:
${safeTitle || '(none yet)'}

CHANNEL:
${safeChannel || 'unspecified'}

ARTICLE BODY (Markdown):
${safeBody}

TASK:
Propose a single improved title that would perform well as a hook-based, honest title for this piece. Remember: respond with ONLY the title text.`;

  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
  });

  let suggestion = completion.choices[0]?.message?.content?.trim() || '';

  // If the model returns multiple lines, take the first non-empty line.
  if (suggestion.includes('\n')) {
    const first = suggestion
      .split('\n')
      .map((s) => s.trim())
      .find((s) => s.length > 0);
    if (first) suggestion = first;
  }

  suggestion = normalizeAuthorPunctuation(suggestion);

  if (!suggestion) {
    throw new Error('OpenAI returned an empty title suggestion');
  }

  return {
    title: suggestion,
    tokensUsed: completion.usage?.total_tokens ?? 0,
    model: completion.model,
  };
}


