'use client';

import { Box, Button, Container, Typography, Chip, Snackbar } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { palette } from '@/theme/theme';
import { useState } from 'react';

export default function Hero() {
  const [copied, setCopied] = useState(false);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('npm install -g voyageai-cli');
    setCopied(true);
  };

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 10, md: 16 },
        pb: { xs: 10, md: 14 },
      }}
    >
      {/* Background glow effect */}
      <Box
        sx={{
          position: 'absolute',
          top: '-40%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.accent}08 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
        <Chip
          label="Open Source CLI Tool"
          size="small"
          sx={{
            mb: 3,
            bgcolor: 'rgba(0, 237, 100, 0.1)',
            color: palette.accent,
            border: `1px solid ${palette.accent}33`,
            fontWeight: 600,
          }}
        />

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
            fontWeight: 800,
            lineHeight: 1.1,
            mb: 2,
            background: `linear-gradient(135deg, ${palette.text} 0%, ${palette.accent} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Vai
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: palette.textDim,
            fontWeight: 400,
            mb: 2,
            fontSize: { xs: '1.1rem', md: '1.35rem' },
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Explore Voyage AI embeddings from your terminal — or your desktop.
        </Typography>

        <Typography
          sx={{
            color: palette.textMuted,
            mb: 5,
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            maxWidth: 560,
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          CLI + Desktop App + Web Playground for Voyage AI embeddings, reranking,
          and MongoDB Atlas Vector Search.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center',
            mb: 5,
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            href="https://github.com/mrlynn/voyageai-cli/releases"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: palette.accent,
              color: palette.bg,
              fontWeight: 700,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              '&:hover': { bgcolor: palette.accentDim },
            }}
          >
            Download Desktop App
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyInstall}
            sx={{
              borderColor: palette.border,
              color: palette.text,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              '&:hover': {
                borderColor: palette.accent,
                bgcolor: 'rgba(0, 237, 100, 0.05)',
              },
            }}
          >
            <Box
              component="code"
              sx={{
                fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                fontSize: '0.9rem',
              }}
            >
              npm i -g voyageai-cli
            </Box>
          </Button>
        </Box>

        {/* Terminal preview */}
        <Box
          sx={{
            maxWidth: 520,
            mx: 'auto',
            bgcolor: palette.bgSurface,
            border: `1px solid ${palette.border}`,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 0.8,
              px: 2,
              py: 1.2,
              bgcolor: 'rgba(0,0,0,0.3)',
              borderBottom: `1px solid ${palette.border}`,
            }}
          >
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
          </Box>
          <Box
            sx={{
              px: 2.5,
              py: 2,
              fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
              fontSize: '0.85rem',
              lineHeight: 1.8,
              textAlign: 'left',
            }}
          >
            <Box component="span" sx={{ color: palette.accent }}>
              $
            </Box>
            <Box component="span" sx={{ color: palette.text }}>
              {' '}
              vai embed &quot;Hello, vector world!&quot;
            </Box>
            <br />
            <Box component="span" sx={{ color: palette.textMuted }}>
              ✓ Generated 1024-dim embedding in 142ms
            </Box>
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
