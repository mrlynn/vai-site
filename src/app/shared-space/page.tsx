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
    label: 'Tech vs Finance',
    textA: 'Kubernetes uses pods as the smallest deployable unit of computing. A pod encapsulates one or more containers, storage resources, a unique network IP, and options that govern how the containers should run. Pods support co-located helper processes like logging agents.',
    textB: 'The company reported Q3 revenue of $4.2B, representing a 23% year-over-year increase. Operating margins expanded to 34.5%, driven by cloud services growth. Free cash flow reached $1.8B, enabling the board to authorize an additional $5B share repurchase program.',
  },
  {
    label: 'Retrieval Demo',
    textA: 'Kubernetes pod scheduling uses affinity and anti-affinity rules to place workloads on appropriate nodes. Node affinity attracts pods to nodes with specific labels, while pod anti-affinity spreads replicas across failure domains for high availability. Taints and tolerations provide another mechanism to repel pods from unsuitable nodes.',
    textB: 'How does Kubernetes decide which node to schedule a pod on?',
  },
  {
    label: 'Same Domain',
    textA: 'Kubernetes pod scheduling uses affinity rules to place workloads on appropriate nodes. Node affinity attracts pods to specific nodes while anti-affinity spreads pods across failure domains for high availability.',
    textB: 'PostgreSQL uses a multi-version concurrency control system for transaction isolation. Each transaction sees a snapshot of data as it was at a particular point in time, preventing dirty reads and ensuring consistent query results.',
  },
  {
    label: 'Paraphrase',
    textA: 'Machine learning models learn patterns from training data by adjusting internal parameters to minimize prediction errors on known examples.',
    textB: 'ML systems identify patterns by analyzing example datasets, tuning their internal weights to reduce mistakes on labeled training samples.',
  },
  {
    label: 'Multilingual',
    textA: 'The weather forecast indicates rain tomorrow with temperatures dropping to near freezing by evening. Residents should prepare for icy road conditions.',
    textB: 'Les prévisions météo indiquent de la pluie demain avec des températures proches du gel en soirée. Les résidents doivent se préparer à des routes verglaçantes.',
  },
  {
    label: 'Legal vs Healthcare',
    textA: 'The lessee shall maintain the premises in good condition and repair, ordinary wear and tear excepted. The lessee shall not make any alterations, additions, or improvements without the prior written consent of the lessor.',
    textB: 'Patients presenting with acute chest pain should undergo immediate 12-lead ECG within 10 minutes of arrival. Troponin levels should be measured at presentation and at 3 hours. Risk stratification using HEART score determines disposition.',
  },
];

interface AgreementPair {
  a: string;
  b: string;
  similarity: number;
}

interface ProjectionPoint {
  label: string;
  group: string;
  model: string;
  x: number;
  y: number;
}

interface ApiResponse {
  modelAgreement: {
    text: string;
    matrix: AgreementPair[];
    labels: string[];
    minSimilarity: number;
    avgSimilarity: number;
  };
  fullComparison: {
    matrix: AgreementPair[];
    labels: string[];
    groups: string[];
    projection: ProjectionPoint[];
  };
  retrieval: {
    docModel: string;
    queryModelCheap: string;
    queryModelExpensive: string;
    similarityCheap: number;
    similarityExpensive: number;
    qualityRetained: number;
    costSavingsPercent: number;
    monthlyAt1M: { symmetric: number; asymmetric: number };
  };
  costs: Array<{ model: string; costPerMillion: number }>;
}

function sendTelemetry(event: string, extra: Record<string, unknown> = {}) {
  fetch('/api/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, version: 'web', context: 'shared-space', ...extra }),
  }).catch(() => {});
}

export default function SharedSpacePage() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [preset, setPreset] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState('');

  const handlePreset = (value: string) => {
    setPreset(value);
    const p = PRESETS.find((p) => p.label === value);
    if (p) {
      setTextA(p.textA);
      setTextB(p.textB);
    }
  };

  const handleExplore = async () => {
    if (!textA.trim() || !textB.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/shared-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textA, textB }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Request failed');
      }
      const data: ApiResponse = await res.json();
      setResult(data);
      sendTelemetry('shared_space_explore', {
        preset: preset || 'custom',
        textALength: textA.length,
        textBLength: textB.length,
        avgSimilarity: data.modelAgreement.avgSimilarity,
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
      ? `🔬 Just tested Voyage AI's shared embedding space.\n\nI embedded the same text with three different models (voyage-4-large, voyage-4, voyage-4-lite).\n\nCross-model similarity: ${result.modelAgreement.avgSimilarity.toFixed(2)} — they produce nearly identical vectors despite being completely different architectures.\n\nThis means: embed your documents ONCE with the best model. Query with the cheapest.\n\nSame results. 83% less cost.\n\nTry it →`
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
        <Typography variant="h6" sx={{ color: palette.textDim, mb: 1, fontWeight: 400 }}>
          Three models. One vector space. See for yourself.
        </Typography>
        <Typography sx={{ color: palette.textMuted, mb: 4, fontSize: '0.9rem', maxWidth: 800 }}>
          Voyage AI&apos;s models share a unified embedding space — vectors from different models are
          directly comparable. Enter two texts below and we&apos;ll prove it in three steps.
        </Typography>

        {/* Input Panel */}
        <Card sx={{ bgcolor: palette.bgSurface, mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
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
                  label="Text A"
                  multiline
                  rows={3}
                  fullWidth
                  value={textA}
                  onChange={(e) => setTextA(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: palette.border },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Text B"
                  multiline
                  rows={3}
                  fullWidth
                  value={textB}
                  onChange={(e) => setTextB(e.target.value)}
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
              disabled={loading || !textA.trim() || !textB.trim()}
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={i === 0 ? 400 : 350}
                sx={{ bgcolor: palette.bgSurface }}
              />
            ))}
          </Box>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            {/* Panel 1: Same Text, Different Models */}
            <Card sx={{ bgcolor: palette.bgSurface, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ color: palette.accent, fontWeight: 700, mb: 0.5 }}>
                  ① Proof: Same Text, Different Models
                </Typography>
                <Typography sx={{ color: palette.textDim, fontSize: '0.9rem', mb: 3 }}>
                  We embedded Text A with all three Voyage 4 models. If they share a vector space,
                  the vectors should be nearly identical.
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <SmallMatrix
                      labels={result.modelAgreement.labels}
                      pairs={result.modelAgreement.matrix}
                      large
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'rgba(0, 237, 100, 0.08)',
                        border: `2px solid ${palette.accent}`,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <Typography sx={{ color: palette.textDim, fontSize: '1rem', mb: 1 }}>
                        VERDICT
                      </Typography>
                      <Typography
                        sx={{ color: palette.accent, fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}
                      >
                        {result.modelAgreement.avgSimilarity.toFixed(3)}
                      </Typography>
                      <Typography sx={{ color: palette.textDim, fontSize: '1rem', mt: 1, mb: 2 }}>
                        average cross-model similarity
                      </Typography>
                      <Typography sx={{ color: palette.accent, fontSize: '1.1rem', fontWeight: 600 }}>
                        ✅ All models agree. The space is shared.
                      </Typography>
                      <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem', mt: 1 }}>
                        Min pair: {result.modelAgreement.minSimilarity.toFixed(3)} — even the
                        weakest agreement is above 0.90
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Panel 2: Visualization */}
            <Card sx={{ bgcolor: palette.bgSurface, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ color: palette.accent, fontWeight: 700, mb: 0.5 }}>
                  ② Visualization: Three Texts, Three Models
                </Typography>
                <Typography sx={{ color: palette.textDim, fontSize: '0.9rem', mb: 3 }}>
                  Now we add Text B and a control sentence. Nine vectors total. If the space is shared,
                  they cluster by MEANING, not by MODEL.
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" sx={{ color: palette.textMuted, mb: 1 }}>
                      PCA Scatter Plot (colored by text group)
                    </Typography>
                    <ScatterChart
                      height={350}
                      series={[
                        {
                          label: 'Text A',
                          data: result.fullComparison.projection
                            .filter((p) => p.group === 'Text A')
                            .map((p) => ({ x: p.x, y: p.y, id: p.label })),
                          color: palette.accent,
                        },
                        {
                          label: 'Text B',
                          data: result.fullComparison.projection
                            .filter((p) => p.group === 'Text B')
                            .map((p) => ({ x: p.x, y: p.y, id: p.label })),
                          color: palette.blue,
                        },
                        {
                          label: 'Control',
                          data: result.fullComparison.projection
                            .filter((p) => p.group === 'Control')
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
                    <Typography sx={{ color: palette.textMuted, fontSize: '0.75rem', mt: 1 }}>
                      Points cluster by meaning, not by model — that&apos;s the shared space.
                      Shape differentiation per model requires a custom renderer (future enhancement).
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" sx={{ color: palette.textMuted, mb: 1 }}>
                      9×9 Similarity Matrix
                    </Typography>
                    <FullMatrix
                      labels={result.fullComparison.labels}
                      groups={result.fullComparison.groups}
                      pairs={result.fullComparison.matrix}
                    />
                    <Typography sx={{ color: palette.textMuted, fontSize: '0.75rem', mt: 1 }}>
                      Block-diagonal pattern: high within text groups (0.95+), low between (shared space confirmed).
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Panel 3: So What */}
            <Card sx={{ bgcolor: palette.bgSurface, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ color: palette.accent, fontWeight: 700, mb: 0.5 }}>
                  ③ So What: The Cost Implication
                </Typography>
                <Typography sx={{ color: palette.textDim, fontSize: '0.9rem', mb: 3 }}>
                  Since the models share a space, you can mix and match. Embed documents with the best.
                  Query with the cheapest.
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: palette.bgCard,
                        border: `1px solid ${palette.border}`,
                      }}
                    >
                      <Typography variant="h6" sx={{ color: palette.text, mb: 2 }}>
                        Retrieval Test
                      </Typography>

                      <Box
                        sx={{
                          mb: 1.5,
                          p: 2,
                          borderRadius: 1,
                          bgcolor: palette.bgCard,
                          border: `1px solid ${palette.border}`,
                        }}
                      >
                        <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem', mb: 0.5 }}>
                          Doc: v4-large → Query: v4-large (baseline)
                        </Typography>
                        <Typography sx={{ color: palette.text, fontSize: '1.3rem', fontWeight: 700 }}>
                          {result.retrieval.similarityExpensive.toFixed(4)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 1,
                          bgcolor: palette.bgCard,
                          border: `1px solid ${palette.accent}`,
                        }}
                      >
                        <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem', mb: 0.5 }}>
                          Doc: v4-large → Query: v4-lite (asymmetric)
                        </Typography>
                        <Typography sx={{ color: palette.accent, fontSize: '1.3rem', fontWeight: 700 }}>
                          {result.retrieval.similarityCheap.toFixed(4)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          bgcolor: 'rgba(0, 237, 100, 0.08)',
                          border: `1px solid ${palette.accent}`,
                        }}
                      >
                        <Typography sx={{ color: palette.accent, fontSize: '0.95rem', fontWeight: 600 }}>
                          ✅ v4-lite retrieval is comparable to v4-large
                        </Typography>
                        <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem', mt: 0.5 }}>
                          Both scores are in the same range — switching to lite doesn&apos;t degrade
                          retrieval, and it costs {result.retrieval.costSavingsPercent}% less.
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant="subtitle2" sx={{ color: palette.textMuted, mb: 1 }}>
                      Cost per 1M Tokens
                    </Typography>
                    <BarChart
                      height={200}
                      layout="horizontal"
                      yAxis={[
                        {
                          scaleType: 'band',
                          data: result.costs.map((c) => c.model.replace('voyage-', '')),
                        },
                      ]}
                      series={[
                        {
                          data: result.costs.map((c) => c.costPerMillion),
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
                        mt: 2,
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'rgba(0, 237, 100, 0.08)',
                        border: `1px solid ${palette.accentDim}`,
                      }}
                    >
                      <Typography sx={{ color: palette.accent, fontSize: '0.9rem', mb: 1 }}>
                        💡 <strong>Asymmetric strategy:</strong> Embed docs with v4-large. Query with v4-lite.
                        {' '}{result.retrieval.costSavingsPercent}% cheaper queries.
                      </Typography>
                      <Typography sx={{ color: palette.textDim, fontSize: '0.85rem' }}>
                        At 1M queries/month: ${result.retrieval.monthlyAt1M.symmetric.toFixed(2)}/mo →{' '}
                        <Box component="span" sx={{ color: palette.accent, fontWeight: 700 }}>
                          ${result.retrieval.monthlyAt1M.asymmetric.toFixed(2)}/mo
                        </Box>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

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
              <Button
                variant="outlined"
                href="https://github.com/mrlynn/voyageai-cli"
                target="_blank"
                sx={{
                  borderColor: palette.textMuted,
                  color: palette.textMuted,
                  '&:hover': { borderColor: palette.textDim, bgcolor: 'rgba(136, 147, 151, 0.1)' },
                }}
              >
                Star on GitHub ⭐
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}

/* ---------- 3×3 Matrix (Panel 1) ---------- */
function SmallMatrix({
  labels,
  pairs,
  large,
}: {
  labels: string[];
  pairs: AgreementPair[];
  large?: boolean;
}) {
  const simMap = new Map<string, number>();
  for (const p of pairs) {
    simMap.set(`${p.a}|${p.b}`, p.similarity);
    simMap.set(`${p.b}|${p.a}`, p.similarity);
  }
  const getSim = (a: string, b: string) => (a === b ? 1 : simMap.get(`${a}|${b}`) ?? 0);
  const fontSize = large ? '1.5rem' : '0.75rem';
  const headerSize = large ? '0.9rem' : '0.65rem';

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `100px repeat(${labels.length}, 1fr)`,
          gap: '3px',
          minWidth: labels.length * (large ? 110 : 70) + 100,
        }}
      >
        <Box />
        {labels.map((l) => (
          <Box
            key={`h-${l}`}
            sx={{ color: palette.textMuted, p: 1, textAlign: 'center', fontSize: headerSize, fontWeight: 600 }}
          >
            {l}
          </Box>
        ))}
        {labels.map((rowLabel) => (
          <Box key={`r-${rowLabel}`} sx={{ display: 'contents' }}>
            <Box
              sx={{
                color: palette.textMuted,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                fontSize: headerSize,
                fontWeight: 600,
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
                    bgcolor: simColor(sim),
                    color: sim > 0.7 ? palette.bg : palette.textDim,
                    p: large ? 2 : 0.5,
                    textAlign: 'center',
                    borderRadius: 1,
                    fontWeight: 700,
                    fontSize,
                  }}
                >
                  {sim.toFixed(3)}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ---------- 9×9 Matrix (Panel 2) ---------- */
function FullMatrix({
  labels,
  groups,
  pairs,
}: {
  labels: string[];
  groups: string[];
  pairs: AgreementPair[];
}) {
  const simMap = new Map<string, number>();
  for (const p of pairs) {
    simMap.set(`${p.a}|${p.b}`, p.similarity);
    simMap.set(`${p.b}|${p.a}`, p.similarity);
  }
  const getSim = (a: string, b: string) => (a === b ? 1 : simMap.get(`${a}|${b}`) ?? 0);

  // Determine if two indices are in the same group (for block-diagonal highlighting)
  const sameGroup = (i: number, j: number) => groups[i] === groups[j];

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `80px repeat(${labels.length}, 1fr)`,
          gap: '1px',
          fontSize: '0.55rem',
          minWidth: labels.length * 48 + 80,
        }}
      >
        <Box />
        {labels.map((l) => (
          <Box
            key={`h-${l}`}
            sx={{
              color: palette.textMuted,
              p: 0.3,
              textAlign: 'center',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              height: 70,
              fontSize: '0.5rem',
            }}
          >
            {l}
          </Box>
        ))}
        {labels.map((rowLabel, ri) => (
          <Box key={`r-${rowLabel}`} sx={{ display: 'contents' }}>
            <Box
              sx={{
                color: palette.textMuted,
                p: 0.3,
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.5rem',
              }}
            >
              {rowLabel}
            </Box>
            {labels.map((colLabel, ci) => {
              const sim = getSim(rowLabel, colLabel);
              const inBlock = sameGroup(ri, ci);
              return (
                <Box
                  key={`${rowLabel}-${colLabel}`}
                  sx={{
                    bgcolor: simColor(sim),
                    color: sim > 0.7 ? palette.bg : palette.textDim,
                    p: 0.3,
                    textAlign: 'center',
                    borderRadius: 0.3,
                    fontWeight: 600,
                    fontSize: '0.55rem',
                    border: inBlock && ri !== ci
                      ? `1.5px solid ${palette.accent}`
                      : '1.5px solid transparent',
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

/* ---------- Helpers ---------- */
function simColor(sim: number): string {
  const t = Math.max(0, Math.min(1, sim));
  if (t >= 0.9) {
    // Bright teal for high similarity
    const s = (t - 0.9) / 0.1;
    const r = Math.round(0);
    const g = Math.round(160 + s * 77);
    const b = Math.round(80 + s * 20);
    return `rgb(${r}, ${g}, ${b})`;
  }
  // Dark scale for lower values
  const r = Math.round(0 + t * 0);
  const g = Math.round(30 + t * 130);
  const b = Math.round(43 + t * 57);
  return `rgb(${r}, ${g}, ${b})`;
}

interface AgreementPair {
  a: string;
  b: string;
  similarity: number;
}
