import type { UseCaseData } from './index';

export const devdocsData: UseCaseData = {
  slug: 'devdocs',
  title: 'Developer Documentation',
  headline: 'Make Your Engineering Docs Actually Searchable',
  subheadline: 'Internal docs, API references, and runbooks: semantic search in minutes',
  description:
    'Build a searchable knowledge base from your engineering documentation using Voyage AI embeddings and MongoDB Atlas Vector Search. From scattered docs to instant answers in under 30 minutes.',
  icon: 'Code',
  accentColor: '#40E0FF',

  persona: 'Engineering lead, DevRel, platform team building internal developer experience',

  problemStatement: `Every engineering team has a documentation problem. Internal docs live across Confluence, Notion, GitHub wikis, README files, and Slack threads. The official search is terrible. Developers ask the same questions in Slack because it's faster than searching the wiki. When someone asks "How do I set up the local development environment?" the answer exists somewhere, but nobody can find it.

The irony: developers build search systems for users but can't search their own documentation. Traditional keyword search fails because engineering docs use inconsistent terminology. "Deployment," "shipping," "releasing," and "going live" might all describe the same process in different documents.`,

  solutionSummary: `vai turns your scattered documentation into a searchable knowledge base in minutes. Point it at a folder of markdown files, and it handles chunking, embedding with Voyage AI's code-optimized model, and indexing in MongoDB Atlas Vector Search. The result: semantic search that understands "How do I get the dev environment running?" finds the local-dev-setup doc, even if it never uses the word "running."`,

  voyageModel: 'voyage-code-3',
  voyageModelReason:
    'voyage-code-3 is optimized for code and technical documentation. Developer docs contain a mix of natural language, code snippets, configuration examples, and CLI commands. voyage-code-3 understands that `docker compose up` and "start the local development environment" are semantically related.',
  dbName: 'devdocs_demo',
  collectionName: 'engineering_knowledge',

  sampleDocs: [
    { filename: 'architecture-overview.md', topic: 'System architecture: microservices, event bus, data stores', sizeKb: 3 },
    { filename: 'api-authentication.md', topic: 'API auth: OAuth 2.0 flow, JWT tokens, API keys, rate limiting', sizeKb: 3 },
    { filename: 'api-endpoints-users.md', topic: 'User API endpoints: CRUD, search, permissions, pagination', sizeKb: 3 },
    { filename: 'api-endpoints-orders.md', topic: 'Order API endpoints: create, status, webhooks, idempotency', sizeKb: 3 },
    { filename: 'local-dev-setup.md', topic: 'Local development environment: Docker Compose, seed data, env vars', sizeKb: 3 },
    { filename: 'deployment-guide.md', topic: 'Deployment process: CI/CD pipeline, staging, production, rollback', sizeKb: 3 },
    { filename: 'database-schema.md', topic: 'Database schema: tables, indexes, migrations, naming conventions', sizeKb: 3 },
    { filename: 'monitoring-runbook.md', topic: 'Monitoring and alerting: Datadog dashboards, PagerDuty escalation', sizeKb: 3 },
    { filename: 'incident-response.md', topic: 'Incident response: severity levels, communication, postmortem', sizeKb: 2 },
    { filename: 'onboarding-checklist.md', topic: 'New engineer onboarding: accounts, tooling, first PR, buddy system', sizeKb: 2 },
    { filename: 'testing-strategy.md', topic: 'Testing philosophy: unit, integration, e2e, coverage targets', sizeKb: 2 },
    { filename: 'feature-flags.md', topic: 'Feature flag system: LaunchDarkly setup, naming, lifecycle, cleanup', sizeKb: 2 },
    { filename: 'error-handling.md', topic: 'Error handling patterns: error codes, retry logic, circuit breakers', sizeKb: 2 },
    { filename: 'caching-strategy.md', topic: 'Caching architecture: Redis layers, TTLs, invalidation patterns', sizeKb: 2 },
    { filename: 'adr-001-event-sourcing.md', topic: 'ADR: Adopted event sourcing for order service', sizeKb: 2 },
    { filename: 'adr-002-graphql.md', topic: 'ADR: Chose GraphQL over REST for new client API', sizeKb: 2 },
  ],
  sampleDocsZipUrl: '/use-cases/devdocs/sample-docs/sample-docs.zip',
  totalSizeKb: 40,

  walkthroughSteps: [
    {
      number: 1,
      title: 'Install vai',
      description: 'Install the vai CLI globally. If you already have it, skip to the next step.',
      command: 'npm install -g voyageai-cli',
      expectedOutput: `added 1 package in 3s

1 package is looking for funding
  run \`npm fund\` for details`,
    },
    {
      number: 2,
      title: 'Configure credentials',
      description:
        'Set your Voyage AI API key and MongoDB Atlas connection string. You can get a free Voyage AI key at dash.voyageai.com and a free MongoDB Atlas cluster at cloud.mongodb.com.',
      command: `vai config set api-key YOUR_VOYAGE_API_KEY
vai config set mongodb-uri YOUR_MONGODB_URI`,
      expectedOutput: `✓ api-key saved
✓ mongodb-uri saved`,
      notes: 'Your credentials are stored locally in ~/.vai/config.json and never shared.',
    },
    {
      number: 3,
      title: 'Download the sample documents',
      description:
        'Grab the 16-file sample documentation set. These are synthetic but realistic engineering docs covering architecture, APIs, runbooks, and ADRs.',
      command: `curl -L https://vaicli.com/use-cases/devdocs/sample-docs/sample-docs.zip -o sample-docs.zip
unzip sample-docs.zip -d ./sample-docs`,
      expectedOutput: `Archive:  sample-docs.zip
  inflating: ./sample-docs/architecture-overview.md
  inflating: ./sample-docs/api-authentication.md
  ...
  inflating: ./sample-docs/adr-002-graphql.md
  16 files extracted`,
    },
    {
      number: 4,
      title: 'Ingest and embed the documents',
      description:
        'Run the vai pipeline to chunk, embed, and index all 16 documents. This uses voyage-code-3, a model optimized for technical content, and creates a vector search index in MongoDB Atlas automatically.',
      command:
        'vai pipeline ./sample-docs/ --model voyage-code-3 --db devdocs_demo --collection engineering_knowledge --create-index',
      expectedOutput: `◼ Scanning ./sample-docs/ ...
  Found 16 files (40KB total)

◼ Chunking documents ...
  Created 127 chunks (avg 312 chars)

◼ Embedding with voyage-code-3 ...
  ████████████████████████████████ 127/127 chunks
  Embedded in 2.3s (55 chunks/sec)

◼ Storing in MongoDB Atlas ...
  Database: devdocs_demo
  Collection: engineering_knowledge
  Inserted 127 documents

◼ Creating vector search index ...
  Index "vector_index" created on field "embedding"
  Dimensions: 1024 | Similarity: cosine

✓ Pipeline complete — 16 files → 127 indexed chunks`,
    },
    {
      number: 5,
      title: 'Run your first search',
      description:
        'Test the knowledge base with a simple query. Notice how semantic search finds the right document even when the query uses different words than the source.',
      command:
        'vai search "How do I get the development environment running on my laptop?" --db devdocs_demo --collection engineering_knowledge',
      expectedOutput: `Query: "How do I get the development environment running on my laptop?"
Model: voyage-code-3 | Results: 5

1. local-dev-setup.md (score: 0.94)
   "Prerequisites: Docker Desktop 4.x+, Node.js 20 LTS, and access
    to the team 1Password vault for environment variables. Clone the
    monorepo and run docker compose up from the project root..."

2. onboarding-checklist.md (score: 0.87)
   "Day 1 Setup: Request access to GitHub org, Datadog, PagerDuty,
    and LaunchDarkly. Follow the local-dev-setup guide to get the
    development environment running on your machine..."

3. deployment-guide.md (score: 0.72)
   "Local Testing: Before pushing to staging, verify your changes
    work locally by running the full test suite against the Docker
    Compose environment..."`,
    },
    {
      number: 6,
      title: 'Try domain-specific queries',
      description:
        'Run a few more queries to see how semantic search handles cross-document retrieval, technical jargon, and questions that span multiple topics.',
      command:
        'vai search "What happens when an API request fails?" --db devdocs_demo --collection engineering_knowledge',
      expectedOutput: `Query: "What happens when an API request fails?"
Model: voyage-code-3 | Results: 5

1. error-handling.md (score: 0.93)
   "All API errors return a structured JSON response with an error
    code, human-readable message, and request ID for tracing. Client
    errors (4xx) include validation details..."

2. api-authentication.md (score: 0.82)
   "Authentication failures return 401 with a WWW-Authenticate header.
    Expired JWT tokens should be refreshed using the /auth/refresh
    endpoint. Rate limit exceeded returns 429..."

3. monitoring-runbook.md (score: 0.76)
   "Alert: API Error Rate > 5%. Escalation: Check the error-rate
    Datadog dashboard. Common causes: upstream service degradation,
    database connection pool exhaustion..."`,
    },
    {
      number: 7,
      title: 'Explore in the playground',
      description:
        'Launch the vai playground for a visual interface. Browse your indexed documents, run queries interactively, and see similarity scores visualized.',
      command: 'vai playground',
      expectedOutput: `◼ Starting vai playground ...
  Server running at http://localhost:1958

  Open your browser to explore:
  • Search your knowledge base
  • Compare embedding models
  • Visualize similarity scores`,
      notes:
        'The playground connects to the same MongoDB collection, so your devdocs knowledge base is ready to query visually.',
    },
  ],

  exampleQueries: [
    {
      query: 'How do I get the development environment running on my laptop?',
      explanation:
        'The most common new-hire question. Tests retrieval from the local-dev-setup doc using natural language that differs from the document title.',
      sampleResults: [
        {
          source: 'local-dev-setup.md',
          relevance: 0.94,
          snippet:
            'Prerequisites: Docker Desktop 4.x+, Node.js 20 LTS, and access to the team 1Password vault for environment variables. Clone the monorepo and run docker compose up from the project root.',
        },
        {
          source: 'onboarding-checklist.md',
          relevance: 0.87,
          snippet:
            'Day 1 Setup: Follow the local-dev-setup guide to get the development environment running. Your onboarding buddy can help if you hit issues with the VPN or Docker networking.',
        },
      ],
    },
    {
      query: 'What happens when an API request fails and how do we handle errors?',
      explanation:
        'Tests cross-document retrieval: spans error-handling patterns, API endpoint docs, and the monitoring runbook.',
      sampleResults: [
        {
          source: 'error-handling.md',
          relevance: 0.93,
          snippet:
            'All API errors return a structured JSON response with an error code, human-readable message, and request ID. Retry logic uses exponential backoff with jitter.',
        },
        {
          source: 'api-authentication.md',
          relevance: 0.82,
          snippet:
            'Authentication failures return 401 with a WWW-Authenticate header. Rate limit exceeded returns 429 with a Retry-After header.',
        },
        {
          source: 'monitoring-runbook.md',
          relevance: 0.76,
          snippet:
            'Alert: API Error Rate > 5%. Check the error-rate Datadog dashboard. Common causes: upstream service degradation, database connection pool exhaustion.',
        },
      ],
    },
    {
      query: "What's the process for deploying to production?",
      explanation:
        'Tests retrieval from the deployment guide, CI/CD pipeline docs, and feature flag lifecycle.',
      sampleResults: [
        {
          source: 'deployment-guide.md',
          relevance: 0.95,
          snippet:
            'Production deployments go through three stages: PR review and CI checks, staging deployment with smoke tests, and production rollout via blue-green deployment.',
        },
        {
          source: 'feature-flags.md',
          relevance: 0.78,
          snippet:
            'All new features must be behind a feature flag before deploying to production. Flags follow the naming convention: team.feature-name. Remove flags within 30 days of full rollout.',
        },
      ],
    },
    {
      query: 'Why did we choose event sourcing for the order service?',
      explanation:
        'Tests architectural decision record (ADR) retrieval. ADRs are a specific document type that captures rationale.',
      sampleResults: [
        {
          source: 'adr-001-event-sourcing.md',
          relevance: 0.96,
          snippet:
            'Decision: Adopt event sourcing for the order service. Context: Order state transitions are complex, auditability is a regulatory requirement, and we need to support retroactive corrections.',
        },
        {
          source: 'architecture-overview.md',
          relevance: 0.71,
          snippet:
            'The order service uses event sourcing with a Kafka-backed event store. All state changes are captured as immutable events, enabling full audit trails and temporal queries.',
        },
      ],
    },
    {
      query: 'How do I add a new API endpoint with authentication?',
      explanation:
        'A practical "how do I" question that spans API auth docs, endpoint patterns, and the testing strategy.',
      sampleResults: [
        {
          source: 'api-authentication.md',
          relevance: 0.89,
          snippet:
            'New endpoints must specify their auth requirements in the route decorator. Public endpoints use @Public(), authenticated endpoints use @RequireAuth(), and admin endpoints use @RequireRole("admin").',
        },
        {
          source: 'api-endpoints-users.md',
          relevance: 0.83,
          snippet:
            'Endpoint pattern: define the route in the controller, add request/response DTOs with validation, register in the module, and add integration tests.',
        },
        {
          source: 'testing-strategy.md',
          relevance: 0.72,
          snippet:
            'API endpoints require both unit tests for business logic and integration tests for the full HTTP request cycle including authentication and authorization.',
        },
      ],
    },
  ],

  modelComparison: {
    recommended: 'voyage-code-3',
    alternatives: [
      {
        model: 'voyage-code-3',
        score: 0.94,
        notes:
          'Purpose-built for code and technical docs. Best at understanding mixed prose, code snippets, and CLI commands in the same document.',
      },
      {
        model: 'voyage-4-large',
        score: 0.89,
        notes:
          'Excellent general-purpose model. Slightly lower relevance on code-heavy docs, but strong on pure prose sections like ADRs and onboarding guides.',
      },
      {
        model: 'voyage-4-lite',
        score: 0.82,
        notes:
          'Fastest and cheapest option. Good enough for simple queries, but misses nuance in technical jargon and code-comment relationships.',
      },
    ],
    comparisonNarrative:
      'For developer documentation, voyage-code-3 consistently outperforms general-purpose models on queries that mix natural language with technical concepts. The difference is most noticeable on queries like "How do I add a new endpoint with auth?" where the model needs to connect prose instructions with code patterns. For pure text documentation (policies, onboarding guides), the gap narrows, and voyage-4-large is a strong alternative.',
  },

  scalingNotes: [
    {
      title: 'Source diversity',
      content:
        'Real engineering docs come from multiple sources: Git repos, Confluence, Notion, Google Docs. vai pipeline accepts any folder of text files. Export your docs to markdown, point vai at the folder, and the pipeline handles the rest.',
      icon: 'FolderOpen',
    },
    {
      title: 'Keeping docs current',
      content:
        'Engineering docs change constantly. Re-run vai pipeline on updated files and it will re-chunk, re-embed, and update only the changed documents. Set up a cron job or CI hook to keep your knowledge base in sync.',
      icon: 'Refresh',
    },
    {
      title: 'Cost at scale',
      content:
        'A typical engineering org has 500 to 5,000 pages of documentation. At this scale, the initial embedding costs pennies with voyage-code-3, and queries cost fractions of a cent each. Use vai estimate to project costs for your corpus.',
      icon: 'Payments',
    },
    {
      title: 'MCP server integration',
      content:
        'vai mcp-server exposes your knowledge base to AI coding assistants (Cursor, Claude Code, Windsurf). Your team\'s docs become available to every developer\'s AI agent, so "How do I deploy?" gets answered from your actual runbook.',
      icon: 'SmartToy',
    },
    {
      title: 'Conversational interface',
      content:
        'The natural next step is vai chat, which adds a conversational layer on top of your knowledge base. New hires can ask questions in natural language and get answers grounded in your team\'s actual documentation.',
      icon: 'Chat',
    },
  ],

  keywords: [
    'developer documentation search',
    'engineering docs',
    'internal documentation',
    'semantic search',
    'code search',
    'API documentation',
    'runbook search',
    'voyage-code-3',
    'vector search',
    'RAG pipeline',
    'knowledge base',
    'developer experience',
  ],
};
