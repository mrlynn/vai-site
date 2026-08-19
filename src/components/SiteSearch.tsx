'use client';

import {
  Box,
  Dialog,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { palette } from '@/theme/theme';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { getSearchIndex, type SearchEntry } from '@/data/searchIndex';

const categoryLabels: Record<SearchEntry['category'], string> = {
  section: 'Section',
  page: 'Page',
  demo: 'Demo',
  workflow: 'Workflow',
  'use-case': 'Use Case',
  external: 'Docs',
};

export default function SiteSearch() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const index = useMemo(() => getSearchIndex(), []);
  const fuse = useMemo(
    () =>
      new Fuse(index, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'keywords', weight: 0.3 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [index],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 8);
    return fuse.search(q).map((r) => r.item).slice(0, 10);
  }, [query, fuse, index]);

  const openSearch = useCallback(() => {
    setOpen(true);
    setQuery('');
    setHighlightedIndex(0);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const selectResult = useCallback(
    (entry: SearchEntry) => {
      if (entry.category === 'external') {
        window.open(entry.href, '_blank');
      } else {
        router.push(entry.href);
      }
      closeSearch();
    },
    [router, closeSearch],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        if (!open) {
          setQuery('');
          setHighlightedIndex(0);
        }
      }
      if (!open) return;
      if (e.key === 'Escape') {
        closeSearch();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, results.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' && results[highlightedIndex]) {
        e.preventDefault();
        selectResult(results[highlightedIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, highlightedIndex, closeSearch, selectResult]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  return (
    <>
      <IconButton
        onClick={openSearch}
        size="small"
        sx={{
          color: palette.textDim,
          '&:hover': { color: palette.text, bgcolor: 'rgba(255,255,255,0.05)' },
        }}
        aria-label="Search site (⌘K)"
      >
        <SearchIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Dialog
        open={open}
        onClose={closeSearch}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              position: 'fixed',
              top: isMobile ? '10%' : 80,
              mx: 'auto',
              borderRadius: 2,
              bgcolor: palette.bgCard,
              border: `1px solid ${palette.border}`,
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: `1px solid ${palette.border}` }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search site… (e.g. model costs, pricing, demos)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="standard"
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
              '& .MuiInput-root': { color: palette.text },
              '& .MuiInput-input': { padding: '12px 0' },
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: palette.textMuted, display: 'block', mt: 0.5, ml: 1 }}
          >
            ⌘K to open · ↑↓ to navigate · Enter to select
          </Typography>
        </Box>

        <List sx={{ maxHeight: 360, overflow: 'auto', py: 0 }}>
          {results.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography sx={{ color: palette.textMuted }}>
                No results for &quot;{query}&quot;
              </Typography>
            </Box>
          ) : (
            results.map((entry, i) => (
              <ListItemButton
                key={entry.id}
                selected={i === highlightedIndex}
                onClick={() => selectResult(entry)}
                onMouseEnter={() => setHighlightedIndex(i)}
                sx={{
                  py: 1.25,
                  '&.Mui-selected': {
                    bgcolor: `${palette.accent}15`,
                    '&:hover': { bgcolor: `${palette.accent}20` },
                  },
                }}
              >
                <ListItemText
                  primary={entry.title}
                  secondary={entry.description}
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: palette.text,
                      },
                    },
                    secondary: {
                      sx: {
                        fontSize: '0.8rem',
                        color: palette.textMuted,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      },
                    },
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: palette.textDim,
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {categoryLabels[entry.category]}
                  </Typography>
                  {entry.category === 'external' && (
                    <OpenInNewIcon sx={{ fontSize: 14, color: palette.textMuted }} />
                  )}
                </Box>
              </ListItemButton>
            ))
          )}
        </List>
      </Dialog>
    </>
  );
}
