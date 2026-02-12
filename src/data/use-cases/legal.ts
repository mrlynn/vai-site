import type { UseCaseData } from './index';

export const legalData: UseCaseData = {
  slug: 'legal',
  title: 'Legal & Compliance',
  headline: 'Turn Your Contract Library Into a Searchable Knowledge Base',
  subheadline: 'Semantic search across legal documents, powered by a model trained on legal text',
  description:
    'Build a searchable knowledge base from contracts, policies, and regulatory documents using Voyage AI\'s legal-domain embedding model and MongoDB Atlas Vector Search. From scattered legal docs to instant answers in under 30 minutes.',
  icon: 'Gavel',
  accentColor: '#B45AF2',

  persona: 'Legal technologist, compliance officer, paralegal building search tools',

  problemStatement: `Legal professionals spend 20 to 40% of their time searching for information. Contract review requires cross-referencing clauses across dozens of agreements. Compliance teams must verify that policies align with regulatory requirements, often across hundreds of pages of regulation. Due diligence involves reading rooms full of documents to find specific provisions.

Keyword search fails legal work because legal language is deliberately precise but wildly inconsistent across documents. One contract says "indemnification," another says "hold harmless," a third says "defense and indemnity," all meaning approximately the same thing. A search for any one term misses the others. Semantic search understands the meaning, not just the words.`,

  solutionSummary:
    'vai turns your contract library into a searchable knowledge base in minutes. Point it at a folder of legal documents, and it handles chunking, embedding with Voyage AI\'s legal-domain model, and indexing in MongoDB Atlas Vector Search. The result: semantic search that understands "What are our data deletion obligations?" finds answers across your GDPR summary, CCPA policy, privacy policy, and data processing addendum, even when each uses different terminology.',

  voyageModel: 'voyage-law-2',
  voyageModelReason:
    'voyage-law-2 is Voyage AI\'s domain-specific model trained on legal text. Legal vocabulary has distinct semantic patterns: "consideration" means something entirely different in contract law vs. general English. voyage-law-2 captures these domain-specific relationships that a general-purpose model may miss.',
  dbName: 'legal_demo',
  collectionName: 'legal_knowledge',

  sampleDocs: [
    { filename: 'master-services-agreement.md', topic: 'MSA template: scope, payment terms, IP provisions', sizeKb: 4 },
    { filename: 'saas-subscription-agreement.md', topic: 'SaaS terms: uptime SLA, data handling, renewal/termination', sizeKb: 3 },
    { filename: 'data-processing-addendum.md', topic: 'DPA with GDPR and CCPA provisions, sub-processor obligations', sizeKb: 3 },
    { filename: 'nda-mutual.md', topic: 'Mutual NDA: definition of confidential info, exclusions, term', sizeKb: 2 },
    { filename: 'nda-unilateral.md', topic: 'One-way NDA: receiving party obligations, return/destruction', sizeKb: 2 },
    { filename: 'employment-agreement.md', topic: 'Employment terms: compensation, benefits, non-compete', sizeKb: 3 },
    { filename: 'independent-contractor.md', topic: 'Contractor agreement: deliverables, IP assignment, indemnification', sizeKb: 3 },
    { filename: 'privacy-policy.md', topic: 'Company privacy policy: data collection, retention, user rights', sizeKb: 3 },
    { filename: 'acceptable-use-policy.md', topic: 'AUP for SaaS product: prohibited uses, enforcement, liability caps', sizeKb: 2 },
    { filename: 'ip-assignment-agreement.md', topic: 'IP assignment: work product, prior inventions, moral rights', sizeKb: 2 },
    { filename: 'gdpr-compliance-summary.md', topic: 'GDPR requirements: lawful basis, data subject rights, DPO', sizeKb: 3 },
    { filename: 'ccpa-compliance-summary.md', topic: 'CCPA requirements: consumer rights, opt-out, service providers', sizeKb: 3 },
    { filename: 'soc2-policy-overview.md', topic: 'SOC 2 Trust Services Criteria: security, availability, confidentiality', sizeKb: 2 },
    { filename: 'limitation-of-liability.md', topic: 'Analysis of liability cap patterns across contract types', sizeKb: 2 },
    { filename: 'force-majeure-clauses.md', topic: 'Force majeure provisions: triggering events, notice, remedies', sizeKb: 2 },
  ],
  sampleDocsZipUrl: '/use-cases/legal/sample-docs/sample-docs.zip',
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
        'Grab the 15-file sample legal document set. These are synthetic but realistic contracts, policies, and regulatory summaries covering a fictional company\'s legal library.',
      command: `curl -L https://vai.mlynn.org/use-cases/legal/sample-docs/sample-docs.zip -o sample-docs.zip
unzip sample-docs.zip -d ./sample-docs`,
      expectedOutput: `Archive:  sample-docs.zip
  inflating: ./sample-docs/master-services-agreement.md
  inflating: ./sample-docs/saas-subscription-agreement.md
  ...
  inflating: ./sample-docs/force-majeure-clauses.md
  15 files extracted`,
    },
    {
      number: 4,
      title: 'Ingest and embed the documents',
      description:
        'Run the vai pipeline to chunk, embed, and index all 15 documents. This uses voyage-law-2, a model specifically trained on legal text, and creates a vector search index in MongoDB Atlas.',
      command:
        'vai pipeline ./sample-docs/ --model voyage-law-2 --db legal_demo --collection legal_knowledge --create-index',
      expectedOutput: `◼ Scanning ./sample-docs/ ...
  Found 15 files (39KB total)

◼ Chunking documents ...
  Created 142 chunks (avg 274 chars)

◼ Embedding with voyage-law-2 ...
  ████████████████████████████████ 142/142 chunks
  Embedded in 2.8s (51 chunks/sec)

◼ Storing in MongoDB Atlas ...
  Database: legal_demo
  Collection: legal_knowledge
  Inserted 142 documents

◼ Creating vector search index ...
  Index "vector_index" created on field "embedding"
  Dimensions: 1024 | Similarity: cosine

✓ Pipeline complete — 15 files → 142 indexed chunks`,
    },
    {
      number: 5,
      title: 'Run your first search',
      description:
        'Test the knowledge base with a query that spans multiple documents. Notice how the legal-domain model finds relevant clauses even when the terminology differs.',
      command:
        'vai search "What are our obligations if a customer requests deletion of their data?" --db legal_demo --collection legal_knowledge',
      expectedOutput: `Query: "What are our obligations if a customer requests deletion of their data?"
Model: voyage-law-2 | Results: 5

1. gdpr-compliance-summary.md (score: 0.95)
   "Right to Erasure (Article 17): Data subjects have the right to
    obtain from the controller the erasure of personal data without
    undue delay. The controller shall erase personal data within
    30 days of receiving a verified request..."

2. ccpa-compliance-summary.md (score: 0.91)
   "Right to Delete (Section 1798.105): A consumer shall have the
    right to request that a business delete any personal information
    about the consumer which the business has collected..."

3. data-processing-addendum.md (score: 0.88)
   "Data Deletion: Upon termination of the Agreement or upon
    Controller's written request, Processor shall delete all
    Personal Data processed on behalf of the Controller..."`,
    },
    {
      number: 6,
      title: 'Try cross-document queries',
      description:
        'Run queries that require understanding legal concepts across different document types. This is where semantic search shines over keyword search.',
      command:
        'vai search "Compare the indemnification provisions across our contracts" --db legal_demo --collection legal_knowledge',
      expectedOutput: `Query: "Compare the indemnification provisions across our contracts"
Model: voyage-law-2 | Results: 5

1. independent-contractor.md (score: 0.93)
   "Indemnification: Contractor shall indemnify, defend, and hold
    harmless Company from any claims, damages, or expenses arising
    from Contractor's breach of this Agreement or negligence..."

2. master-services-agreement.md (score: 0.90)
   "Mutual Indemnification: Each party shall indemnify the other
    against third-party claims arising from (a) breach of
    representations, (b) willful misconduct, or (c) violation
    of applicable law..."

3. saas-subscription-agreement.md (score: 0.85)
   "Provider Indemnification: Provider shall defend Customer against
    any claim that the Service infringes a third party's intellectual
    property rights..."`,
    },
    {
      number: 7,
      title: 'Explore in the playground',
      description:
        'Launch the vai playground for a visual interface. Browse your indexed legal documents, run queries interactively, and compare how different models handle legal terminology.',
      command: 'vai playground',
      expectedOutput: `◼ Starting vai playground ...
  Server running at http://localhost:1958

  Open your browser to explore:
  • Search your knowledge base
  • Compare embedding models
  • Visualize similarity scores`,
      notes:
        'Try comparing voyage-law-2 results with voyage-4-large on the same legal query to see how the domain-specific model captures legal semantics.',
    },
  ],

  exampleQueries: [
    {
      query: 'What are our obligations if a customer requests deletion of their data?',
      explanation:
        'Spans four documents: GDPR summary, CCPA summary, privacy policy, and DPA. Tests cross-document retrieval on the same legal concept expressed differently in each.',
      sampleResults: [
        {
          source: 'gdpr-compliance-summary.md',
          relevance: 0.95,
          snippet:
            'Right to Erasure (Article 17): Data subjects have the right to obtain from the controller the erasure of personal data without undue delay. The controller shall erase personal data within 30 days of receiving a verified request.',
        },
        {
          source: 'ccpa-compliance-summary.md',
          relevance: 0.91,
          snippet:
            'Right to Delete (Section 1798.105): A consumer shall have the right to request that a business delete any personal information about the consumer which the business has collected.',
        },
        {
          source: 'data-processing-addendum.md',
          relevance: 0.88,
          snippet:
            'Upon termination of the Agreement or upon Controller\'s written request, Processor shall delete all Personal Data processed on behalf of the Controller within 30 calendar days.',
        },
      ],
    },
    {
      query: 'Compare the indemnification provisions across our contracts',
      explanation:
        'Tests retrieval across MSA, contractor agreement, and SaaS agreement. Each uses slightly different indemnification language ("hold harmless," "defend and indemnify," "mutual indemnification").',
      sampleResults: [
        {
          source: 'independent-contractor.md',
          relevance: 0.93,
          snippet:
            'Contractor shall indemnify, defend, and hold harmless Company from any claims, damages, or expenses arising from Contractor\'s breach of this Agreement or negligence.',
        },
        {
          source: 'master-services-agreement.md',
          relevance: 0.90,
          snippet:
            'Mutual Indemnification: Each party shall indemnify the other against third-party claims arising from (a) breach of representations, (b) willful misconduct, or (c) violation of applicable law.',
        },
      ],
    },
    {
      query: 'What happens if we cannot meet the SLA due to a natural disaster?',
      explanation:
        'Tests the intersection of force majeure provisions and SLA commitments across the SaaS agreement and force majeure clauses document.',
      sampleResults: [
        {
          source: 'force-majeure-clauses.md',
          relevance: 0.94,
          snippet:
            'Neither party shall be liable for delays or failures in performance resulting from causes beyond the reasonable control of such party, including acts of God, natural disasters, war, terrorism, or pandemic.',
        },
        {
          source: 'saas-subscription-agreement.md',
          relevance: 0.86,
          snippet:
            'Service Level Credits shall not apply to downtime caused by Force Majeure Events as defined in Section 12, provided that Provider gives prompt written notice and uses commercially reasonable efforts to resume service.',
        },
      ],
    },
    {
      query: 'Do our NDAs allow sharing confidential information with sub-processors?',
      explanation:
        'Tests NDA exception clauses against DPA sub-processor provisions. A nuanced legal question requiring cross-document reasoning.',
      sampleResults: [
        {
          source: 'nda-mutual.md',
          relevance: 0.91,
          snippet:
            'Permitted Disclosures: The Receiving Party may disclose Confidential Information to its employees, contractors, and agents who have a need to know and are bound by confidentiality obligations no less protective than this Agreement.',
        },
        {
          source: 'data-processing-addendum.md',
          relevance: 0.87,
          snippet:
            'Sub-Processors: Processor shall not engage a sub-processor without prior written authorization from Controller. Processor shall ensure that sub-processors are bound by data protection obligations no less stringent than those in this Addendum.',
        },
      ],
    },
    {
      query: 'What non-compete restrictions apply to former employees?',
      explanation:
        'Tests precise retrieval from the employment agreement, specifically the restrictive covenants section.',
      sampleResults: [
        {
          source: 'employment-agreement.md',
          relevance: 0.96,
          snippet:
            'Non-Competition: For a period of twelve (12) months following termination, Employee shall not engage in or provide services to any Competing Business within the Geographic Territory, defined as any market in which the Company actively conducts business.',
        },
        {
          source: 'independent-contractor.md',
          relevance: 0.72,
          snippet:
            'Non-Solicitation: During the term and for twelve (12) months thereafter, Contractor shall not solicit or attempt to solicit any employee or customer of Company.',
        },
      ],
    },
  ],

  modelComparison: {
    recommended: 'voyage-law-2',
    alternatives: [
      {
        model: 'voyage-law-2',
        score: 0.95,
        notes:
          'Purpose-built for legal text. Best at distinguishing legal terms that have different meanings in general English ("consideration," "party," "instrument").',
      },
      {
        model: 'voyage-4-large',
        score: 0.87,
        notes:
          'Strong general-purpose model. Handles straightforward legal queries well, but misses nuance in cross-referencing clauses and legal term disambiguation.',
      },
      {
        model: 'voyage-4-lite',
        score: 0.78,
        notes:
          'Fast and cost-effective. Adequate for simple keyword-like queries, but struggles with the semantic precision legal search demands.',
      },
    ],
    comparisonNarrative:
      'For legal documents, voyage-law-2 consistently outperforms general-purpose models on queries that require understanding legal-specific semantics. The difference is most pronounced on queries like "Compare indemnification provisions" where the model needs to recognize that "hold harmless," "defend and indemnify," and "mutual indemnification" all refer to the same legal concept. For simple factual retrieval, the gap narrows, but the domain model is the clear choice for any serious legal search application.',
  },

  scalingNotes: [
    {
      title: 'Privilege and confidentiality',
      content:
        'Documents stay in your MongoDB Atlas cluster. Text is sent to Voyage AI for embedding (see their data handling policy). The resulting vectors do not contain readable text, but the stored chunks in MongoDB do. Plan your access controls accordingly.',
      icon: 'Security',
    },
    {
      title: 'Contract volume',
      content:
        'A mid-size company might have 500 to 5,000 contracts. At this scale, initial embedding costs are modest with voyage-law-2, and queries cost fractions of a cent. Use vai estimate to project costs for your corpus size.',
      icon: 'Payments',
    },
    {
      title: 'Metadata filtering',
      content:
        'Legal search often needs filters by contract type, counterparty, or date range. vai supports metadata filters on search, so you can narrow results to "only NDAs signed in the last 2 years" before semantic ranking applies.',
      icon: 'FilterAlt',
    },
    {
      title: 'Keeping documents current',
      content:
        'Contracts get amended, policies get updated. Re-run vai pipeline on updated files and it will re-chunk, re-embed, and update only the changed documents. Automate this as part of your document management workflow.',
      icon: 'Refresh',
    },
    {
      title: 'Conversational interface',
      content:
        'The natural next step is vai chat: a compliance officer asking "Do we have any contracts expiring in the next 90 days with auto-renewal clauses?" and getting answers grounded in actual contract text.',
      icon: 'Chat',
    },
  ],

  keywords: [
    'legal document search',
    'contract search',
    'compliance search',
    'legal AI',
    'voyage-law-2',
    'legal embeddings',
    'contract review',
    'NDA search',
    'GDPR compliance',
    'CCPA compliance',
    'legal knowledge base',
    'semantic legal search',
  ],
};
