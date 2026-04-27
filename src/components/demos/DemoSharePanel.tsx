'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { palette } from '@/theme/theme';
import type { DemoData } from '@/data/demos';

interface DemoSharePanelProps {
  demo: DemoData;
}

const SITE_URL = 'https://vaicli.com';

function buildCanonicalUrl(slug: string) {
  return `${SITE_URL}/demos/${slug}`;
}

function buildPostText(demo: DemoData, platform: 'linkedin' | 'x') {
  const base = platform === 'linkedin' ? demo.social.linkedinText : demo.social.xText;
  const tags = demo.social.hashtags.map((tag) => `#${tag}`).join(' ');

  return `${base}\n\n${demo.social.callToAction}\n${buildCanonicalUrl(demo.slug)}\n\n${tags}`.trim();
}

export default function DemoSharePanel({ demo }: DemoSharePanelProps) {
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const canonicalUrl = buildCanonicalUrl(demo.slug);
  const linkedinPost = buildPostText(demo, 'linkedin');
  const xPost = buildPostText(demo, 'x');

  const handleCopy = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setSnackbarMessage(label);
  };

  const handleLinkedInShare = async () => {
    await navigator.clipboard.writeText(linkedinPost);
    setSnackbarMessage('Copied LinkedIn post text. Paste it into LinkedIn after the share window opens.');
    window.open(linkedinShareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleXShare = () => {
    window.open(xShareUrl, '_blank', 'noopener,noreferrer');
  };

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xPost)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`;

  return (
    <>
      <Box
        sx={{
          bgcolor: palette.bgSurface,
          border: `1px solid ${palette.border}`,
          borderRadius: 2.5,
          p: { xs: 2, md: 2.25 },
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
         
         
          sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between',  mb: 1.5 }}
        >
          <Box>
            <Typography sx={{ color: palette.text, fontWeight: 600 }}>
              Share or copy this demo
            </Typography>
            <Typography sx={{ color: palette.textMuted, fontSize: '0.9rem', mt: 0.3 }}>
              Keep it lightweight. The prepared text stays behind the buttons.
            </Typography>
          </Box>
          <Button
            variant="text"
            href={canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon />}
            size="small"
            sx={{ color: palette.accent, px: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent' } }}
          >
            Open canonical URL
          </Button>
        </Stack>

        <Stack spacing={1.25}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
           
           sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
            <Typography
              sx={{
                color: palette.textMuted,
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                minWidth: { sm: 48 },
              }}
            >
              Share
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleLinkedInShare}
                startIcon={<LinkedInIcon />}
                sx={{
                  color: palette.textDim,
                  borderColor: palette.border,
                  px: 1.4,
                  '&:hover': { borderColor: palette.accent, color: palette.text, bgcolor: `${palette.accent}08` },
                }}
              >
                LinkedIn
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleXShare}
                startIcon={<XIcon />}
                sx={{
                  color: palette.textDim,
                  borderColor: palette.border,
                  px: 1.4,
                  '&:hover': { borderColor: palette.accent, color: palette.text, bgcolor: `${palette.accent}08` },
                }}
              >
                X
              </Button>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
           
           sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
            <Typography
              sx={{
                color: palette.textMuted,
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                minWidth: { sm: 48 },
              }}
            >
              Copy
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<LinkIcon />}
                onClick={() => handleCopy('Copied demo link', canonicalUrl)}
                sx={{
                  color: palette.textDim,
                  borderColor: palette.border,
                  px: 1.4,
                  '&:hover': { borderColor: palette.accent, color: palette.text, bgcolor: `${palette.accent}08` },
                }}
              >
                Link
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleCopy('Copied LinkedIn post', linkedinPost)}
                sx={{
                  color: palette.textDim,
                  borderColor: palette.border,
                  px: 1.4,
                  '&:hover': { borderColor: palette.accent, color: palette.text, bgcolor: `${palette.accent}08` },
                }}
              >
                LinkedIn
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleCopy('Copied X post', xPost)}
                sx={{
                  color: palette.textDim,
                  borderColor: palette.border,
                  px: 1.4,
                  '&:hover': { borderColor: palette.accent, color: palette.text, bgcolor: `${palette.accent}08` },
                }}
              >
                X
              </Button>
            </Stack>
          </Stack>
        </Stack>

        <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem', mt: 1.5 }}>
          LinkedIn opens the share dialog and copies the prepared text so you can paste it in quickly.
        </Typography>
      </Box>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={1800}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
