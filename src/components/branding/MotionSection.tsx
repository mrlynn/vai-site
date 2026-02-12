'use client';

import { Box, Card, Typography } from '@mui/material';
import { palette } from '@/theme/theme';
import { SectionTitle, SectionSubtitle, CopyValue } from './shared';

const motionTokens = [
  { name: 'Hover transition', value: "transition: 'all 0.2s ease'", desc: 'Default for all interactive hover states' },
  { name: 'Card lift', value: "transform: 'translateY(-2px)'", desc: 'Subtle elevation on card hover' },
  { name: 'Shadow on lift', value: "boxShadow: '0 8px 24px rgba(0,0,0,0.3)'", desc: 'Depth shadow paired with lift' },
  { name: 'Fade in', value: "opacity 0.15s ease", desc: 'Element visibility transitions' },
];

export default function MotionSection() {
  return (
    <Box sx={{ mb: 10 }} id="motion">
      <SectionTitle id="motion">Motion &amp; Animation</SectionTitle>
      <SectionSubtitle>Prefer subtle, functional motion. No decorative animations.</SectionSubtitle>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        {motionTokens.map((t) => (
          <Card key={t.name} sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}`, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography sx={{ fontWeight: 600, color: palette.text, fontSize: '0.9rem' }}>{t.name}</Typography>
              <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem' }}>{t.desc}</Typography>
            </Box>
            <CopyValue value={t.value} />
          </Card>
        ))}
      </Box>

      {/* Live hover demo */}
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Live Demo</Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box
          sx={{
            width: 140,
            height: 100,
            bgcolor: palette.bgCard,
            border: `1px solid ${palette.border}`,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
          }}
        >
          <Typography sx={{ color: palette.textMuted, fontSize: '0.75rem' }}>Hover me</Typography>
        </Box>

        {/* Glow demo */}
        <Box
          sx={{
            width: 140,
            height: 100,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: `1px solid ${palette.border}`,
            bgcolor: palette.bgCard,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(0,212,170,0.12) 0%, transparent 70%)',
              transition: 'opacity 0.3s ease',
              opacity: 0.5,
            }}
          />
          <Typography sx={{ color: palette.textMuted, fontSize: '0.75rem', position: 'relative' }}>Glow</Typography>
        </Box>
      </Box>
    </Box>
  );
}
