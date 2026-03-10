/**
 * Site search index. Aggregates content from nav items, pages, demos, workflows,
 * and use cases so users can find information (e.g. model costs, pricing) quickly.
 */

import { getPublishedDemos } from '@/data/demos';
import { getAllUseCases } from '@/data/use-cases';
import workflows from '@/data/workflows.json';

export interface SearchEntry {
  id: string;
  title: string;
  description: string;
  href: string;
  category: 'page' | 'section' | 'demo' | 'workflow' | 'use-case' | 'external';
  keywords: string[];
}

// Homepage sections (anchors)
const homepageSections: SearchEntry[] = [
  {
    id: 'why-voyage',
    title: 'Why Voyage AI',
    description: 'Learn why Voyage AI embeddings and MongoDB Atlas Vector Search',
    href: '/#why-voyage',
    category: 'section',
    keywords: ['why', 'voyage', 'overview', 'intro'],
  },
  {
    id: 'features',
    title: 'Features',
    description: 'Embed, Compare, Multimodal, Rerank, Benchmark, Explore',
    href: '/#features',
    category: 'section',
    keywords: ['features', 'embed', 'rerank', 'benchmark', 'multimodal'],
  },
  {
    id: 'models',
    title: 'Models & Pricing',
    description: 'Model costs, pricing per 1M tokens. voyage-4-large $0.12, voyage-4-lite $0.02. RTEB benchmarks.',
    href: '/#models',
    category: 'section',
    keywords: ['models', 'pricing', 'cost', 'costs', 'price', 'voyage-4', 'voyage-4-large', 'voyage-4-lite', 'rerank', 'embedding', 'per million', 'tokens', 'rteb'],
  },
  {
    id: 'cli-demo',
    title: 'CLI Demo',
    description: 'Try the vai CLI in your browser. Embed, search, rerank from the terminal.',
    href: '/#cli-demo',
    category: 'section',
    keywords: ['cli', 'demo', 'terminal', 'try', 'embed', 'search'],
  },
  {
    id: 'mcp',
    title: 'MCP Server',
    description: 'Connect vai to Cursor, Claude Desktop, or any MCP-compatible editor',
    href: '/#mcp',
    category: 'section',
    keywords: ['mcp', 'cursor', 'claude', 'agent', 'ai assistant'],
  },
];

// Top-level pages
const pages: SearchEntry[] = [
  {
    id: 'desktop',
    title: 'Desktop App',
    description: 'Download the VAI desktop app for macOS, Windows, Linux. Visual interface for embeddings and vector search.',
    href: '/desktop',
    category: 'page',
    keywords: ['desktop', 'app', 'download', 'gui', 'visual'],
  },
  {
    id: 'modes',
    title: 'Operational Modes',
    description: 'CLI, Playground, MCP Server, Workflows. Compare modes and choose the right one.',
    href: '/modes',
    category: 'page',
    keywords: ['modes', 'playground', 'cli', 'workflow', 'mcp'],
  },
  {
    id: 'demos',
    title: 'Demo Gallery',
    description: 'Reproducible demos: embeddings, pipeline, two-stage retrieval, local inference, shared space.',
    href: '/demos',
    category: 'page',
    keywords: ['demos', 'gallery', 'examples', 'tutorials'],
  },
  {
    id: 'workflows',
    title: 'Workflows',
    description: 'Pre-built RAG workflows: asymmetric search, contract finder, code migration, risk scanner.',
    href: '/workflows',
    category: 'page',
    keywords: ['workflows', 'rag', 'pipelines', 'asymmetric', 'contract', 'code'],
  },
  {
    id: 'use-cases',
    title: 'Use Cases',
    description: 'Legal, Finance, Healthcare, Developer Docs. Domain-specific semantic search.',
    href: '/use-cases',
    category: 'page',
    keywords: ['use cases', 'legal', 'finance', 'healthcare', 'devdocs'],
  },
  {
    id: 'shared-space',
    title: 'Shared Space',
    description: 'Embed with voyage-4-large, query with voyage-4-lite. Same vector space, 83% cost reduction.',
    href: '/shared-space',
    category: 'page',
    keywords: ['shared space', 'asymmetric', 'cost', 'voyage-4', 'embedding space'],
  },
  {
    id: 'docs',
    title: 'Documentation',
    description: 'CLI commands, guides, getting started. Full technical documentation.',
    href: 'https://docs.vaicli.com',
    category: 'external',
    keywords: ['docs', 'documentation', 'guides', 'commands', 'reference'],
  },
];

function buildDemoEntries(): SearchEntry[] {
  const demos = getPublishedDemos();
  return demos.map((d) => ({
    id: `demo-${d.slug}`,
    title: d.title,
    description: d.summary,
    href: `/demos/${d.slug}`,
    category: 'demo' as const,
    keywords: [...d.categories, d.slug].map((s) => s.toLowerCase()),
  }));
}

function buildWorkflowEntries(): SearchEntry[] {
  return (workflows as Array<{ slug: string; name: string; description: string; tags?: string[]; category?: string }>).map((w) => ({
    id: `workflow-${w.slug}`,
    title: w.name.replace(/^@vaicli\/vai-workflow-/, '').replace(/-/g, ' '),
    description: w.description,
    href: `/workflows/${w.slug}`,
    category: 'workflow' as const,
    keywords: [...(w.tags || []), w.category || ''].map((s) => s.toLowerCase()).filter(Boolean),
  }));
}

function buildUseCaseEntries(): SearchEntry[] {
  const useCases = getAllUseCases();
  return useCases.map((u) => ({
    id: `usecase-${u.slug}`,
    title: u.title,
    description: u.description,
    href: `/use-cases/${u.slug}`,
    category: 'use-case' as const,
    keywords: (u.keywords || []).map((k) => k.toLowerCase()),
  }));
}

let cachedIndex: SearchEntry[] | null = null;

export function getSearchIndex(): SearchEntry[] {
  if (cachedIndex) return cachedIndex;
  cachedIndex = [
    ...homepageSections,
    ...pages,
    ...buildDemoEntries(),
    ...buildWorkflowEntries(),
    ...buildUseCaseEntries(),
  ];
  return cachedIndex;
}
