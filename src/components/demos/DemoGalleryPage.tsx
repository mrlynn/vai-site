'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { palette } from '@/theme/theme';
import DemoCard from '@/components/demos/DemoCard';
import {
  getDemoCategories,
  getFeaturedDemos,
  getPublishedDemos,
} from '@/data/demos';

export default function DemoGalleryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const demos = useMemo(() => getPublishedDemos(), []);
  const featured = useMemo(() => getFeaturedDemos(), []);
  const categories = useMemo(() => ['All', ...getDemoCategories()], []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return demos.filter((demo) => {
      if (category !== 'All' && !demo.categories.includes(category)) return false;
      if (!query) return true;

      return (
        demo.title.toLowerCase().includes(query) ||
        demo.summary.toLowerCase().includes(query) ||
        demo.categories.some((item) => item.toLowerCase().includes(query)) ||
        demo.prerequisites.some((item) => item.toLowerCase().includes(query)) ||
        demo.commands.some((item) => item.toLowerCase().includes(query))
      );
    });
  }, [category, demos, search]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.bg }}>
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 7, md: 9 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -160,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 820,
            height: 820,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 68%)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', textAlign: 'center' }}>
          <Chip
            label="Demo Library"
            size="small"
            sx={{
              mb: 3,
              bgcolor: `${palette.accent}18`,
              color: palette.accent,
              border: `1px solid ${palette.accent}33`,
              fontWeight: 700,
            }}
          />

          <Typography
            variant="h1"
            sx={{
              color: palette.text,
              fontWeight: 800,
              fontSize: { xs: '2.4rem', md: '4rem' },
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              mb: 2,
            }}
          >
            Watch, copy, and reproduce
            <Box component="span" sx={{ display: 'block', color: palette.accent }}>
              real vai demos
            </Box>
          </Typography>

          <Typography
            sx={{
              color: palette.textDim,
              maxWidth: 760,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.7,
              mb: 4,
            }}
          >
            A curated gallery of CLI demos sourced from `voyageai-cli`, with exact commands, prerequisites,
            and direct links to the original tape files.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ color: palette.textMuted }}
          >
            <Typography>{demos.length} published demos</Typography>
            <Typography>{categories.length - 1} learning paths</Typography>
            <Typography>Source of truth: `voyageai-cli/docs/demos` and `docs/demos/tapes`</Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            border: `1px solid ${palette.border}`,
            borderRadius: 1.5,
            bgcolor: palette.bgSurface,
            p: { xs: 2, md: 3 },
            mb: 5,
          }}
        >
          <TextField
            fullWidth
            placeholder="Search demos, commands, prerequisites, or categories"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                bgcolor: palette.bgCard,
                color: palette.text,
                '& fieldset': { borderColor: palette.border },
                '&:hover fieldset': { borderColor: palette.textMuted },
              },
            }}
          />

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {categories.map((item) => {
              const active = item === category;

              return (
                <Chip
                  key={item}
                  label={item}
                  clickable
                  onClick={() => setCategory(item)}
                  sx={{
                    color: active ? palette.bg : palette.textDim,
                    bgcolor: active ? palette.accent : palette.bgCard,
                    border: `1px solid ${active ? palette.accent : palette.border}`,
                    fontWeight: 600,
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        {search.trim() === '' && category === 'All' && featured.length > 0 && (
          <Box sx={{ mb: 7 }}>
            <Typography variant="h4" sx={{ color: palette.text, fontWeight: 700, mb: 1 }}>
              Featured demos
            </Typography>
            <Typography sx={{ color: palette.textMuted, mb: 3 }}>
              A lightweight starting set focused on developer education and reproducibility.
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' },
                gap: 3,
              }}
            >
              {featured.map((demo) => (
                <DemoCard key={demo.slug} demo={demo} />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ borderColor: palette.border, mb: 4 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ color: palette.text, fontWeight: 700, mb: 1 }}>
            All demos
          </Typography>
          <Typography sx={{ color: palette.textMuted }}>
            {filtered.length} result{filtered.length === 1 ? '' : 's'} matching the current filters.
          </Typography>
        </Box>

        {filtered.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {filtered.map((demo) => (
              <DemoCard key={demo.slug} demo={demo} />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              border: `1px dashed ${palette.border}`,
              borderRadius: 1.5,
              bgcolor: palette.bgSurface,
              p: 5,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ color: palette.text, fontWeight: 600, mb: 1 }}>
              No demos match these filters
            </Typography>
            <Typography sx={{ color: palette.textMuted }}>
              Try a broader search or switch back to `All` categories.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
