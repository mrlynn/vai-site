'use client';

import { Box, Chip, Container, Typography } from '@mui/material';
import { palette } from '@/theme/theme';

interface ModelGroup {
  category: string;
  color: string;
  models: string[];
}

const modelGroups: ModelGroup[] = [
  {
    category: 'Text Embedding',
    color: palette.accent,
    models: [
      'voyage-4-large',
      'voyage-4',
      'voyage-4-lite',
      'voyage-code-3',
      'voyage-finance-2',
      'voyage-law-2',
    ],
  },
  {
    category: 'Multimodal',
    color: palette.purple,
    models: ['voyage-multimodal-3.5'],
  },
  {
    category: 'Reranking',
    color: palette.blue,
    models: ['rerank-2.5', 'rerank-2.5-lite'],
  },
];

export default function Models() {
  return (
    <Box component="section" id="models" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontSize: { xs: '1.8rem', md: '2.4rem' },
            color: palette.text,
          }}
        >
          Supported Models
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            mb: 8,
            color: palette.textMuted,
            fontSize: '1.1rem',
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          Access the full range of Voyage AI models for text, multimodal, and reranking tasks.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            maxWidth: 800,
            mx: 'auto',
          }}
        >
          {modelGroups.map((group) => (
            <Box
              key={group.category}
              sx={{
                bgcolor: palette.bgCard,
                border: `1px solid ${palette.border}`,
                borderRadius: 3,
                p: 3.5,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: group.color,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontSize: '0.8rem',
                  mb: 2,
                }}
              >
                {group.category}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {group.models.map((model) => (
                  <Chip
                    key={model}
                    label={model}
                    sx={{
                      fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                      fontSize: '0.85rem',
                      bgcolor: `${group.color}12`,
                      color: palette.text,
                      border: `1px solid ${group.color}33`,
                      fontWeight: 500,
                      py: 2.2,
                      '&:hover': {
                        bgcolor: `${group.color}22`,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
