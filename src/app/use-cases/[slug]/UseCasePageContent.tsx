'use client';

import { Box, Breadcrumbs, Container, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { palette } from '@/theme/theme';
import { getUseCaseBySlug } from '@/data/use-cases';
import UseCaseHero from '@/components/use-cases/UseCaseHero';
import ProblemSection from '@/components/use-cases/ProblemSection';
import SolutionPipeline from '@/components/use-cases/SolutionPipeline';
import SampleDocsList from '@/components/use-cases/SampleDocsList';
import WalkthroughStepper from '@/components/use-cases/WalkthroughStepper';
import ExampleQueries from '@/components/use-cases/ExampleQueries';
import ModelComparison from '@/components/use-cases/ModelComparison';
import ScalingSection from '@/components/use-cases/ScalingSection';
import UseCaseCTA from '@/components/use-cases/UseCaseCTA';
import TryItCTA from '@/components/use-cases/TryItCTA';
import ChatBot from '@/components/use-cases/ChatBot';
import { useUseCaseAnalytics } from '@/hooks/useUseCaseAnalytics';

const chatbotSlugs = ['devdocs', 'legal', 'finance', 'healthcare'];

const CHATBOT_DESCRIPTIONS: Record<string, string> = {
  devdocs: 'This is a real chatbot powered by the 16 sample docs you just explored. Ask it anything about authentication, deployment, architecture, or any of the developer documentation.',
  legal: 'This is a real chatbot powered by the 15 legal sample docs you just explored. Ask it about contracts, GDPR compliance, indemnification clauses, NDAs, or any of the legal documentation.',
  finance: 'This is a real chatbot powered by the 15 financial sample docs you just explored. Ask it about earnings calls, risk management, capital allocation, or regulatory compliance.',
  healthcare: 'This is a real chatbot powered by the 15 clinical sample docs you just explored. Ask it about treatment guidelines, drug interactions, care protocols, or clinical procedures.',
};

const SUGGESTED_QUERIES: Record<string, string[]> = {
  devdocs: [
    'How do I set up the local dev environment?',
    'How does API authentication work?',
    'What is the deployment process?',
    'How is error handling implemented?',
    'What does the database schema look like?',
  ],
  legal: [
    'What are our GDPR obligations for data deletion?',
    'Compare indemnification across our contracts',
    'What happens if we miss the SLA due to a natural disaster?',
    'What are the confidentiality exceptions in our NDAs?',
    'What non-compete restrictions apply to employees?',
  ],
  finance: [
    'What did management say about margin pressure?',
    'What are our biggest risk exposures?',
    'How are we preparing for regulatory changes?',
    "What's the capital return strategy?",
    'Do we have vendor concentration risk?',
  ],
  healthcare: [
    'What medications should I avoid with kidney problems?',
    'What is the sepsis protocol for the first hour?',
    'How do I manage blood sugar if metformin is contraindicated?',
    'When should I refer a patient to nephrology?',
    'What are the fall prevention interventions?',
  ],
};

interface UseCasePageContentProps {
  slug: string;
}

export default function UseCasePageContent({ slug }: UseCasePageContentProps) {
  const useCase = getUseCaseBySlug(slug);
  const analytics = useUseCaseAnalytics(slug);
  if (!useCase) return null;

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
          sx={{ '& .MuiBreadcrumbs-li': { fontSize: '0.85rem' } }}
        >
          <Link
            href="/"
            underline="hover"
            sx={{ color: palette.textMuted, '&:hover': { color: palette.text } }}
          >
            Home
          </Link>
          <Link
            href="/use-cases"
            underline="hover"
            sx={{ color: palette.textMuted, '&:hover': { color: palette.text } }}
          >
            Use Cases
          </Link>
          <Typography sx={{ color: palette.text, fontSize: '0.85rem' }}>
            {useCase.title}
          </Typography>
        </Breadcrumbs>
      </Container>

      <UseCaseHero useCase={useCase} onDownload={() => analytics.trackDownload()} onWalkthroughClick={() => analytics.trackCtaClick('walkthrough')} />

      <ProblemSection
        problemStatement={useCase.problemStatement}
        accent={useCase.accentColor}
      />

      <SolutionPipeline
        solutionSummary={useCase.solutionSummary}
        accent={useCase.accentColor}
      />

      <SampleDocsList
        docs={useCase.sampleDocs}
        totalSizeKb={useCase.totalSizeKb}
        zipUrl={useCase.sampleDocsZipUrl}
        accent={useCase.accentColor}
        onDownload={analytics.trackDownload}
      />

      <WalkthroughStepper
        steps={useCase.walkthroughSteps}
        accent={useCase.accentColor}
      />

      <ExampleQueries
        queries={useCase.exampleQueries}
        accent={useCase.accentColor}
      />

      {chatbotSlugs.includes(slug) && (
        <TryItCTA
          accent={useCase.accentColor}
          docCount={useCase.sampleDocs.length}
          description={CHATBOT_DESCRIPTIONS[slug]}
          onStartChatting={() => analytics.trackCtaClick('start_chatting')}
        />
      )}

      <ModelComparison
        comparison={useCase.modelComparison}
        accent={useCase.accentColor}
      />

      <ScalingSection
        notes={useCase.scalingNotes}
        accent={useCase.accentColor}
      />

      <UseCaseCTA accent={useCase.accentColor} onCtaClick={analytics.trackCtaClick} />

      {chatbotSlugs.includes(slug) && (
        <ChatBot
          slug={slug}
          accentColor={useCase.accentColor}
          suggestedQueries={SUGGESTED_QUERIES[slug] || []}
          onOpen={analytics.trackChatbotOpen}
          onQuery={analytics.trackChatbotQuery}
        />
      )}
    </Box>
  );
}
