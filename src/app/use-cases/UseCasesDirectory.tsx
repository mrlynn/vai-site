'use client';

import { Box, Chip, Container, Typography } from '@mui/material';
import { palette } from '@/theme/theme';
import { getAllUseCases } from '@/data/use-cases';
import UseCaseCard from '@/components/use-cases/UseCaseCard';

export default function UseCasesDirectory() {
  const useCases = getAllUseCases();

  return (
    <Box sx={{ minHeight: '60vh' }}>
      {/* Header */}
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-30%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', textAlign: 'center' }}>
          <Chip
            label="Zero to RAG"
            size="small"
            sx={{
              mb: 3,
              bgcolor: 'rgba(0,212,170,0.1)',
              color: '#00D4AA',
              border: '1px solid rgba(0,212,170,0.3)',
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.8rem' },
              color: palette.text,
              mb: 2,
              letterSpacing: '-0.02em',
            }}
          >
            Industry Use Cases
          </Typography>
          <Typography
            sx={{
              color: palette.textDim,
              fontSize: { xs: '1rem', md: '1.15rem' },
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Domain-specific walkthroughs that take you from sample documents to a working, searchable
            knowledge base in under 30 minutes.
          </Typography>
        </Container>
      </Box>

      {/* Cards grid */}
      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {useCases.map((uc) => (
            <UseCaseCard key={uc.slug} useCase={uc} />
          ))}

          {/* Placeholder cards for upcoming use cases */}
          {['Healthcare', 'Legal', 'Finance'].filter(
            (name) => !useCases.some((uc) => uc.title === name)
          ).length > 0 && (
            <>
              {[
                { title: 'Healthcare & Clinical', icon: 'LocalHospital', color: '#5CE8CC', model: 'voyage-4-large' },
                { title: 'Legal & Compliance', icon: 'Gavel', color: '#B45AF2', model: 'voyage-law-2' },
                { title: 'Financial Services', icon: 'TrendingUp', color: '#FFC010', model: 'voyage-finance-2' },
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
                      opacity: 0.5,
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
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}
