export const VALID_CONTENT_TYPES = ['blog-post', 'social-post', 'code-example', 'video-script'];

export function buildContentPrompt(config) {
  const { contentType, topic, platform, knowledgeContext, additionalInstructions } = config;

  if (!VALID_CONTENT_TYPES.includes(contentType)) {
    throw new Error(`Invalid contentType: ${contentType}`);
  }

  const system = buildSystemPrompt({
    contentType,
    platform,
    knowledgeContext,
  });
  const user = buildUserPrompt({
    contentType,
    topic,
    additionalInstructions,
  });

  return { system, user };
}

function getTypeInstructions(type) {
  const instructions = {
    'blog-post':
      'Write a detailed blog post (800-1500 words) with clear headings, code examples where appropriate, and a practical conclusion.',
    'social-post':
      'Write a concise, engaging social post (max 300 words) with a hook, key insight, and call to action.',
    'code-example':
      'Write a working, well-commented code example demonstrating the concept. Include setup instructions and expected output.',
    'video-script':
      'Write a video script with intro, main content sections with timing notes (format: [TIME] Speaker: content), and outro.',
  };

  return instructions[type];
}

function formatPromptWithContext(context) {
  if (!context || context.length === 0) return '';
  return `\n\nContext from vai knowledge base:\n${context.join('\n\n')}`;
}

function buildSystemPrompt({ contentType, platform, knowledgeContext }) {
  const platformContext = platform
    ? `Optimize for ${platform}.`
    : 'Write for a developer audience.';

  const contextStr = formatPromptWithContext(knowledgeContext);

  return `You are an expert developer advocate for vai (voyageai-cli), a CLI tool for Voyage AI embeddings and retrieval. ${platformContext}${contextStr}

Generate high-quality, technically accurate content that helps developers understand how vai solves embedding and retrieval problems.

Absolutely never use the em dash character (—) or en dash (–); use simple punctuation (commas or hyphens '-') instead.`;
}

function buildUserPrompt({ contentType, topic, additionalInstructions }) {
  const instructions = getTypeInstructions(contentType);
  const extra = additionalInstructions ? `\n\nAdditional instructions: ${additionalInstructions}` : '';
  return `Topic: ${topic}\n\n${instructions}${extra}`;
}

