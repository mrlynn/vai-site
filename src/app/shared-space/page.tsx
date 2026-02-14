'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { palette } from '@/theme/theme';

const PRESETS = [
  {
    label: 'Tech Docs',
    document:
      'Kubernetes uses pods as the smallest deployable unit. A pod encapsulates one or more containers, storage resources, a unique network IP, and options that govern how the containers should run. Pods support co-located helper processes like logging agents and represent a logical host for tightly coupled application components.',
    query: 'How does container orchestration work?',
  },
  {
    label: 'Legal',
    document:
      'The lessee shall maintain the premises in good condition and repair, ordinary wear and tear excepted. The lessee shall not make any alterations, additions, or improvements to the premises without the prior written consent of the lessor. All fixtures and improvements shall become the property of the lessor upon termination.',
    query: "What are the tenant's maintenance obligations?",
  },
  {
    label: 'Finance',
    document:
      'The company reported Q3 revenue of $4.2B, representing a 23% year-over-year increase. Operating margins expanded to 34.5%, driven by cloud services growth. Free cash flow reached $1.8B, enabling the board to authorize an additional $5B share repurchase program.',
    query: 'What was the quarterly revenue performance?',
  },
  {
    label: 'Healthcare',
    document:
      'Patients presenting with acute chest pain should undergo immediate 12-lead ECG within 10 minutes of arrival. Troponin levels should be measured at presentation and at 3 hours. Risk stratification using HEART score determines disposition: low risk (0-3) for outpatient follow-up, moderate (4-6) for observation, high (7-10) for cardiology consultation.',
    query: 'What is the protocol for chest pain evaluation?',
  },
  {
    label: 'General',
    document:
      'The James Webb Space Telescope uses a 6.5-meter primary mirror composed of 18 hexagonal gold-plated beryllium segments. Operating at the second Lagrange point (L2), approximately 1.5 million kilometers from Earth, it captures infrared light from the earliest galaxies formed after the Big Bang.',
    query: 'How does the new space telescope capture images?',
  },
];

interface EmbeddingInfo {
  model: string;
  documentTokens: number;
  queryTokens: number;
  costPerMillion: number;
  documentCost: number;
  queryCost: number;
}

interface Similarity {
  a: string;
  b: string;
  similarity: number;
}

interface Projection {
  label: string;
  type: 'document' | 'query' | 'control';
  model: string;
  x: number;
  y: number;
}

interface Insight {
  crossModelSimilarity: number;
  sameModelSimilarity: number;
  qualityRetention: number;
  savingsPercent: number;
  monthlyAt1M: { symmetric: number; asymmetric: number };
}

interface ApiResponse {
  embeddings: EmbeddingInfo[];
  similarities: Similarity[];
  projection: Projection[];
  insight: Insight;
}

function sendTelemetry(event: string, extra: Record<string, unknown> = {}) {
  fetch('/api/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, version: 'web', context: 'shared-space', ...extra }),
  }).catch(() => {});
}

export default function SharedSpacePage() {
  const [documentText, setDocumentText] = useState('');
  const [queryText, setQueryText] = useState('');
  const [preset, setPreset] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState('');

  const handlePreset = (value: string) => {
    setPreset(value);
    const p = PRESETS.find((p) => p.label === value);
    if (p) {
      setDocumentText(p.document);
      setQueryText(p.query);
    }
  };

  const handleExplore = async () => {
    if (!documentText.trim() || !queryText.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/shared-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText, queryText }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Request failed');
      }
      const data: ApiResponse = await res.json();
      setResult(data);
      sendTelemetry('shared_space_explore', {
        preset: preset || 'custom',
        docLength: documentText.length,
        queryLength: queryText.length,
        crossModelSimilarity: data.insight.crossModelSimilarity,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    sendTelemetry('shared_space_share', { platform: 'linkedin' });
    const text = result
      ? `I just explored Voyage AI's shared embedding space! Cross-model similarity: ${result.insight.crossModelSimilarity.toFixed(2)} — asymmetric retrieval saves ${result.insight.savingsPercent}% on query costs. Try it yourself:`
      : 'Check out the Voyage AI Shared Space Explorer — visualize how embedding models share the same vector space!';
    const url = 'https://vaicli.com/shared-space';
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
      '_blank',
    );
  };

  return (
    <Box sx={{ bgcolor: palette.bg, minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Typography variant="h3" sx={{ color: palette.text, fontWeight: 700, mb: 1 }}>
          Shared Space Explorer
        </Typography>
        <Typography variant="h6" sx={{ color: palette.textDim, mb: 4, fontWeight: 400 }}>
          Embed text with 3 Voyage AI models simultaneously and see that vectors land in the same
          semantic neighborhood.
        </Typography>

        {/* Input Panel */}
        <Card sx={{ bgcolor: palette.bgSurface, mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Preset</InputLabel>
                <Select
                  value={preset}
                  label="Preset"
                  onChange={(e) => handlePreset(e.target.value)}
                >
                  {PRESETS.map((p) => (
                    <MenuItem key={p.label} value={p.label}>
                      {p.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="📄 Document Text"
                  multiline
                  rows={3}
                  fullWidth
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: palette.border },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="🔍 Query Text"
                  multiline
                  rows={3}
                  fullWidth
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: palette.border },
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              onClick={handleExplore}
              disabled={loading || !documentText.trim() || !queryText.trim()}
              sx={{
                bgcolor: palette.accent,
                color: palette.bg,
                fontWeight: 700,
                px: 4,
                '&:hover': { bgcolor: palette.accentDim },
              }}
            >
              {loading ? 'Exploring...' : 'Explore →'}
            </Button>
            {error && (
              <Typography sx={{ color: '#ff6b6b', mt: 1, fontSize: '0.875rem' }}>
                {error}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Loading Skeleton */}
        {loading && (
          <Grid container spacing={3}>
            {[0, 1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Skeleton
                  variant="rounded"
                  height={300}
                  sx={{ bgcolor: palette.bgSurface }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            <Grid container spacing={3}>
              {/* 1. Vector Neighborhood */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: palette.bgSurface, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: palette.text, mb: 2 }}>
                      Vector Neighborhood
                    </Typography>
                    <ScatterChart
                      height={320}
                      series={[
                        {
                          label: 'Document',
                          data: result.projection
                            .filter((p) => p.type === 'document')
                            .map((p) => ({ x: p.x, y: p.y, id: p.label })),
                          color: palette.accent,
                        },
                        {
                          label: 'Query',
                          data: result.projection
                            .filter((p) => p.type === 'query')
                            .map((p) => ({ x: p.x, y: p.y, id: p.label })),
                          color: palette.blue,
                        },
                        {
                          label: 'Control',
                          data: result.projection
                            .filter((p) => p.type === 'control')
                            .map((p) => ({ x: p.x, y: p.y, id: p.label })),
                          color: palette.textMuted,
                        },
                      ]}
                      sx={{
                        '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': {
                          stroke: palette.border,
                        },
                        '& .MuiChartsAxis-tickLabel': { fill: palette.textDim },
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* 2. Similarity Matrix */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: palette.bgSurface, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: palette.text, mb: 2 }}>
                      Similarity Matrix
                    </Typography>
                    <SimilarityMatrix
                      projection={result.projection}
                      similarities={result.similarities}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* 3. Cost Comparison */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: palette.bgSurface, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: palette.text, mb: 2 }}>
                      Cost Comparison (per 1M tokens)
                    </Typography>
                    <BarChart
                      height={280}
                      layout="horizontal"
                      yAxis={[
                        {
                          scaleType: 'band',
                          data: result.embeddings.map((e) => e.model.replace('voyage-', '')),
                        },
                      ]}
                      series={[
                        {
                          data: result.embeddings.map((e) => e.costPerMillion),
                          label: 'Cost / 1M tokens ($)',
                          color: palette.accent,
                        },
                      ]}
                      sx={{
                        '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': {
                          stroke: palette.border,
                        },
                        '& .MuiChartsAxis-tickLabel': { fill: palette.textDim },
                      }}
                    />
                    <Box
                      sx={{
                        mt: 1,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: 'rgba(0, 237, 100, 0.08)',
                        border: `1px solid ${palette.accentDim}`,
                      }}
                    >
                      <Typography sx={{ color: palette.accent, fontSize: '0.8rem' }}>
                        💡 <strong>Asymmetric strategy:</strong> Use voyage-4-large for documents,
                        voyage-4-lite for queries — same quality, {result.insight.savingsPercent}%
                        less cost.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* 4. Insight Card */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: palette.bgSurface, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: palette.text, mb: 2 }}>
                      Insight
                    </Typography>
                    <Typography
                      sx={{ color: palette.accent, fontSize: '2rem', fontWeight: 700, mb: 1 }}
                    >
                      {result.insight.crossModelSimilarity.toFixed(2)}
                    </Typography>
                    <Typography sx={{ color: palette.textDim, fontSize: '0.9rem', mb: 2 }}>
                      Cross-model similarity (v4-large doc ↔ v4-lite query)
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <InsightRow
                        label="Same-model similarity"
                        value={result.insight.sameModelSimilarity.toFixed(2)}
                      />
                      <InsightRow
                        label="Quality retained"
                        value={`${result.insight.qualityRetention.toFixed(1)}%`}
                      />
                      <InsightRow
                        label="Query cost savings"
                        value={`${result.insight.savingsPercent}%`}
                        accent
                      />
                      <Box
                        sx={{
                          mt: 1,
                          p: 2,
                          borderRadius: 1,
                          bgcolor: palette.bgCard,
                          border: `1px solid ${palette.border}`,
                        }}
                      >
                        <Typography sx={{ color: palette.textDim, fontSize: '0.85rem' }}>
                          At 1M queries/month:
                        </Typography>
                        <Typography sx={{ color: palette.text, fontSize: '1.1rem', fontWeight: 600 }}>
                          ${result.insight.monthlyAt1M.symmetric.toFixed(2)}/mo →{' '}
                          <Box component="span" sx={{ color: palette.accent }}>
                            ${result.insight.monthlyAt1M.asymmetric.toFixed(2)}/mo
                          </Box>
                        </Typography>
                      </Box>
                    </Box>

                    <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem', mt: 2 }}>
                      Because Voyage AI models share the same vector space, you can embed documents
                      with the most powerful model and queries with the cheapest — vectors remain
                      compatible for retrieval.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Share Section */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={handleShare}
                sx={{
                  borderColor: palette.blue,
                  color: palette.blue,
                  '&:hover': { borderColor: palette.blue, bgcolor: 'rgba(4, 152, 236, 0.1)' },
                }}
              >
                Share on LinkedIn
              </Button>
              <Button
                variant="outlined"
                href="https://github.com/mrlynn/voyageai-cli"
                target="_blank"
                sx={{
                  borderColor: palette.accent,
                  color: palette.accent,
                  '&:hover': { borderColor: palette.accentDim, bgcolor: 'rgba(0, 237, 100, 0.1)' },
                }}
              >
                Try vai →
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}

function InsightRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography sx={{ color: palette.textDim, fontSize: '0.9rem' }}>{label}</Typography>
      <Typography
        sx={{
          color: accent ? palette.accent : palette.text,
          fontWeight: 600,
          fontSize: '0.95rem',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function SimilarityMatrix({
  projection,
  similarities,
}: {
  projection: Projection[];
  similarities: Similarity[];
}) {
  const labels = projection.map((p) => p.label);
  const simMap = new Map<string, number>();
  for (const s of similarities) {
    simMap.set(`${s.a}|${s.b}`, s.similarity);
    simMap.set(`${s.b}|${s.a}`, s.similarity);
  }

  const getSim = (a: string, b: string) =>
    a === b ? 1 : simMap.get(`${a}|${b}`) ?? 0;

  const colorForSim = (sim: number) => {
    const t = Math.max(0, Math.min(1, sim));
    const r = Math.round(0 + t * 0);
    const g = Math.round(30 + t * (237 - 30));
    const b = Math.round(43 + t * (100 - 43));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const isHighlight = (a: string, b: string) =>
    (a.includes('large') && a.includes('doc') && b.includes('lite') && b.includes('query')) ||
    (b.includes('large') && b.includes('doc') && a.includes('lite') && a.includes('query'));

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `80px repeat(${labels.length}, 1fr)`,
          gap: '2px',
          fontSize: '0.65rem',
          minWidth: labels.length * 60 + 80,
        }}
      >
        {/* Header row */}
        <Box />
        {labels.map((l) => (
          <Box
            key={`h-${l}`}
            sx={{
              color: palette.textMuted,
              p: 0.5,
              textAlign: 'center',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              height: 80,
            }}
          >
            {l}
          </Box>
        ))}
        {/* Rows */}
        {labels.map((rowLabel) => (
          <Box key={`r-${rowLabel}`} sx={{ display: 'contents' }}>
            <Box
              sx={{
                color: palette.textMuted,
                p: 0.5,
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.6rem',
              }}
            >
              {rowLabel}
            </Box>
            {labels.map((colLabel) => {
              const sim = getSim(rowLabel, colLabel);
              return (
                <Box
                  key={`${rowLabel}-${colLabel}`}
                  sx={{
                    bgcolor: colorForSim(sim),
                    color: sim > 0.7 ? palette.bg : palette.textDim,
                    p: 0.5,
                    textAlign: 'center',
                    borderRadius: 0.5,
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    border: isHighlight(rowLabel, colLabel)
                      ? `2px solid ${palette.accent}`
                      : '2px solid transparent',
                  }}
                >
                  {sim.toFixed(2)}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
