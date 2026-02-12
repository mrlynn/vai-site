'use client';

import { Box, Typography } from '@mui/material';
import { palette } from '@/theme/theme';
import { SectionTitle, SectionSubtitle } from './shared';

function WireframeBox({ label, h, bg }: { label: string; h?: number; bg?: string }) {
  return (
    <Box
      sx={{
        border: `2px dashed ${palette.border}`,
        borderRadius: 1,
        height: h || 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: bg || 'transparent',
      }}
    >
      <Typography sx={{ fontSize: '0.65rem', color: palette.textMuted, fontFamily: "'Source Code Pro', monospace" }}>{label}</Typography>
    </Box>
  );
}

export default function LayoutSection() {
  return (
    <Box sx={{ mb: 10 }} id="layout">
      <SectionTitle id="layout">Layout Patterns</SectionTitle>
      <SectionSubtitle>Page structure, section rhythm, and grid patterns.</SectionSubtitle>

      {/* Page structure */}
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Page Structure</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 480, mb: 5 }}>
        <WireframeBox label="Navbar" h={36} bg="rgba(0,212,170,0.05)" />
        <WireframeBox label="Hero" h={80} bg="rgba(0,212,170,0.03)" />
        <WireframeBox label="Section (bg)" h={60} />
        <WireframeBox label="Section (bgSurface)" h={60} bg={palette.bgSurface} />
        <WireframeBox label="Section (bg)" h={60} />
        <WireframeBox label="Footer" h={36} bg="rgba(0,212,170,0.05)" />
      </Box>

      {/* Section rhythm */}
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Section Rhythm</Typography>
      <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem', mb: 4, maxWidth: 480 }}>
        Alternate background colors between sections: <Box component="code" sx={{ bgcolor: palette.bgSurface, px: 0.5, borderRadius: 0.5, fontSize: '0.8rem' }}>bg → bgSurface → bg</Box>. This creates visual separation without hard dividers.
      </Typography>

      {/* Container widths */}
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Container Widths</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 5 }}>
        <Box sx={{ border: `2px dashed ${palette.border}`, borderRadius: 1, p: 1, maxWidth: 480, position: 'relative' }}>
          <Typography sx={{ fontSize: '0.6rem', color: palette.accent, fontFamily: "'Source Code Pro', monospace", position: 'absolute', top: -8, left: 8, bgcolor: palette.bg, px: 0.5 }}>maxWidth=&quot;lg&quot; (1200px)</Typography>
          <Box sx={{ height: 32 }} />
        </Box>
        <Box sx={{ border: `2px dashed ${palette.border}`, borderRadius: 1, p: 1, maxWidth: 360, position: 'relative' }}>
          <Typography sx={{ fontSize: '0.6rem', color: palette.accent, fontFamily: "'Source Code Pro', monospace", position: 'absolute', top: -8, left: 8, bgcolor: palette.bg, px: 0.5 }}>maxWidth=&quot;md&quot; (900px)</Typography>
          <Box sx={{ height: 32 }} />
        </Box>
      </Box>

      {/* Grid patterns */}
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Grid Patterns</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 480 }}>
        <Box>
          <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted, mb: 1, fontFamily: "'Source Code Pro', monospace" }}>2-col (sm and up)</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <WireframeBox label="1" h={40} />
            <WireframeBox label="2" h={40} />
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted, mb: 1, fontFamily: "'Source Code Pro', monospace" }}>3-col (md and up)</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
            <WireframeBox label="1" h={40} />
            <WireframeBox label="2" h={40} />
            <WireframeBox label="3" h={40} />
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted, mb: 1, fontFamily: "'Source Code Pro', monospace" }}>4-col (lg and up)</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1 }}>
            <WireframeBox label="1" h={40} />
            <WireframeBox label="2" h={40} />
            <WireframeBox label="3" h={40} />
            <WireframeBox label="4" h={40} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
