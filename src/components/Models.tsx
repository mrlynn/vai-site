'use client';

import {
  Box, Chip, Container, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScienceIcon from '@mui/icons-material/Science';
import { palette } from '@/theme/theme';

interface Model {
  name: string;
  category: 'embed' | 'multimodal' | 'rerank';
  context: string;
  dimensions: string;
  architecture?: string;
  sharedSpace?: string;
  rtebScore?: number;
  price: string;
  bestFor: string;
  recommended?: boolean;
  unreleased?: boolean;
  openWeight?: boolean;
}

const models: Model[] = [
  // ── Voyage 4 family ──
  {
    name: 'voyage-4-large', category: 'embed', context: '32K',
    dimensions: '1024*, 256, 512, 2048', architecture: 'MoE', sharedSpace: 'voyage-4',
    rtebScore: 71.41, price: '$0.12', bestFor: 'Best quality, multilingual', recommended: true,
  },
  {
    name: 'voyage-4', category: 'embed', context: '32K',
    dimensions: '1024*, 256, 512, 2048', architecture: 'Dense', sharedSpace: 'voyage-4',
    rtebScore: 70.07, price: '$0.06', bestFor: 'Balanced quality & cost',
  },
  {
    name: 'voyage-4-lite', category: 'embed', context: '32K',
    dimensions: '1024*, 256, 512, 2048', architecture: 'Dense', sharedSpace: 'voyage-4',
    rtebScore: 68.10, price: '$0.02', bestFor: 'Lowest cost, high volume',
  },
  // ── Domain-specific ──
  {
    name: 'voyage-code-3', category: 'embed', context: '32K',
    dimensions: '1024*, 256, 512, 2048', price: '$0.18', bestFor: 'Code & technical docs',
  },
  {
    name: 'voyage-finance-2', category: 'embed', context: '32K',
    dimensions: '1024', price: '$0.12', bestFor: 'Financial documents',
  },
  {
    name: 'voyage-law-2', category: 'embed', context: '16K',
    dimensions: '1024', price: '$0.12', bestFor: 'Legal documents',
  },
  // ── Specialized ──
  {
    name: 'voyage-context-3', category: 'embed', context: '32K',
    dimensions: '1024*, 256, 512, 2048', price: '$0.18', bestFor: 'Contextualized chunks',
    unreleased: true,
  },
  {
    name: 'voyage-multimodal-3.5', category: 'multimodal', context: '32K',
    dimensions: '1024*, 256, 512, 2048', price: '$0.12/M + $0.60/B px',
    bestFor: 'Text + images + video',
  },
  // ── Open-weight ──
  {
    name: 'voyage-4-nano', category: 'embed', context: '32K',
    dimensions: '512*, 128, 256', architecture: 'Dense', sharedSpace: 'voyage-4',
    price: 'Free (open-weight)', bestFor: 'Edge / local / self-hosted',
    unreleased: true, openWeight: true,
  },
  // ── Reranking ──
  {
    name: 'rerank-2.5', category: 'rerank', context: '32K',
    dimensions: '—', price: '$0.05', bestFor: 'Best reranking quality', recommended: true,
  },
  {
    name: 'rerank-2.5-lite', category: 'rerank', context: '32K',
    dimensions: '—', price: '$0.02', bestFor: 'Fast reranking',
  },
];

/* ── RTEB benchmark comparison ── */
const benchmarks = [
  { model: 'voyage-4-large', provider: 'Voyage AI', score: 71.41 },
  { model: 'voyage-4', provider: 'Voyage AI', score: 70.07 },
  { model: 'Gemini Embed 001', provider: 'Google', score: 68.66 },
  { model: 'voyage-4-lite', provider: 'Voyage AI', score: 68.10 },
  { model: 'Cohere Embed v4', provider: 'Cohere', score: 65.75 },
  { model: 'OpenAI v3 Large', provider: 'OpenAI', score: 62.57 },
];
const maxScore = Math.max(...benchmarks.map((b) => b.score));

const categoryColors: Record<string, string> = {
  embed: palette.accent,
  multimodal: palette.purple,
  rerank: palette.blue,
};

const categoryLabels: Record<string, string> = {
  embed: 'Embedding',
  multimodal: 'Multimodal',
  rerank: 'Reranking',
};

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
          11 specialized models. One{' '}
          <Box
            component="span"
            sx={{
              background: `linear-gradient(135deg, ${palette.accent}, ${palette.blue})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            shared space
          </Box>
          .
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            mb: 3,
            color: palette.textMuted,
            fontSize: '1.1rem',
            maxWidth: 640,
            mx: 'auto',
          }}
        >
          Embed documents with voyage-4-large, query with voyage-4-lite —
          same vector space, 83% cost reduction. The new voyage-4 family sets
          SOTA on RTEB benchmarks.
        </Typography>

        {/* Pricing highlight chips */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mb: 6,
            flexWrap: 'wrap',
          }}
        >
          <Chip
            label="Starting at $0.02/1M tokens"
            sx={{
              bgcolor: `${palette.accent}15`,
              color: palette.accent,
              border: `1px solid ${palette.accent}33`,
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 2.5,
            }}
          />
          <Chip
            label="RTEB #1: 71.41 NDCG@10"
            sx={{
              bgcolor: `${palette.blue}15`,
              color: palette.blue,
              border: `1px solid ${palette.blue}33`,
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 2.5,
            }}
          />
          <Chip
            label="vs OpenAI $0.13/1M"
            sx={{
              bgcolor: 'rgba(255, 107, 107, 0.1)',
              color: '#FF6B6B',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 2.5,
              textDecoration: 'line-through',
            }}
          />
        </Box>

        {/* ── Models table ── */}
        <TableContainer
          sx={{
            bgcolor: palette.bgCard,
            border: `1px solid ${palette.border}`,
            borderRadius: 3,
            maxWidth: 1000,
            mx: 'auto',
            mb: 6,
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: palette.textDim, fontWeight: 700, borderColor: palette.border }}>Model</TableCell>
                <TableCell sx={{ color: palette.textDim, fontWeight: 700, borderColor: palette.border }}>Type</TableCell>
                <TableCell sx={{ color: palette.textDim, fontWeight: 700, borderColor: palette.border, textAlign: 'center' }}>Context</TableCell>
                <TableCell sx={{ color: palette.textDim, fontWeight: 700, borderColor: palette.border, textAlign: 'center' }}>
                  <Tooltip title="NDCG@10 avg across 29 datasets (RTEB benchmark)">
                    <span>RTEB</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ color: palette.textDim, fontWeight: 700, borderColor: palette.border, textAlign: 'right' }}>Price/1M</TableCell>
                <TableCell sx={{ color: palette.textDim, fontWeight: 700, borderColor: palette.border }}>Best For</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map((model) => (
                <TableRow
                  key={model.name}
                  sx={{
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                    ...(model.recommended && {
                      bgcolor: `${categoryColors[model.category]}08`,
                    }),
                    ...(model.unreleased && { opacity: 0.7 }),
                  }}
                >
                  <TableCell sx={{ borderColor: palette.border }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                          fontSize: '0.82rem',
                          color: palette.text,
                          fontWeight: model.recommended ? 600 : 400,
                        }}
                      >
                        {model.name}
                      </Typography>
                      {model.recommended && (
                        <CheckCircleIcon sx={{ fontSize: 15, color: categoryColors[model.category] }} />
                      )}
                      {model.unreleased && (
                        <Chip label="soon" size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: palette.bgSurface, color: palette.textMuted }} />
                      )}
                      {model.sharedSpace && (
                        <Tooltip title={`Shared embedding space: ${model.sharedSpace}`}>
                          <Chip
                            label={model.sharedSpace}
                            size="small"
                            sx={{ height: 18, fontSize: '0.55rem', bgcolor: `${palette.accent}15`, color: palette.accent, display: { xs: 'none', md: 'inline-flex' } }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: palette.border }}>
                    <Chip
                      label={categoryLabels[model.category]}
                      size="small"
                      sx={{
                        bgcolor: `${categoryColors[model.category]}15`,
                        color: categoryColors[model.category],
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        height: 22,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ borderColor: palette.border, textAlign: 'center' }}>
                    <Typography sx={{ color: palette.textDim, fontSize: '0.82rem' }}>
                      {model.context}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: palette.border, textAlign: 'center' }}>
                    <Typography
                      sx={{
                        color: model.rtebScore ? palette.accent : palette.textMuted,
                        fontWeight: model.rtebScore ? 600 : 400,
                        fontSize: '0.85rem',
                      }}
                    >
                      {model.rtebScore?.toFixed(2) || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: palette.border, textAlign: 'right' }}>
                    <Typography sx={{ color: palette.text, fontWeight: 500, fontSize: '0.85rem' }}>
                      {model.price}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: palette.border }}>
                    <Typography sx={{ color: palette.textMuted, fontSize: '0.82rem' }}>
                      {model.bestFor}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── RTEB Benchmark chart ── */}
        <Box sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, justifyContent: 'center' }}>
            <ScienceIcon sx={{ color: palette.blue, fontSize: 20 }} />
            <Typography variant="h6" sx={{ color: palette.text, fontWeight: 600, fontSize: '1rem' }}>
              RTEB Benchmark — NDCG@10 (29 datasets)
            </Typography>
          </Box>
          {benchmarks.map((b) => {
            const isVoyage = b.provider === 'Voyage AI';
            const barPct = ((b.score / maxScore) * 100).toFixed(1);
            return (
              <Box key={b.model} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography
                  sx={{
                    width: 170,
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    color: isVoyage ? palette.accent : palette.textMuted,
                    fontWeight: isVoyage ? 600 : 400,
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {b.model}
                </Typography>
                <Box sx={{ flexGrow: 1, height: 20, bgcolor: palette.bgSurface, borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
                  <Box
                    sx={{
                      width: `${barPct}%`,
                      height: '100%',
                      bgcolor: isVoyage ? palette.accent : palette.textMuted,
                      opacity: isVoyage ? 0.8 : 0.3,
                      borderRadius: 1,
                      transition: 'width 0.6s ease-out',
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    fontWeight: isVoyage ? 700 : 400,
                    color: isVoyage ? palette.text : palette.textMuted,
                    width: 45,
                    flexShrink: 0,
                  }}
                >
                  {b.score.toFixed(2)}
                </Typography>
              </Box>
            );
          })}
          <Typography sx={{ textAlign: 'center', mt: 1.5, color: palette.textMuted, fontSize: '0.7rem' }}>
            Source: Voyage AI, January 2026
          </Typography>
        </Box>

        {/* Shared embedding space callout */}
        <Box
          sx={{
            p: 3,
            bgcolor: palette.bgCard,
            border: `1px solid ${palette.border}`,
            borderRadius: 2,
            maxWidth: 700,
            mx: 'auto',
            textAlign: 'center',
          }}
        >
          <Typography sx={{ color: palette.textDim, fontSize: '0.95rem', lineHeight: 1.7 }}>
            <Box component="span" sx={{ color: palette.accent, fontWeight: 600 }}>
              Pro tip:
            </Box>{' '}
            All voyage-4 models share the same embedding space. Index documents with voyage-4-large
            for best quality, then query with voyage-4-lite to save 83% on API costs —
            no re-indexing needed.
          </Typography>
          <Typography sx={{ color: palette.textMuted, fontSize: '0.75rem', mt: 1 }}>
            * = default dimension; also supports other dimension sizes
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
