'use client';

import { Box, IconButton, Snackbar, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { palette } from '@/theme/theme';
import { useState } from 'react';

interface CommandBlockProps {
  command: string;
  output?: string;
  accent?: string;
}

export default function CommandBlock({ command, output, accent = '#00D4AA' }: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
  };

  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${palette.border}`,
        bgcolor: palette.bgSurface,
        my: 2,
      }}
    >
      {/* Terminal header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          bgcolor: 'rgba(0,0,0,0.3)',
          borderBottom: `1px solid ${palette.border}`,
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.8 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
        </Box>
        <Tooltip title="Copy command">
          <IconButton
            onClick={handleCopy}
            size="small"
            sx={{
              color: palette.textMuted,
              '&:hover': { color: palette.text },
            }}
          >
            <ContentCopyIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Command */}
      <Box sx={{ px: 2.5, pt: 2, pb: output ? 1 : 2 }}>
        {command.split('\n').map((line, i) => (
          <Typography
            key={i}
            component="div"
            sx={{
              fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
              fontSize: { xs: '0.78rem', md: '0.85rem' },
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            <Box component="span" sx={{ color: accent, mr: 1 }}>$</Box>
            <Box component="span" sx={{ color: palette.text }}>{line}</Box>
          </Typography>
        ))}
      </Box>

      {/* Output */}
      {output && (
        <Box
          sx={{
            px: 2.5,
            pb: 2,
            pt: 1,
            borderTop: `1px solid rgba(255,255,255,0.05)`,
          }}
        >
          <Typography
            component="pre"
            sx={{
              fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
              fontSize: { xs: '0.73rem', md: '0.8rem' },
              lineHeight: 1.7,
              color: palette.textDim,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              m: 0,
            }}
          >
            {output}
          </Typography>
        </Box>
      )}

      <Snackbar
        open={copied}
        autoHideDuration={1500}
        onClose={() => setCopied(false)}
        message="Copied!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
