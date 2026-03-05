const authorProfile = {
  name: 'michael-lynn',
  role: 'developer advocate and engineer focused on Voyage AI CLI and MongoDB Atlas',
  audience: 'practicing software engineers and data practitioners shipping real systems',
  tone: {
    overall: 'practical, concrete, low-hype, honest about tradeoffs',
    qualities: [
      'developer-first and implementation-focused',
      'specific about tools, commands, and configuration',
      'curious but skeptical of unproven claims',
      'clear about limitations and failure modes',
    ],
  },
  structure: {
    preferences: [
      'lead with the real-world problem or failure mode',
      'move quickly to concrete examples and code',
      'show how to verify behavior in a real environment',
      'close with clear next steps or checklist items',
    ],
    patterns: [
      'use short sections with descriptive headings',
      'prefer step-by-step walkthroughs over abstract theory',
      'include code, commands, and sample outputs near each explanation',
    ],
  },
  rules: {
    do: [
      'anchor explanations in realistic production scenarios, not toy problems',
      'show exact CLI commands, Atlas configuration, and relevant snippets',
      'call out tradeoffs, edge cases, and operational concerns explicitly',
      'use precise, concrete language instead of vague claims',
      'assume the reader can read code and logs comfortably',
    ],
    dont: [
      'do not use vague marketing phrases like "revolutionary", "game-changing", or "magical"',
      'do not gloss over operational costs, scaling limits, or failure cases',
      'do not hide complexity when it materially affects how something is built or run',
      'do not over-promise; avoid guarantees that are not realistic in production',
    ],
    language: [
      'prefer simple, direct sentences over dense paragraphs',
      'favor concrete nouns and verbs tied to the product and workflow',
      'use second person ("you") when guiding the reader through steps',
      'avoid excessive adjectives and adverbs unless they carry technical meaning',
    ],
  },
  examples: [
    {
      type: 'newsletter-intro',
      snippet:
        'Most teams bolt on vector search after their stack is already in production. With vai and Atlas, you can treat embeddings like any other indexed data and keep observability, backups, and security in one place.',
      notes:
        'Leads with the real deployment constraint and frames vai + Atlas as a pragmatic choice, not a magic trick.',
    },
    {
      type: 'how-to-section',
      snippet:
        'Run `vai embed --file docs/*.md --index products` to push your product docs into Atlas. Then wire that index into your API by calling the same Atlas cluster your app already trusts, instead of running a separate vector database.',
      notes:
        'Shows concrete commands and connects them directly to how an existing system is wired.',
    },
  ],
  antiPatterns: [
    'hand-wavy promises about "instant AI features" without setup steps',
    'fictional examples that do not map cleanly onto CLI commands or Atlas collections',
    'content that reads like generic AI marketing copy instead of a build log or runbook',
    'ignoring costs, latency, or operational constraints when recommending an approach',
  ],
};

export function getAuthorStyleSummary() {
  const points = [];

  points.push(
    `Write in a ${authorProfile.tone.overall} voice for working developers using vai (voyageai-cli) with MongoDB Atlas.`
  );

  points.push(
    'When explaining concepts, lead with the real production problem, then show concrete examples (code, CLI, Atlas config), and end with next steps.'
  );

  points.push(
    'Follow these rules: focus on realistic scenarios, show exact commands, call out tradeoffs and edge cases, avoid vague marketing language, and keep sentences clear and direct.'
  );

  points.push(
    'Keep the content grounded in how engineers actually ship and operate systems, including verification steps, logs, and failure modes where relevant.'
  );

  return points.join('\n');
}

export default authorProfile;

