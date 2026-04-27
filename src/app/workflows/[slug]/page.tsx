'use client';

import {
  Box, Container, Typography, Chip, Breadcrumbs, Link as MuiLink,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Button, Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { palette } from '@/theme/theme';
import workflows from '@/data/workflows.json';
import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import WorkflowCard, { type WorkflowEntry } from '@/components/workflows/WorkflowCard';

const allWorkflows = workflows as unknown as WorkflowEntry[];

/* ── tool color mapping ── */
const toolColorMap: Record<string, string> = {
  query: '#00BCD4', search: '#00BCD4', rerank: '#00BCD4',
  embed: '#9C27B0', similarity: '#9C27B0',
  estimate: '#FF9800', models: '#FF9800', collections: '#FF9800', explain: '#FF9800',
  merge: '#607D8B', filter: '#607D8B', transform: '#607D8B',
  generate: '#4CAF50',
  ingest: '#2196F3',
};

const toolCategoryLabel: Record<string, string> = {
  query: 'Retrieval', search: 'Retrieval', rerank: 'Retrieval',
  embed: 'Embedding', similarity: 'Embedding',
  generate: 'Generation',
  ingest: 'Storage',
  merge: 'Control Flow', filter: 'Control Flow', transform: 'Control Flow',
};

/* ── copy block ── */
function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ color: palette.textMuted, mb: 0.5, display: 'block' }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, borderRadius: 2, px: 2, py: 1 }}>
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: palette.accent, flexGrow: 1, overflow: 'auto', whiteSpace: 'nowrap' }}>
          {text}
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy'}>
          <IconButton size="small" onClick={handleCopy} sx={{ color: palette.textMuted, ml: 1 }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

/* ── Install CTA sidebar ── */
function InstallCTA({ w, displayName }: { w: WorkflowEntry; displayName: string }) {
  const installCmd = `vai workflow install ${w.name.replace('@vaicli/', '')}`;
  const npmCmd = `npm install ${w.name}`;

  return (
    <Box
      sx={{
        bgcolor: palette.bgCard,
        border: `1px solid ${palette.border}`,
        borderRadius: 3,
        p: 3,
        position: { md: 'sticky' },
        top: { md: 100 },
      }}
    >
      <Typography variant="subtitle1" sx={{ color: palette.text, fontWeight: 700, mb: 2 }}>
        Install
      </Typography>

      <CopyBlock label="Via vai CLI" text={installCmd} />

      <Typography variant="caption" sx={{ color: palette.textMuted, display: 'block', textAlign: 'center', mb: 1 }}>
        — or —
      </Typography>

      <CopyBlock label="Via npm" text={npmCmd} />

      <Stack spacing={1} sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          href={`https://www.npmjs.com/package/${w.name}`}
          target="_blank"
          fullWidth
          sx={{ color: palette.textDim, borderColor: palette.border, textTransform: 'none', '&:hover': { borderColor: palette.textMuted } }}
        >
          View on npm
        </Button>
        <Button
          variant="outlined"
          startIcon={<GitHubIcon />}
          href={`https://github.com/mrlynn/vai-workflows/tree/main/packages/vai-workflow-${w.slug}`}
          target="_blank"
          fullWidth
          sx={{ color: palette.textDim, borderColor: palette.border, textTransform: 'none', '&:hover': { borderColor: palette.textMuted } }}
        >
          View Source
        </Button>
      </Stack>
    </Box>
  );
}

/* ── Main Page ── */
export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const w = allWorkflows.find((wf) => wf.slug === slug);

  const related = useMemo(() => {
    if (!w) return [];
    return allWorkflows
      .filter((wf) => wf.slug !== slug)
      .map((wf) => ({
        wf,
        score:
          (wf.category === w.category ? 3 : 0) +
          wf.tags.filter((t) => w.tags.includes(t)).length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.wf);
  }, [w, slug]);

  if (!w) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: palette.bg, pt: 12 }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ color: palette.text }}>Workflow not found</Typography>
          <Button href="/workflows" sx={{ color: palette.accent, mt: 2 }}>← Back to catalog</Button>
        </Container>
      </Box>
    );
  }

  const displayName = w.slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  const isOfficial = w.name.startsWith('@vaicli/');
  const inputs = Object.entries(w.inputs);

  /* educational framing from tools used */
  const uniqueCategories = [...new Set(w.tools.map((t) => toolCategoryLabel[t]).filter(Boolean))];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.bg, pt: 10, pb: 10 }}>
      <Container maxWidth="lg">
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 2, '& .MuiBreadcrumbs-separator': { color: palette.textMuted } }}>
          <MuiLink href="/workflows" underline="hover" sx={{ color: palette.textMuted, cursor: 'pointer' }}>
            Workflow Hub
          </MuiLink>
          <Typography sx={{ color: palette.text }}>{displayName}</Typography>
        </Breadcrumbs>

        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/workflows')} sx={{ color: palette.textMuted, mb: 3, pl: 0 }}>
          Back to catalog
        </Button>

        {/* ── Two-column layout ── */}
        <Grid container spacing={4}>
          {/* Left: content */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Title area */}
            <Box sx={{ mb: 3 }}>
              {isOfficial && (
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                  label="Official @vaicli"
                  size="small"
                  sx={{ mb: 1, bgcolor: `${palette.accent}22`, color: palette.accent, fontWeight: 600, '& .MuiChip-icon': { color: palette.accent } }}
                />
              )}
              <Typography variant="h3" sx={{ color: palette.text, fontWeight: 700, mb: 1 }}>
                {displayName}
              </Typography>
              <Typography variant="body1" sx={{ color: palette.textDim, lineHeight: 1.7 }}>
                {w.description}
              </Typography>
            </Box>

            {/* Metadata pills */}
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap',  mb: 3 }}>
              <Chip label={w.category} sx={{ textTransform: 'capitalize', bgcolor: `${palette.accent}22`, color: palette.accent, fontWeight: 600 }} />
              <Chip label={`v${w.version}`} size="small" sx={{ bgcolor: palette.bgSurface, color: palette.textDim }} />
              <Chip label={`${w.stepsCount} steps · ${w.layersCount} layers`} size="small" sx={{ bgcolor: palette.bgSurface, color: palette.textDim }} />
              <Chip label={`vai ≥ ${w.minVaiVersion}`} size="small" sx={{ bgcolor: palette.bgSurface, color: palette.textDim }} />
            </Stack>

            {/* Tags */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 3 }}>
              {w.tags.map((t) => (
                <Chip key={t} label={t} size="small" sx={{ bgcolor: palette.bgCard, color: palette.textMuted, border: `1px solid ${palette.border}` }} />
              ))}
            </Box>

            {/* Tools */}
            <Typography variant="subtitle2" sx={{ color: palette.textMuted, mb: 1 }}>Tools used</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 4 }}>
              {w.tools.map((t) => {
                const c = toolColorMap[t] || palette.textMuted;
                return (
                  <Chip key={t} label={t} size="small" sx={{ bgcolor: `${c}18`, color: c, fontWeight: 600, border: `1px solid ${c}44` }} />
                );
              })}
            </Box>

            {/* Steps */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: palette.text, mb: 1, fontWeight: 600 }}>Steps</Typography>
              <TableContainer component={Paper} sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}` }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: palette.textMuted, fontWeight: 600 }}>#</TableCell>
                      <TableCell sx={{ color: palette.textMuted, fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ color: palette.textMuted, fontWeight: 600 }}>Tool</TableCell>
                      <TableCell sx={{ color: palette.textMuted, fontWeight: 600 }}>Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {w.steps.map((s, i) => {
                      const c = toolColorMap[s.tool] || palette.textMuted;
                      return (
                        <TableRow key={s.id}>
                          <TableCell sx={{ color: palette.textMuted }}>{i + 1}</TableCell>
                          <TableCell sx={{ color: palette.accent, fontFamily: 'monospace' }}>{s.id}</TableCell>
                          <TableCell>
                            <Chip label={s.tool} size="small" sx={{ bgcolor: `${c}18`, color: c, fontWeight: 600, height: 22, fontSize: '0.7rem' }} />
                          </TableCell>
                          <TableCell sx={{ color: palette.textDim }}>{s.name}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Inputs table */}
            {inputs.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: palette.text, mb: 1, fontWeight: 600 }}>Input Parameters</Typography>
                <TableContainer component={Paper} sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}` }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: palette.textMuted, fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ color: palette.textMuted, fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ color: palette.textMuted, fontWeight: 600 }}>Required</TableCell>
                        <TableCell sx={{ color: palette.textMuted, fontWeight: 600 }}>Default</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inputs.map(([name, meta]) => (
                        <TableRow key={name}>
                          <TableCell sx={{ color: palette.accent, fontFamily: 'monospace' }}>{name}</TableCell>
                          <TableCell sx={{ color: palette.textDim }}>{meta.type || '—'}</TableCell>
                          <TableCell sx={{ color: palette.textDim }}>{meta.required ? 'Yes' : 'No'}</TableCell>
                          <TableCell sx={{ color: palette.textDim, fontFamily: 'monospace' }}>{meta.default !== undefined ? String(meta.default) : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* What You'll Learn */}
            <Box sx={{ mb: 4, p: 3, bgcolor: palette.bgSurface, borderRadius: 3, border: `1px solid ${palette.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <LightbulbIcon sx={{ color: palette.yellow, fontSize: 20 }} />
                <Typography variant="h6" sx={{ color: palette.text, fontWeight: 600 }}>What You&apos;ll Learn</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: palette.textDim, lineHeight: 1.8 }}>
                This workflow demonstrates how to compose{' '}
                <strong style={{ color: palette.text }}>{w.stepsCount} steps</strong> across{' '}
                <strong style={{ color: palette.text }}>{w.layersCount} execution layers</strong> using{' '}
                {uniqueCategories.length > 0 ? (
                  <>
                    {uniqueCategories.map((cat, i) => (
                      <span key={cat}>
                        {i > 0 && (i === uniqueCategories.length - 1 ? ' and ' : ', ')}
                        <strong style={{ color: palette.text }}>{cat}</strong>
                      </span>
                    ))}
                    {' '}capabilities.
                  </>
                ) : (
                  'various Voyage AI capabilities.'
                )}{' '}
                Install it, inspect the workflow definition, and use it as a template for building your own pipelines.
              </Typography>
            </Box>

            {/* Mobile install CTA (hidden on desktop) */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
              <InstallCTA w={w} displayName={displayName} />
            </Box>

            {/* Related Workflows */}
            {related.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ color: palette.text, mb: 2, fontWeight: 600 }}>Related Workflows</Typography>
                <Grid container spacing={2}>
                  {related.map((rw) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={rw.slug}>
                      <WorkflowCard workflow={rw} compact />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>

          {/* Right: sticky install CTA (desktop only) */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <InstallCTA w={w} displayName={displayName} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
