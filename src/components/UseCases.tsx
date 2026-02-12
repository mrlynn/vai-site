'use client';

import { Box, Button, Chip, Container, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { palette } from '@/theme/theme';
import { getAllUseCases } from '@/data/use-cases';
import UseCaseCard from '@/components/use-cases/UseCaseCard';

export default function UseCases() {
  const useCases = getAllUseCases();

  return (
    <Box
      id="use-cases"
      component="section"
      sx={{ py: { xs: 8, md: 12 } }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            label="Industry Walkthroughs"
            size="small"
            sx={{
              mb: 2,
              bgcolor: 'rgba(0,212,170,0.1)',
              color: '#00D4AA',
              border: '1px solid rgba(0,212,170,0.3)',
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              color: palette.text,
              mb: 2,
            }}
          >
            Built for your domain
          </Typography>
          <Typography
            sx={{
              color: palette.textDim,
              fontSize: { xs: '1rem', md: '1.1rem' },
              maxWidth: 560,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Go from sample documents to a working knowledge base in under 30 minutes,
            with walkthroughs tailored to your industry.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          {useCases.map((uc) => (
            <UseCaseCard key={uc.slug} useCase={uc} />
          ))}

          {/* Coming soon placeholders for domains not yet built */}
          {[
            { title: 'Healthcare & Clinical', color: '#5CE8CC', model: 'voyage-4-large' },
            { title: 'Legal & Compliance', color: '#B45AF2', model: 'voyage-law-2' },
            { title: 'Financial Services', color: '#FFC010', model: 'voyage-finance-2' },
          ]
            .filter((p) => !useCases.some((uc) => uc.title === p.title))
            .map((placeholder) => (
              <Box
                key={placeholder.title}
                sx={{
                  bgcolor: palette.bgCard,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 3,
                  p: 3,
                  opacity: 0.45,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  minHeight: 200,
                }}
              >
                <Chip
                  label={placeholder.model}
                  size="small"
                  sx={{
                    mb: 2,
                    height: 22,
                    bgcolor: `${placeholder.color}12`,
                    color: placeholder.color,
                    fontWeight: 600,
                    fontFamily: "'Source Code Pro', monospace",
                    fontSize: '0.7rem',
                  }}
                />
                <Typography sx={{ fontWeight: 600, color: palette.text, fontSize: '0.95rem', mb: 0.5 }}>
                  {placeholder.title}
                </Typography>
                <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem' }}>
                  Coming soon
                </Typography>
              </Box>
            ))}
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            href="/use-cases"
            endIcon={<ArrowForwardIcon />}
            sx={{
              color: '#00D4AA',
              fontWeight: 600,
              '&:hover': { bgcolor: 'rgba(0,212,170,0.08)' },
            }}
          >
            View all use cases
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
