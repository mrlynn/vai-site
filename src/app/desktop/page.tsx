import { Metadata } from 'next';
import DesktopAppPage from './DesktopAppPage';

export const metadata: Metadata = {
  title: 'Desktop App | VAI - Voyage AI CLI',
  description: 'Download the VAI desktop app for macOS, Windows, and Linux. A beautiful interface for embeddings, vector search, and RAG workflows.',
};

export default function Page() {
  return <DesktopAppPage />;
}
