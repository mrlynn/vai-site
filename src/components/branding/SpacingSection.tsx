'use client';

import { Box, Card, Typography } from '@mui/material';
import { palette } from '@/theme/theme';
import { SectionTitle, SectionSubtitle } from './shared';

export default function SpacingSection() {
  return (
    <Box sx={{ mb: 10 }} id="spacing">
      <SectionTitle id="spacing">Spacing &amp; Radii</SectionTitle>
      <SectionSubtitle>Consistent spacing and border radius values used throughout the UI.</SectionSubtitle>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Card sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}`, p: 3 }}>
          <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '0.95rem' }}>Border Radius</Typography>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {[
              { label: 'Small', value: '4px' },
              { label: 'Default', value: '8px' },
              { label: 'Card', value: '12px' },
              { label: 'Large', value: '16px' },
            ].map((r) => (
              <Box key={r.label} sx={{ textAlign: 'center' }}>
                <Box sx={{ width: 48, height: 48, border: `2px solid ${palette.accent}`, borderRadius: r.value, mb: 1 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: palette.text }}>{r.value}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted }}>{r.label}</Typography>
              </Box>
            ))}
          </Box>
        </Card>

        <Card sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}`, p: 3 }}>
          <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '0.95rem' }}>Spacing Scale</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              { label: 'xs', value: '4px' },
              { label: 'sm', value: '8px' },
              { label: 'md', value: '16px' },
              { label: 'lg', value: '24px' },
              { label: 'xl', value: '32px' },
              { label: '2xl', value: '48px' },
            ].map((s) => (
              <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontFamily: "'Source Code Pro', monospace", color: palette.textMuted, width: 40 }}>{s.label}</Typography>
                <Box sx={{ height: 8, width: s.value, bgcolor: palette.accent, borderRadius: 1 }} />
                <Typography sx={{ fontSize: '0.7rem', fontFamily: "'Source Code Pro', monospace", color: palette.textMuted }}>{s.value}</Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
