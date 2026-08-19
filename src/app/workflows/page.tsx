'use client';

import {
  Box, Container, Typography, TextField, InputAdornment, Stack,
  IconButton, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { palette } from '@/theme/theme';
import { useState, useMemo, useRef } from 'react';
import workflows from '@/data/workflows.json';
import featuredSlugs from '@/data/featured-workflows.json';
import WorkflowCard, { type WorkflowEntry } from '@/components/workflows/WorkflowCard';
import CategoryPills from '@/components/workflows/CategoryPills';

type SortMode = 'trending' | 'downloads' | 'newest' | 'az';

/* deterministic pseudo-score for fake trending/downloads until we have real data */
function pseudoScore(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 5000;
}

export default function WorkflowsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortMode>('trending');
  const scrollRef = useRef<HTMLDivElement>(null);

  const allWorkflows = workflows as unknown as WorkflowEntry[];

  /* category counts */
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    allWorkflows.forEach((w) => { c[w.category] = (c[w.category] || 0) + 1; });
    return c;
  }, [allWorkflows]);

  /* featured */
  const featured = useMemo(
    () => featuredSlugs.map((s) => allWorkflows.find((w) => w.slug === s)).filter(Boolean) as WorkflowEntry[],
    [allWorkflows],
  );

  /* filter + sort */
  const filtered = useMemo(() => {
    let list = allWorkflows.filter((w) => {
      if (category !== 'all' && w.category !== category) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        w.slug.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
    switch (sort) {
      case 'az':
        list = [...list].sort((a, b) => a.slug.localeCompare(b.slug));
        break;
      case 'downloads':
        list = [...list].sort((a, b) => pseudoScore(b.name) - pseudoScore(a.name));
        break;
      case 'newest':
        list = [...list].sort((a, b) => b.slug.localeCompare(a.slug)); // reverse alpha as proxy
        break;
      case 'trending':
      default:
        list = [...list].sort((a, b) => pseudoScore(b.name + 'trend') - pseudoScore(a.name + 'trend'));
        break;
    }
    return list;
  }, [allWorkflows, search, category, sort]);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.bg, pt: 10, pb: 10 }}>
      <Container maxWidth="lg">
        {/* ── Hero ── */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ color: palette.text, mb: 1, fontWeight: 700 }}>
            Workflow{' '}
            <Box
              component="span"
              sx={{
                background: `linear-gradient(135deg, ${palette.accent}, ${palette.blue})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Store
            </Box>
          </Typography>
          <Typography variant="h6" sx={{ color: palette.textMuted, fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
            Discover community-built RAG pipelines for Voyage AI
          </Typography>
        </Box>

        {/* ── Featured ── */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ color: palette.text, fontWeight: 600 }}>
              ✨ Featured
            </Typography>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5 }}>
              <IconButton size="small" onClick={() => scroll(-1)} sx={{ color: palette.textMuted, border: `1px solid ${palette.border}` }}>
                <ChevronLeftIcon />
              </IconButton>
              <IconButton size="small" onClick={() => scroll(1)} sx={{ color: palette.textMuted, border: `1px solid ${palette.border}` }}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>
          <Box
            ref={scrollRef}
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 1,
              scrollSnapType: 'x mandatory',
              '&::-webkit-scrollbar': { height: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: palette.border, borderRadius: 3 },
            }}
          >
            {featured.map((w) => (
              <Box key={w.slug} sx={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                <WorkflowCard workflow={w} compact />
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Browse by Domain ── */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: palette.text, fontWeight: 600, mb: 2 }}>
            Browse by Domain
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
            <CategoryPills active={category} counts={counts} onChange={setCategory} />
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
        </Box>

        {/* ── All Workflows header + sort ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ color: palette.text, fontWeight: 600 }}>
            All Workflows{' '}
            <Box component="span" sx={{ color: palette.textMuted, fontWeight: 400, fontSize: '0.9rem' }}>
              — {filtered.length} found
            </Box>
          </Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={sort}
            onChange={(_, v) => v && setSort(v)}
            sx={{
              '& .MuiToggleButton-root': {
                color: palette.textMuted,
                borderColor: palette.border,
                textTransform: 'none',
                fontSize: '0.75rem',
                px: 1.5,
                '&.Mui-selected': {
                  bgcolor: `${palette.accent}22`,
                  color: palette.accent,
                  borderColor: palette.accent,
                },
              },
            }}
          >
            <ToggleButton value="trending">Trending</ToggleButton>
            <ToggleButton value="downloads">Downloads</ToggleButton>
            <ToggleButton value="newest">Newest</ToggleButton>
            <ToggleButton value="az">A–Z</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* ── Grid ── */}
        <Grid container spacing={3}>
          {filtered.map((w) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={w.slug}>
              <WorkflowCard workflow={w} />
            </Grid>
          ))}
        </Grid>

        {filtered.length === 0 && (
          <Typography sx={{ textAlign: 'center', color: palette.textMuted, mt: 8 }}>
            No workflows match your filters.
          </Typography>
        )}

        {/* ── Publish Your Own CTA ── */}
        <Box
          sx={{
            mt: 8,
            p: 4,
            borderRadius: 3,
            border: `1px solid ${palette.border}`,
            bgcolor: palette.bgSurface,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ color: palette.text, mb: 1, fontWeight: 600 }}>
            Publish Your Own
          </Typography>
          <Typography sx={{ color: palette.textDim, mb: 3, maxWidth: 500, mx: 'auto' }}>
            Share your workflows with the community. Build, test, and publish in minutes.
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: palette.bgCard,
              border: `1px solid ${palette.border}`,
              borderRadius: 2,
              px: 2.5,
              py: 1.5,
              mb: 2,
            }}
          >
            <Typography sx={{ fontFamily: 'monospace', color: palette.accent, fontSize: '0.9rem' }}>
              $ vai workflow create --from my-workflow.json
            </Typography>
            <IconButton
              size="small"
              onClick={() => navigator.clipboard.writeText('vai workflow create --from my-workflow.json')}
              sx={{ color: palette.textMuted }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box>
            <Typography
              component="a"
              href="https://docs.vaicli.com/workflows/publishing"
              target="_blank"
              rel="noopener"
              sx={{
                color: palette.accent,
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Learn How →
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
