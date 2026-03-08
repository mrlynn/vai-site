import type { Metadata } from 'next';
import DemoGalleryPage from '@/components/demos/DemoGalleryPage';

export const metadata: Metadata = {
  title: 'Demo Gallery | vai',
  description:
    'Browse reproducible VAI CLI demos with exact commands, prerequisites, and links to the original tape files in voyageai-cli.',
  openGraph: {
    title: 'Demo Gallery | vai',
    description:
      'Browse reproducible VAI CLI demos with exact commands, prerequisites, and source tape links.',
    url: 'https://vaicli.com/demos',
  },
};

export default function Page() {
  return <DemoGalleryPage />;
}
