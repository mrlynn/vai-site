import type { Metadata } from 'next';
import ThemeRegistry from '@/theme/ThemeRegistry';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Vai — Open Source Toolkit for Voyage AI Embeddings',
  description:
    'Community-built CLI, desktop app, and web playground for exploring Voyage AI embeddings and MongoDB Atlas Vector Search. Open source developer tool by Michael Lynn.',
  keywords: [
    'voyage ai',
    'embeddings',
    'vector search',
    'mongodb atlas',
    'semantic search',
    'RAG pipeline',
    'reranking',
    'cli tool',
    'cosine similarity',
    'MTEB',
    'embedding models',
  ],
  authors: [{ name: 'Michael Lynn', url: 'https://mlynn.org' }],
  creator: 'Michael Lynn',
  openGraph: {
    title: 'Vai — Open Source Voyage AI Toolkit',
    description:
      'Community-built CLI, desktop app, and playground for exploring Voyage AI embeddings. Open source by Michael Lynn.',
    url: 'https://vai.mlynn.org',
    siteName: 'Vai',
    type: 'website',
    images: [
      {
        url: 'https://vai.mlynn.org/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vai - Voyage AI Developer Toolkit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vai — Open Source Voyage AI Toolkit',
    description:
      'Community-built CLI and desktop app for exploring Voyage AI embeddings. Open source by @mlaboratory.',
    creator: '@mlaboratory',
    images: ['https://vai.mlynn.org/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://vai.mlynn.org',
  },
};

// JSON-LD structured data for SoftwareApplication
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Vai (VoyageAI-CLI)',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'macOS, Windows, Linux',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Community-built open source CLI and desktop app for exploring Voyage AI embeddings and MongoDB Atlas Vector Search. Not affiliated with Voyage AI or MongoDB.',
  author: {
    '@type': 'Person',
    name: 'Michael Lynn',
    url: 'https://mlynn.org',
  },
  url: 'https://vai.mlynn.org',
  downloadUrl: 'https://github.com/mrlynn/voyageai-cli/releases',
  softwareVersion: '1.20.0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
