'use client';

import { Box, Card, Typography } from '@mui/material';
import { palette } from '@/theme/theme';
import { SectionTitle, SectionSubtitle, CopyValue } from './shared';

const typeScale = [
  { name: 'Display', size: '2.5rem', px: '40px', lineHeight: 1.1, weight: 800, family: 'mono', sample: 'vai' },
  { name: 'H1', size: '2rem', px: '32px', lineHeight: 1.2, weight: 700, family: 'sans', sample: 'Ship semantic search in minutes' },
  { name: 'H2', size: '1.5rem', px: '24px', lineHeight: 1.3, weight: 700, family: 'sans', sample: 'Embed, index, and search your documents' },
  { name: 'H3', size: '1.25rem', px: '20px', lineHeight: 1.4, weight: 600, family: 'sans', sample: 'Getting started with vai' },
  { name: 'Body', size: '1rem', px: '16px', lineHeight: 1.6, weight: 400, family: 'sans', sample: 'The complete developer toolkit for Voyage AI embeddings, vector search, and RAG pipelines.' },
  { name: 'Small', size: '0.875rem', px: '14px', lineHeight: 1.5, weight: 400, family: 'sans', sample: 'Updated 3 minutes ago' },
  { name: 'Caption', size: '0.75rem', px: '12px', lineHeight: 1.4, weight: 400, family: 'sans', sample: 'v2.1.0 · MIT License' },
];

const fontStacks = [
  { name: 'Display / Logo', family: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace" },
  { name: 'Headings & Body', family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { name: 'Code / Terminal', family: "'Source Code Pro', 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace" },
];

export default function TypographySection() {
  return (
    <Box sx={{ mb: 10 }} id="typography">
      <SectionTitle id="typography">Typography</SectionTitle>
      <SectionSubtitle>System fonts for body text, monospace for branding and code. No external font loading required.</SectionSubtitle>

      {/* Type scale table */}
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Type Scale</Typography>
      <Box sx={{ border: `1px solid ${palette.border}`, borderRadius: 2, overflow: 'hidden', mb: 5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '100px 90px 70px 70px 1fr', p: 1.5, bgcolor: palette.bgSurface, gap: 1 }}>
          {['Name', 'Size', 'px', 'Line H', 'Sample'].map((h) => (
            <Typography key={h} sx={{ fontSize: '0.65rem', fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</Typography>
          ))}
        </Box>
        {typeScale.map((t, i) => (
          <Box
            key={t.name}
            sx={{
              display: 'grid',
              gridTemplateColumns: '100px 90px 70px 70px 1fr',
              p: 1.5,
              gap: 1,
              bgcolor: i % 2 === 0 ? palette.bgCard : palette.bgSurface,
              borderTop: `1px solid ${palette.border}`,
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: palette.accent }}>{t.name}</Typography>
            <CopyValue value={t.size} />
            <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted, fontFamily: "'Source Code Pro', monospace" }}>{t.px}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted, fontFamily: "'Source Code Pro', monospace" }}>{t.lineHeight}</Typography>
            <Typography
              sx={{
                fontSize: t.size,
                fontWeight: t.weight,
                lineHeight: t.lineHeight,
                color: palette.text,
                fontFamily: t.family === 'mono' ? "'Source Code Pro', monospace" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {t.sample}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Font stacks */}
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Font Stacks</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        {fontStacks.map((f) => (
          <Card key={f.name} sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}`, p: 2.5 }}>
            <Typography sx={{ fontWeight: 600, color: palette.accent, fontSize: '0.85rem', mb: 1 }}>{f.name}</Typography>
            <CopyValue value={f.family} />
          </Card>
        ))}
      </Box>

      {/* Font loading guidance */}
      <Card sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}`, p: 2.5 }}>
        <Typography sx={{ fontWeight: 600, color: palette.text, fontSize: '0.9rem', mb: 1 }}>Font Loading</Typography>
        <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem', lineHeight: 1.6 }}>
          vai uses system font stacks exclusively. No external font files or Google Fonts. The monospace stack
          (Source Code Pro → SF Mono → Fira Code) is available on most developer machines. On systems without
          Source Code Pro, the stack falls back gracefully.
        </Typography>
      </Card>
    </Box>
  );
}
