'use client';

import { Box, Button, Container, Typography, Chip, Snackbar, Skeleton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StarIcon from '@mui/icons-material/Star';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { palette } from '@/theme/theme';
import { useState, useEffect } from 'react';

interface Stats {
  stars: number;
  downloads: number;
}

export default function Hero() {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [typedText, setTypedText] = useState('');
  const fullCommand = 'vai embed "Hello, vector world!"';

  useEffect(() => {
    // Fetch GitHub/npm stats
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats({ stars: 0, downloads: 0 }));
  }, []);

  // Typewriter effect for terminal
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullCommand.length) {
        setTypedText(fullCommand.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 60);
    return () => clearInterval(timer);
  }, []);

  const [copiedCmd, setCopiedCmd] = useState('');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setCopied(true);
  };

  const formatNumber = (n: number): string => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
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
          label="Open Source Community Tool"
          size="small"
          sx={{
            mb: 3,
            bgcolor: 'rgba(0, 237, 100, 0.1)',
            color: palette.accent,
            border: `1px solid ${palette.accent}33`,
            fontWeight: 600,
          }}
        />

        {/* Value-first headline */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.2rem', sm: '3rem', md: '3.8rem' },
            fontWeight: 800,
            lineHeight: 1.15,
            mb: 2,
            color: palette.text,
          }}
        >
          Ship semantic search{' '}
          <Box
            component="span"
            sx={{
              background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.blue} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            in minutes
          </Box>
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: palette.textDim,
            fontWeight: 400,
            mb: 2,
            fontSize: { xs: '1.1rem', md: '1.3rem' },
            maxWidth: 580,
            mx: 'auto',
            lineHeight: 1.5,
          }}
        >
          The complete developer toolkit for Voyage AI embeddings, 
          vector search, and RAG pipelines.
        </Typography>

        <Typography
          sx={{
            color: palette.textMuted,
            mb: 4,
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            maxWidth: 520,
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          Terminal, browser, or desktop — embed, compare, benchmark, 
          and deploy with MongoDB Atlas Vector Search.
        </Typography>

        {/* Social proof badges */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mb: 4,
            flexWrap: 'wrap',
          }}
        >
          {stats ? (
            <>
              <Chip
                icon={<StarIcon sx={{ fontSize: 16 }} />}
                label={`${formatNumber(stats.stars)} stars`}
                component="a"
                href="https://github.com/mrlynn/voyageai-cli"
                target="_blank"
                rel="noopener noreferrer"
                clickable
                sx={{
                  bgcolor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFD700',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(255, 215, 0, 0.15)' },
                }}
              />
              <Chip
                icon={<DownloadForOfflineIcon sx={{ fontSize: 16 }} />}
                label={`${formatNumber(stats.downloads)}/month`}
                component="a"
                href="https://www.npmjs.com/package/voyageai-cli"
                target="_blank"
                rel="noopener noreferrer"
                clickable
                sx={{
                  bgcolor: 'rgba(203, 56, 55, 0.1)',
                  color: '#CB3837',
                  border: '1px solid rgba(203, 56, 55, 0.3)',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(203, 56, 55, 0.15)' },
                }}
              />
            </>
          ) : (
            <>
              <Skeleton variant="rounded" width={90} height={32} sx={{ bgcolor: palette.bgSurface }} />
              <Skeleton variant="rounded" width={110} height={32} sx={{ bgcolor: palette.bgSurface }} />
            </>
          )}
          <Chip
            label="#1 MTEB Ranking"
            sx={{
              bgcolor: 'rgba(0, 237, 100, 0.1)',
              color: palette.accent,
              border: `1px solid ${palette.accent}33`,
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Quick install - curl front and center */}
        <Box
          onClick={() => handleCopy('curl -fsSL https://vaicli.com/install.sh | sh', 'curl')}
          sx={{
            maxWidth: 520,
            mx: 'auto',
            mb: 2,
            px: 3,
            py: 1.5,
            bgcolor: palette.bgSurface,
            border: `1px solid ${palette.accent}44`,
            borderRadius: 2,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
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
              fontSize: { xs: '0.75rem', sm: '0.9rem' },
              color: palette.text,
            }}
          >
            <Box component="span" sx={{ color: palette.accent }}>$</Box>{' '}
            curl -fsSL https://vaicli.com/install.sh | sh
          </Box>
          <ContentCopyIcon sx={{ fontSize: 16, color: palette.textMuted, ml: 1, flexShrink: 0 }} />
        </Box>

        <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem', mb: 3 }}>
          Click to copy · Works on macOS, Linux &amp; WSL
        </Typography>

        {/* Alternative install methods */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            justifyContent: 'center',
            alignItems: 'center',
            mb: 5,
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            size="medium"
            startIcon={<DownloadIcon />}
            href="https://github.com/mrlynn/voyageai-cli/releases"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: palette.accent,
              color: palette.bg,
              fontWeight: 700,
              px: 3,
              py: 1.2,
              fontSize: '0.9rem',
              '&:hover': { bgcolor: palette.accentDim },
            }}
          >
            Desktop App
          </Button>

          <Button
            variant="outlined"
            size="medium"
            startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleCopy('npm i -g voyageai-cli', 'npm')}
            sx={{
              borderColor: palette.border,
              color: palette.text,
              px: 3,
              py: 1.2,
              fontSize: '0.9rem',
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
                fontSize: '0.85rem',
              }}
            >
              npm i -g voyageai-cli
            </Box>
          </Button>

          <Button
            variant="outlined"
            size="medium"
            startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
            onClick={() => handleCopy('brew install mrlynn/tap/voyageai-cli', 'brew')}
            sx={{
              borderColor: palette.border,
              color: palette.text,
              px: 3,
              py: 1.2,
              fontSize: '0.9rem',
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
                fontSize: '0.85rem',
              }}
            >
              brew install voyageai-cli
            </Box>
          </Button>
        </Box>

        {/* Animated terminal preview */}
        <Box
          sx={{
            maxWidth: 560,
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
              minHeight: 72,
            }}
          >
            <Box component="span" sx={{ color: palette.accent }}>$</Box>
            <Box component="span" sx={{ color: palette.text }}> {typedText}</Box>
            <Box 
              component="span" 
              sx={{ 
                display: 'inline-block',
                width: 8,
                height: 16,
                bgcolor: palette.accent,
                ml: 0.5,
                animation: 'blink 1s step-end infinite',
                '@keyframes blink': {
                  '50%': { opacity: 0 },
                },
              }} 
            />
            {typedText === fullCommand && (
              <>
                <br />
                <Box component="span" sx={{ color: palette.textMuted }}>
                  ✓ Generated 1024-dim embedding in 142ms
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message={`Copied ${copiedCmd} command!`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
