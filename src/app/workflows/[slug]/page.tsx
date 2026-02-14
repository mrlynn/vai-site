'use client';

import {
  Box, Container, Typography, Chip, Breadcrumbs, Link as MuiLink,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Button, Stack,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { palette } from '@/theme/theme';
import workflows from '@/data/workflows.json';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="caption" sx={{ color: palette.textMuted, mb: 0.5, display: 'block' }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, borderRadius: 2, px: 2, py: 1 }}>
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: palette.accent, flexGrow: 1, overflow: 'auto' }}>
          {text}
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy'}>
          <IconButton size="small" onClick={handleCopy} sx={{ color: palette.textMuted }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const w = workflows.find((wf) => wf.slug === slug);

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
  const inputs = Object.entries(w.inputs as unknown as Record<string, { type?: string; required?: boolean; default?: unknown; description?: string }>);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.bg, pt: 10, pb: 10 }}>
      <Container maxWidth="md">
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 3, '& .MuiBreadcrumbs-separator': { color: palette.textMuted } }}>
          <MuiLink href="/workflows" underline="hover" sx={{ color: palette.textMuted, cursor: 'pointer' }}>
            Workflows
          </MuiLink>
          <Typography sx={{ color: palette.text }}>{displayName}</Typography>
        </Breadcrumbs>

        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/workflows')} sx={{ color: palette.textMuted, mb: 2, pl: 0 }}>
          Back to catalog
        </Button>

        {/* Title */}
        <Typography variant="h3" sx={{ color: palette.text, mb: 1 }}>{displayName}</Typography>
        <Typography variant="body1" sx={{ color: palette.textDim, mb: 3, lineHeight: 1.7 }}>{w.description}</Typography>

        {/* Metadata */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
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
          {w.tools.map((t) => (
            <Chip key={t} label={t} size="small" sx={{ bgcolor: `${palette.blue}22`, color: palette.blue, fontWeight: 600 }} />
          ))}
        </Box>

        {/* Inputs table */}
        {inputs.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: palette.text, mb: 1 }}>Input Parameters</Typography>
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

        {/* Steps */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: palette.text, mb: 1 }}>Steps</Typography>
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
                {w.steps.map((s, i) => (
                  <TableRow key={s.id}>
                    <TableCell sx={{ color: palette.textMuted }}>{i + 1}</TableCell>
                    <TableCell sx={{ color: palette.accent, fontFamily: 'monospace' }}>{s.id}</TableCell>
                    <TableCell sx={{ color: palette.blue }}>{s.tool}</TableCell>
                    <TableCell sx={{ color: palette.textDim }}>{s.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Install & CLI */}
        <CopyBlock label="Install" text={`npm install ${w.name}`} />
        <CopyBlock label="Run" text={`vai workflow run ${w.slug}`} />

        {/* Links */}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<GitHubIcon />}
            href={`https://github.com/mrlynn/vai-workflows/tree/main/packages/vai-workflow-${w.slug}`}
            target="_blank"
            sx={{ color: palette.textDim, borderColor: palette.border, '&:hover': { borderColor: palette.textMuted } }}
          >
            Source
          </Button>
          <Button
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            href={`https://www.npmjs.com/package/${w.name}`}
            target="_blank"
            sx={{ color: palette.textDim, borderColor: palette.border, '&:hover': { borderColor: palette.textMuted } }}
          >
            npm
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
