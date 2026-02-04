'use client';

import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { palette } from '@/theme/theme';

const features = [
  {
    icon: '⚡',
    title: 'Embed',
    description: 'Generate vector embeddings for any text using Voyage AI\'s state-of-the-art models.',
    color: palette.accent,
  },
  {
    icon: '⚖️',
    title: 'Compare',
    description: 'Measure cosine similarity, dot product, and euclidean distance between texts.',
    color: palette.blue,
  },
  {
    icon: '🔮',
    title: 'Multimodal',
    description: 'Compare images and text in the same vector space with multimodal embeddings.',
    color: palette.purple,
  },
  {
    icon: '🔍',
    title: 'Rerank',
    description: 'Re-order documents by semantic relevance to improve search quality.',
    color: '#FF6B6B',
  },
  {
    icon: '⏱',
    title: 'Benchmark',
    description: 'Compare model latency, embedding quality, and costs across different models.',
    color: '#FFA94D',
  },
  {
    icon: '📚',
    title: 'Explore',
    description: 'Learn about embeddings, vector search, and RAG concepts with interactive guides.',
    color: '#69DB7C',
  },
];

export default function Features() {
  return (
    <Box
      component="section"
      id="features"
      sx={{ py: { xs: 8, md: 12 }, bgcolor: palette.bgSurface }}
    >
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
          Everything you need to work with embeddings
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            mb: 8,
            color: palette.textMuted,
            fontSize: '1.1rem',
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Six powerful tools in one CLI — from generating embeddings to benchmarking models.
        </Typography>

        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: palette.bgCard,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: `${feature.color}66`,
                    boxShadow: `0 8px 32px ${feature.color}15`,
                  },
                }}
              >
                <CardContent sx={{ p: 3.5 }}>
                  <Box
                    sx={{
                      fontSize: '2rem',
                      mb: 2,
                      width: 52,
                      height: 52,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      bgcolor: `${feature.color}15`,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ mb: 1, color: palette.text, fontWeight: 700 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{ color: palette.textMuted, lineHeight: 1.6, fontSize: '0.95rem' }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
