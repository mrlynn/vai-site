'use client';

import { Box, Button, Card, Chip, IconButton, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { palette } from '@/theme/theme';
import { SectionTitle, SectionSubtitle } from './shared';
import { useState } from 'react';

function SubHeading({ children }: { children: React.ReactNode }) {
  return <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, mt: 4, fontSize: '1rem' }}>{children}</Typography>;
}

function CardExample() {
  return (
    <Card
      sx={{
        bgcolor: palette.bgCard,
        border: `1px solid ${palette.border}`,
        p: 3,
        maxWidth: 360,
        transition: 'all 0.2s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
      }}
    >
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 0.5 }}>Sample Card</Typography>
      <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem', mb: 2 }}>
        Cards use bgCard background with a 1px border. Hover lifts with translateY(-2px).
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Chip label="tag" size="small" sx={{ bgcolor: 'rgba(0,212,170,0.1)', color: palette.accent, fontSize: '0.75rem' }} />
        <Chip label="active" size="small" sx={{ bgcolor: 'rgba(64,224,255,0.1)', color: '#40E0FF', fontSize: '0.75rem' }} />
      </Box>
    </Card>
  );
}

function ButtonExamples() {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button sx={{ bgcolor: palette.accent, color: '#001E2B', fontWeight: 600, '&:hover': { bgcolor: '#5CE8CC' }, '&.Mui-disabled': { bgcolor: 'rgba(0,212,170,0.2)', color: 'rgba(0,30,43,0.4)' } }}>
        Primary
      </Button>
      <Button variant="outlined" sx={{ borderColor: palette.border, color: palette.text, '&:hover': { borderColor: palette.accent, bgcolor: 'rgba(0,212,170,0.05)' } }}>
        Secondary
      </Button>
      <Button sx={{ color: palette.textDim, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
        Ghost
      </Button>
      <Button disabled sx={{ bgcolor: 'rgba(0,212,170,0.2)', color: 'rgba(0,30,43,0.4)' }}>
        Disabled
      </Button>
    </Box>
  );
}

function TerminalBlock() {
  const [copied, setCopied] = useState(false);
  const lines = [
    { prefix: '$ ', text: 'vai embed "Hello, vector world!"', color: palette.text },
    { prefix: '', text: '✓ Model: voyage-3-large', color: palette.accent },
    { prefix: '', text: '✓ Dimensions: 1024', color: palette.accent },
    { prefix: '', text: '✓ Latency: 42ms', color: palette.accent },
    { prefix: '', text: '[0.0234, -0.0891, 0.1456, ...]', color: '#40E0FF' },
  ];

  return (
    <Box
      sx={{
        bgcolor: '#0A1929',
        borderRadius: 2,
        border: `1px solid ${palette.border}`,
        overflow: 'hidden',
        maxWidth: 520,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, bgcolor: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${palette.border}` }}>
        <Box sx={{ display: 'flex', gap: 0.7 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FF5F57' }} />
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FEBC2E' }} />
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#28C840' }} />
        </Box>
        <IconButton
          size="small"
          onClick={() => {
            navigator.clipboard.writeText('vai embed "Hello, vector world!"');
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          sx={{ color: palette.textMuted, '&:hover': { color: palette.text } }}
        >
          <ContentCopyIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
      <Box sx={{ p: 2, fontFamily: "'Source Code Pro', monospace", fontSize: '0.8rem', lineHeight: 1.8 }}>
        {lines.map((line, i) => (
          <Box key={i} sx={{ color: line.color }}>
            {line.prefix && <Box component="span" sx={{ color: palette.textMuted }}>{line.prefix}</Box>}
            {line.text}
          </Box>
        ))}
        {copied && <Box sx={{ color: palette.textMuted, mt: 1, fontSize: '0.7rem' }}>Copied!</Box>}
      </Box>
    </Box>
  );
}

function ChipExamples() {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Chip label="voyage-code-3" size="small" sx={{ bgcolor: 'rgba(0,212,170,0.1)', color: palette.accent, fontFamily: "'Source Code Pro', monospace", fontSize: '0.75rem', fontWeight: 600 }} />
      <Chip label="voyage-3-large" size="small" sx={{ bgcolor: 'rgba(64,224,255,0.1)', color: '#40E0FF', fontFamily: "'Source Code Pro', monospace", fontSize: '0.75rem', fontWeight: 600 }} />
      <Chip label="Active" size="small" sx={{ bgcolor: 'rgba(0,212,170,0.15)', color: palette.accent, fontWeight: 600 }} />
      <Chip label="Beta" size="small" sx={{ bgcolor: 'rgba(180,90,242,0.15)', color: '#B45AF2', fontWeight: 600 }} />
      <Chip label="Healthcare" size="small" sx={{ bgcolor: 'rgba(92,232,204,0.15)', color: '#5CE8CC' }} />
      <Chip label="Finance" size="small" sx={{ bgcolor: 'rgba(255,192,16,0.15)', color: '#FFC010' }} />
    </Box>
  );
}

function SectionContainerExample() {
  return (
    <Box
      sx={{
        border: `2px dashed ${palette.border}`,
        borderRadius: 2,
        p: 3,
        position: 'relative',
        maxWidth: 520,
      }}
    >
      <Typography sx={{ position: 'absolute', top: -10, left: 16, bgcolor: palette.bg, px: 1, fontSize: '0.65rem', color: palette.accent, fontFamily: "'Source Code Pro', monospace" }}>
        {'<Container maxWidth="lg">'}
      </Typography>
      <Box sx={{ py: 2 }}>
        <Typography sx={{ fontWeight: 700, color: palette.text, fontSize: '1.2rem', mb: 0.5 }}>Section Heading</Typography>
        <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem', mb: 2 }}>Section subtitle with supporting context.</Typography>
        <Box sx={{ border: `1px dashed ${palette.border}`, borderRadius: 1, p: 2, textAlign: 'center' }}>
          <Typography sx={{ color: palette.textMuted, fontSize: '0.75rem' }}>Content area</Typography>
        </Box>
      </Box>
      <Typography sx={{ position: 'absolute', bottom: -10, right: 16, bgcolor: palette.bg, px: 1, fontSize: '0.65rem', color: palette.textMuted, fontFamily: "'Source Code Pro', monospace" }}>
        py: 8
      </Typography>
    </Box>
  );
}

export default function ComponentsSection() {
  return (
    <Box sx={{ mb: 10 }} id="components">
      <SectionTitle id="components">Component Patterns</SectionTitle>
      <SectionSubtitle>Key UI patterns used across the site. All examples are live-rendered MUI components.</SectionSubtitle>

      <SubHeading>Cards</SubHeading>
      <CardExample />

      <SubHeading>Buttons</SubHeading>
      <ButtonExamples />

      <SubHeading>Terminal / Command Block</SubHeading>
      <TerminalBlock />

      <SubHeading>Chips &amp; Badges</SubHeading>
      <ChipExamples />

      <SubHeading>Section Container Pattern</SubHeading>
      <SectionContainerExample />
    </Box>
  );
}
