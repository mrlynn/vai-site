// Public demo registry for vaicli.com.
// Source of truth lives in voyageai-cli demo tape files under docs/demos/ and docs/demos/tapes/.
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

export interface LabStepMapping {
  labSection: string;
  labStep?: string;
  vaiCommand: string;
  note?: string;
}

export interface LabCompanion {
  labUrl: string;
  labTitle: string;
  intro: string;
  mappings: LabStepMapping[];
  takeaway?: string;
}

export interface DemoSocial {
  headline: string;
  linkedinText: string;
  xText: string;
  hashtags: string[];
  callToAction: string;
}

export type DemoCodeLanguage = 'node' | 'python' | 'curl';

export interface DemoCodeBlock {
  node?: string;
  python?: string;
  curl?: string;
}

export interface DemoMongoCodeBlock {
  node: string;
  python: string;
}

export interface DemoUnderTheHoodStep {
  label: string;
  code: DemoCodeBlock;
}

export interface DemoUnderTheHood {
  vaiCommand: string;
  voyageApi: DemoCodeBlock;
  voyageApiSteps?: DemoUnderTheHoodStep[];
  mongoQuery: DemoMongoCodeBlock;
  explanations: {
    vaiCommand: string;
    voyageApi: string;
    mongoQuery: string;
  };
}

export interface DemoSetupStep {
  title: string;
  description: string;
  commands: string[];
}

export interface DemoSetupTab {
  id: string;
  label: string;
  steps: DemoSetupStep[];
}

export interface DemoSetupGuide {
  title: string;
  description: string;
  tabs: DemoSetupTab[];
}

/** Shell command (shown with $) or user input within an interactive app (e.g. vai chat prompt) */
export type DemoCommandStep = string | { type: 'input'; value: string };

export interface DemoData {
  slug: string;
  title: string;
  summary: string;
  categories: string[];
  published: boolean;
  featured: boolean;
  prerequisites: string[];
  environment: DemoEnvironment;
  commands: DemoCommandStep[];
  setupGuide?: DemoSetupGuide;
  labCompanion?: LabCompanion;
  assets: DemoAssets;
  source: DemoSource;
  links: DemoLinks;
  social: DemoSocial;
  underTheHood: DemoUnderTheHood;
}

const DOCS_URL = 'https://docs.vaicli.com';
const REPO_URL = 'https://github.com/mrlynn/voyageai-cli';
const README_URL = `${REPO_URL}/blob/main/README.md`;

function buildTapeRepoUrl(tapePath: string): string {
  return `${REPO_URL}/blob/main/${tapePath}`;
}

function buildReadmeUrl(anchor: string): string {
  return `${README_URL}#${anchor}`;
}

const noMongoInThisDemo: DemoMongoCodeBlock = {
  node: `// No MongoDB query in this demo.
// The workflow stays in the CLI and exits without touching Atlas.`,
  python: `# No MongoDB query in this demo.
# The workflow stays in the CLI and exits without touching Atlas.`,
};

const noVoyageApiInThisDemo: DemoCodeBlock = {
  node: `// No Voyage AI API call in this demo.
// The workflow stays local and focuses on preprocessing concepts.`,
  python: `# No Voyage AI API call in this demo.
# The workflow stays local and focuses on preprocessing concepts.`,
  curl: `# No Voyage AI API call in this demo.
# The workflow stays local and focuses on preprocessing concepts.`,
};

const noRemoteVoyageApiForLocalEmbed: DemoCodeBlock = {
  node: `// No remote Voyage AI API call.
// --local routes this command through the local voyage-4-nano bridge instead.`,
  python: `# No remote Voyage AI API call.
# --local routes this command through the local voyage-4-nano bridge instead.`,
  curl: `# No remote Voyage AI API call.
# --local routes this command through the local voyage-4-nano bridge instead.`,
};

const noRemoteVoyageApiForLocalChat: DemoCodeBlock = {
  node: `// No remote Voyage AI API call.
// This flow uses local embeddings plus Ollama for generation.`,
  python: `# No remote Voyage AI API call.
# This flow uses local embeddings plus Ollama for generation.`,
  curl: `# No remote Voyage AI API call.
# This flow uses local embeddings plus Ollama for generation.`,
};

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
      sitePreviewPath: '/demos/cli-quickstart.mp4',
    },
    source: {
      tapePath: 'docs/demos/demo.tape',
      repoUrl: buildTapeRepoUrl('docs/demos/demo.tape'),
    },
    links: {
      docs: [DOCS_URL, buildReadmeUrl('individual-commands')],
      related: ['what-is-an-embedding', 'document-vs-query', 'local-inference'],
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
    underTheHood: {
      vaiCommand: 'vai embed "What is MongoDB Atlas?"',
      voyageApi: {
        node: `const response = await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'What is MongoDB Atlas?',
    model: 'voyage-4-large',
    input_type: 'document',
  }),
});

const { data } = await response.json();
console.log(data[0].embedding);`,
        python: `import voyageai

client = voyageai.Client()
result = client.embed(
    texts=['What is MongoDB Atlas?'],
    model='voyage-4-large',
    input_type='document',
)

print(result.embeddings[0])`,
        curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "What is MongoDB Atlas?",
    "model": "voyage-4-large",
    "input_type": "document"
  }'`,
      },
      mongoQuery: noMongoInThisDemo,
      explanations: {
        vaiCommand:
          'This is the one-liner developers see first in the demo. VAI wraps the request, formats the response, and prints the vector without forcing you to write any client code.',
        voyageApi:
          'Under the hood this is a single embeddings request to Voyage AI. input_type=document is the right fit here because the text is being embedded as source content, not as a search query.',
        mongoQuery:
          'There is no MongoDB operation in this specific demo. The command returns the embedding directly so the focus stays on the API response and vector shape.',
      },
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
      sitePreviewPath: '/demos/local-inference.mp4',
    },
    source: {
      tapePath: 'docs/demos/local-inference.tape',
      repoUrl: buildTapeRepoUrl('docs/demos/local-inference.tape'),
    },
    links: {
      docs: [DOCS_URL, buildReadmeUrl('individual-commands')],
      related: ['chunking-strategies', 'ollama-nano-chat', 'cli-quickstart'],
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
    underTheHood: {
      vaiCommand:
        'vai embed "Local inference keeps retrieval private, fast, and API-key free." --local --dimensions 256',
      voyageApi: noRemoteVoyageApiForLocalEmbed,
      mongoQuery: {
        node: `// No MongoDB query in this demo.
// The command computes the embedding locally and prints it to stdout.`,
        python: `# No MongoDB query in this demo.
# The command computes the embedding locally and prints it to stdout.`,
      },
      explanations: {
        vaiCommand:
          'The --local flag switches the command from hosted embeddings to the local voyage-4-nano bridge. That keeps the demo private, API-key free, and fast to re-run.',
        voyageApi:
          'Because this flow is intentionally local, there is no outgoing Voyage AI API request. The transparency here is in making that absence explicit rather than pretending a hosted call still exists.',
        mongoQuery:
          'There is no MongoDB write or search in this demo. It is focused on proving that local embeddings work on their own before any storage or retrieval layer is added.',
      },
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
      { type: 'input', value: 'Which models are used in this demo, and what benefits does the document mention?' },
      { type: 'input', value: 'What is the workflow from ingest to exit?' },
      { type: 'input', value: '/quit' },
    ],
    assets: {
      recordingOutput: 'ollama-nano-chat.gif',
      sitePreviewPath: '/demos/ollama-nano-chat.mp4',
    },
    source: {
      tapePath: 'docs/demos/ollama-nano-chat.tape',
      repoUrl: buildTapeRepoUrl('docs/demos/ollama-nano-chat.tape'),
    },
    links: {
      docs: [DOCS_URL, buildReadmeUrl('core-workflow')],
      related: ['pipeline-end-to-end', 'two-stage-retrieval', 'local-inference'],
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
    underTheHood: {
      vaiCommand:
        'vai chat --db "$DEMO_DB" --collection "$DEMO_COLLECTION" --local --llm-provider ollama --llm-model "$OLLAMA_MODEL" --llm-base-url http://localhost:11434 --no-history --no-stream',
      voyageApi: noRemoteVoyageApiForLocalChat,
      mongoQuery: {
        node: `const results = await collection.aggregate([
  {
    $vectorSearch: {
      index: 'default',
      path: 'embedding',
      queryVector,
      numCandidates: 40,
      limit: 6,
    },
  },
  {
    $project: {
      _id: 0,
      text: 1,
      source: 1,
      score: { $meta: 'vectorSearchScore' },
    },
  },
]).toArray();`,
        python: `pipeline = [
    {
        "$vectorSearch": {
            "index": "default",
            "path": "embedding",
            "queryVector": query_vector,
            "numCandidates": 40,
            "limit": 6,
        }
    },
    {
        "$project": {
            "_id": 0,
            "text": 1,
            "source": 1,
            "score": {"$meta": "vectorSearchScore"},
        }
    },
]

results = list(collection.aggregate(pipeline))`,
      },
      explanations: {
        vaiCommand:
          'This is the high-level chat entrypoint from the GIF. VAI handles query embedding, Atlas retrieval, prompt assembly, and Ollama generation behind one command.',
        voyageApi:
          'This demo is intentionally local on the model side: nano handles embeddings and Ollama handles generation. The point of transparency here is showing that no hosted Voyage AI API round-trip is happening.',
        mongoQuery:
          'Atlas Vector Search is the retrieval layer for the chat flow. numCandidates is set higher than limit so the system can over-sample semantically similar chunks before trimming the final context that gets sent to the LLM.',
      },
    },
  },
  {
    slug: 'what-is-an-embedding',
    title: 'What Is an Embedding?',
    summary:
      'Start from first principles: generate a Voyage embedding, inspect its shape, and compare full-size versus Matryoshka-reduced vectors.',
    categories: ['Getting Started', 'Embeddings', 'Matryoshka'],
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
      'vai explain embeddings',
      "vai embed 'MongoDB Atlas makes vector search production-ready'",
      "echo '=> 1024 floats. Each dimension encodes a slice of semantic meaning.'",
      "vai embed 'MongoDB Atlas makes vector search production-ready' --dimensions 512",
      "echo '=> 512 dims: same meaning, half the storage cost (Matryoshka RLR)'",
    ],
    assets: {
      recordingOutput: '01-what-is-an-embedding.gif',
      sitePreviewPath: '/demos/what-is-an-embedding.mp4',
    },
    source: {
      tapePath: 'docs/demos/tapes/01-what-is-an-embedding.tape',
      repoUrl: buildTapeRepoUrl('docs/demos/tapes/01-what-is-an-embedding.tape'),
    },
    links: {
      docs: [DOCS_URL, buildReadmeUrl('individual-commands')],
      related: ['document-vs-query', 'cli-quickstart'],
    },
    social: {
      headline: 'A fast, reproducible intro to what an embedding actually is.',
      linkedinText:
        'This VAI tape is a clean intro to embeddings: generate a vector, inspect the dimensionality, and compare a reduced Matryoshka version without changing the meaning of the text.',
      xText:
        'VAI demo: what an embedding looks like, why dimensions matter, and how Matryoshka reduction lowers storage cost.',
      hashtags: ['vai', 'voyageai', 'embeddings', 'vectors'],
      callToAction: 'Watch the demo, copy the commands, and open the source tape.',
    },
    underTheHood: {
      vaiCommand: "vai embed 'MongoDB Atlas makes vector search production-ready'",
      voyageApi: {
        node: `const response = await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'MongoDB Atlas makes vector search production-ready',
    model: 'voyage-4-large',
    input_type: 'document',
  }),
});

const { data } = await response.json();
console.log(data[0].embedding.length); // 1024`,
        python: `import voyageai

client = voyageai.Client()
result = client.embed(
    texts=['MongoDB Atlas makes vector search production-ready'],
    model='voyage-4-large',
    input_type='document',
)

print(len(result.embeddings[0]))  # 1024`,
        curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "MongoDB Atlas makes vector search production-ready",
    "model": "voyage-4-large",
    "input_type": "document"
  }'`,
      },
      mongoQuery: noMongoInThisDemo,
      explanations: {
        vaiCommand:
          'The demo starts with the smallest useful mental model: one sentence in, one embedding out. The follow-up dimensions example shows how you can cut storage with Matryoshka-style reduction while preserving the semantic task.',
        voyageApi:
          'Under the hood this is a standard embeddings call against voyage-4-large with input_type=document. The CLI hides the request boilerplate and prints the vector directly.',
        mongoQuery:
          'This demo stops before storage or retrieval. Its only job is to make the vector itself tangible before Atlas or reranking enter the picture.',
      },
    },
  },
  {
    slug: 'document-vs-query',
    title: 'Document vs Query Embeddings',
    summary:
      'Show why input type matters by embedding the same sentence as both a document and a query, then validating the semantic overlap with similarity.',
    categories: ['Embeddings', 'Retrieval', 'Input Types'],
    published: true,
    featured: false,
    prerequisites: ['A valid VOYAGE_API_KEY is set in the environment.'],
    environment: {
      requiresApiKey: true,
      requiresMongoDbAtlas: false,
      requiresOllama: false,
      worksOffline: false,
      platformNotes: [],
    },
    commands: [
      'vai explain embeddings',
      "echo '=> ingest-time: embed as a document'",
      "vai embed 'Vector search finds semantically similar content' --input-type document",
      "echo '=> search-time: embed as a query -- different vector, same space'",
      "vai embed 'Vector search finds semantically similar content' --input-type query",
      "echo '=> now measure semantic similarity between two different phrasings'",
      "vai similarity 'What is vector search?' 'How does semantic search work?' --model voyage-4-large",
      "echo '=> high similarity score: different words, same meaning'",
    ],
    assets: {
      recordingOutput: '02-document-vs-query.gif',
      sitePreviewPath: '/demos/document-vs-query.mp4',
    },
    source: {
      tapePath: 'docs/demos/tapes/02-document-vs-query.tape',
      repoUrl: buildTapeRepoUrl('docs/demos/tapes/02-document-vs-query.tape'),
    },
    links: {
      docs: [DOCS_URL, buildReadmeUrl('individual-commands'), buildReadmeUrl('core-workflow')],
      related: ['what-is-an-embedding', 'two-stage-retrieval'],
    },
    social: {
      headline: 'The same text, two different embedding intents: document vs query.',
      linkedinText:
        'One of the most practical retrieval lessons is that the same sentence should not always be embedded the same way. This VAI demo contrasts document and query embeddings, then validates the semantic relationship with a similarity check.',
      xText:
        'VAI demo: document embeddings vs query embeddings. Same sentence, different retrieval role, different vector.',
      hashtags: ['vai', 'voyageai', 'retrieval', 'embeddings'],
      callToAction: 'Use the exact commands to test document and query embeddings side by side.',
    },
    underTheHood: {
      vaiCommand: "vai embed 'Vector search finds semantically similar content' --input-type query",
      voyageApi: {
        node: `const response = await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'Vector search finds semantically similar content',
    model: 'voyage-4-large',
    input_type: 'query',
  }),
});`,
        python: `import voyageai

client = voyageai.Client()
result = client.embed(
    texts=['Vector search finds semantically similar content'],
    model='voyage-4-large',
    input_type='query',
)`,
        curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "Vector search finds semantically similar content",
    "model": "voyage-4-large",
    "input_type": "query"
  }'`,
      },
      voyageApiSteps: [
        {
          label: 'Embed as document',
          code: {
            node: `await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'Vector search finds semantically similar content',
    model: 'voyage-4-large',
    input_type: 'document',
  }),
});`,
            python: `client.embed(
    texts=['Vector search finds semantically similar content'],
    model='voyage-4-large',
    input_type='document',
)`,
            curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "Vector search finds semantically similar content",
    "model": "voyage-4-large",
    "input_type": "document"
  }'`,
          },
        },
        {
          label: 'Embed as query',
          code: {
            node: `await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'Vector search finds semantically similar content',
    model: 'voyage-4-large',
    input_type: 'query',
  }),
});`,
            python: `client.embed(
    texts=['Vector search finds semantically similar content'],
    model='voyage-4-large',
    input_type='query',
)`,
            curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "Vector search finds semantically similar content",
    "model": "voyage-4-large",
    "input_type": "query"
  }'`,
          },
        },
      ],
      mongoQuery: noMongoInThisDemo,
      explanations: {
        vaiCommand:
          'The tape uses the same sentence twice so the only changing variable is intent. That makes it easy to see why input_type is a retrieval choice, not just a syntactic flag.',
        voyageApi:
          'Both calls hit the embeddings endpoint, but with different input_type values. That is the core educational point: document and query vectors are optimized for different roles in the same retrieval system.',
        mongoQuery:
          'Atlas is intentionally absent here. The lesson is upstream of storage: produce the right kind of vector first, then plug it into search.',
      },
    },
  },
  {
    slug: 'chunking-strategies',
    title: 'Chunking Strategies Before Embedding',
    summary:
      'Compare fixed, sentence, and markdown chunking on the same sample document before any embedding or storage layer is introduced.',
    categories: ['Chunking', 'Preprocessing', 'Getting Started'],
    published: true,
    featured: false,
    prerequisites: ['The `vai` CLI is installed locally. No API key is required for chunking-only workflows.'],
    environment: {
      requiresApiKey: false,
      requiresMongoDbAtlas: false,
      requiresOllama: false,
      worksOffline: true,
      platformNotes: [],
    },
    commands: [
      "echo '=> step 1: chunk your docs. step 2: embed. step 3: store in Atlas.'",
      "printf '# Vector Search Guide\\n\\nVector search finds semantically similar content.\\nIt uses embeddings -- numbers that capture meaning.\\n\\n## How It Works\\n\\nDocuments are chunked, embedded, and stored in Atlas.\\nAt query time, your question is embedded too.\\n\\n## Why It Matters\\n\\nKeyword search misses synonyms and context.\\nVector search understands intent, not just words.' > /tmp/sample.md",
      "echo '=> strategy: fixed -- simple, predictable sizes'",
      'vai chunk /tmp/sample.md --strategy fixed --size 100',
      "echo '=> strategy: sentence -- respects natural language boundaries'",
      'vai chunk /tmp/sample.md --strategy sentence',
      "echo '=> strategy: markdown -- heading-aware, best for .md files'",
      'vai chunk /tmp/sample.md --strategy markdown',
      "echo '=> rule: markdown->markdown  |  code->recursive  |  PDF->paragraph'",
    ],
    assets: {
      recordingOutput: '03-chunking-strategies.gif',
      sitePreviewPath: '/demos/chunking-strategies.mp4',
    },
    source: {
      tapePath: 'docs/demos/tapes/03-chunking-strategies.tape',
      repoUrl: buildTapeRepoUrl('docs/demos/tapes/03-chunking-strategies.tape'),
    },
    links: {
      docs: [DOCS_URL, buildReadmeUrl('core-workflow')],
      related: ['pipeline-end-to-end', 'local-inference'],
    },
    social: {
      headline: 'A quick visual guide to choosing the right chunking strategy.',
      linkedinText:
        'Before you embed anything, chunking determines what retrieval can ever see. This VAI demo compares fixed, sentence, and markdown strategies on the same document so the tradeoffs are obvious.',
      xText:
        'VAI demo: compare fixed, sentence, and markdown chunking before you ever call the embeddings API.',
      hashtags: ['vai', 'chunking', 'rag', 'preprocessing'],
      callToAction: 'Replay the commands locally and pick the chunking strategy that fits your content.',
    },
    underTheHood: {
      vaiCommand: 'vai chunk /tmp/sample.md --strategy markdown',
      voyageApi: noVoyageApiInThisDemo,
      mongoQuery: noMongoInThisDemo,
      explanations: {
        vaiCommand:
          'This is a purely local preprocessing demo. The important thing is not the command syntax itself, but how each strategy changes the units of meaning that later get embedded.',
        voyageApi:
          'No Voyage AI call happens yet. Chunking is the stage where you shape documents into retrieval-ready pieces before any embedding cost is incurred.',
        mongoQuery:
          'No Atlas query or write happens here either. This tape isolates the preprocessing layer so developers can reason about chunk boundaries on their own.',
      },
    },
  },
  {
    slug: 'pipeline-end-to-end',
    title: 'End-to-End Atlas Pipeline',
    summary:
      'Run the full workflow in one command: create sample docs, chunk them, embed them, store them in Atlas, and auto-create the vector index.',
    categories: ['Pipeline', 'MongoDB Atlas', 'Embeddings', 'RAG'],
    published: true,
    featured: true,
    prerequisites: [
      'A valid VOYAGE_API_KEY is set in the environment.',
      'MongoDB Atlas is configured through MONGODB_URI or vai config set mongodb-uri.',
    ],
    environment: {
      requiresApiKey: true,
      requiresMongoDbAtlas: true,
      requiresOllama: false,
      worksOffline: false,
      platformNotes: [],
    },
    commands: [
      'mkdir -p /tmp/vai-demo-docs',
      "echo 'MongoDB Atlas Vector Search enables semantic similarity search at scale.' > /tmp/vai-demo-docs/atlas.md",
      "echo 'Voyage AI embedding models convert text into high-dimensional vectors.' > /tmp/vai-demo-docs/embeddings.md",
      "echo 'Retrieval-Augmented Generation grounds LLM responses in your own documents.' > /tmp/vai-demo-docs/rag.md",
      'ls /tmp/vai-demo-docs/',
      "echo '=> vai pipeline: files -> chunk -> embed -> store in Atlas, one command'",
      "echo '=> each batch: POST /v1/embeddings  model:voyage-4-large  input_type:document'",
      'vai pipeline /tmp/vai-demo-docs/ --db vai_demo --collection knowledge --create-index',
      "echo '=> verifying documents landed in Atlas...'",
      'vai collections --db vai_demo',
      "echo '=> verifying vector search index was created...'",
      'vai index list --db vai_demo --collection knowledge',
      "echo '=> collection indexed and ready to query'",
    ],
    assets: {
      recordingOutput: '04-pipeline-end-to-end.gif',
      sitePreviewPath: '/demos/pipeline-end-to-end.mp4',
    },
    source: {
      tapePath: 'docs/demos/tapes/04-pipeline-end-to-end.tape',
      repoUrl: buildTapeRepoUrl('docs/demos/tapes/04-pipeline-end-to-end.tape'),
    },
    links: {
      docs: [DOCS_URL, buildReadmeUrl('core-workflow')],
      related: ['two-stage-retrieval', 'ollama-nano-chat', 'chunking-strategies'],
    },
    social: {
      headline: 'A one-command path from raw files to Atlas Vector Search.',
      linkedinText:
        'This VAI demo shows the full ingestion path end to end: create sample docs, chunk them, batch-embed them with Voyage AI, write them to Atlas, and auto-create the vector index in one workflow.',
      xText:
        'VAI demo: files -> chunk -> embed -> store in Atlas -> create vector index. One command, fully reproducible.',
      hashtags: ['vai', 'mongodb', 'atlas', 'rag'],
      callToAction: 'Run the pipeline locally, then inspect the source tape for the exact sequence.',
    },
    underTheHood: {
      vaiCommand: 'vai pipeline /tmp/vai-demo-docs/ --db vai_demo --collection knowledge --create-index',
      voyageApi: {
        node: `const response = await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: chunks.map((chunk) => chunk.text),
    model: 'voyage-4-large',
    input_type: 'document',
  }),
});

const { data } = await response.json();
const embeddings = data.map((item) => item.embedding);`,
        python: `import voyageai

client = voyageai.Client()
result = client.embed(
    texts=[chunk["text"] for chunk in chunks],
    model='voyage-4-large',
    input_type='document',
)

embeddings = result.embeddings`,
        curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": ["chunk 1 text", "chunk 2 text", "chunk 3 text"],
    "model": "voyage-4-large",
    "input_type": "document"
  }'`,
      },
      mongoQuery: {
        node: `const documents = chunks.map((chunk, i) => ({
  text: chunk.text,
  embedding: embeddings[i],
  metadata: chunk.metadata,
  _model: 'voyage-4-large',
  _embeddedAt: new Date(),
}));

await collection.insertMany(documents);

await collection.createSearchIndex({
  name: 'vector_index',
  type: 'vectorSearch',
  definition: {
    fields: [
      {
        type: 'vector',
        path: 'embedding',
        numDimensions: 1024,
        similarity: 'cosine',
      },
    ],
  },
});`,
        python: `from datetime import datetime

documents = [
    {
        "text": chunk["text"],
        "embedding": embeddings[i],
        "metadata": chunk["metadata"],
        "_model": "voyage-4-large",
        "_embeddedAt": datetime.utcnow(),
    }
    for i, chunk in enumerate(chunks)
]

collection.insert_many(documents)

db.command({
    "createSearchIndexes": "knowledge",
    "indexes": [
        {
            "name": "vector_index",
            "type": "vectorSearch",
            "definition": {
                "fields": [
                    {
                        "type": "vector",
                        "path": "embedding",
                        "numDimensions": 1024,
                        "similarity": "cosine",
                    }
                ]
            },
        }
    ],
})`,
      },
      explanations: {
        vaiCommand:
          'This is the highest-leverage ingestion demo in the gallery: one command orchestrates chunking, embedding, Atlas writes, and optional vector index creation.',
        voyageApi:
          'The hosted layer is a batched embeddings request. Instead of sending one document at a time, the CLI groups chunks so the workflow stays fast and cost-efficient.',
        mongoQuery:
          'Atlas is the storage and retrieval layer. Each chunk is stored with its embedding, then a vectorSearch index is created so the collection is queryable immediately after ingest.',
      },
    },
  },
  {
    slug: 'two-stage-retrieval',
    title: 'Two-Stage Retrieval With Reranking',
    summary:
      'Walk through the classic retrieval stack: embed the query, run Atlas vector search, rerank the candidates, then compare the result to a vector-only pass.',
    categories: ['Retrieval', 'Reranking', 'MongoDB Atlas', 'RAG'],
    published: true,
    featured: true,
    prerequisites: [
      'A valid VOYAGE_API_KEY is set in the environment.',
      'MongoDB Atlas is configured through MONGODB_URI or vai config set mongodb-uri.',
      'The `vai_demo.knowledge` collection already exists, for example by running the pipeline demo first.',
    ],
    environment: {
      requiresApiKey: true,
      requiresMongoDbAtlas: true,
      requiresOllama: false,
      worksOffline: false,
      platformNotes: [],
    },
    commands: [
      'vai explain two-stage',
      "echo '=> stage 1: POST /v1/embeddings  model:voyage-4-lite  input_type:query'",
      "echo '=> stage 1: $vectorSearch  numCandidates:100  limit:20'",
      "echo '=> stage 2: POST /v1/rerank  model:rerank-2.5  top_k:5'",
      "vai query 'how does vector search work?' --db vai_demo --collection knowledge --model voyage-4-lite",
      "echo '=> now skip reranking to see stage 1 results alone'",
      "vai query 'how does vector search work?' --db vai_demo --collection knowledge --model voyage-4-lite --no-rerank",
      "echo '=> reranking reorders candidates -- same docs, better precision'",
    ],
    assets: {
      recordingOutput: '05-two-stage-retrieval.gif',
      sitePreviewPath: '/demos/two-stage-retrieval.mp4',
    },
    source: {
      tapePath: 'docs/demos/tapes/05-two-stage-retrieval.tape',
      repoUrl: buildTapeRepoUrl('docs/demos/tapes/05-two-stage-retrieval.tape'),
    },
    links: {
      docs: [DOCS_URL, buildReadmeUrl('core-workflow')],
      related: ['pipeline-end-to-end', 'reranking', 'ollama-nano-chat'],
    },
    social: {
      headline: 'Embed, search, rerank: the retrieval pattern behind production RAG.',
      linkedinText:
        'This VAI demo makes the two-stage retrieval pattern concrete: embed the question, over-sample semantically similar candidates with Atlas Vector Search, then rerank for precision before showing results.',
      xText:
        'VAI demo: query embedding + Atlas vector search + reranking. Same candidates, better precision.',
      hashtags: ['vai', 'retrieval', 'rerank', 'mongodb'],
      callToAction: 'Run the reranked and non-reranked queries side by side to see the difference.',
    },
    underTheHood: {
      vaiCommand: "vai query 'how does vector search work?' --db vai_demo --collection knowledge --model voyage-4-lite",
      voyageApi: {
        node: `const response = await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'how does vector search work?',
    model: 'voyage-4-lite',
    input_type: 'query',
  }),
});`,
        python: `client.embed(
    texts=['how does vector search work?'],
    model='voyage-4-lite',
    input_type='query',
)`,
        curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "how does vector search work?",
    "model": "voyage-4-lite",
    "input_type": "query"
  }'`,
      },
      voyageApiSteps: [
        {
          label: 'Embed the query',
          code: {
            node: `const embed = await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'how does vector search work?',
    model: 'voyage-4-lite',
    input_type: 'query',
  }),
});`,
            python: `query_embedding = client.embed(
    texts=['how does vector search work?'],
    model='voyage-4-lite',
    input_type='query',
)`,
            curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "how does vector search work?",
    "model": "voyage-4-lite",
    "input_type": "query"
  }'`,
          },
        },
        {
          label: 'Rerank the retrieved candidates',
          code: {
            node: `const rerank = await fetch('https://api.voyageai.com/v1/rerank', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'how does vector search work?',
    documents,
    model: 'rerank-2.5',
    top_k: 5,
  }),
});`,
            python: `reranked = client.rerank(
    query='how does vector search work?',
    documents=documents,
    model='rerank-2.5',
    top_k=5,
)`,
            curl: `curl https://api.voyageai.com/v1/rerank \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "how does vector search work?",
    "documents": ["doc 1", "doc 2", "doc 3"],
    "model": "rerank-2.5",
    "top_k": 5
  }'`,
          },
        },
      ],
      mongoQuery: {
        node: `const pipeline = [
  {
    $vectorSearch: {
      index: 'vector_index',
      path: 'embedding',
      queryVector,
      numCandidates: 100,
      limit: 20,
    },
  },
  { $addFields: { _vsScore: { $meta: 'vectorSearchScore' } } },
];

const searchResults = await collection.aggregate(pipeline).toArray();`,
        python: `pipeline = [
    {
        "$vectorSearch": {
            "index": "vector_index",
            "path": "embedding",
            "queryVector": query_vector,
            "numCandidates": 100,
            "limit": 20,
        }
    },
    {
        "$addFields": {
            "_vsScore": {"$meta": "vectorSearchScore"}
        }
    },
]

search_results = list(collection.aggregate(pipeline))`,
      },
      explanations: {
        vaiCommand:
          'The high-level command packages the canonical RAG retrieval pattern into one CLI step. The second command in the tape disables reranking so the precision gain is visible, not theoretical.',
        voyageApi:
          'Two hosted calls matter here: a query embedding call up front, then a rerank call after Atlas returns the candidate set. That separation is why the pattern is called two-stage retrieval.',
        mongoQuery:
          'Atlas handles candidate generation with vectorSearch. The CLI intentionally over-samples with numCandidates before reranking trims the set to the final top_k results.',
      },
    },
  },
  {
    slug: 'shared-embedding-space',
    title: 'Shared Embedding Space And Cost Savings',
    summary:
      'Validate that Voyage 4 models share an embedding space, then connect that result to asymmetric retrieval and concrete cost savings.',
    categories: ['Embeddings', 'Cost Optimization', 'Model Selection'],
    published: true,
    featured: false,
    prerequisites: ['A valid VOYAGE_API_KEY is set in the environment.'],
    environment: {
      requiresApiKey: true,
      requiresMongoDbAtlas: false,
      requiresOllama: false,
      worksOffline: false,
      platformNotes: [],
    },
    commands: [
      'vai explain shared-space',
      "echo '=> embed same text with two models -- cosine similarity proves shared space'",
      "echo '=> voyage-4-large: best quality, use for documents at ingest time'",
      "echo '=> voyage-4-lite:  cheapest,      use for queries at search time'",
      'vai benchmark space',
      "echo '=> ~0.938 similarity -- same space, different cost points'",
      "echo '=> what does that mean in dollars?'",
      'vai estimate --docs 10M --queries 100M --months 12',
      "echo '=> asymmetric strategy saves ~83% on query-time embedding costs'",
    ],
    assets: {
      recordingOutput: '06-shared-embedding-space.gif',
      sitePreviewPath: '/demos/shared-embedding-space.mp4',
    },
    source: {
      tapePath: 'docs/demos/tapes/06-shared-embedding-space.tape',
      repoUrl: buildTapeRepoUrl('docs/demos/tapes/06-shared-embedding-space.tape'),
    },
    links: {
      docs: [DOCS_URL, buildReadmeUrl('models--benchmarks'), buildReadmeUrl('core-workflow')],
      related: ['models-and-benchmarks', 'what-is-an-embedding'],
    },
    social: {
      headline: 'Why shared embedding space makes asymmetric retrieval economically compelling.',
      linkedinText:
        'This VAI demo connects two ideas that usually live separately: shared embedding space and cost planning. It validates compatibility across Voyage 4 models, then shows how that translates into asymmetric-retrieval savings.',
      xText:
        'VAI demo: validate shared embedding space, then quantify the savings from asymmetric retrieval.',
      hashtags: ['vai', 'voyageai', 'embeddings', 'costoptimization'],
      callToAction: 'Run the benchmark, then estimate the long-term cost impact for your own query volume.',
    },
    underTheHood: {
      vaiCommand: 'vai benchmark space',
      voyageApi: {
        node: `await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'MongoDB Atlas provides a fully managed cloud database with vector search.',
    model: 'voyage-4-large',
    input_type: 'document',
  }),
});`,
        python: `client.embed(
    texts=['MongoDB Atlas provides a fully managed cloud database with vector search.'],
    model='voyage-4-large',
    input_type='document',
)`,
        curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "MongoDB Atlas provides a fully managed cloud database with vector search.",
    "model": "voyage-4-large",
    "input_type": "document"
  }'`,
      },
      voyageApiSteps: [
        {
          label: 'Embed with voyage-4-large',
          code: {
            node: `await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'MongoDB Atlas provides a fully managed cloud database with vector search.',
    model: 'voyage-4-large',
    input_type: 'document',
  }),
});`,
            python: `client.embed(
    texts=['MongoDB Atlas provides a fully managed cloud database with vector search.'],
    model='voyage-4-large',
    input_type='document',
)`,
            curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "MongoDB Atlas provides a fully managed cloud database with vector search.",
    "model": "voyage-4-large",
    "input_type": "document"
  }'`,
          },
        },
        {
          label: 'Embed the same text with voyage-4-lite',
          code: {
            node: `await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'MongoDB Atlas provides a fully managed cloud database with vector search.',
    model: 'voyage-4-lite',
    input_type: 'document',
  }),
});`,
            python: `client.embed(
    texts=['MongoDB Atlas provides a fully managed cloud database with vector search.'],
    model='voyage-4-lite',
    input_type='document',
)`,
            curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "MongoDB Atlas provides a fully managed cloud database with vector search.",
    "model": "voyage-4-lite",
    "input_type": "document"
  }'`,
          },
        },
      ],
      mongoQuery: noMongoInThisDemo,
      explanations: {
        vaiCommand:
          'The benchmark proves that multiple Voyage 4 models can represent the same text in a compatible space. The estimate command in the tape then turns that abstract property into an operational cost argument.',
        voyageApi:
          'Under the hood the benchmark repeatedly calls the embeddings API for the same text across different models, then measures cosine similarity between the resulting vectors.',
        mongoQuery:
          'There is no Atlas operation in this demo. It is about model compatibility and cost strategy before any retrieval system is even queried.',
      },
    },
  },
  {
    slug: 'reranking',
    title: 'Standalone Reranking',
    summary:
      'Rerank intentionally messy candidate documents against a query, then compare the full reranker to the lite version to show the latency-precision tradeoff.',
    categories: ['Reranking', 'Retrieval', 'Model Selection'],
    published: true,
    featured: false,
    prerequisites: ['A valid VOYAGE_API_KEY is set in the environment.'],
    environment: {
      requiresApiKey: true,
      requiresMongoDbAtlas: false,
      requiresOllama: false,
      worksOffline: false,
      platformNotes: [],
    },
    commands: [
      'vai explain two-stage',
      "echo '=> rerank deliberately out-of-order documents against a query'",
      "vai rerank 'how do I connect to MongoDB Atlas?' --documents 'Use the connection string from your Atlas dashboard' 'Python is a popular language' 'Atlas supports vectorSearch aggregation' 'Copy your URI and pass it to MongoClient' 'The weather in San Francisco is mild'",
      "echo '=> unrelated docs scored near zero -- reranker understands meaning'",
      "echo '=> rerank-2.5-lite: faster. rerank-2.5: more accurate.'",
      "vai rerank 'how do I connect to MongoDB Atlas?' --documents 'Use the connection string from your Atlas dashboard' 'Copy your URI and pass it to MongoClient' --model rerank-2.5-lite",
      "echo '=> same ranking, lower latency -- choose based on precision needs'",
    ],
    assets: {
      recordingOutput: '07-reranking.gif',
      sitePreviewPath: '/demos/reranking.mp4',
    },
    source: {
      tapePath: 'docs/demos/tapes/07-reranking.tape',
      repoUrl: buildTapeRepoUrl('docs/demos/tapes/07-reranking.tape'),
    },
    links: {
      docs: [DOCS_URL, buildReadmeUrl('individual-commands'), buildReadmeUrl('core-workflow')],
      related: ['two-stage-retrieval', 'models-and-benchmarks'],
    },
    social: {
      headline: 'A small but vivid reranking demo that shows relevance, not just similarity.',
      linkedinText:
        'This VAI tape isolates reranking so you can see what it adds beyond embeddings alone: irrelevant candidates sink, the most useful instructions rise, and the lite model gives you a lower-latency option when speed matters.',
      xText:
        'VAI demo: rerank messy candidates, surface the useful ones, then compare rerank-2.5 vs rerank-2.5-lite.',
      hashtags: ['vai', 'reranking', 'retrieval', 'voyageai'],
      callToAction: 'Copy the command and test reranking on your own candidate set.',
    },
    underTheHood: {
      vaiCommand:
        "vai rerank 'how do I connect to MongoDB Atlas?' --documents 'Use the connection string from your Atlas dashboard' 'Python is a popular language' 'Atlas supports vectorSearch aggregation' 'Copy your URI and pass it to MongoClient' 'The weather in San Francisco is mild'",
      voyageApi: {
        node: `await fetch('https://api.voyageai.com/v1/rerank', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'how do I connect to MongoDB Atlas?',
    documents: [
      'Use the connection string from your Atlas dashboard',
      'Python is a popular language',
      'Atlas supports vectorSearch aggregation',
      'Copy your URI and pass it to MongoClient',
      'The weather in San Francisco is mild',
    ],
    model: 'rerank-2.5',
  }),
});`,
        python: `client.rerank(
    query='how do I connect to MongoDB Atlas?',
    documents=[
        'Use the connection string from your Atlas dashboard',
        'Python is a popular language',
        'Atlas supports vectorSearch aggregation',
        'Copy your URI and pass it to MongoClient',
        'The weather in San Francisco is mild',
    ],
    model='rerank-2.5',
)`,
        curl: `curl https://api.voyageai.com/v1/rerank \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "how do I connect to MongoDB Atlas?",
    "documents": [
      "Use the connection string from your Atlas dashboard",
      "Python is a popular language",
      "Atlas supports vectorSearch aggregation",
      "Copy your URI and pass it to MongoClient",
      "The weather in San Francisco is mild"
    ],
    "model": "rerank-2.5"
  }'`,
      },
      voyageApiSteps: [
        {
          label: 'Best-quality reranker',
          code: {
            node: `await fetch('https://api.voyageai.com/v1/rerank', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'how do I connect to MongoDB Atlas?',
    documents,
    model: 'rerank-2.5',
  }),
});`,
            python: `client.rerank(
    query='how do I connect to MongoDB Atlas?',
    documents=documents,
    model='rerank-2.5',
)`,
            curl: `curl https://api.voyageai.com/v1/rerank \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "how do I connect to MongoDB Atlas?",
    "documents": ["doc 1", "doc 2", "doc 3"],
    "model": "rerank-2.5"
  }'`,
          },
        },
        {
          label: 'Lower-latency reranker',
          code: {
            node: `await fetch('https://api.voyageai.com/v1/rerank', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'how do I connect to MongoDB Atlas?',
    documents,
    model: 'rerank-2.5-lite',
  }),
});`,
            python: `client.rerank(
    query='how do I connect to MongoDB Atlas?',
    documents=documents,
    model='rerank-2.5-lite',
)`,
            curl: `curl https://api.voyageai.com/v1/rerank \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "how do I connect to MongoDB Atlas?",
    "documents": ["doc 1", "doc 2", "doc 3"],
    "model": "rerank-2.5-lite"
  }'`,
          },
        },
      ],
      mongoQuery: noMongoInThisDemo,
      explanations: {
        vaiCommand:
          'This tape strips away the vector-search stage so the reranker can be understood on its own. That makes the relevance behavior easier to spot than when reranking is buried inside a bigger retrieval stack.',
        voyageApi:
          'The rerank endpoint takes a query plus candidate documents and returns them reordered by relevance. The lite comparison in the tape shows the speed-vs-precision tradeoff directly.',
        mongoQuery:
          'No Atlas query is involved here because the candidates are supplied inline. That is useful when your first-stage retrieval comes from another system or from handcrafted examples.',
      },
    },
  },
  {
    slug: 'models-and-benchmarks',
    title: 'Models And Benchmarks',
    summary:
      'Survey the Voyage model lineup, explain benchmark context, and then measure embedding latency on your own hardware before choosing a production model.',
    categories: ['Model Discovery', 'Benchmarks', 'Embeddings'],
    published: true,
    featured: false,
    prerequisites: ['A valid VOYAGE_API_KEY is set in the environment.'],
    environment: {
      requiresApiKey: true,
      requiresMongoDbAtlas: false,
      requiresOllama: false,
      worksOffline: false,
      platformNotes: [],
    },
    commands: [
      "echo '=> which Voyage AI model should you use? vai models has the answer'",
      'vai models',
      "echo '=> RTEB NDCG@10: retrieval quality across 36 real-world datasets'",
      'vai explain rteb',
      "echo '=> general RAG:  voyage-4-large (docs) + voyage-4-lite (queries)'",
      "echo '=> code search:  voyage-code-3'",
      "echo '=> finance:      voyage-finance-2'",
      "echo '=> legal:        voyage-law-2'",
      "echo '=> benchmark latency on your own hardware before committing'",
      "vai benchmark embed --input 'What is the best way to index a large document corpus?'",
      "echo '=> pick your model, then: vai pipeline ./docs/ --model <chosen-model>'",
    ],
    assets: {
      recordingOutput: '08-models-and-benchmarks.gif',
      sitePreviewPath: '/demos/models-and-benchmarks.mp4',
    },
    source: {
      tapePath: 'docs/demos/tapes/08-models-and-benchmarks.tape',
      repoUrl: buildTapeRepoUrl('docs/demos/tapes/08-models-and-benchmarks.tape'),
    },
    links: {
      docs: [DOCS_URL, buildReadmeUrl('models--benchmarks')],
      related: ['shared-embedding-space', 'reranking', 'cli-quickstart'],
    },
    social: {
      headline: 'Choose the right Voyage model with both published scores and local benchmarks.',
      linkedinText:
        'This VAI demo pairs model discovery with practical evaluation. It starts with the model catalog and benchmark context, then runs a local latency benchmark so the final choice is based on your workload instead of generic averages alone.',
      xText:
        'VAI demo: inspect the model catalog, understand the benchmarks, then run your own embedding latency test.',
      hashtags: ['vai', 'benchmarks', 'voyageai', 'modelselection'],
      callToAction: 'Use the commands to shortlist a model, then benchmark it on your own machine.',
    },
    underTheHood: {
      vaiCommand: "vai benchmark embed --input 'What is the best way to index a large document corpus?'",
      voyageApi: {
        node: `await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'What is the best way to index a large document corpus?',
    model: 'voyage-4-large',
    input_type: 'document',
  }),
});`,
        python: `client.embed(
    texts=['What is the best way to index a large document corpus?'],
    model='voyage-4-large',
    input_type='document',
)`,
        curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "What is the best way to index a large document corpus?",
    "model": "voyage-4-large",
    "input_type": "document"
  }'`,
      },
      voyageApiSteps: [
        {
          label: 'Benchmark voyage-4-large',
          code: {
            node: `await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'What is the best way to index a large document corpus?',
    model: 'voyage-4-large',
    input_type: 'document',
  }),
});`,
            python: `client.embed(
    texts=['What is the best way to index a large document corpus?'],
    model='voyage-4-large',
    input_type='document',
)`,
            curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "What is the best way to index a large document corpus?",
    "model": "voyage-4-large",
    "input_type": "document"
  }'`,
          },
        },
        {
          label: 'Benchmark voyage-4',
          code: {
            node: `await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'What is the best way to index a large document corpus?',
    model: 'voyage-4',
    input_type: 'document',
  }),
});`,
            python: `client.embed(
    texts=['What is the best way to index a large document corpus?'],
    model='voyage-4',
    input_type='document',
)`,
            curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "What is the best way to index a large document corpus?",
    "model": "voyage-4",
    "input_type": "document"
  }'`,
          },
        },
        {
          label: 'Benchmark voyage-4-lite',
          code: {
            node: `await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'What is the best way to index a large document corpus?',
    model: 'voyage-4-lite',
    input_type: 'document',
  }),
});`,
            python: `client.embed(
    texts=['What is the best way to index a large document corpus?'],
    model='voyage-4-lite',
    input_type='document',
)`,
            curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "What is the best way to index a large document corpus?",
    "model": "voyage-4-lite",
    "input_type": "document"
  }'`,
          },
        },
      ],
      mongoQuery: noMongoInThisDemo,
      explanations: {
        vaiCommand:
          'The catalog and explainer parts of the tape build context, but the benchmark command is where selection becomes operational. It lets you test model latency against your own prompt shape before committing.',
        voyageApi:
          'The benchmark loops over the embeddings API with the same input text across multiple models. The CLI measures latency and token usage so you can compare quality, speed, and price together.',
        mongoQuery:
          'No Atlas operation is needed here. This is a model-selection exercise that happens before you settle on the embedding strategy for your production pipeline.',
      },
    },
  },
  {
    slug: 'vector-search-devday',
    title: 'Vector Search Developer Day (VAI Edition)',
    summary:
      'The complete MongoDB Developer Day vector search workshop reimagined as a VAI CLI workflow. Use it as a backup during the Vector Search: Beginner to Pro lab or afterward to reinforce concepts: set up local MongoDB, install the CLI, generate embeddings with voyage-4-nano, create a vector index, and run semantic search — end to end from the command line.',
    categories: ['Pipeline', 'MongoDB Atlas', 'Embeddings', 'Vector Search', 'Local Embeddings', 'Hybrid Search', 'Docker'],
    published: true,
    featured: true,
    prerequisites: [
      'Docker installed (for local MongoDB Atlas) or access to a MongoDB Atlas cluster.',
      'Node.js >= 18 installed.',
      'VAI CLI installed globally: `npm install -g voyageai-cli`.',
      'For query commands (Step 5+), a VOYAGE_API_KEY is needed — free tier available at voyageai.com. Embedding and ingestion run entirely locally with nano.',
    ],
    environment: {
      requiresApiKey: false,
      requiresMongoDbAtlas: true,
      requiresOllama: false,
      worksOffline: false,
      platformNotes: [
        'Step 0 sets up a local MongoDB Atlas instance via Docker — no cloud account needed for the database.',
        'Embedding and ingestion use voyage-4-nano locally (no API key).',
        'Query commands use voyage-4-lite via API (same embedding space, $0.02/1M tokens).',
      ],
    },
    commands: [
      'docker run -d --name mongodb-atlas-local -p 27017:27017 mongodb/mongodb-atlas-local:latest',
      'sleep 5 && mongosh --eval "db.runCommand({ ping: 1 })"',
      'npm install -g voyageai-cli',
      'vai config set mongodb-uri "mongodb://localhost:27017"',
      'vai nano setup',
      'vai embed "Puppy Preschool: Raising Your Puppy Right" --local --dimensions 1024',
      'vai ingest --file books.jsonl --db mongodb_genai_devday_vs --collection books --field embedding --text-field title --local --dimensions 1024 --batch-size 10',
      'vai index create --db mongodb_genai_devday_vs --collection books --field embedding --dimensions 1024 --similarity cosine',
      'vai query "A man wearing a golden crown" --db mongodb_genai_devday_vs --collection books --model voyage-4-lite --no-rerank',
      'vai query "A boy and the ocean" --db mongodb_genai_devday_vs --collection books --model voyage-4-lite',
      'docker stop mongodb-atlas-local && docker rm mongodb-atlas-local',
    ],
    setupGuide: {
      title: 'Environment Setup',
      description:
        'Choose your MongoDB setup. Both options work identically with the VAI CLI — the Docker local image includes full Atlas Vector Search support.',
      tabs: [
        {
          id: 'docker-local',
          label: 'Docker (Local)',
          steps: [
            {
              title: 'Start MongoDB Atlas Local',
              description:
                'The mongodb-atlas-local Docker image provides a single-node MongoDB instance with full Atlas Search and Vector Search support — no cloud account needed.',
              commands: [
                'docker run -d --name mongodb-atlas-local -p 27017:27017 mongodb/mongodb-atlas-local:latest',
                'sleep 5',
                'mongosh --eval "db.runCommand({ ping: 1 })"',
              ],
            },
            {
              title: 'Install & Configure VAI CLI',
              description: 'Install the CLI globally and point it at your local MongoDB instance.',
              commands: [
                'npm install -g voyageai-cli',
                'vai config set mongodb-uri "mongodb://localhost:27017"',
                'vai --version',
              ],
            },
            {
              title: 'Download Nano Model',
              description:
                'voyage-4-nano is an open-weight embedding model (~700 MB). It runs locally and generates 1024-dim vectors compatible with all Voyage 4 models.',
              commands: ['vai nano setup', 'vai models --type embedding'],
            },
          ],
        },
        {
          id: 'atlas-cloud',
          label: 'Atlas (Cloud)',
          steps: [
            {
              title: 'Create a Free MongoDB Atlas Cluster',
              description:
                'Sign up at mongodb.com/try and create a free M0 cluster. Copy the connection string from the Atlas UI (Database > Connect > Drivers).',
              commands: [
                '# 1. Go to https://www.mongodb.com/try',
                '# 2. Create a free M0 cluster',
                '# 3. Add your IP to the access list',
                '# 4. Create a database user',
                '# 5. Copy the connection string',
              ],
            },
            {
              title: 'Install & Configure VAI CLI',
              description: 'Install the CLI globally and configure your Atlas connection string.',
              commands: [
                'npm install -g voyageai-cli',
                'vai config set mongodb-uri "mongodb+srv://<username>:<password>@cluster.mongodb.net"',
                'vai --version',
              ],
            },
            {
              title: 'Download Nano Model',
              description:
                'voyage-4-nano is an open-weight embedding model (~700 MB). It runs locally and generates 1024-dim vectors compatible with all Voyage 4 models.',
              commands: ['vai nano setup', 'vai models --type embedding'],
            },
          ],
        },
        {
          id: 'codespaces',
          label: 'GitHub Codespaces',
          steps: [
            {
              title: 'Launch a Codespace',
              description:
                'Open the workshop repo in GitHub Codespaces. The devcontainer includes Docker with mongodb-atlas-local and all dependencies pre-installed.',
              commands: [
                '# Click "Open in Codespaces" on the repo page:',
                '# https://github.com/mongodb-developer/genai-devday-notebooks',
                '# Or create one directly:',
                'gh codespace create --repo mongodb-developer/genai-devday-notebooks --machine basicLinux32gb',
              ],
            },
            {
              title: 'Install VAI CLI in the Codespace',
              description: 'MongoDB is already running on localhost:27017 inside the Codespace container.',
              commands: [
                'npm install -g voyageai-cli',
                'vai config set mongodb-uri "mongodb://localhost:27017"',
                'vai --version',
              ],
            },
            {
              title: 'Download Nano Model',
              description:
                'voyage-4-nano is an open-weight embedding model (~700 MB). It runs locally and generates 1024-dim vectors compatible with all Voyage 4 models.',
              commands: ['vai nano setup', 'vai models --type embedding'],
            },
          ],
        },
      ],
    },
    labCompanion: {
      labUrl: 'https://mongodb-developer.github.io/vector-search-lab/',
      labTitle: 'Vector Search: Beginner to Pro',
      intro:
        'This demo mirrors the full MongoDB Developer Day vector search workshop. Use it as a backup reference during the lab (if you get stuck or want to see the CLI equivalent) or afterward to reinforce concepts with a single-terminal workflow.',
      mappings: [
        {
          labSection: '20 Dev Environment',
          labStep: 'Jupyter setup',
          vaiCommand: 'docker run -d --name mongodb-atlas-local -p 27017:27017 mongodb/mongodb-atlas-local:latest',
          note: 'Same local MongoDB. VAI uses the terminal instead of notebooks.',
        },
        {
          labSection: '30 Import Data',
          labStep: 'Import books into mongodb_genai_devday_vs.books',
          vaiCommand: 'vai ingest --file books.jsonl --db mongodb_genai_devday_vs --collection books ...',
          note: 'Lab uses Python + preloaded data. VAI ingests from JSONL and embeds in one step.',
        },
        {
          labSection: '40 Perform Vector Search',
          labStep: 'Step 3: Generate embeddings',
          vaiCommand: 'vai embed "..." --local --dimensions 1024',
          note: 'Lab uses voyage-multimodal-3 (images). VAI uses voyage-4-nano (text, local). Same 1024-dim space.',
        },
        {
          labSection: '40 Perform Vector Search',
          labStep: 'Step 4: Add embeddings to data',
          vaiCommand: 'vai ingest ... --local',
          note: 'Combined with import. Batch-embeds each document and writes to Atlas.',
        },
        {
          labSection: '40 Perform Vector Search',
          labStep: 'Step 5: Create vector index',
          vaiCommand: 'vai index create --db mongodb_genai_devday_vs --collection books --field embedding --dimensions 1024',
          note: 'Same $vectorSearch index definition. VAI creates it via CLI.',
        },
        {
          labSection: '40 Perform Vector Search',
          labStep: 'Step 6: Run vector search queries',
          vaiCommand: 'vai query "A man wearing a golden crown" --db mongodb_genai_devday_vs --collection books --model voyage-4-lite',
          note: 'Same $vectorSearch aggregation. VAI embeds the query, runs the pipeline, and prints results.',
        },
        {
          labSection: '50 Optimizing',
          labStep: 'Pre-filtering',
          vaiCommand: 'vai index create ... (supports filter fields)',
          note: 'See Under the Hood for the filter field in the index definition. vai query supports pre-filters.',
        },
        {
          labSection: '60 Other Techniques',
          labStep: 'Hybrid search',
          vaiCommand: 'See mongoQuery in Under the Hood',
          note: 'The $rankFusion pipeline combines vector and full-text search. VAI exposes this in advanced workflows.',
        },
      ],
      takeaway:
        'The lab teaches the concepts (embeddings, $vectorSearch, pre-filters, hybrid). This VAI demo gives you the same workflow in a reproducible CLI form. Run both to reinforce the mental model: Python for exploration, VAI for automation and demos.',
    },
    assets: {
      recordingOutput: 'vector-search-devday.gif',
      sitePreviewPath: '/demos/vector-search-devday.mp4',
    },
    source: {
      tapePath: 'docs/demos/vector-search-devday.tape',
      repoUrl: buildTapeRepoUrl('docs/demos/vector-search-devday.tape'),
    },
    links: {
      docs: [
        DOCS_URL,
        buildReadmeUrl('core-workflow'),
        'https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/',
        'https://www.mongodb.com/docs/atlas/cli/current/atlas-cli-deploy-local/',
        'https://mongodb-developer.github.io/vector-search-lab/',
      ],
      related: ['pipeline-end-to-end', 'two-stage-retrieval', 'what-is-an-embedding'],
    },
    social: {
      headline: 'The MongoDB Developer Day vector search workshop — zero to semantic search in one terminal session.',
      linkedinText:
        'Full Developer Day vector search workshop as a VAI CLI demo: spin up local MongoDB via Docker, generate embeddings locally with voyage-4-nano (no API key), ingest into Atlas, create a vector index, and run semantic search. End-to-end setup to working vector search from the command line.',
      xText:
        'MongoDB Developer Day workshop as a VAI CLI workflow: Docker-based local MongoDB, local embeddings with nano, Atlas vector search. Zero to semantic search from your terminal.',
      hashtags: ['vai', 'voyageai', 'mongodb', 'vectorsearch', 'devday', 'nano', 'docker'],
      callToAction: 'Run the full workshop end-to-end: Docker, local embeddings, Atlas vector search.',
    },
    underTheHood: {
      vaiCommand: 'vai query "A man wearing a golden crown" --db mongodb_genai_devday_vs --collection books --model voyage-4-lite',
      voyageApi: {
        node: `// Step 1: Embed the query with voyage-4-lite (shares nano's embedding space)
const embedResponse = await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: ['A man wearing a golden crown'],
    model: 'voyage-4-lite',
    input_type: 'query',
    output_dimension: 1024,
  }),
});

const { data } = await embedResponse.json();
const queryVector = data[0].embedding;`,
        python: `import voyageai

vo = voyageai.Client()

# Step 1: Embed the query with voyage-4-lite (shares nano's embedding space)
embedding = vo.embed(
    texts=["A man wearing a golden crown"],
    model="voyage-4-lite",
    input_type="query",
    output_dimension=1024,
)

query_vector = embedding.embeddings[0]`,
        curl: `# Step 1: Embed the query with voyage-4-lite
curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": ["A man wearing a golden crown"],
    "model": "voyage-4-lite",
    "input_type": "query",
    "output_dimension": 1024
  }'`,
      },
      voyageApiSteps: [
        {
          label: 'Embed text locally with nano (no API call)',
          code: {
            node: `// voyage-4-nano runs locally — no API key or network needed
// The VAI CLI handles this with: vai embed "text" --local --dimensions 1024
// Under the hood it loads the ONNX model and runs inference locally:

import { NanoLocal } from 'vai/nano';
const nano = new NanoLocal({ model: 'voyage-4-nano' });
const embedding = await nano.embed(
  'Puppy Preschool: Raising Your Puppy Right',
  { dimensions: 1024, inputType: 'document' }
);
// => Float32Array(1024) — generated on your machine`,
            python: `# voyage-4-nano runs locally — no API key or network needed
# The VAI CLI handles this with: vai embed "text" --local --dimensions 1024
# Equivalent Python with the open-weight model:

from sentence_transformers import SentenceTransformer
model = SentenceTransformer("voyageai/voyage-4-nano")
embedding = model.encode(
    "Puppy Preschool: Raising Your Puppy Right",
    output_value="sentence_embedding",
    normalize_embeddings=True,
)
# => numpy array of 1024 dimensions`,
            curl: `# No API call needed! voyage-4-nano runs locally.
# Use the VAI CLI:
vai embed "Puppy Preschool: Raising Your Puppy Right" --local --dimensions 1024

# Or download the model from HuggingFace:
# https://huggingface.co/voyageai/voyage-4-nano`,
          },
        },
        {
          label: 'Embed search query via API (voyage-4-lite)',
          code: {
            node: `// For query-time embedding, use voyage-4-lite via API
// It shares the same embedding space as nano
const queryResponse = await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: ['A man wearing a golden crown'],
    model: 'voyage-4-lite',
    input_type: 'query',
    output_dimension: 1024,
  }),
});

const { data } = await queryResponse.json();
const queryVector = data[0].embedding;`,
            python: `# For query-time embedding, use voyage-4-lite via API
# It shares the same embedding space as nano
import voyageai
vo = voyageai.Client()

query_embedding = vo.embed(
    texts=["A man wearing a golden crown"],
    model="voyage-4-lite",
    input_type="query",
    output_dimension=1024,
)

query_vector = query_embedding.embeddings[0]`,
            curl: `# For query-time embedding, use voyage-4-lite via API
# It shares the same embedding space as nano
curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": ["A man wearing a golden crown"],
    "model": "voyage-4-lite",
    "input_type": "query",
    "output_dimension": 1024
  }'`,
          },
        },
      ],
      mongoQuery: {
        node: `// Vector search with optional pre-filter
const pipeline = [
  {
    $vectorSearch: {
      index: 'vector_index',
      path: 'embedding',
      queryVector,
      numCandidates: 20,
      limit: 5,
      filter: { year: { $gte: 2002 } },  // optional pre-filter
    },
  },
  {
    $project: {
      _id: 0,
      title: 1,
      cover: 1,
      year: 1,
      pages: 1,
      score: { $meta: 'vectorSearchScore' },
    },
  },
];

const results = await collection.aggregate(pipeline).toArray();

// Hybrid search with rank fusion
const hybridPipeline = [
  {
    $rankFusion: {
      input: {
        pipelines: {
          vector: [
            {
              $vectorSearch: {
                index: 'vector_index',
                path: 'embedding',
                queryVector,
                numCandidates: 20,
                limit: 10,
              },
            },
          ],
          fulltext: [
            {
              $search: {
                index: 'fts_index',
                text: { query: 'My Favorite Summer', path: 'synopsis' },
              },
            },
            { $limit: 10 },
          ],
        },
      },
      combination: {
        weights: { vector: 0.3, fulltext: 0.7 },
      },
    },
  },
  { $limit: 5 },
];`,
        python: `# Vector search with optional pre-filter
pipeline = [
    {
        "$vectorSearch": {
            "index": "vector_index",
            "path": "embedding",
            "queryVector": query_vector,
            "numCandidates": 20,
            "limit": 5,
            "filter": {"year": {"$gte": 2002}},  # optional pre-filter
        }
    },
    {
        "$project": {
            "_id": 0,
            "title": 1,
            "cover": 1,
            "year": 1,
            "pages": 1,
            "score": {"$meta": "vectorSearchScore"},
        }
    },
]

results = list(collection.aggregate(pipeline))

# Hybrid search with rank fusion
hybrid_pipeline = [
    {
        "$rankFusion": {
            "input": {
                "pipelines": {
                    "vector": [
                        {
                            "$vectorSearch": {
                                "index": "vector_index",
                                "path": "embedding",
                                "queryVector": query_vector,
                                "numCandidates": 20,
                                "limit": 10,
                            }
                        }
                    ],
                    "fulltext": [
                        {
                            "$search": {
                                "index": "fts_index",
                                "text": {"query": "My Favorite Summer", "path": "synopsis"},
                            }
                        },
                        {"$limit": 10},
                    ],
                }
            },
            "combination": {
                "weights": {"vector": 0.3, "fulltext": 0.7}
            },
        }
    },
    {"$limit": 5},
]

results = list(collection.aggregate(hybrid_pipeline))`,
      },
      explanations: {
        vaiCommand:
          'This demo mirrors the full MongoDB Developer Day vector search workshop end-to-end. Part 1 sets up the environment: a local MongoDB Atlas instance via Docker, the VAI CLI, and voyage-4-nano for local embeddings. Part 2 runs the workshop: ingest, index, search, and rerank. No cloud account needed for the database — everything runs locally except the lightweight query API call.',
        voyageApi:
          'The key insight: voyage-4-nano (local, free) and voyage-4-lite (API, $0.02/1M tokens) share the same 1024-dim embedding space. Embed thousands of documents locally at zero cost, then run queries through the lightweight API. This hybrid local+API approach is the recommended pattern for cost-effective vector search.',
        mongoQuery:
          'The local mongodb-atlas-local Docker image provides full Atlas Vector Search support including $vectorSearch aggregation, pre-filters, and hybrid search with $rankFusion — identical behavior to Atlas cloud. The workshop progresses from basic vector search to pre-filtered queries and hybrid search combining vector and full-text pipelines.',
      },
    },
  },
  {
    slug: 'rag-devday',
    title: 'RAG Developer Day (VAI Edition)',
    summary:
      'The complete MongoDB Developer Day RAG lab reimagined as a VAI CLI workflow. Use it as a backup during the Build RAG Applications using MongoDB lab or afterward to reinforce concepts: ingest documentation chunks, create a vector index, and run RAG chat — end to end from the command line.',
    categories: ['RAG', 'MongoDB Atlas', 'Embeddings', 'Chat', 'Pipeline', 'Docker'],
    published: true,
    featured: true,
    prerequisites: [
      'Docker installed (for local MongoDB Atlas) or access to a MongoDB Atlas cluster.',
      'Node.js >= 18 installed.',
      'VAI CLI installed globally: `npm install -g voyageai-cli`.',
      'VOYAGE_API_KEY for embeddings and chat (free tier at voyageai.com), or another configured LLM provider.',
    ],
    environment: {
      requiresApiKey: true,
      requiresMongoDbAtlas: true,
      requiresOllama: false,
      worksOffline: false,
      platformNotes: [
        'Step 0 sets up a local MongoDB Atlas instance via Docker — no cloud account needed for the database.',
        'Embeddings use the Voyage AI API (voyage-4 by default).',
        'vai chat uses your configured LLM provider for generation.',
      ],
    },
    commands: [
      'docker run -d --name mongodb-atlas-local -p 27017:27017 mongodb/mongodb-atlas-local:latest',
      'sleep 5 && mongosh --eval "db.runCommand({ ping: 1 })"',
      'npm install -g voyageai-cli',
      'vai config set mongodb-uri "mongodb://localhost:27017"',
      'vai ingest --file docs/demos/rag-devday-docs.jsonl --db mongodb_genai_devday_rag --collection knowledge_base --field embedding --text-field text --batch-size 5',
      'vai index create --db mongodb_genai_devday_rag --collection knowledge_base --field embedding --dimensions 1024 --similarity cosine',
      'vai chat --db mongodb_genai_devday_rag --collection knowledge_base --no-history --no-stream',
      { type: 'input', value: 'What are some best practices for data backups in MongoDB?' },
      { type: 'input', value: 'How to resolve alerts in MongoDB?' },
      { type: 'input', value: '/quit' },
      'docker stop mongodb-atlas-local && docker rm mongodb-atlas-local',
    ],
    setupGuide: {
      title: 'Environment Setup',
      description:
        'Choose your MongoDB setup. Both options work identically with the VAI CLI — the Docker local image includes full Atlas Vector Search support.',
      tabs: [
        {
          id: 'docker-local',
          label: 'Docker (Local)',
          steps: [
            {
              title: 'Start MongoDB Atlas Local',
              description:
                'The mongodb-atlas-local Docker image provides a single-node MongoDB instance with full Atlas Search and Vector Search support — no cloud account needed.',
              commands: [
                'docker run -d --name mongodb-atlas-local -p 27017:27017 mongodb/mongodb-atlas-local:latest',
                'sleep 5',
                'mongosh --eval "db.runCommand({ ping: 1 })"',
              ],
            },
            {
              title: 'Install & Configure VAI CLI',
              description: 'Install the CLI globally and point it at your local MongoDB instance.',
              commands: [
                'npm install -g voyageai-cli',
                'vai config set mongodb-uri "mongodb://localhost:27017"',
                'vai --version',
              ],
            },
          ],
        },
        {
          id: 'atlas-cloud',
          label: 'Atlas (Cloud)',
          steps: [
            {
              title: 'Create a Free MongoDB Atlas Cluster',
              description:
                'Sign up at mongodb.com/try and create a free M0 cluster. Copy the connection string from the Atlas UI (Database > Connect > Drivers).',
              commands: [
                '# 1. Go to https://www.mongodb.com/try',
                '# 2. Create a free M0 cluster',
                '# 3. Add your IP to the access list',
                '# 4. Create a database user',
                '# 5. Copy the connection string',
              ],
            },
            {
              title: 'Install & Configure VAI CLI',
              description: 'Install the CLI globally and configure your Atlas connection string.',
              commands: [
                'npm install -g voyageai-cli',
                'vai config set mongodb-uri "mongodb+srv://<username>:<password>@cluster.mongodb.net"',
                'vai --version',
              ],
            },
          ],
        },
      ],
    },
    labCompanion: {
      labUrl: 'https://mongodb-developer.github.io/ai-rag-lab/',
      labTitle: 'Build RAG Applications using MongoDB',
      intro:
        'This demo mirrors the full MongoDB Developer Day RAG lab. Use it as a backup reference during the lab (if you get stuck or want to see the CLI equivalent) or afterward to reinforce concepts with a single-terminal workflow.',
      mappings: [
        {
          labSection: '20 Dev Environment',
          labStep: 'Setup prerequisites',
          vaiCommand: 'docker run -d --name mongodb-atlas-local -p 27017:27017 mongodb/mongodb-atlas-local:latest',
          note: 'Same local MongoDB. VAI uses the terminal instead of Jupyter notebooks.',
        },
        {
          labSection: '30 Prepare the Data',
          labStep: 'Step 2: Load the dataset',
          vaiCommand: 'vai ingest --file docs/demos/rag-devday-docs.jsonl ...',
          note: 'Lab loads mongodb_docs.json. VAI ingests from JSONL. Use the full workshop data for production.',
        },
        {
          labSection: '30 Prepare the Data',
          labStep: 'Step 3: Chunk and embed',
          vaiCommand: 'vai ingest ... --field embedding --text-field text',
          note: 'Lab uses RecursiveCharacterTextSplitter + voyage-context-3. VAI chunks and embeds in one step with voyage-4.',
        },
        {
          labSection: '30 Prepare the Data',
          labStep: 'Step 4: Ingest into MongoDB',
          vaiCommand: 'vai ingest --db mongodb_genai_devday_rag --collection knowledge_base ...',
          note: 'Same db and collection. VAI writes embedded chunks directly.',
        },
        {
          labSection: '40 Perform Vector Search',
          labStep: 'Create vector index',
          vaiCommand: 'vai index create --db mongodb_genai_devday_rag --collection knowledge_base --field embedding --dimensions 1024',
          note: 'Same vector index definition. 1024 dimensions for voyage-4.',
        },
        {
          labSection: '40 Perform Vector Search',
          labStep: 'Vector search queries',
          vaiCommand: 'vai chat --db mongodb_genai_devday_rag --collection knowledge_base',
          note: 'vai chat embeds the query, runs $vectorSearch, retrieves context, and passes to the LLM.',
        },
        {
          labSection: '50 Build RAG App',
          labStep: 'Step 7: Build the RAG application',
          vaiCommand: 'vai chat ... (create_prompt + generate_answer in one command)',
          note: 'Lab builds create_prompt and generate_answer. vai chat does both: retrieve context, assemble prompt, call LLM.',
        },
        {
          labSection: '50 Build RAG App',
          labStep: 'Add reranking',
          vaiCommand: 'vai chat ... (reranking enabled by default)',
          note: 'vai chat uses reranking when available. Use --no-rerank to compare.',
        },
        {
          labSection: '60 Add Memory',
          labStep: 'Step 8: Add memory',
          vaiCommand: 'vai chat (omit --no-history for session memory)',
          note: 'vai chat persists sessions. Use vai chat --session <id> to resume. The lab stores history in MongoDB.',
        },
      ],
      takeaway:
        'The lab teaches RAG from first principles: chunk, embed, store, index, retrieve, prompt, generate. This VAI demo gives you the same workflow in a reproducible CLI form. Run both to reinforce the mental model: Python for exploration, VAI for automation and demos.',
    },
    assets: {
      recordingOutput: 'rag-devday.gif',
      sitePreviewPath: '/demos/rag-devday.mp4',
    },
    source: {
      tapePath: 'docs/demos/rag-devday.tape',
      repoUrl: buildTapeRepoUrl('docs/demos/rag-devday.tape'),
    },
    links: {
      docs: [
        DOCS_URL,
        buildReadmeUrl('core-workflow'),
        'https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/',
        'https://mongodb-developer.github.io/ai-rag-lab/',
      ],
      related: ['ollama-nano-chat', 'pipeline-end-to-end', 'two-stage-retrieval'],
    },
    social: {
      headline: 'The MongoDB Developer Day RAG lab — zero to documentation chatbot in one terminal session.',
      linkedinText:
        'Full Developer Day RAG lab as a VAI CLI demo: ingest MongoDB docs, create a vector index, and run RAG chat. End-to-end setup to working documentation chatbot from the command line.',
      xText:
        'MongoDB Developer Day RAG lab as a VAI CLI workflow: ingest, index, chat. Zero to documentation chatbot from your terminal.',
      hashtags: ['vai', 'voyageai', 'mongodb', 'rag', 'devday', 'vectorsearch'],
      callToAction: 'Run the full RAG lab end-to-end: Docker, ingest, chat.',
    },
    underTheHood: {
      vaiCommand: 'vai chat --db mongodb_genai_devday_rag --collection knowledge_base',
      voyageApi: {
        node: `// Step 1: Embed the query
const embedResponse = await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    Authorization: \`Bearer \${process.env.VOYAGE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: userQuery,
    model: 'voyage-4',
    input_type: 'query',
  }),
});

const { data } = await embedResponse.json();
const queryVector = data[0].embedding;`,
        python: `import voyageai

vo = voyageai.Client()
embedding = vo.embed(
    texts=[user_query],
    model="voyage-4",
    input_type="query",
)
query_vector = embedding.embeddings[0]`,
        curl: `curl https://api.voyageai.com/v1/embeddings \\
  -H "Authorization: Bearer $VOYAGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": ["What are some best practices for data backups?"],
    "model": "voyage-4",
    "input_type": "query"
  }'`,
      },
      mongoQuery: {
        node: `const pipeline = [
  {
    $vectorSearch: {
      index: 'vector_index',
      path: 'embedding',
      queryVector,
      numCandidates: 150,
      limit: 5,
    },
  },
  {
    $project: {
      _id: 0,
      text: 1,
      source: 1,
      score: { $meta: 'vectorSearchScore' },
    },
  },
];

const results = await collection.aggregate(pipeline).toArray();
// Context is passed to LLM with the user query`,
        python: `pipeline = [
    {
        "$vectorSearch": {
            "index": "vector_index",
            "path": "embedding",
            "queryVector": query_vector,
            "numCandidates": 150,
            "limit": 5,
        }
    },
    {
        "$project": {
            "_id": 0,
            "text": 1,
            "source": 1,
            "score": {"$meta": "vectorSearchScore"},
        }
    },
]

results = list(collection.aggregate(pipeline))
# Context is passed to LLM with the user query`,
      },
      explanations: {
        vaiCommand:
          'vai chat is the RAG entrypoint. It embeds your question, runs vector search, retrieves the top chunks, assembles a prompt with context, and calls your configured LLM to generate an answer.',
        voyageApi:
          'The embeddings API converts the user query into a vector. At ingest time, documents were embedded with input_type document. At query time, use input_type query so the vector is optimized for search.',
        mongoQuery:
          'The $vectorSearch stage finds the most semantically similar chunks. numCandidates over-samples before returning the top limit. The retrieved text becomes the context for the LLM prompt.',
      },
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
