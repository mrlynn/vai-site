import type { Metadata } from 'next';
import ThemeRegistry from '@/theme/ThemeRegistry';

export const metadata: Metadata = {
  title: 'Vai — Explore Voyage AI Embeddings from Your Terminal',
  description:
    'CLI + Desktop App + Web Playground for Voyage AI embeddings, reranking, and MongoDB Atlas Vector Search. Embed text, compare vectors, benchmark models, and explore RAG concepts.',
  keywords: [
    'voyage ai',
    'embeddings',
    'vector search',
    'mongodb atlas',
    'cli tool',
    'reranking',
    'cosine similarity',
    'RAG',
  ],
  openGraph: {
    title: 'Vai — Explore Voyage AI Embeddings',
    description:
      'CLI + Desktop App + Web Playground for Voyage AI embeddings, reranking, and MongoDB Atlas Vector Search.',
    url: 'https://vai.mlynn.org',
    siteName: 'Vai',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
