'use client';

import { Box, Typography } from '@mui/material';
import { palette } from '@/theme/theme';
import { SectionTitle, SectionSubtitle } from './shared';

const mappings = [
  { token: 'bg', dark: '#001E2B', light: '#FFFFFF' },
  { token: 'bgSurface', dark: '#112733', light: '#F9FBFA' },
  { token: 'bgCard', dark: '#1C2D38', light: '#FFFFFF' },
  { token: 'accent', dark: '#00D4AA', light: '#009E80' },
  { token: 'text', dark: '#E8EDEB', light: '#001E2B' },
  { token: 'textDim', dark: '#C1C7C6', light: '#3D4F58' },
  { token: 'textMuted', dark: '#889397', light: '#889397' },
  { token: 'border', dark: '#3D4F58', light: '#E8EDEB' },
];

export default function DarkLightSection() {
  return (
    <Box sx={{ mb: 10 }} id="dark-light">
      <SectionTitle id="dark-light">Dark / Light Mode</SectionTitle>
      <SectionSubtitle>Dark mode is primary. Light mode support is planned.</SectionSubtitle>

      <Box sx={{ border: `1px solid ${palette.border}`, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', p: 1.5, bgcolor: palette.bgSurface, gap: 1 }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase' }}>Token</Typography>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase' }}>Dark (current)</Typography>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase' }}>Light (planned)</Typography>
        </Box>
        {mappings.map((m, i) => (
          <Box key={m.token} sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', p: 1.5, gap: 1, bgcolor: i % 2 === 0 ? palette.bgCard : palette.bgSurface, borderTop: `1px solid ${palette.border}`, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.8rem', fontFamily: "'Source Code Pro', monospace", color: palette.accent }}>{m.token}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: m.dark, border: '1px solid rgba(255,255,255,0.1)' }} />
              <Typography sx={{ fontSize: '0.75rem', fontFamily: "'Source Code Pro', monospace", color: palette.textMuted }}>{m.dark}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: m.light, border: '1px solid rgba(0,0,0,0.1)' }} />
              <Typography sx={{ fontSize: '0.75rem', fontFamily: "'Source Code Pro', monospace", color: palette.textMuted }}>{m.light}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
