import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getUseCaseBySlug, getAllSlugs } from '@/data/use-cases';
import UseCasePageContent from './UseCasePageContent';
import Script from 'next/script';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const baseKeywords = [
  'voyage ai',
  'embeddings',
  'vector search',
  'mongodb atlas',
  'semantic search',
  'RAG pipeline',
  'knowledge base',
  'vai',
];

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const useCase = getUseCaseBySlug(slug);
  if (!useCase) return { title: 'Not Found' };

  return {
    title: `${useCase.headline} - Vai`,
    description: useCase.description,
    keywords: [...baseKeywords, ...useCase.keywords],
    openGraph: {
      title: useCase.headline,
      description: useCase.subheadline,
      url: `https://vai.mlynn.org/use-cases/${useCase.slug}`,
      siteName: 'Vai',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: useCase.headline,
      description: useCase.subheadline,
    },
  };
}

export default async function UseCasePage({ params }: PageProps) {
  const { slug } = await params;
  const useCase = getUseCaseBySlug(slug);
  if (!useCase) notFound();

  // JSON-LD structured data (HowTo schema)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: useCase.headline,
    description: useCase.description,
    step: useCase.walkthroughSteps.map((step) => ({
      '@type': 'HowToStep',
      name: step.title,
      text: step.description,
    })),
    tool: {
      '@type': 'SoftwareApplication',
      name: 'Vai (VoyageAI-CLI)',
      url: 'https://vai.mlynn.org',
    },
  };

  return (
    <>
      <Script
        id={`json-ld-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <UseCasePageContent slug={slug} />
    </>
  );
}
