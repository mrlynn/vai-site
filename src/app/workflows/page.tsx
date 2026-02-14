'use client';

import {
  Box, Container, Typography, TextField, Chip, Card, CardContent,
  CardActionArea, InputAdornment, Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';
import { palette } from '@/theme/theme';
import { useState, useMemo } from 'react';
import workflows from '@/data/workflows.json';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['all', 'retrieval', 'analysis', 'domain-specific', 'ingestion', 'utility', 'integration'];

const categoryColors: Record<string, string> = {
  retrieval: palette.blue,
  analysis: palette.purple,
  'domain-specific': '#FF6F61',
  ingestion: palette.accent,
  utility: palette.textDim,
  integration: '#F5A623',
};

export default function WorkflowsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    return workflows.filter((w) => {
      if (category !== 'all' && w.category !== category) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [search, category]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.bg, pt: 10, pb: 10 }}>
      <Container maxWidth="lg">
        {/* Hero */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ color: palette.text, mb: 1 }}>
            Workflow Catalog
          </Typography>
          <Typography variant="h6" sx={{ color: palette.textMuted, fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
            Pre-built multi-step workflows for vector search, RAG evaluation, data quality, and more.
          </Typography>
        </Box>

        {/* Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={c === 'all' ? 'All' : c}
                onClick={() => setCategory(c)}
                sx={{
                  textTransform: 'capitalize',
                  bgcolor: category === c ? palette.accent : palette.bgCard,
                  color: category === c ? palette.bg : palette.textDim,
                  fontWeight: 600,
                  border: `1px solid ${category === c ? palette.accent : palette.border}`,
                  '&:hover': { bgcolor: category === c ? palette.accentDim : palette.bgSurface },
                }}
              />
            ))}
          </Box>
          <TextField
            size="small"
            placeholder="Search workflows…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: palette.textMuted }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              minWidth: 260,
              '& .MuiOutlinedInput-root': {
                bgcolor: palette.bgCard,
                color: palette.text,
                '& fieldset': { borderColor: palette.border },
                '&:hover fieldset': { borderColor: palette.textMuted },
              },
            }}
          />
        </Stack>

        {/* Grid */}
        <Grid container spacing={3}>
          {filtered.map((w) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={w.slug}>
              <Card
                sx={{
                  bgcolor: palette.bgCard,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 0.2s, transform 0.2s',
                  '&:hover': { borderColor: palette.accent, transform: 'translateY(-2px)' },
                }}
              >
                <CardActionArea onClick={() => router.push(`/workflows/${w.slug}`)} sx={{ flexGrow: 1, p: 0 }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Category badge */}
                    <Chip
                      label={w.category}
                      size="small"
                      sx={{
                        alignSelf: 'flex-start',
                        mb: 1,
                        bgcolor: `${categoryColors[w.category] || palette.textMuted}22`,
                        color: categoryColors[w.category] || palette.textMuted,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        textTransform: 'capitalize',
                      }}
                    />
                    <Typography variant="h6" sx={{ color: palette.text, fontSize: '1rem', mb: 0.5 }}>
                      {w.slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: palette.textDim,
                        mb: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flexGrow: 1,
                      }}
                    >
                      {w.description}
                    </Typography>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                      {w.tags.slice(0, 3).map((t) => (
                        <Chip key={t} label={t} size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: palette.bgSurface, color: palette.textMuted }} />
                      ))}
                    </Box>

                    {/* Tools */}
                    <Typography variant="caption" sx={{ color: palette.textMuted, mb: 0.5 }}>
                      Tools: {w.tools.join(', ')}
                    </Typography>

                    {/* Complexity */}
                    <Typography variant="caption" sx={{ color: palette.accent, fontWeight: 600 }}>
                      {w.stepsCount} steps · {w.layersCount} layers
                    </Typography>
                  </CardContent>
                </CardActionArea>
                {/* Install command */}
                <Box
                  sx={{
                    px: 2, py: 1,
                    bgcolor: palette.bgSurface,
                    borderTop: `1px solid ${palette.border}`,
                    borderRadius: '0 0 12px 12px',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: palette.textMuted, fontFamily: 'monospace', fontSize: '0.7rem' }}
                  >
                    npm i {w.name}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filtered.length === 0 && (
          <Typography sx={{ textAlign: 'center', color: palette.textMuted, mt: 8 }}>
            No workflows match your filters.
          </Typography>
        )}
      </Container>
    </Box>
  );
}
