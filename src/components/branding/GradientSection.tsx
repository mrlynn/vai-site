'use client';

import { Box, Typography } from '@mui/material';
import { palette } from '@/theme/theme';
import { SectionTitle, SectionSubtitle } from './shared';

const gradients = [
  { name: 'Hero Text', css: 'linear-gradient(135deg, #00D4AA 0%, #40E0FF 100%)', usage: 'Headline accents, hero text spans' },
  { name: 'Success Bar', css: 'linear-gradient(90deg, #00D4AA, #5CE8CC)', usage: 'Progress bars, meter fills, positive indicators' },
  { name: 'Info Bar', css: 'linear-gradient(90deg, #40E0FF, #0088CC)', usage: 'Secondary progress bars, latency indicators' },
];

export default function GradientSection({ onSnack }: { onSnack: (msg: string) => void }) {
  return (
    <Box sx={{ mb: 10 }} id="gradients">
      <SectionTitle id="gradients">Gradients</SectionTitle>
      <SectionSubtitle>Used sparingly for emphasis, hero text, and interactive highlights.</SectionSubtitle>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
        {gradients.map((grad) => (
          <Box
            key={grad.name}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${palette.border}`,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
            onClick={() => {
              navigator.clipboard.writeText(grad.css);
              onSnack(`Copied: ${grad.css}`);
            }}
          >
            <Box sx={{ height: 80, background: grad.css }} />
            <Box sx={{ p: 2, bgcolor: palette.bgCard }}>
              <Typography sx={{ fontWeight: 600, color: palette.text, fontSize: '0.85rem', mb: 0.5 }}>{grad.name}</Typography>
              <Typography sx={{ fontFamily: "'Source Code Pro', monospace", fontSize: '0.7rem', color: palette.textMuted, mb: 0.5, wordBreak: 'break-all' }}>{grad.css}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>{grad.usage}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
