'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import { palette } from '@/theme/theme';

export default function SharedSpaceCTA() {
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: palette.bg }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{ color: palette.text, fontWeight: 700, mb: 2, letterSpacing: '-0.02em' }}
        >
          See the Shared Space{' '}
          <Box component="span" sx={{ color: palette.accent }}>
            in Action
          </Box>
        </Typography>
        <Typography sx={{ color: palette.textDim, fontSize: '1.1rem', mb: 1, maxWidth: 600, mx: 'auto' }}>
          Embed the same text with three different models and watch the vectors land in the same
          neighborhood. Cross-model similarity of 0.95+ — proven live, not just claimed.
        </Typography>
        <Typography sx={{ color: palette.textMuted, fontSize: '0.95rem', mb: 4, maxWidth: 600, mx: 'auto' }}>
          Embed documents with the best model. Query with the cheapest. 83% cost savings.
          No re-vectorization. Ever.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            href="/shared-space"
            size="large"
            sx={{
              bgcolor: palette.accent,
              color: palette.bg,
              fontWeight: 700,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              '&:hover': { bgcolor: palette.accentDim },
            }}
          >
            Try the Explorer →
          </Button>
          <Button
            variant="outlined"
            href="https://github.com/mrlynn/voyageai-cli"
            target="_blank"
            size="large"
            sx={{
              borderColor: palette.border,
              color: palette.textDim,
              fontWeight: 600,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              '&:hover': { borderColor: palette.accent, color: palette.accent },
            }}
          >
            Star on GitHub ⭐
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
