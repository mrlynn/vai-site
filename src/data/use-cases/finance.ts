import type { UseCaseData } from './index';

export const financeData: UseCaseData = {
  slug: 'finance',
  title: 'Financial Services',
  headline: 'Semantic Search Across Financial Documents, In Minutes',
  subheadline: 'Earnings calls, risk reports, and policy docs, searchable with a model trained on financial text',
  description:
    'Build a searchable knowledge base from financial documents using Voyage AI\'s finance-domain embedding model and MongoDB Atlas Vector Search. From earnings calls to risk reports, instant semantic search in under 30 minutes.',
  icon: 'TrendingUp',
  accentColor: '#FFC010',

  persona: 'Fintech developer, quantitative analyst, risk team building internal tools',

  problemStatement: `Financial analysis requires synthesizing information across dozens of documents: earnings call transcripts, 10-K filings, risk committee reports, internal policy memos, and market research. An analyst asking "What did management say about margin pressure?" needs to find the relevant passage across hundreds of pages of transcripts, and keyword search returns far too many results for "margin" alone.

The financial domain also has its own vocabulary challenges. "Headwinds" means challenges. "Color" means additional detail. "Constructive" means cautiously optimistic. A semantic search system trained on financial text understands these conventions; a generic one doesn't.`,

  solutionSummary:
    'vai turns your financial document library into a searchable knowledge base in minutes. Point it at a folder of earnings transcripts, risk reports, and policy documents, and it handles chunking, embedding with Voyage AI\'s finance-domain model, and indexing in MongoDB Atlas Vector Search. The result: semantic search that understands "What are our biggest risk exposures?" finds answers across risk committee reports, market risk frameworks, and credit policies.',

  voyageModel: 'voyage-finance-2',
  voyageModelReason:
    'voyage-finance-2 is purpose-built for financial text. Financial jargon ("headwinds," "run-rate," "accretive," "mark-to-market") has domain-specific semantics that general models may miss. Earnings call language follows conventions that voyage-finance-2 was trained to understand.',
  dbName: 'finance_demo',
  collectionName: 'financial_knowledge',

  sampleDocs: [
    { filename: 'q3-2025-earnings-call.md', topic: 'Acme Corp Q3 2025 earnings call: revenue beat, margin pressure', sizeKb: 4 },
    { filename: 'q4-2025-earnings-call.md', topic: 'Q4 2025 earnings call: full-year results, 2026 guidance', sizeKb: 4 },
    { filename: 'q3-2025-10q-summary.md', topic: '10-Q highlights: revenue breakdown, operating expenses, risk factors', sizeKb: 3 },
    { filename: 'annual-report-summary.md', topic: 'Annual report executive summary: strategy, markets, competition', sizeKb: 3 },
    { filename: 'risk-committee-report.md', topic: 'Risk committee quarterly report: credit, market, operational risk', sizeKb: 3 },
    { filename: 'credit-policy.md', topic: 'Corporate credit policy: approval tiers, concentration limits', sizeKb: 3 },
    { filename: 'market-risk-framework.md', topic: 'Market risk management: VaR methodology, stress testing', sizeKb: 2 },
    { filename: 'interest-rate-analysis.md', topic: 'Interest rate sensitivity: duration gaps, hedging strategy', sizeKb: 2 },
    { filename: 'liquidity-policy.md', topic: 'Liquidity management: reserve requirements, stress scenarios', sizeKb: 2 },
    { filename: 'compliance-aml-summary.md', topic: 'AML/KYC compliance: CDD requirements, SAR filing triggers', sizeKb: 3 },
    { filename: 'vendor-risk-assessment.md', topic: 'Third-party vendor risk: tiering, due diligence framework', sizeKb: 2 },
    { filename: 'capital-allocation-memo.md', topic: 'Capital allocation strategy: dividends, buybacks, M&A criteria', sizeKb: 2 },
    { filename: 'esg-report-summary.md', topic: 'ESG report: carbon targets, diversity metrics, governance', sizeKb: 2 },
    { filename: 'fintech-partnership-memo.md', topic: 'Strategic memo: fintech partnership, embedded finance, API strategy', sizeKb: 2 },
    { filename: 'regulatory-change-tracker.md', topic: 'Regulatory changes: Basel IV, DORA, SEC climate disclosure', sizeKb: 2 },
  ],
  sampleDocsZipUrl: '/use-cases/finance/sample-docs/sample-docs.zip',
  totalSizeKb: 39,

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
        'Grab the 15-file sample financial document set. These are synthetic but realistic documents for a fictional public company (Acme Corp), including earnings calls, risk reports, and policy memos.',
      command: `curl -L https://vaicli.com/use-cases/finance/sample-docs/sample-docs.zip -o sample-docs.zip
unzip sample-docs.zip -d ./sample-docs`,
      expectedOutput: `Archive:  sample-docs.zip
  inflating: ./sample-docs/q3-2025-earnings-call.md
  inflating: ./sample-docs/q4-2025-earnings-call.md
  ...
  inflating: ./sample-docs/regulatory-change-tracker.md
  15 files extracted`,
    },
    {
      number: 4,
      title: 'Ingest and embed the documents',
      description:
        'Run the vai pipeline to chunk, embed, and index all 15 documents. This uses voyage-finance-2, a model trained specifically on financial text, and creates a vector search index in MongoDB Atlas.',
      command:
        'vai pipeline ./sample-docs/ --model voyage-finance-2 --db finance_demo --collection financial_knowledge --create-index',
      expectedOutput: `◼ Scanning ./sample-docs/ ...
  Found 15 files (39KB total)

◼ Chunking documents ...
  Created 156 chunks (avg 250 chars)

◼ Embedding with voyage-finance-2 ...
  ████████████████████████████████ 156/156 chunks
  Embedded in 3.1s (50 chunks/sec)

◼ Storing in MongoDB Atlas ...
  Database: finance_demo
  Collection: financial_knowledge
  Inserted 156 documents

◼ Creating vector search index ...
  Index "vector_index" created on field "embedding"
  Dimensions: 1024 | Similarity: cosine

✓ Pipeline complete — 15 files → 156 indexed chunks`,
    },
    {
      number: 5,
      title: 'Run your first search',
      description:
        'Test the knowledge base with a query that uses financial language. Notice how the finance-domain model understands terms like "margin compression" and "headwinds."',
      command:
        'vai search "What did management say about margin compression and how are they addressing it?" --db finance_demo --collection financial_knowledge',
      expectedOutput: `Query: "What did management say about margin compression and how are they addressing it?"
Model: voyage-finance-2 | Results: 5

1. q3-2025-earnings-call.md (score: 0.94)
   "On margins, we saw about 80 basis points of compression this
    quarter, primarily driven by input cost headwinds and the
    product mix shift toward our enterprise tier. We expect to
    recover roughly half of that through pricing actions in Q1..."

2. q4-2025-earnings-call.md (score: 0.89)
   "For the full year, gross margins came in at 62.3%, down from
    64.1% in the prior year. The team has executed well on our
    cost optimization program, and we're guiding to margin
    expansion in the back half of 2026..."

3. annual-report-summary.md (score: 0.82)
   "Profitability: Gross margin declined 180 basis points
    year-over-year due to elevated cloud infrastructure costs
    and competitive pricing pressure in the mid-market segment..."`,
    },
    {
      number: 6,
      title: 'Try cross-document queries',
      description:
        'Run queries that span risk reports, policy documents, and earnings calls. This is where semantic search on financial text is most powerful.',
      command:
        'vai search "What are our biggest risk exposures right now?" --db finance_demo --collection financial_knowledge',
      expectedOutput: `Query: "What are our biggest risk exposures right now?"
Model: voyage-finance-2 | Results: 5

1. risk-committee-report.md (score: 0.93)
   "Top Risks This Quarter: (1) Interest rate volatility and its
    impact on our fixed-income portfolio, (2) Concentration risk
    in our top-5 enterprise accounts representing 34% of ARR,
    (3) Regulatory uncertainty around pending SEC climate rules..."

2. market-risk-framework.md (score: 0.87)
   "Current VaR at the 99th percentile stands at $4.2M, up from
    $3.8M last quarter. The increase is primarily attributable to
    heightened equity market volatility and widening credit spreads
    in our corporate bond holdings..."

3. credit-policy.md (score: 0.81)
   "Concentration Limits: No single counterparty shall represent
    more than 10% of total credit exposure. The current top
    exposure is 8.7%, approaching the threshold..."`,
    },
    {
      number: 7,
      title: 'Explore in the playground',
      description:
        'Launch the vai playground for a visual interface. Browse your indexed financial documents, run queries interactively, and use vai estimate to project costs for your actual document volume.',
      command: 'vai playground',
      expectedOutput: `◼ Starting vai playground ...
  Server running at http://localhost:1958

  Open your browser to explore:
  • Search your knowledge base
  • Compare embedding models
  • Visualize similarity scores`,
      notes:
        'Try vai estimate to see what it would cost to embed your full document library. Finance audiences care about unit economics.',
    },
  ],

  exampleQueries: [
    {
      query: 'What did management say about margin compression and how are they addressing it?',
      explanation:
        'Tests earnings call retrieval with nuanced financial language. "Margin compression," "headwinds," and "pricing actions" are financial idioms the domain model understands.',
      sampleResults: [
        {
          source: 'q3-2025-earnings-call.md',
          relevance: 0.94,
          snippet:
            'On margins, we saw about 80 basis points of compression this quarter, primarily driven by input cost headwinds and the product mix shift toward our enterprise tier.',
        },
        {
          source: 'q4-2025-earnings-call.md',
          relevance: 0.89,
          snippet:
            'For the full year, gross margins came in at 62.3%, down from 64.1% in the prior year. The team has executed well on our cost optimization program.',
        },
      ],
    },
    {
      query: 'What are our biggest risk exposures right now?',
      explanation:
        'Spans the risk committee report, market risk framework, and credit policy. Tests the model\'s ability to connect "risk exposure" across different document contexts.',
      sampleResults: [
        {
          source: 'risk-committee-report.md',
          relevance: 0.93,
          snippet:
            'Top Risks This Quarter: (1) Interest rate volatility, (2) Concentration risk in top-5 enterprise accounts representing 34% of ARR, (3) Regulatory uncertainty.',
        },
        {
          source: 'market-risk-framework.md',
          relevance: 0.87,
          snippet:
            'Current VaR at the 99th percentile stands at $4.2M, up from $3.8M last quarter. The increase is primarily attributable to heightened equity market volatility.',
        },
        {
          source: 'credit-policy.md',
          relevance: 0.81,
          snippet:
            'Concentration Limits: No single counterparty shall represent more than 10% of total credit exposure. The current top exposure is 8.7%, approaching the threshold.',
        },
      ],
    },
    {
      query: 'How are we preparing for upcoming regulatory changes?',
      explanation:
        'Tests the regulatory change tracker and compliance documents. Financial firms face constant regulatory evolution.',
      sampleResults: [
        {
          source: 'regulatory-change-tracker.md',
          relevance: 0.95,
          snippet:
            'Basel IV Implementation (Q3 2026): Revised standardized approach for credit risk. Impact assessment in progress. Estimated capital increase of 8-12%.',
        },
        {
          source: 'compliance-aml-summary.md',
          relevance: 0.83,
          snippet:
            'Upcoming changes to beneficial ownership reporting requirements under the Corporate Transparency Act. Implementation deadline: January 2027. Gap analysis initiated.',
        },
      ],
    },
    {
      query: "What's the capital return strategy for next year?",
      explanation:
        'Tests capital allocation memo and earnings call guidance. Financial analysts frequently ask about capital return plans.',
      sampleResults: [
        {
          source: 'capital-allocation-memo.md',
          relevance: 0.94,
          snippet:
            'FY2026 Capital Return Framework: (1) Maintain quarterly dividend of $0.35/share, (2) Authorize new $500M share repurchase program, (3) Reserve $200M for tuck-in M&A opportunities.',
        },
        {
          source: 'q4-2025-earnings-call.md',
          relevance: 0.88,
          snippet:
            'On capital allocation, our board approved a new $500 million buyback program. Combined with the dividend, we expect to return approximately 60% of free cash flow to shareholders in 2026.',
        },
      ],
    },
    {
      query: 'Do we have concentration risk in our vendor relationships?',
      explanation:
        'Tests the vendor risk assessment against credit policy. A practical compliance question that spans two policy documents.',
      sampleResults: [
        {
          source: 'vendor-risk-assessment.md',
          relevance: 0.92,
          snippet:
            'Tier 1 Vendors (Critical): AWS (infrastructure, $8.2M annually), Stripe (payments, $2.1M), Snowflake (analytics, $1.4M). Single points of failure identified for AWS and Stripe.',
        },
        {
          source: 'credit-policy.md',
          relevance: 0.79,
          snippet:
            'Vendor Concentration: Operational dependency on any single vendor exceeding $5M in annual spend requires board-level risk acknowledgment and documented contingency planning.',
        },
      ],
    },
  ],

  modelComparison: {
    recommended: 'voyage-finance-2',
    alternatives: [
      {
        model: 'voyage-finance-2',
        score: 0.94,
        notes:
          'Purpose-built for financial text. Best at understanding financial jargon, earnings call conventions, and risk terminology.',
      },
      {
        model: 'voyage-4-large',
        score: 0.86,
        notes:
          'Strong general-purpose model. Handles straightforward financial queries well, but misses nuance in domain-specific terminology like "headwinds" and "run-rate."',
      },
      {
        model: 'voyage-4-lite',
        score: 0.77,
        notes:
          'Fastest and cheapest. Adequate for simple lookups, but lacks the financial vocabulary understanding needed for analyst-quality retrieval.',
      },
    ],
    comparisonNarrative:
      'For financial documents, voyage-finance-2 provides measurably better retrieval on queries that use domain-specific language. The difference is most apparent on earnings call queries where terms like "headwinds," "constructive," and "run-rate" carry specific financial meaning that general models may not capture. The cost difference between voyage-finance-2 and voyage-4-large is marginal for most document volumes, making the domain model the clear choice for financial applications.',
  },

  scalingNotes: [
    {
      title: 'Data sensitivity',
      content:
        'Financial documents often contain material non-public information (MNPI). Embedding vectors sent to Voyage AI do not contain readable text, but the text chunks stored in MongoDB do. Ensure your Atlas cluster meets your compliance requirements.',
      icon: 'Security',
    },
    {
      title: 'Scale projections',
      content:
        'An investment firm might ingest 10,000+ documents (transcripts, filings, research notes). At this scale, vai estimate shows embedding costs remain low with voyage-finance-2. Asymmetric retrieval (short queries against long documents) further reduces per-query costs.',
      icon: 'Payments',
    },
    {
      title: 'Metadata filtering',
      content:
        'Financial search often needs filters by date, company, or document type. vai supports metadata filters, so you can narrow results to "only Q3 2025 documents" or "only risk reports" before semantic ranking applies.',
      icon: 'FilterAlt',
    },
    {
      title: 'Real-time ingestion',
      content:
        'Earnings calls and filings arrive on a schedule. vai pipeline can be automated as part of an ingestion workflow, embedding new documents as they land and making them searchable within minutes.',
      icon: 'Refresh',
    },
    {
      title: 'Conversational interface',
      content:
        'The natural next step is vai chat: an analyst asking "Summarize what management said about cloud spending across the last four quarters" and getting answers grounded in actual transcript text.',
      icon: 'Chat',
    },
  ],

  keywords: [
    'financial document search',
    'earnings call search',
    'risk report search',
    'financial AI',
    'voyage-finance-2',
    'financial embeddings',
    'regulatory compliance search',
    'fintech search',
    'financial knowledge base',
    'semantic financial search',
    'ESG reporting',
    '10-K search',
  ],
};
