'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import TerminalIcon from '@mui/icons-material/Terminal';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import Image from 'next/image';
import { palette } from '@/theme/theme';
import type { DemoData } from '@/data/demos';

interface DemoCardProps {
  demo: DemoData;
}

function getCapabilityChips(demo: DemoData): string[] {
  const chips: string[] = [];

  if (demo.environment.worksOffline) chips.push('Offline-capable');
  if (demo.environment.requiresOllama) chips.push('Requires Ollama');
  if (demo.environment.requiresMongoDbAtlas) chips.push('Atlas');
  if (demo.environment.requiresApiKey) chips.push('API key');

  return chips;
}

export default function DemoCard({ demo }: DemoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const capabilityChips = useMemo(() => getCapabilityChips(demo), [demo]);
  const hasPreview = !imageError;

  const handleCopyCommands = async () => {
    await navigator.clipboard.writeText(demo.commands.join('\n'));
    setCopied(true);
  };

  return (
    <>
      <Card
        sx={{
          bgcolor: palette.bgCard,
          border: `1px solid ${palette.border}`,
          borderRadius: 3,
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.25s ease',
          '&:hover': {
            borderColor: palette.accent,
            transform: 'translateY(-4px)',
            boxShadow: '0 14px 36px rgba(0, 212, 170, 0.16)',
          },
        }}
      >
        <ButtonBase
          onClick={() => {
            if (hasPreview) setPreviewOpen(true);
          }}
          disabled={!hasPreview}
          sx={{
            display: 'block',
            width: '100%',
            position: 'relative',
            textAlign: 'left',
            cursor: hasPreview ? 'zoom-in' : 'default',
            '&:hover .demo-preview-overlay': {
              opacity: hasPreview ? 1 : 0,
            },
          }}
        >
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '16 / 9',
            bgcolor: palette.bg,
            borderBottom: `1px solid ${palette.border}`,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              gap: 0.8,
              zIndex: 2,
            }}
          >
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
          </Box>

          {imageError ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                px: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 1.25,
              }}
            >
              <TerminalIcon sx={{ color: palette.textMuted, fontSize: 34 }} />
              <Typography sx={{ color: palette.text, fontWeight: 600 }}>
                Preview asset not published yet
              </Typography>
              <Typography sx={{ color: palette.textMuted, maxWidth: 320, fontSize: '0.9rem' }}>
                The demo metadata is ready. Copy the GIF into `public/demos/` to light up this card.
              </Typography>
            </Box>
          ) : (
            <Image
              src={demo.assets.sitePreviewPath}
              alt={demo.title}
              fill
              sizes="(max-width: 900px) 100vw, 33vw"
              style={{ objectFit: 'cover' }}
              onError={() => setImageError(true)}
            />
          )}
        </Box>
        {hasPreview && (
          <Box
            className="demo-preview-overlay"
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 25%, rgba(0,0,0,0.7) 100%)',
              color: '#fff',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              pointerEvents: 'none',
            }}
          >
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Click to enlarge
            </Typography>
            <ZoomInIcon sx={{ fontSize: 20 }} />
          </Box>
        )}
        </ButtonBase>

        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
            {demo.categories.slice(0, 2).map((category) => (
              <Chip
                key={category}
                label={category}
                size="small"
                sx={{
                  bgcolor: `${palette.accent}16`,
                  color: palette.accent,
                  border: `1px solid ${palette.accent}33`,
                  fontWeight: 600,
                }}
              />
            ))}
            {demo.featured && (
              <Chip
                label="Featured"
                size="small"
                sx={{
                  bgcolor: `${palette.blue}16`,
                  color: palette.blue,
                  border: `1px solid ${palette.blue}33`,
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>

          <Typography variant="h5" sx={{ color: palette.text, fontWeight: 700, mb: 1 }}>
            {demo.title}
          </Typography>

          <Typography sx={{ color: palette.textMuted, lineHeight: 1.65, mb: 2 }}>
            {demo.summary}
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
            {capabilityChips.map((chip) => (
              <Chip
                key={chip}
                label={chip}
                size="small"
                variant="outlined"
                sx={{
                  color: palette.textDim,
                  borderColor: palette.border,
                  fontWeight: 500,
                }}
              />
            ))}
          </Stack>

          <Box
            sx={{
              border: `1px solid ${palette.border}`,
              borderRadius: 2,
              bgcolor: palette.bgSurface,
              p: 2,
              mb: 2.5,
            }}
          >
            <Typography sx={{ color: palette.textDim, fontSize: '0.8rem', mb: 0.8 }}>
              Exact commands included
            </Typography>
            <Typography
              sx={{
                color: palette.text,
                fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mb: 0.8,
              }}
            >
              $ {demo.commands[0]}
            </Typography>
            <Typography sx={{ color: palette.textMuted, fontSize: '0.82rem' }}>
              {demo.commands.length} step{demo.commands.length === 1 ? '' : 's'} documented
            </Typography>
          </Box>

          <Box sx={{ mt: 'auto' }}>
            <Typography sx={{ color: palette.textDim, fontSize: '0.82rem', mb: 1 }}>
              Prerequisites
            </Typography>
            <Typography sx={{ color: palette.textMuted, fontSize: '0.88rem', lineHeight: 1.6, mb: 2.5 }}>
              {demo.prerequisites[0]}
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button
              variant="outlined"
              href={`/demos/${demo.slug}`}
              sx={{
                borderColor: palette.border,
                color: palette.text,
                '&:hover': { borderColor: palette.accent, bgcolor: `${palette.accent}10` },
              }}
            >
              View Demo
            </Button>
            <Button
              variant="contained"
              onClick={handleCopyCommands}
              startIcon={<ContentCopyIcon />}
              sx={{
                bgcolor: palette.accent,
                color: palette.bg,
                '&:hover': { bgcolor: palette.accentLight },
              }}
            >
              Copy Commands
            </Button>
            <Button
              variant="outlined"
              href={demo.source.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewIcon />}
              sx={{
                borderColor: palette.border,
                color: palette.text,
                '&:hover': { borderColor: palette.accent, bgcolor: `${palette.accent}10` },
              }}
            >
              Source Tape
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={copied}
        autoHideDuration={1800}
        onClose={() => setCopied(false)}
        message="Copied demo commands"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: palette.bgSurface,
            border: `1px solid ${palette.border}`,
            backgroundImage: 'none',
          },
        }}
      >
        <DialogContent sx={{ p: { xs: 1.5, md: 2 }, position: 'relative' }}>
          <IconButton
            onClick={() => setPreviewOpen(false)}
            aria-label="Close enlarged demo preview"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 2,
              color: palette.text,
              bgcolor: 'rgba(0, 0, 0, 0.45)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.65)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: palette.bg,
            }}
          >
            <Image
              src={demo.assets.sitePreviewPath}
              alt={`${demo.title} enlarged preview`}
              fill
              sizes="100vw"
              style={{ objectFit: 'contain' }}
            />
          </Box>

          <Typography sx={{ color: palette.text, fontWeight: 600, mt: 2 }}>
            {demo.title}
          </Typography>
          <Typography sx={{ color: palette.textMuted, mt: 0.5 }}>
            Click outside the modal or press Escape to close.
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}
