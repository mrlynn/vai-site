import type { Metadata } from 'next';
import UseCasesDirectory from './UseCasesDirectory';

export const metadata: Metadata = {
  title: 'Industry Use Cases - Vai',
  description:
    'Domain-specific walkthroughs for building searchable knowledge bases with Voyage AI embeddings. Healthcare, Legal, Finance, and Developer Documentation.',
  openGraph: {
    title: 'Industry Use Cases - Vai',
    description:
      'Domain-specific walkthroughs for building searchable knowledge bases with Voyage AI embeddings.',
    url: 'https://vai.mlynn.org/use-cases',
  },
};

export default function UseCasesPage() {
  return <UseCasesDirectory />;
}
