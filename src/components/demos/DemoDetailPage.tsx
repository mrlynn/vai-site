'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  ButtonBase,
  Chip,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import Image from 'next/image';
import { palette } from '@/theme/theme';
import type { DemoData } from '@/data/demos';
import { getRelatedDemos } from '@/data/demos';
import CommandBlock from '@/components/use-cases/CommandBlock';
import DemoCard from '@/components/demos/DemoCard';
import DemoSharePanel from '@/components/demos/DemoSharePanel';
import UnderTheHoodPanel from '@/components/demos/UnderTheHoodPanel';

interface DemoDetailPageProps {
  demo: DemoData;
}

function getCapabilityChips(demo: DemoData): string[] {
  const chips: string[] = [];

  if (demo.environment.worksOffline) chips.push('Offline-capable');
  if (demo.environment.requiresOllama) chips.push('Requires Ollama');
  if (demo.environment.requiresMongoDbAtlas) chips.push('MongoDB Atlas');
  if (demo.environment.requiresApiKey) chips.push('API key');

  return chips;
}

export default function DemoDetailPage({ demo }: DemoDetailPageProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const related = useMemo(() => getRelatedDemos(demo), [demo]);
  const capabilityChips = useMemo(() => getCapabilityChips(demo), [demo]);

  return (
    <>
      <Box sx={{ minHeight: '100vh', bgcolor: palette.bg, pb: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 4 } }}>
          <Breadcrumbs
            separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
            sx={{ mb: 3, '& .MuiBreadcrumbs-li': { fontSize: '0.85rem' } }}
          >
            <Link href="/" underline="hover" sx={{ color: palette.textMuted, '&:hover': { color: palette.text } }}>
              Home
            </Link>
            <Link href="/demos" underline="hover" sx={{ color: palette.textMuted, '&:hover': { color: palette.text } }}>
              Demo Gallery
            </Link>
            <Typography sx={{ color: palette.text, fontSize: '0.85rem' }}>{demo.title}</Typography>
          </Breadcrumbs>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                  {demo.categories.map((category) => (
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
                </Stack>

                <Typography
                  variant="h1"
                  sx={{
                    color: palette.text,
                    fontWeight: 800,
                    fontSize: { xs: '2.3rem', md: '3.5rem' },
                    lineHeight: 1.08,
                    letterSpacing: '-0.03em',
                    mb: 1.5,
                  }}
                >
                  {demo.title}
                </Typography>

                <Typography sx={{ color: palette.textDim, fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.75 }}>
                  {demo.summary}
                </Typography>
              </Box>

              <ButtonBase
                onClick={() => setPreviewOpen(true)}
                sx={{
                  display: 'block',
                  width: '100%',
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  mb: 3,
                  cursor: 'zoom-in',
                  border: `1px solid ${palette.border}`,
                  '&:hover .demo-detail-overlay': { opacity: 1 },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    bgcolor: palette.bgSurface,
                  }}
                >
                  <Image
                    src={demo.assets.sitePreviewPath}
                    alt={demo.title}
                    fill
                    sizes="(max-width: 900px) 100vw, 60vw"
                    style={{ objectFit: 'cover' }}
                  />
                </Box>
                <Box
                  className="demo-detail-overlay"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5,
                    color: '#fff',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.78) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>Click to enlarge</Typography>
                  <ZoomInIcon />
                </Box>
              </ButtonBase>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
                {capabilityChips.map((chip) => (
                  <Chip
                    key={chip}
                    label={chip}
                    variant="outlined"
                    sx={{ color: palette.textDim, borderColor: palette.border, fontWeight: 600 }}
                  />
                ))}
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mb: 4 }}>
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
                  View Source Tape
                </Button>
                <Button
                  variant="text"
                  href={demo.links.docs[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: palette.accent, '&:hover': { bgcolor: 'transparent' } }}
                >
                  Open Docs
                </Button>
              </Stack>

              <Box
                sx={{
                  bgcolor: palette.bgCard,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 3,
                  p: { xs: 2.5, md: 3 },
                  mb: 4,
                }}
              >
                <Typography variant="h5" sx={{ color: palette.text, fontWeight: 700, mb: 1.5 }}>
                  Prerequisites
                </Typography>
                <Stack spacing={1.2}>
                  {demo.prerequisites.map((item) => (
                    <Typography key={item} sx={{ color: palette.textMuted, lineHeight: 1.7 }}>
                      • {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>

              <Box
                sx={{
                  bgcolor: palette.bgCard,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 3,
                  p: { xs: 2.5, md: 3 },
                  mb: 4,
                }}
              >
                <Typography variant="h5" sx={{ color: palette.text, fontWeight: 700, mb: 1 }}>
                  Under the hood
                </Typography>
                <Typography sx={{ color: palette.textMuted, lineHeight: 1.65, mb: 2 }}>
                  See the exact VAI command, the matching Voyage AI layer, and the MongoDB query shape behind the demo.
                </Typography>
                <UnderTheHoodPanel underTheHood={demo.underTheHood} showHeader={false} />
              </Box>

              <DemoSharePanel demo={demo} />
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  bgcolor: palette.bgCard,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 3,
                  p: { xs: 2.5, md: 3 },
                  position: { md: 'sticky' },
                  top: { md: 100 },
                }}
              >
                <Typography variant="h5" sx={{ color: palette.text, fontWeight: 700, mb: 1 }}>
                  Exact commands
                </Typography>
                <Typography sx={{ color: palette.textMuted, lineHeight: 1.65, mb: 2.5 }}>
                  The full walkthrough is included here so anyone can replay the demo exactly as published.
                </Typography>

                {demo.commands.map((command, index) => (
                  <CommandBlock
                    key={`${demo.slug}-${index}`}
                    command={command}
                    accent={index === 0 ? palette.accent : palette.blue}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>

          {related.length > 0 && (
            <Box sx={{ mt: { xs: 6, md: 8 } }}>
              <Typography variant="h4" sx={{ color: palette.text, fontWeight: 700, mb: 1 }}>
                Related demos
              </Typography>
              <Typography sx={{ color: palette.textMuted, mb: 3 }}>
                More shareable workflows from the same VAI demo library.
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                {related.map((item) => (
                  <DemoCard key={item.slug} demo={item} />
                ))}
              </Box>
            </Box>
          )}
        </Container>
      </Box>

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
        </DialogContent>
      </Dialog>
    </>
  );
}
