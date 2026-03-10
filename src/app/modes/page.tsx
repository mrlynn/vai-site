import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ModesInfographic from '@/components/ModesInfographic';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Operational Modes | vai – voyageai-cli',
  description:
    'Explore the 5 operational modes of vai: CLI, Local/Nano, Web Playground, MCP Server, and Desktop App. Full RAG pipeline visualization.',
  openGraph: {
    title: 'Operational Modes | vai',
    description: 'CLI · Local · Playground · MCP · Desktop — every way to run your RAG pipeline.',
  },
};

export default function ModesPage() {
  return (
    <main>
      <Navbar />
      <ModesInfographic />
      <Footer />
    </main>
  );
}
