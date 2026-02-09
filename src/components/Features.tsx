'use client';

import { Box, Card, CardContent, Container, Typography, Link } from '@mui/material';
import Grid from '@mui/material/Grid2';
import BoltIcon from '@mui/icons-material/Bolt';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ImageIcon from '@mui/icons-material/Image';
import FilterListIcon from '@mui/icons-material/FilterList';
import SpeedIcon from '@mui/icons-material/Speed';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { palette } from '@/theme/theme';

const features = [
  {
    icon: <BoltIcon />,
    title: 'Embed',
    description: 'Generate SOTA embeddings with Voyage AI\'s models — #1 on MTEB at half the cost of OpenAI.',
    tryLink: 'Embed',
    color: palette.accent,
  },
  {
    icon: <CompareArrowsIcon />,
    title: 'Compare',
    description: 'Measure semantic similarity between texts with cosine, dot product, and euclidean distance.',
    tryLink: 'Compare',
    color: palette.blue,
  },
  {
    icon: <ImageIcon />,
    title: 'Multimodal',
    description: 'Embed images and text in a shared vector space — search images with text and vice versa.',
    tryLink: 'Multimodal',
    color: palette.purple,
  },
  {
    icon: <FilterListIcon />,
    title: 'Rerank',
    description: 'Neural reranking improves search precision by 15-30%. Two-stage retrieval made easy.',
    tryLink: 'Rerank',
    color: '#FF6B6B',
  },
  {
    icon: <SpeedIcon />,
    title: 'Benchmark',
    description: 'Compare latency, quality, and cost across models. Make data-driven decisions.',
    tryLink: 'Benchmark',
    color: '#FFA94D',
  },
  {
    icon: <SchoolIcon />,
    title: 'Explore',
    description: '22 interactive guides on embeddings, RAG, vector search, and semantic similarity.',
    tryLink: 'Explore',
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
          Six powerful tools in one CLI — from generating embeddings to benchmarking models and building RAG pipelines.
        </Typography>

        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: palette.bgCard,
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: `${feature.color}66`,
                    boxShadow: `0 8px 32px ${feature.color}15`,
                  },
                }}
              >
                <CardContent sx={{ p: 3.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      mb: 2,
                      width: 52,
                      height: 52,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      bgcolor: `${feature.color}15`,
                      color: feature.color,
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
                    sx={{ color: palette.textMuted, lineHeight: 1.6, fontSize: '0.95rem', flex: 1 }}
                  >
                    {feature.description}
                  </Typography>
                  <Link
                    href={`https://github.com/mrlynn/voyageai-cli#${feature.tryLink.toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mt: 2,
                      color: feature.color,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      '&:hover': {
                        gap: 1,
                      },
                    }}
                  >
                    Try it <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
