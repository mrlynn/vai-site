'use client';

import { Box, Chip, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { palette } from '@/theme/theme';

interface Model {
  name: string;
  category: 'embed' | 'multimodal' | 'rerank';
  mtebScore?: string;
  price: string;
  bestFor: string;
  recommended?: boolean;
}

const models: Model[] = [
  { name: 'voyage-3-large', category: 'embed', mtebScore: '67.29', price: '$0.06', bestFor: 'Highest quality', recommended: true },
  { name: 'voyage-3', category: 'embed', mtebScore: '66.42', price: '$0.06', bestFor: 'General purpose' },
  { name: 'voyage-3-lite', category: 'embed', mtebScore: '62.38', price: '$0.02', bestFor: 'High volume, lower cost' },
  { name: 'voyage-code-3', category: 'embed', mtebScore: '—', price: '$0.06', bestFor: 'Code & technical docs' },
  { name: 'voyage-finance-2', category: 'embed', mtebScore: '—', price: '$0.12', bestFor: 'Financial documents' },
  { name: 'voyage-law-2', category: 'embed', mtebScore: '—', price: '$0.12', bestFor: 'Legal documents' },
  { name: 'voyage-multimodal-3.5', category: 'multimodal', price: '$0.12', bestFor: 'Image + text search' },
  { name: 'rerank-2.5', category: 'rerank', price: '$0.05', bestFor: 'Highest rerank quality', recommended: true },
  { name: 'rerank-2.5-lite', category: 'rerank', price: '$0.02', bestFor: 'Fast reranking' },
];

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
          9 specialized models. One shared space.
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            mb: 3,
            color: palette.textMuted,
            fontSize: '1.1rem',
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Embed documents with voyage-3-large, query with voyage-3-lite — 
          same vector space, 67% cost reduction.
        </Typography>

        {/* Pricing highlight */}
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

        {/* Models table */}
        <TableContainer
          sx={{
            bgcolor: palette.bgCard,
            border: `1px solid ${palette.border}`,
            borderRadius: 3,
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: palette.textDim, fontWeight: 700, borderColor: palette.border }}>Model</TableCell>
                <TableCell sx={{ color: palette.textDim, fontWeight: 700, borderColor: palette.border }}>Type</TableCell>
                <TableCell sx={{ color: palette.textDim, fontWeight: 700, borderColor: palette.border, textAlign: 'center' }}>MTEB</TableCell>
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
                  }}
                >
                  <TableCell sx={{ borderColor: palette.border }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                          fontSize: '0.85rem',
                          color: palette.text,
                          fontWeight: model.recommended ? 600 : 400,
                        }}
                      >
                        {model.name}
                      </Typography>
                      {model.recommended && (
                        <CheckCircleIcon sx={{ fontSize: 16, color: categoryColors[model.category] }} />
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
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        height: 24,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ borderColor: palette.border, textAlign: 'center' }}>
                    <Typography
                      sx={{
                        color: model.mtebScore && model.mtebScore !== '—' ? palette.accent : palette.textMuted,
                        fontWeight: model.mtebScore && model.mtebScore !== '—' ? 600 : 400,
                        fontSize: '0.9rem',
                      }}
                    >
                      {model.mtebScore || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: palette.border, textAlign: 'right' }}>
                    <Typography sx={{ color: palette.text, fontWeight: 500, fontSize: '0.9rem' }}>
                      {model.price}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: palette.border }}>
                    <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem' }}>
                      {model.bestFor}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Shared embedding space callout */}
        <Box
          sx={{
            mt: 4,
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
            All voyage-3 models share the same embedding space. Index documents with voyage-3-large 
            for best quality, then query with voyage-3-lite to save 67% on API costs.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
