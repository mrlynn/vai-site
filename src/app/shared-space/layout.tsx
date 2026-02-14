import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Shared Space Explorer | vai — Voyage AI CLI',
  description:
    'Visualize how Voyage AI embedding models share the same vector space. See why asymmetric retrieval cuts query costs by 83%.',
  openGraph: {
    title: 'Shared Space Explorer | vai — Voyage AI CLI',
    description:
      'Visualize how Voyage AI embedding models share the same vector space. See why asymmetric retrieval cuts query costs by 83%.',
    url: 'https://vaicli.com/shared-space',
    type: 'website',
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
