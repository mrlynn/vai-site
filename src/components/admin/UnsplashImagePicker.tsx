'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { palette } from '@/theme/theme';

export interface UnsplashImageChoice {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  unsplashUrl: string;
}

interface UnsplashImagePickerProps {
  open: boolean;
  initialQuery?: string;
  onClose: () => void;
  onSelect: (image: UnsplashImageChoice) => void;
}

export default function UnsplashImagePicker({
  open,
  initialQuery,
  onClose,
  onSelect,
}: UnsplashImagePickerProps) {
  const [query, setQuery] = useState(initialQuery ?? '');
  const [images, setImages] = useState<UnsplashImageChoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery ?? '');
    setImages([]);
    setError(null);
    if (initialQuery && initialQuery.trim()) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      performSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialQuery]);

  async function performSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) {
      setImages([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/images/unsplash/search?query=${encodeURIComponent(trimmed)}&per_page=16`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Search failed');
        return;
      }
      setImages((data.images || []) as UnsplashImageChoice[]);
    } catch {
      setError('Network error while searching Unsplash.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    performSearch(query);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      slotProps={{
        paper: {
          sx: {
            bgcolor: palette.bgSurface,
            borderRadius: 2,
            border: `1px solid ${palette.border}`,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${palette.border}`,
          pb: 1.5,
          fontSize: 14,
          fontWeight: 600,
          color: palette.text,
        }}
      >
        Insert Unsplash image
      </DialogTitle>
      <DialogContent
        sx={{
          borderBottom: `1px solid ${palette.border}`,
          pb: 1.5,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Unsplash (e.g. terminal, documentation, developers)"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: palette.border },
                '&:hover fieldset': { borderColor: palette.accent },
                '&.Mui-focused fieldset': { borderColor: palette.accent },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !query.trim()}
            sx={{
              bgcolor: palette.accent,
              color: palette.bg,
              fontSize: 12,
              textTransform: 'none',
              px: 2.5,
              '&:hover': { bgcolor: palette.accentDim },
            }}
          >
            {loading ? 'Searching…' : 'Search'}
          </Button>
        </Box>

        {error && (
          <Typography sx={{ fontSize: 13, color: '#f97373', mb: 1 }}>{error}</Typography>
        )}
        {!error && !loading && images.length === 0 && (
          <Typography sx={{ fontSize: 13, color: palette.textDim }}>
            Enter a search term above to find images. For example:{' '}
            <strong>developer documentation desk</strong> or <strong>dark terminal code</strong>.
          </Typography>
        )}

        <Box sx={{ mt: 2, maxHeight: 420, overflowY: 'auto' }}>
          <Grid container spacing={1.5}>
            {images.map((img) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={img.id}>
                <Card
                  sx={{
                    bgcolor: palette.bgCard,
                    borderRadius: 1.5,
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  <CardActionArea
                    onClick={() => {
                      onSelect(img);
                      onClose();
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt || ''}
                      style={{
                        width: '100%',
                        height: 140,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <CardContent
                      sx={{
                        py: 0.75,
                        px: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: palette.text,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {img.photographer}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: palette.textMuted }}>
                        Unsplash
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          borderTop: `1px solid ${palette.border}`,
          px: 2,
          py: 1,
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontSize: 10, color: palette.textDim }}>
          Photos are provided by Unsplash. When publishing, include attribution such as{' '}
          <strong>"Photo by &lt;photographer&gt; on Unsplash"</strong>.
        </Typography>
        <Button
          onClick={onClose}
          size="small"
          sx={{
            textTransform: 'none',
            fontSize: 12,
            color: palette.textDim,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

