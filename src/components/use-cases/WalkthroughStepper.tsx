'use client';

import { Box, Container, Typography, Chip } from '@mui/material';
import { palette } from '@/theme/theme';
import type { WalkthroughStep } from '@/data/use-cases';
import CommandBlock from './CommandBlock';

interface WalkthroughStepperProps {
  steps: WalkthroughStep[];
  accent: string;
}

export default function WalkthroughStepper({ steps, accent }: WalkthroughStepperProps) {
  return (
    <Box
      id="walkthrough"
      component="section"
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: palette.bgSurface,
        scrollMarginTop: 80,
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: palette.text,
            mb: 1,
            fontSize: { xs: '1.5rem', md: '1.8rem' },
          }}
        >
          Walkthrough
        </Typography>
        <Box sx={{ width: 48, height: 3, bgcolor: accent, borderRadius: 2, mb: 2 }} />
        <Typography sx={{ color: palette.textDim, fontSize: '1rem', mb: 5 }}>
          From zero to a searchable knowledge base. Follow these steps, each takes 1-3 minutes.
        </Typography>

        <Box sx={{ position: 'relative' }}>
          {/* Vertical connector line */}
          <Box
            sx={{
              position: 'absolute',
              left: 19,
              top: 24,
              bottom: 24,
              width: 2,
              bgcolor: palette.border,
              display: { xs: 'none', md: 'block' },
            }}
          />

          {steps.map((step) => (
            <Box
              key={step.number}
              sx={{
                display: 'flex',
                gap: { xs: 2, md: 3 },
                mb: 5,
                position: 'relative',
              }}
            >
              {/* Step number circle */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: `${accent}18`,
                  border: `2px solid ${accent}`,
                  color: accent,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  fontFamily: "'Source Code Pro', monospace",
                  zIndex: 1,
                }}
              >
                {step.number}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Mobile step number */}
                <Chip
                  label={`Step ${step.number}`}
                  size="small"
                  sx={{
                    display: { xs: 'inline-flex', md: 'none' },
                    bgcolor: `${accent}18`,
                    color: accent,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    mb: 1,
                    height: 24,
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 600,
                    color: palette.text,
                    fontSize: '1.1rem',
                    mb: 0.5,
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  sx={{
                    color: palette.textDim,
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    mb: 1,
                  }}
                >
                  {step.description}
                </Typography>

                <CommandBlock
                  command={step.command}
                  output={step.expectedOutput}
                  accent={accent}
                />

                {step.notes && (
                  <Box
                    sx={{
                      mt: 1.5,
                      p: 2,
                      bgcolor: `${accent}08`,
                      border: `1px solid ${accent}20`,
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography
                      sx={{
                        color: palette.textDim,
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {step.notes}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
