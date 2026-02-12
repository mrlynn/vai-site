'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import GitHubIcon from '@mui/icons-material/GitHub';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { palette } from '@/theme/theme';
import { useState } from 'react';

interface UseCaseCTAProps {
  accent: string;
  onCtaClick?: (type: 'install' | 'github' | 'start_chatting' | 'desktop_app' | 'walkthrough') => void;
}

export default function UseCaseCTA({ accent, onCtaClick }: UseCaseCTAProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('npm install -g voyageai-cli');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        bgcolor: palette.bgSurface,
        textAlign: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: palette.text,
            mb: 2,
            fontSize: { xs: '1.5rem', md: '2rem' },
          }}
        >
          Ready to build your knowledge base?
        </Typography>
        <Typography
          sx={{
            color: palette.textDim,
            fontSize: '1.05rem',
            lineHeight: 1.7,
            mb: 4,
          }}
        >
          Install vai and go from documents to searchable knowledge in minutes.
        </Typography>

        {/* Install command */}
        <Box
          onClick={handleCopy}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5,
            px: 3,
            py: 1.5,
            bgcolor: palette.bgCard,
            borderRadius: 2,
            border: `1px solid ${palette.border}`,
            cursor: 'pointer',
            mb: 4,
            transition: 'border-color 0.2s',
            '&:hover': { borderColor: accent },
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Source Code Pro', monospace",
              fontSize: '0.95rem',
              color: palette.text,
            }}
          >
            <Box component="span" sx={{ color: accent }}>$</Box> npm install -g voyageai-cli
          </Typography>
          <ContentCopyIcon sx={{ fontSize: 16, color: copied ? accent : palette.textMuted }} />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            href="https://github.com/mrlynn/voyageai-cli/releases"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onCtaClick?.('desktop_app')}
            sx={{
              bgcolor: accent,
              color: palette.bg,
              fontWeight: 700,
              px: 4,
              py: 1.5,
              '&:hover': { bgcolor: accent, filter: 'brightness(0.85)' },
            }}
          >
            Download Desktop App
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<GitHubIcon />}
            href="https://github.com/mrlynn/voyageai-cli"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onCtaClick?.('github')}
            sx={{
              borderColor: palette.border,
              color: palette.text,
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: accent,
                bgcolor: `${accent}08`,
              },
            }}
          >
            Star on GitHub
          </Button>
        </Box>

        {/* Other use cases link */}
        <Typography sx={{ mt: 4, color: palette.textMuted, fontSize: '0.9rem' }}>
          Explore other use cases:{' '}
          <Box
            component="a"
            href="/use-cases"
            sx={{
              color: accent,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Healthcare, Legal, Finance, and more
          </Box>
        </Typography>
      </Container>
    </Box>
  );
}
