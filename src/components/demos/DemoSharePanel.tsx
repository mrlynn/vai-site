'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xPost)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`;

  return (
    <>
      <Box
        sx={{
          bgcolor: palette.bgCard,
          border: `1px solid ${palette.border}`,
          borderRadius: 3,
          p: { xs: 2.5, md: 3 },
        }}
      >
        <Typography variant="h5" sx={{ color: palette.text, fontWeight: 700, mb: 1 }}>
          Share this demo
        </Typography>
        <Typography sx={{ color: palette.textMuted, lineHeight: 1.65, mb: 2.5 }}>
          Give people a ready-to-run example. Every share points back to the exact commands and source tape.
        </Typography>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2.5 }}>
          {demo.social.hashtags.map((tag) => (
            <Chip
              key={tag}
              label={`#${tag}`}
              size="small"
              sx={{
                bgcolor: `${palette.accent}12`,
                color: palette.accent,
                border: `1px solid ${palette.accent}22`,
                fontWeight: 600,
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
          <Typography sx={{ color: palette.text, fontWeight: 600, mb: 0.75 }}>
            Suggested headline
          </Typography>
          <Typography sx={{ color: palette.textMuted, lineHeight: 1.7 }}>
            {demo.social.headline}
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Box
            sx={{
              flex: 1,
              border: `1px solid ${palette.border}`,
              borderRadius: 2,
              bgcolor: palette.bgSurface,
              p: 2,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ color: palette.text, fontWeight: 600 }}>LinkedIn post</Typography>
              <Tooltip title="Copy LinkedIn post">
                <IconButton
                  size="small"
                  onClick={() => handleCopy('Copied LinkedIn post', linkedinPost)}
                  sx={{ color: palette.textMuted }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography sx={{ color: palette.textMuted, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {linkedinPost}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              border: `1px solid ${palette.border}`,
              borderRadius: 2,
              bgcolor: palette.bgSurface,
              p: 2,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ color: palette.text, fontWeight: 600 }}>X post</Typography>
              <Tooltip title="Copy X post">
                <IconButton
                  size="small"
                  onClick={() => handleCopy('Copied X post', xPost)}
                  sx={{ color: palette.textMuted }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography sx={{ color: palette.textMuted, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {xPost}
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: 2.5 }}>
          <Button
            variant="contained"
            startIcon={<LinkIcon />}
            onClick={() => handleCopy('Copied demo link', canonicalUrl)}
            sx={{
              bgcolor: palette.accent,
              color: palette.bg,
              '&:hover': { bgcolor: palette.accentLight },
            }}
          >
            Copy Link
          </Button>
          <Button
            variant="outlined"
            href={linkedinShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<LinkedInIcon />}
            sx={{
              color: palette.text,
              borderColor: palette.border,
              '&:hover': { borderColor: palette.accent, bgcolor: `${palette.accent}10` },
            }}
          >
            Share on LinkedIn
          </Button>
          <Button
            variant="outlined"
            href={xShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<XIcon />}
            sx={{
              color: palette.text,
              borderColor: palette.border,
              '&:hover': { borderColor: palette.accent, bgcolor: `${palette.accent}10` },
            }}
          >
            Share on X
          </Button>
          <Button
            variant="text"
            href={canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon />}
            sx={{ color: palette.accent, '&:hover': { bgcolor: 'transparent' } }}
          >
            Open Canonical URL
          </Button>
        </Stack>
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
