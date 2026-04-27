'use client';

import { Box, Container, Typography, Chip } from '@mui/material';
import Grid from '@mui/material/Grid2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SavingsIcon from '@mui/icons-material/Savings';
import HubIcon from '@mui/icons-material/Hub';
import CategoryIcon from '@mui/icons-material/Category';
import FilterListIcon from '@mui/icons-material/FilterList';
import SpeedIcon from '@mui/icons-material/Speed';
import { palette } from '@/theme/theme';

const advantages = [
  {
    icon: <TrendingUpIcon />,
    title: 'SOTA Quality',
    stat: '#1 MTEB',
    description: 'voyage-3-large ranks #1 on MTEB with 67.29 score, outperforming OpenAI, Cohere, and Google.',
    color: palette.accent,
  },
  {
    icon: <SavingsIcon />,
    title: '83% Cost Savings',
    stat: '$0.02/1M',
    description: 'Starting at $0.02 per million tokens vs OpenAI\'s $0.13 — same quality, fraction of the cost.',
    color: '#FFD93D',
  },
  {
    icon: <HubIcon />,
    title: 'Shared Embedding Space',
    stat: 'Asymmetric',
    description: 'Embed documents with voyage-3-large, query with voyage-3-lite. Same vector space, 4x faster queries.',
    color: palette.blue,
  },
  {
    icon: <CategoryIcon />,
    title: 'Domain Models',
    stat: '4 Domains',
    description: 'Purpose-built models for code, finance, law, and multilingual — outperform general models by 10-20%.',
    color: palette.purple,
  },
  {
    icon: <FilterListIcon />,
    title: 'Two-Stage Retrieval',
    stat: 'Reranking',
    description: 'Combine fast embedding search with neural reranking for optimal precision and recall.',
    color: '#FF6B6B',
  },
  {
    icon: <SpeedIcon />,
    title: 'Production Ready',
    stat: '<100ms',
    description: 'Sub-100ms latency, 99.9% uptime SLA, and enterprise-grade security for production workloads.',
    color: '#4ECDC4',
  },
];

export default function WhyVoyageAI() {
  return (
    <Box
      component="section"
      id="why-voyage"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle gradient background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${palette.bg} 0%, ${palette.bgSurface} 50%, ${palette.bg} 100%)`,
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            label="Learn About Voyage AI"
            size="small"
            sx={{
              mb: 2,
              bgcolor: `${palette.accent}15`,
              color: palette.accent,
              border: `1px solid ${palette.accent}33`,
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              color: palette.text,
            }}
          >
            Why I built this around Voyage AI
          </Typography>
          <Typography
            sx={{
              color: palette.textMuted,
              fontSize: '1.1rem',
              maxWidth: 650,
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            After evaluating embedding providers, Voyage AI stood out for quality and cost. 
            Here&apos;s what makes their models worth exploring.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {advantages.map((item) => (
            <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  height: '100%',
                  p: 3.5,
                  bgcolor: palette.bgCard,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 3,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: `${item.color}66`,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 40px ${item.color}15`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      bgcolor: `${item.color}15`,
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Chip
                    label={item.stat}
                    size="small"
                    sx={{
                      bgcolor: `${item.color}12`,
                      color: item.color,
                      border: `1px solid ${item.color}33`,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 1, color: palette.text, fontWeight: 700, fontSize: '1.1rem' }}
                >
                  {item.title}
                </Typography>
                <Typography sx={{ color: palette.textMuted, lineHeight: 1.6, fontSize: '0.92rem' }}>
                  {item.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Community tool callout */}
        <Box
          sx={{
            mt: 6,
            p: 4,
            bgcolor: palette.bgCard,
            border: `1px solid ${palette.border}`,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '1rem', md: '1.1rem' },
              color: palette.textMuted,
              lineHeight: 1.8,
            }}
          >
            <Box component="span" sx={{ color: palette.text, fontWeight: 600 }}>
              vai is a community-built developer tool
            </Box>
            {' — '}
            designed to help you explore Voyage AI embeddings and MongoDB Atlas Vector Search. 
            Not affiliated with Voyage AI or MongoDB.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
