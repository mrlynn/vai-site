// Use case data types and registry
// Each use case is a self-contained data object that drives the page rendering.
// To add a new domain: create a data file, import it here, add to the registry.

export interface SampleDocument {
  filename: string;
  topic: string;
  sizeKb: number;
}

export interface WalkthroughStep {
  number: number;
  title: string;
  description: string;
  command: string;
  expectedOutput?: string;
  notes?: string;
}

export interface ExampleQuery {
  query: string;
  explanation: string;
  sampleResults?: Array<{
    source: string;
    relevance: number;
    snippet: string;
  }>;
}

export interface ModelComparison {
  recommended: string;
  alternatives: Array<{
    model: string;
    score?: number;
    notes: string;
  }>;
  comparisonNarrative: string;
}

export interface ScalingNote {
  title: string;
  content: string;
  icon?: string;
}

export interface UseCaseData {
  // Identity
  slug: string;
  title: string;
  headline: string;
  subheadline: string;
  description: string;
  icon: string;
  accentColor: string;

  // Domain content
  persona: string;
  problemStatement: string;
  solutionSummary: string;

  // Technical configuration
  voyageModel: string;
  voyageModelReason: string;
  dbName: string;
  collectionName: string;

  // Sample documents
  sampleDocs: SampleDocument[];
  sampleDocsZipUrl: string;
  totalSizeKb: number;

  // Walkthrough steps
  walkthroughSteps: WalkthroughStep[];

  // Example queries
  exampleQueries: ExampleQuery[];

  // Model comparison data
  modelComparison: ModelComparison;

  // Scaling notes
  scalingNotes: ScalingNote[];

  // SEO
  keywords: string[];
}

// Registry: import and register all use case data files here
import { devdocsData } from './devdocs';
import { legalData } from './legal';
import { financeData } from './finance';
import { healthcareData } from './healthcare';

const useCaseRegistry: Record<string, UseCaseData> = {
  devdocs: devdocsData,
  legal: legalData,
  finance: financeData,
  healthcare: healthcareData,
};

export function getUseCaseBySlug(slug: string): UseCaseData | undefined {
  return useCaseRegistry[slug];
}

export function getAllUseCases(): UseCaseData[] {
  return Object.values(useCaseRegistry);
}

export function getAllSlugs(): string[] {
  return Object.keys(useCaseRegistry);
}
