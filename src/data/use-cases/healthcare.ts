import type { UseCaseData } from './index';

export const healthcareData: UseCaseData = {
  slug: 'healthcare',
  title: 'Healthcare & Clinical',
  headline: 'Build a Clinical Knowledge Base in 20 Minutes',
  subheadline: 'From clinical guidelines to searchable AI, using your own infrastructure',
  description:
    'Build a searchable knowledge base from clinical guidelines, drug references, and care protocols using Voyage AI embeddings and MongoDB Atlas Vector Search. From scattered documentation to instant clinical answers in under 20 minutes.',
  icon: 'LocalHospital',
  accentColor: '#5CE8CC',

  persona: 'Clinical informaticist, health-tech developer, care team lead building internal tools',

  problemStatement: `Healthcare teams drown in clinical documentation. Treatment guidelines update quarterly. Drug interaction databases span thousands of pages. Internal protocols live in scattered wikis, PDFs, and shared drives. When a clinician needs an answer, "What's the recommended first-line treatment for Type 2 diabetes with renal impairment?", they search through multiple systems, often settling for whatever Google returns rather than their organization's own vetted guidelines.

Standard search tools fail here because clinical questions are semantic, not keyword-based. A search for "diabetes kidney treatment" needs to find documents about "glycemic management in chronic kidney disease": same concept, completely different words. This is exactly what embedding-based semantic search solves.`,

  solutionSummary:
    'vai turns your clinical documentation into a searchable knowledge base in minutes. Point it at a folder of guidelines, drug references, and care protocols, and it handles chunking, embedding with Voyage AI\'s highest-accuracy model, and indexing in MongoDB Atlas Vector Search. The result: semantic search that understands "What medications should I avoid in a patient with kidney problems?" finds answers across your metformin reference, CKD staging guide, and ACE inhibitor docs, even when each uses different terminology.',

  voyageModel: 'voyage-4-large',
  voyageModelReason:
    'voyage-4-large is Voyage AI\'s highest-accuracy general-purpose model. Clinical text has specialized vocabulary that benefits from the best available embedding quality. No domain-specific healthcare model exists in the Voyage AI lineup, so the best general-purpose model is the right choice. For a production healthcare system, accuracy is paramount, and voyage-4-large\'s superior retrieval quality justifies the modest cost premium over lighter models.',
  dbName: 'healthcare_demo',
  collectionName: 'clinical_knowledge',

  sampleDocs: [
    { filename: 'diabetes-management.md', topic: 'Type 2 diabetes treatment guidelines, HbA1c targets, medication ladder', sizeKb: 3 },
    { filename: 'diabetes-renal.md', topic: 'Glycemic management in patients with CKD stages 3 to 5', sizeKb: 2 },
    { filename: 'metformin-reference.md', topic: 'Metformin prescribing information, contraindications, renal dosing', sizeKb: 2 },
    { filename: 'sglt2-inhibitors.md', topic: 'SGLT2 inhibitor class overview, cardiovascular and renal benefits', sizeKb: 2 },
    { filename: 'hypertension-guidelines.md', topic: 'Blood pressure targets, first-line agents, resistant hypertension', sizeKb: 3 },
    { filename: 'ace-inhibitor-reference.md', topic: 'ACE inhibitor prescribing, renal protective effects, monitoring', sizeKb: 2 },
    { filename: 'heart-failure-protocol.md', topic: 'HFrEF and HFpEF management, GDMT optimization', sizeKb: 3 },
    { filename: 'anticoagulation-guide.md', topic: 'Anticoagulation selection, DOAC vs warfarin, bridging protocols', sizeKb: 3 },
    { filename: 'sepsis-bundle.md', topic: 'Sepsis recognition, hour-1 bundle, lactate-guided resuscitation', sizeKb: 2 },
    { filename: 'pain-management.md', topic: 'Acute and chronic pain protocols, opioid stewardship, multimodal approach', sizeKb: 2 },
    { filename: 'drug-interactions-cardiac.md', topic: 'Common drug interactions in cardiac patients, QTc prolongation risks', sizeKb: 2 },
    { filename: 'ckd-staging.md', topic: 'Chronic kidney disease staging, eGFR calculation, referral criteria', sizeKb: 2 },
    { filename: 'insulin-protocols.md', topic: 'Basal-bolus insulin, sliding scale, transition from IV to subcutaneous', sizeKb: 2 },
    { filename: 'discharge-checklist.md', topic: 'Hospital discharge protocol, medication reconciliation, follow-up', sizeKb: 2 },
    { filename: 'falls-prevention.md', topic: 'Fall risk assessment, prevention interventions, post-fall protocol', sizeKb: 2 },
  ],
  sampleDocsZipUrl: '/use-cases/healthcare/sample-docs/sample-docs.zip',
  totalSizeKb: 34,

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
        'Grab the 15-file sample clinical document set. These are synthetic but realistic treatment guidelines, drug references, and care protocols for a fictional hospital system.',
      command: `curl -L https://vaicli.com/use-cases/healthcare/sample-docs/sample-docs.zip -o sample-docs.zip
unzip sample-docs.zip -d ./sample-docs`,
      expectedOutput: `Archive:  sample-docs.zip
  inflating: ./sample-docs/diabetes-management.md
  inflating: ./sample-docs/diabetes-renal.md
  ...
  inflating: ./sample-docs/falls-prevention.md
  15 files extracted`,
    },
    {
      number: 4,
      title: 'Ingest and embed the documents',
      description:
        'Run the vai pipeline to chunk, embed, and index all 15 documents. This uses voyage-4-large, the highest-accuracy general-purpose model, and creates a vector search index in MongoDB Atlas.',
      command:
        'vai pipeline ./sample-docs/ --model voyage-4-large --db healthcare_demo --collection clinical_knowledge --create-index',
      expectedOutput: `◼ Scanning ./sample-docs/ ...
  Found 15 files (34KB total)

◼ Chunking documents ...
  Created 118 chunks (avg 288 chars)

◼ Embedding with voyage-4-large ...
  ████████████████████████████████ 118/118 chunks
  Embedded in 2.1s (56 chunks/sec)

◼ Storing in MongoDB Atlas ...
  Database: healthcare_demo
  Collection: clinical_knowledge
  Inserted 118 documents

◼ Creating vector search index ...
  Index "vector_index" created on field "embedding"
  Dimensions: 1024 | Similarity: cosine

✓ Pipeline complete — 15 files → 118 indexed chunks`,
    },
    {
      number: 5,
      title: 'Run your first clinical search',
      description:
        'Test the knowledge base with a query that spans multiple clinical documents. Notice how semantic search finds relevant information even when the query uses different terminology than the source documents.',
      command:
        'vai search "What medications should I avoid in a patient with kidney problems?" --db healthcare_demo --collection clinical_knowledge',
      expectedOutput: `Query: "What medications should I avoid in a patient with kidney problems?"
Model: voyage-4-large | Results: 5

1. metformin-reference.md (score: 0.94)
   "Contraindications: Metformin is contraindicated in patients with
    an eGFR below 30 mL/min/1.73m2. For patients with eGFR 30-45,
    initiation is not recommended but continuation at reduced dose
    may be considered with close monitoring..."

2. ckd-staging.md (score: 0.91)
   "Medication Adjustment by CKD Stage: Multiple medications require
    dose adjustment or discontinuation as renal function declines.
    Review all medications at each stage transition..."

3. ace-inhibitor-reference.md (score: 0.87)
   "Renal Monitoring: Check serum creatinine and potassium within
    1-2 weeks of initiation or dose increase. A rise in creatinine
    of up to 30% is acceptable and expected..."`,
    },
    {
      number: 6,
      title: 'Try cross-document clinical queries',
      description:
        'Run queries that require understanding medical concepts across different document types. This is where semantic search delivers the most value over traditional keyword search.',
      command:
        'vai search "How do I manage blood sugar in someone who cannot take metformin?" --db healthcare_demo --collection clinical_knowledge',
      expectedOutput: `Query: "How do I manage blood sugar in someone who cannot take metformin?"
Model: voyage-4-large | Results: 5

1. diabetes-management.md (score: 0.93)
   "Second-Line Agents: When metformin is contraindicated or not
    tolerated, consider SGLT2 inhibitors (preferred if cardiovascular
    or renal comorbidity) or GLP-1 receptor agonists..."

2. diabetes-renal.md (score: 0.90)
   "Glycemic Management in CKD: For patients with eGFR below 30
    where metformin is contraindicated, SGLT2 inhibitors with
    demonstrated renal benefit (dapagliflozin, empagliflozin)
    are preferred..."

3. sglt2-inhibitors.md (score: 0.86)
   "SGLT2 inhibitors have demonstrated cardiovascular and renal
    benefits independent of their glucose-lowering effect.
    Recommended as first-line add-on or metformin alternative..."`,
    },
    {
      number: 7,
      title: 'Explore in the playground',
      description:
        'Launch the vai playground for a visual interface. Browse your indexed clinical documents, run queries interactively, and compare how different models handle clinical terminology.',
      command: 'vai playground',
      expectedOutput: `◼ Starting vai playground ...
  Server running at http://localhost:1958

  Open your browser to explore:
  • Search your knowledge base
  • Compare embedding models
  • Visualize similarity scores`,
      notes:
        'Try comparing voyage-4-large results with voyage-4-lite on the same clinical query to see how model quality affects retrieval accuracy for medical terminology.',
    },
  ],

  exampleQueries: [
    {
      query: 'What medications should I avoid in a patient with kidney problems?',
      explanation:
        'Tests cross-document retrieval spanning the metformin reference, CKD staging guide, and ACE inhibitor docs. The query uses "kidney problems" while the documents use "renal impairment," "CKD," and "eGFR."',
      sampleResults: [
        {
          source: 'metformin-reference.md',
          relevance: 0.94,
          snippet:
            'Contraindications: Metformin is contraindicated in patients with an eGFR below 30 mL/min/1.73m2. For patients with eGFR 30-45, initiation is not recommended but continuation at reduced dose may be considered.',
        },
        {
          source: 'ckd-staging.md',
          relevance: 0.91,
          snippet:
            'Medication Adjustment by CKD Stage: Multiple medications require dose adjustment or discontinuation as renal function declines. NSAIDs should be avoided in Stage 3 and beyond.',
        },
        {
          source: 'ace-inhibitor-reference.md',
          relevance: 0.87,
          snippet:
            'Renal Monitoring: Check serum creatinine and potassium within 1-2 weeks of initiation or dose increase. Discontinue if creatinine rises more than 30% or potassium exceeds 5.5 mEq/L.',
        },
      ],
    },
    {
      query: 'How do I manage blood sugar in someone who cannot take metformin?',
      explanation:
        'Tests the medication ladder and renal contraindication overlap across diabetes management, diabetes-renal, and SGLT2 inhibitor documents.',
      sampleResults: [
        {
          source: 'diabetes-management.md',
          relevance: 0.93,
          snippet:
            'Second-Line Agents: When metformin is contraindicated or not tolerated, consider SGLT2 inhibitors (preferred if cardiovascular or renal comorbidity) or GLP-1 receptor agonists.',
        },
        {
          source: 'diabetes-renal.md',
          relevance: 0.90,
          snippet:
            'Glycemic Management in CKD: For patients with eGFR below 30 where metformin is contraindicated, SGLT2 inhibitors with demonstrated renal benefit are preferred as first-line.',
        },
      ],
    },
    {
      query: "What's the sepsis protocol for the first hour?",
      explanation:
        'Tests precise retrieval from the sepsis bundle document. The "hour-1 bundle" concept should be retrieved even when the query uses different phrasing.',
      sampleResults: [
        {
          source: 'sepsis-bundle.md',
          relevance: 0.96,
          snippet:
            'Hour-1 Bundle: (1) Measure lactate level. (2) Obtain blood cultures before antibiotics. (3) Administer broad-spectrum antibiotics. (4) Begin rapid administration of 30 mL/kg crystalloid for hypotension or lactate greater than or equal to 4 mmol/L.',
        },
        {
          source: 'anticoagulation-guide.md',
          relevance: 0.68,
          snippet:
            'Sepsis-Related Coagulopathy: Hold prophylactic anticoagulation if platelet count falls below 25,000. Consider resumption when platelets recover above 50,000 and active bleeding has resolved.',
        },
      ],
    },
    {
      query: 'My patient is on warfarin and needs to start amiodarone. What do I watch for?',
      explanation:
        'Tests drug interaction document retrieval. A practical clinical scenario requiring cross-reference between the anticoagulation guide and drug interactions document.',
      sampleResults: [
        {
          source: 'drug-interactions-cardiac.md',
          relevance: 0.95,
          snippet:
            'Amiodarone-Warfarin Interaction: Amiodarone inhibits CYP2C9 and CYP3A4, increasing warfarin levels by 30% to 50%. Reduce warfarin dose by one-third to one-half when initiating amiodarone and monitor INR weekly for the first 4 to 6 weeks.',
        },
        {
          source: 'anticoagulation-guide.md',
          relevance: 0.88,
          snippet:
            'Drug Interactions: Multiple medications affect warfarin metabolism. Check for interactions before adding any new medication. High-risk interactions include amiodarone, fluconazole, and certain antibiotics.',
        },
      ],
    },
    {
      query: 'When should I refer a patient to nephrology?',
      explanation:
        'Tests CKD staging referral criteria. A straightforward clinical question that should retrieve specific threshold values from the CKD staging document.',
      sampleResults: [
        {
          source: 'ckd-staging.md',
          relevance: 0.95,
          snippet:
            'Nephrology Referral Criteria: Refer when eGFR falls below 30 mL/min/1.73m2 (Stage 4), when there is a rapid decline in eGFR (greater than 5 mL/min per year), or when the etiology of CKD is unclear.',
        },
        {
          source: 'diabetes-renal.md',
          relevance: 0.79,
          snippet:
            'Specialist Referral: Patients with diabetic nephropathy showing rapid eGFR decline should be co-managed with nephrology. Consider referral when ACR exceeds 300 mg/g or eGFR drops below 45.',
        },
      ],
    },
  ],

  modelComparison: {
    recommended: 'voyage-4-large',
    alternatives: [
      {
        model: 'voyage-4-large',
        score: 0.95,
        notes:
          'Highest-accuracy general-purpose model. Best retrieval quality for clinical terminology where precision matters. Recommended for any healthcare application where accuracy is paramount.',
      },
      {
        model: 'voyage-4-lite',
        score: 0.84,
        notes:
          'Faster and more cost-effective. Handles straightforward clinical queries adequately, but struggles with nuanced cross-document retrieval involving specialized medical terminology.',
      },
      {
        model: 'voyage-code-3',
        score: 0.72,
        notes:
          'Optimized for code and technical docs, not clinical text. Included for comparison only. Medical vocabulary and clinical reasoning patterns are outside its training domain.',
      },
    ],
    comparisonNarrative:
      'For clinical documents, voyage-4-large consistently outperforms lighter models on queries that require understanding medical terminology and cross-referencing clinical concepts. The difference is most pronounced on queries like "What medications should I avoid in a patient with kidney problems?" where the model needs to connect "kidney problems" with "renal impairment," "eGFR," and "CKD stages." For a healthcare application, the accuracy premium of voyage-4-large is worth the modest additional cost.',
  },

  scalingNotes: [
    {
      title: 'HIPAA considerations',
      content:
        'vai processes documents locally before embedding. The vectors sent to Voyage AI do not contain readable PHI, but the text chunks stored in MongoDB do. Your Atlas cluster must be HIPAA-eligible if storing real clinical data. MongoDB Atlas offers HIPAA-eligible dedicated clusters with a BAA.',
      icon: 'Security',
    },
    {
      title: 'Document volume',
      content:
        'A typical hospital formulary plus guideline set might be 5,000 to 50,000 pages. At this scale, initial embedding costs are modest with voyage-4-large, and queries cost fractions of a cent. Use vai estimate to project costs for your corpus size.',
      icon: 'Payments',
    },
    {
      title: 'Keeping guidelines current',
      content:
        'Clinical guidelines update regularly: drug formularies change, protocols evolve, new evidence emerges. Re-run vai pipeline on updated files and it will re-chunk, re-embed, and update only the changed documents. Automate this as part of your clinical documentation workflow.',
      icon: 'Refresh',
    },
    {
      title: 'Metadata filtering',
      content:
        'Clinical search often needs filters by department, document type, or date. vai supports metadata filters on search, so you can narrow results to "only cardiology guidelines updated in the last year" before semantic ranking applies.',
      icon: 'FilterAlt',
    },
    {
      title: 'Conversational interface',
      content:
        'The natural next step is vai chat: a clinician asking "What is the recommended anticoagulation for a patient with atrial fibrillation and moderate renal impairment?" and getting answers grounded in your organization\'s own vetted guidelines.',
      icon: 'Chat',
    },
  ],

  keywords: [
    'clinical knowledge base',
    'healthcare search',
    'medical document search',
    'clinical guidelines',
    'drug reference search',
    'HIPAA compliant search',
    'voyage-4-large',
    'clinical embeddings',
    'healthcare AI',
    'treatment protocol search',
    'clinical decision support',
    'medical semantic search',
  ],
};
