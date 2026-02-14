import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Shared Space Explorer | vai — Voyage AI CLI',
  description:
    'Visualize how Voyage AI embedding models share the same vector space. 3 models, 0.95+ cross-model similarity. Asymmetric retrieval saves 83% on query costs.',
  openGraph: {
    title: 'Shared Space Explorer | vai — Voyage AI CLI',
    description:
      '3 Models. 1 Vector Space. Proven. See why asymmetric retrieval cuts query costs by 83%.',
    url: 'https://vaicli.com/shared-space',
    type: 'website',
    images: [
      {
        url: 'https://vaicli.com/api/og/shared-space',
        width: 1200,
        height: 630,
        alt: 'Shared Space Explorer — cross-model similarity proof',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shared Space Explorer | vai',
    description: '3 Models. 1 Vector Space. Proven. Asymmetric retrieval saves 83% on query costs.',
    images: ['https://vaicli.com/api/og/shared-space'],
  },
};

export default function SharedSpaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
