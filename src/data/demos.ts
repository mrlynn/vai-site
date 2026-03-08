// Public demo registry for vaicli.com.
// Source of truth lives in voyageai-cli/docs/demos/*.demo.json.
// For now, entries are copied here by hand as part of the publishing flow.

export interface DemoEnvironment {
  requiresApiKey: boolean;
  requiresMongoDbAtlas: boolean;
  requiresOllama: boolean;
  worksOffline: boolean;
  platformNotes: string[];
}

export interface DemoAssets {
  recordingOutput: string;
  sitePreviewPath: string;
}

export interface DemoSource {
  tapePath: string;
  repoUrl: string;
}

export interface DemoLinks {
  docs: string[];
  related: string[];
}

export interface DemoSocial {
  headline: string;
  linkedinText: string;
  xText: string;
  hashtags: string[];
  callToAction: string;
}

export interface DemoData {
  slug: string;
  title: string;
  summary: string;
  categories: string[];
  published: boolean;
  featured: boolean;
  prerequisites: string[];
  environment: DemoEnvironment;
  commands: string[];
  assets: DemoAssets;
  source: DemoSource;
  links: DemoLinks;
  social: DemoSocial;
}

const demoRegistry: DemoData[] = [
  {
    slug: 'cli-quickstart',
    title: 'CLI Quickstart For Embeddings',
    summary:
      'Walk through the core vai embedding commands: model discovery, embedding generation, explainers, and similarity.',
    categories: ['Getting Started', 'Embeddings', 'Similarity', 'Model Discovery'],
    published: true,
    featured: true,
    prerequisites: ['A valid VOYAGE_API_KEY is set in the environment.'],
    environment: {
      requiresApiKey: true,
      requiresMongoDbAtlas: false,
      requiresOllama: false,
      worksOffline: false,
      platformNotes: [],
    },
    commands: [
      'vai --version',
      'vai models --type embedding',
      'vai embed "What is MongoDB Atlas?"',
      'vai explain embeddings',
      'vai similarity "MongoDB is great" "MongoDB Atlas is amazing"',
    ],
    assets: {
      recordingOutput: 'demo.gif',
      sitePreviewPath: '/demos/cli-quickstart.gif',
    },
    source: {
      tapePath: 'docs/demos/demo.tape',
      repoUrl: 'https://github.com/mrlynn/voyageai-cli/blob/main/docs/demos/demo.tape',
    },
    links: {
      docs: [
        'https://docs.vaicli.com',
        'https://github.com/mrlynn/voyageai-cli#cli--quick-start',
      ],
      related: ['local-inference'],
    },
    social: {
      headline: 'A reproducible CLI walkthrough for core VAI embeddings workflows.',
      linkedinText:
        'Powerful little demo from the VAI CLI gallery: model discovery, embeddings, explainers, and similarity in one reproducible workflow. The commands and source tape are included, so it is easy to run yourself.',
      xText:
        'Reproducible VAI CLI demo: model discovery, embeddings, explainers, and similarity in one workflow. Commands + source tape included.',
      hashtags: ['vai', 'voyageai', 'mongodb', 'embeddings'],
      callToAction: 'Run it yourself and view the source tape.',
    },
  },
  {
    slug: 'local-inference',
    title: 'Local Inference With Ollama',
    summary:
      'Run a local CLI workflow with Ollama generation and local embeddings, without a Voyage API key.',
    categories: ['Getting Started', 'Local Inference', 'Embeddings'],
    published: true,
    featured: true,
    prerequisites: [
      'Ollama is installed and running locally.',
      'The llama3.2:3b model is already pulled in Ollama.',
      'vai nano setup has already completed successfully.',
    ],
    environment: {
      requiresApiKey: false,
      requiresMongoDbAtlas: false,
      requiresOllama: true,
      worksOffline: true,
      platformNotes: [],
    },
    commands: [
      'vai --version',
      'ollama list',
      'export VAI_LLM_PROVIDER=ollama',
      'export VAI_LLM_MODEL=llama3.2:3b',
      'export VAI_LLM_BASE_URL=http://localhost:11434',
      'vai nano status',
      'ollama run llama3.2:3b "In 4 short lines, explain why pairing a local LLM with local embeddings is useful for CLI demos."',
      'vai embed "Local inference keeps retrieval private, fast, and API-key free." --local --dimensions 256',
      'vai explain local inference',
    ],
    assets: {
      recordingOutput: 'local-inference.gif',
      sitePreviewPath: '/demos/local-inference.gif',
    },
    source: {
      tapePath: 'docs/demos/local-inference.tape',
      repoUrl: 'https://github.com/mrlynn/voyageai-cli/blob/main/docs/demos/local-inference.tape',
    },
    links: {
      docs: [
        'https://docs.vaicli.com',
        'https://github.com/mrlynn/voyageai-cli#local-inference',
      ],
      related: ['ollama-nano-chat', 'cli-quickstart'],
    },
    social: {
      headline: 'Local inference with Ollama and local embeddings, no Voyage API key required.',
      linkedinText:
        'This VAI demo is a great example of a reproducible local workflow: Ollama for generation, local embeddings for retrieval, and no Voyage API key required. The gallery page includes the exact commands plus the original source tape.',
      xText:
        'Local inference demo with VAI: Ollama for generation, local embeddings for retrieval, no Voyage API key required. Commands + source tape included.',
      hashtags: ['vai', 'ollama', 'localinference', 'embeddings'],
      callToAction: 'Try the local workflow yourself and share the source tape.',
    },
  },
  {
    slug: 'ollama-nano-chat',
    title: 'Local RAG Chat With Ollama And Nano',
    summary:
      'Build a tiny Atlas-backed RAG chat flow using local nano embeddings and Ollama for generation.',
    categories: ['RAG', 'Local Inference', 'Chat', 'MongoDB Atlas'],
    published: true,
    featured: true,
    prerequisites: [
      'Ollama is installed and running locally.',
      'The llama3.2:3b model is already pulled in Ollama.',
      'vai nano setup has already completed successfully.',
      'MongoDB Atlas is configured through MONGODB_URI or vai config set mongodb-uri.',
    ],
    environment: {
      requiresApiKey: false,
      requiresMongoDbAtlas: true,
      requiresOllama: true,
      worksOffline: false,
      platformNotes: [],
    },
    commands: [
      'vai --version',
      'ollama list',
      'vai nano status',
      'export DEMO_DB=vai_demo',
      'export DEMO_COLLECTION=ollama_nano_chat_demo_$(date +%s)',
      'export DEMO_FILE="docs/demos/ollama-nano-chat-docs.jsonl"',
      'export OLLAMA_MODEL="llama3.2:3b"',
      'cat "$DEMO_FILE"',
      'vai ingest --file "$DEMO_FILE" --db "$DEMO_DB" --collection "$DEMO_COLLECTION" --field embedding --text-field text --local --batch-size 3',
      'vai index create --db "$DEMO_DB" --collection "$DEMO_COLLECTION" --field embedding --dimensions 1024',
      'vai chat --db "$DEMO_DB" --collection "$DEMO_COLLECTION" --local --llm-provider ollama --llm-model "$OLLAMA_MODEL" --llm-base-url http://localhost:11434 --no-history --no-stream',
      'Which models are used in this demo, and what benefits does the document mention?',
      'What is the workflow from ingest to exit?',
      '/quit',
    ],
    assets: {
      recordingOutput: 'ollama-nano-chat.gif',
      sitePreviewPath: '/demos/ollama-nano-chat.gif',
    },
    source: {
      tapePath: 'docs/demos/ollama-nano-chat.tape',
      repoUrl: 'https://github.com/mrlynn/voyageai-cli/blob/main/docs/demos/ollama-nano-chat.tape',
    },
    links: {
      docs: [
        'https://docs.vaicli.com',
        'https://github.com/mrlynn/voyageai-cli#local-inference',
      ],
      related: ['local-inference'],
    },
    social: {
      headline: 'A tiny Atlas-backed local RAG chat flow with Ollama and nano embeddings.',
      linkedinText:
        'This VAI demo shows a strong end-to-end pattern for local RAG chat: ingest a small corpus, index it in MongoDB Atlas, embed locally with nano, and generate with Ollama. The gallery includes exact commands and the source tape so anyone can reproduce it.',
      xText:
        'VAI demo: local RAG chat with Ollama + nano embeddings + MongoDB Atlas. End-to-end workflow, exact commands, and source tape included.',
      hashtags: ['vai', 'rag', 'ollama', 'mongodb'],
      callToAction: 'Explore the workflow, then share the demo with your team.',
    },
  },
];

export function getPublishedDemos(): DemoData[] {
  return demoRegistry.filter((demo) => demo.published);
}

export function getFeaturedDemos(): DemoData[] {
  return getPublishedDemos().filter((demo) => demo.featured);
}

export function getDemoBySlug(slug: string): DemoData | undefined {
  return getPublishedDemos().find((demo) => demo.slug === slug);
}

export function getAllDemoSlugs(): string[] {
  return getPublishedDemos().map((demo) => demo.slug);
}

export function getDemoCategories(): string[] {
  return [...new Set(getPublishedDemos().flatMap((demo) => demo.categories))].sort();
}

export function getRelatedDemos(demo: DemoData): DemoData[] {
  return demo.links.related
    .map((slug) => getDemoBySlug(slug))
    .filter((item): item is DemoData => Boolean(item));
}
