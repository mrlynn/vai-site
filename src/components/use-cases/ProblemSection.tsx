'use client';

import { Box, Container, Typography } from '@mui/material';
import { palette } from '@/theme/theme';

interface ProblemSectionProps {
  problemStatement: string;
  accent: string;
}

export default function ProblemSection({ problemStatement, accent }: ProblemSectionProps) {
  const paragraphs = problemStatement.split('\n\n').filter(Boolean);

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 8 } }}>
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
          The Problem
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
        {paragraphs.map((p, i) => (
          <Typography
            key={i}
            sx={{
              color: palette.textDim,
              fontSize: { xs: '1rem', md: '1.1rem' },
              lineHeight: 1.8,
              mb: i < paragraphs.length - 1 ? 3 : 0,
            }}
          >
            {p}
          </Typography>
        ))}
      </Container>
    </Box>
  );
}
