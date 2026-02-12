import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WhyVoyageAI from '@/components/WhyVoyageAI';
import Features from '@/components/Features';
import Models from '@/components/Models';
import CliDemo from '@/components/CliDemo';
import McpServer from '@/components/McpServer';
import UseCases from '@/components/UseCases';
import DesktopApp from '@/components/DesktopApp';
import CommunityStats from '@/components/CommunityStats';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <WhyVoyageAI />
      <Features />
      <Models />
      <CliDemo />
      <McpServer />
      <UseCases />
      <DesktopApp />
      <CommunityStats />
      <Footer />
    </main>
  );
}
