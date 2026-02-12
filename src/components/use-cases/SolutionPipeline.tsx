'use client';

import { Box, Container, Typography } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import HubIcon from '@mui/icons-material/Hub';
import StorageIcon from '@mui/icons-material/Storage';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { palette } from '@/theme/theme';

interface SolutionPipelineProps {
  solutionSummary: string;
  accent: string;
}

const pipelineSteps = [
  { icon: FolderOpenIcon, label: 'Documents', sub: 'Your files' },
  { icon: ContentCutIcon, label: 'Chunk', sub: 'Split text' },
  { icon: HubIcon, label: 'Embed', sub: 'Voyage AI' },
  { icon: StorageIcon, label: 'Index', sub: 'MongoDB Atlas' },
  { icon: SearchIcon, label: 'Search', sub: 'Semantic query' },
];

export default function SolutionPipeline({ solutionSummary, accent }: SolutionPipelineProps) {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: palette.bgSurface,
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
          The Solution
        </Typography>
        <Box
          sx={{
            width: 48,
            height: 3,
            bgcolor: accent,
            borderRadius: 2,
            mb: 4,
          }}
        />

        <Typography
          sx={{
            color: palette.textDim,
            fontSize: { xs: '1rem', md: '1.1rem' },
            lineHeight: 1.8,
            mb: 5,
          }}
        >
          {solutionSummary}
        </Typography>

        {/* Pipeline diagram */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 1, md: 2 },
            flexWrap: 'wrap',
            p: 3,
            bgcolor: palette.bgCard,
            borderRadius: 2,
            border: `1px solid ${palette.border}`,
          }}
        >
          {pipelineSteps.map((step, i) => (
            <Box key={step.label} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: `${accent}12`,
                    border: `1px solid ${accent}25`,
                    mb: 0.5,
                  }}
                >
                  <step.icon sx={{ fontSize: 24, color: accent }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: palette.text,
                    display: 'block',
                  }}
                >
                  {step.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    color: palette.textMuted,
                    display: 'block',
                  }}
                >
                  {step.sub}
                </Typography>
              </Box>
              {i < pipelineSteps.length - 1 && (
                <ArrowForwardIcon
                  sx={{
                    fontSize: 16,
                    color: palette.textMuted,
                    mt: -2,
                    display: { xs: 'none', sm: 'block' },
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
