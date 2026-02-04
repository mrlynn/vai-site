import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Models from '@/components/Models';
import CliDemo from '@/components/CliDemo';
import DesktopApp from '@/components/DesktopApp';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Models />
      <CliDemo />
      <DesktopApp />
      <Footer />
    </main>
  );
}
