'use client';

import { Box, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { palette } from '@/theme/theme';
import { useState } from 'react';

export function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <Typography
      id={id}
      variant="h4"
      sx={{
        fontWeight: 700,
        color: palette.text,
        mb: 1,
        fontSize: { xs: '1.5rem', md: '1.8rem' },
        scrollMarginTop: '80px',
      }}
    >
      {children}
    </Typography>
  );
}

export function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ color: palette.textMuted, mb: 4, fontSize: '1rem', maxWidth: 600 }}>
      {children}
    </Typography>
  );
}

export function ColorSwatch({ name, hex, usage, onCopy }: { name: string; hex: string; usage: string; onCopy?: (msg: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    onCopy?.(`Copied ${hex}`);
    setTimeout(() => setCopied(false), 1500);
  };

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = luminance > 0.5 ? '#001E2B' : '#FFFFFF';

  return (
    <Box
      onClick={handleCopy}
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${palette.border}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        },
      }}
    >
      <Box
        sx={{
          bgcolor: hex,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {copied ? (
          <CheckIcon sx={{ color: textColor, fontSize: 20 }} />
        ) : (
          <ContentCopyIcon
            sx={{
              color: textColor,
              fontSize: 16,
              opacity: 0,
              transition: 'opacity 0.2s',
              '.MuiBox-root:hover &': { opacity: 0.6 },
            }}
          />
        )}
      </Box>
      <Box sx={{ p: 1.5, bgcolor: palette.bgCard }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: palette.text, mb: 0.3 }}>
          {name}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontFamily: "'Source Code Pro', monospace",
            color: palette.textMuted,
            mb: 0.5,
          }}
        >
          {hex}
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted, lineHeight: 1.4 }}>
          {usage}
        </Typography>
      </Box>
    </Box>
  );
}

export function CopyValue({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Box
      component="span"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      sx={{
        cursor: 'pointer',
        fontFamily: "'Source Code Pro', monospace",
        fontSize: '0.75rem',
        color: palette.textMuted,
        bgcolor: palette.bgSurface,
        px: 1,
        py: 0.3,
        borderRadius: 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        transition: 'color 0.15s',
        '&:hover': { color: palette.text },
      }}
    >
      {label || value}
      {copied && <CheckIcon sx={{ fontSize: 12, color: palette.accent }} />}
    </Box>
  );
}
