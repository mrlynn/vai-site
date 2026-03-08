import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import DemoDetailPage from '@/components/demos/DemoDetailPage';
import { getAllDemoSlugs, getDemoBySlug } from '@/data/demos';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllDemoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const demo = getDemoBySlug(slug);

  if (!demo) return { title: 'Not Found' };

  const canonicalUrl = `https://vaicli.com/demos/${demo.slug}`;
  const imageUrl = `https://vaicli.com${demo.assets.sitePreviewPath}`;

  return {
    title: `${demo.title} | Demo Gallery | vai`,
    description: demo.social.headline,
    keywords: ['vai', 'voyage ai', 'mongodb atlas', 'demo gallery', ...demo.categories],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: demo.title,
      description: demo.social.headline,
      url: canonicalUrl,
      siteName: 'Vai',
      type: 'article',
      images: [
        {
          url: imageUrl,
          alt: `${demo.title} preview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: demo.title,
      description: demo.social.headline,
      images: [imageUrl],
    },
  };
}

export default async function DemoPage({ params }: PageProps) {
  const { slug } = await params;
  const demo = getDemoBySlug(slug);

  if (!demo) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: demo.title,
    description: demo.summary,
    url: `https://vaicli.com/demos/${demo.slug}`,
    image: `https://vaicli.com${demo.assets.sitePreviewPath}`,
    step: demo.commands.map((command, index) => ({
      '@type': 'HowToStep',
      name: `Step ${index + 1}`,
      text: command,
    })),
    tool: {
      '@type': 'SoftwareApplication',
      name: 'Vai (VoyageAI-CLI)',
      url: 'https://vaicli.com',
    },
  };

  return (
    <>
      <Script
        id={`demo-json-ld-${demo.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DemoDetailPage demo={demo} />
    </>
  );
}
