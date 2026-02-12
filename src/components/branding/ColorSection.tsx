'use client';

import { Box, Typography, Chip } from '@mui/material';
import { palette } from '@/theme/theme';
import { SectionTitle, SectionSubtitle, ColorSwatch } from './shared';

const brandColors = {
  primary: [
    { name: 'Teal', hex: '#00D4AA', usage: 'Primary accent, buttons, interactive elements (dark mode)' },
    { name: 'Teal Dark', hex: '#009E80', usage: 'Primary accent (light mode), dimmed accent' },
    { name: 'Teal Darker', hex: '#007A63', usage: 'Button hover (light mode)' },
    { name: 'Teal Light', hex: '#5CE8CC', usage: 'Button hover (dark mode), secondary accent' },
  ],
  secondary: [
    { name: 'Cyan', hex: '#40E0FF', usage: 'Links, secondary highlights (dark mode)' },
    { name: 'Cyan Dark', hex: '#0088CC', usage: 'Links (light mode)' },
  ],
  neutralsDark: [
    { name: 'MDB Black', hex: '#001E2B', usage: 'Dark mode background' },
    { name: 'Gray Dark 4', hex: '#112733', usage: 'Surface, input backgrounds' },
    { name: 'Gray Dark 3', hex: '#1C2D38', usage: 'Cards' },
    { name: 'Gray Dark 2', hex: '#3D4F58', usage: 'Borders' },
    { name: 'Gray Base', hex: '#889397', usage: 'Muted text' },
    { name: 'Gray Light 1', hex: '#C1C7C6', usage: 'Dimmed text' },
    { name: 'Gray Light 2', hex: '#E8EDEB', usage: 'Primary text (dark mode), borders (light mode)' },
  ],
  neutralsLight: [
    { name: 'White', hex: '#FFFFFF', usage: 'Light mode background' },
    { name: 'Gray Light 3', hex: '#F9FBFA', usage: 'Light mode surface' },
  ],
  semantic: [
    { name: 'Red', hex: '#FF6960', usage: 'Error states (dark mode)' },
    { name: 'Yellow', hex: '#FFC010', usage: 'Warning states' },
    { name: 'Purple', hex: '#B45AF2', usage: 'Accent, charts' },
  ],
  industry: [
    { name: 'Healthcare', hex: '#5CE8CC', usage: 'Healthcare use case accent' },
    { name: 'Legal', hex: '#B45AF2', usage: 'Legal use case accent' },
    { name: 'Finance', hex: '#FFC010', usage: 'Finance use case accent' },
    { name: 'DevDocs', hex: '#40E0FF', usage: 'Developer docs use case accent' },
  ],
};

// WCAG contrast ratio calculation
function luminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1: string, hex2: string) {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const contrastPairs = [
  { fg: '#E8EDEB', bg: '#001E2B', label: 'Text on Background' },
  { fg: '#00D4AA', bg: '#001E2B', label: 'Accent on Background' },
  { fg: '#889397', bg: '#001E2B', label: 'Muted on Background' },
  { fg: '#E8EDEB', bg: '#1C2D38', label: 'Text on Card' },
  { fg: '#00D4AA', bg: '#1C2D38', label: 'Accent on Card' },
  { fg: '#001E2B', bg: '#FFFFFF', label: 'Text on White (light)' },
];

function ColorGroup({ label, colors, cols }: { label: string; colors: typeof brandColors.primary; cols?: object }) {
  return (
    <>
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>{label}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: cols || { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        {colors.map((c) => <ColorSwatch key={c.hex + c.name} {...c} />)}
      </Box>
    </>
  );
}

export default function ColorSection({ onSnack }: { onSnack: (msg: string) => void }) {
  void onSnack;
  return (
    <Box sx={{ mb: 10 }} id="colors">
      <SectionTitle id="colors">Color Palette</SectionTitle>
      <SectionSubtitle>Click any swatch to copy its hex value. The palette uses a teal/cyan accent anchored to a dark neutral base.</SectionSubtitle>

      <ColorGroup label="Primary (Teal)" colors={brandColors.primary} />
      <ColorGroup label="Secondary (Cyan)" colors={brandColors.secondary} />
      <ColorGroup label="Neutrals (Dark Mode)" colors={brandColors.neutralsDark} cols={{ xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)', md: 'repeat(7, 1fr)' }} />
      <ColorGroup label="Neutrals (Light Mode)" colors={brandColors.neutralsLight} />
      <ColorGroup label="Semantic" colors={brandColors.semantic} />
      <ColorGroup label="Industry Accents" colors={brandColors.industry} />

      {/* Accessibility contrast ratios */}
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, mt: 4, fontSize: '1rem' }}>Accessibility Contrast Ratios</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
        {contrastPairs.map((p) => {
          const ratio = contrastRatio(p.fg, p.bg);
          const aa = ratio >= 4.5;
          const aaa = ratio >= 7;
          return (
            <Box key={p.label} sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}`, borderRadius: 2, p: 2, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: p.bg, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: p.fg, fontWeight: 700, fontSize: '0.7rem' }}>Aa</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: palette.text }}>{p.label}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', fontFamily: "'Source Code Pro', monospace", color: palette.textMuted }}>{ratio.toFixed(1)}:1</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Chip label="AA" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: aa ? 'rgba(0,212,170,0.15)' : 'rgba(255,105,96,0.15)', color: aa ? '#00D4AA' : '#FF6960' }} />
                <Chip label="AAA" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: aaa ? 'rgba(0,212,170,0.15)' : 'rgba(255,105,96,0.15)', color: aaa ? '#00D4AA' : '#FF6960' }} />
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Color usage diagram */}
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Color Usage Map</Typography>
      <Box sx={{ display: 'inline-block', position: 'relative', bgcolor: palette.bg, border: `1px solid ${palette.border}`, borderRadius: 3, p: 3, maxWidth: 480 }}>
        {/* mock card */}
        <Box sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}`, borderRadius: 2, p: 2.5, width: 320 }}>
          <Typography sx={{ color: palette.text, fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>Card Title</Typography>
          <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem', mb: 1.5 }}>Body text describing the component.</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ bgcolor: palette.accent, color: '#001E2B', px: 2, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600 }}>Primary</Box>
            <Box sx={{ border: `1px solid ${palette.border}`, color: palette.text, px: 2, py: 0.5, borderRadius: 1, fontSize: '0.75rem' }}>Secondary</Box>
          </Box>
        </Box>
        {/* labels */}
        {[
          { label: 'bg (#001E2B)', top: 8, right: -4, transform: 'translateX(100%)' },
          { label: 'bgCard (#1C2D38)', top: 48, right: -4, transform: 'translateX(100%)' },
          { label: 'text (#E8EDEB)', top: 72, right: -4, transform: 'translateX(100%)' },
          { label: 'textMuted (#889397)', top: 96, right: -4, transform: 'translateX(100%)' },
          { label: 'accent (#00D4AA)', top: 132, right: -4, transform: 'translateX(100%)' },
          { label: 'border (#3D4F58)', top: 48, left: -4, transform: 'translateX(-100%)' },
        ].map((l) => (
          <Typography
            key={l.label}
            sx={{
              position: 'absolute',
              ...l,
              fontSize: '0.6rem',
              fontFamily: "'Source Code Pro', monospace",
              color: palette.accent,
              whiteSpace: 'nowrap',
              display: { xs: 'none', sm: 'block' },
              px: 1,
            }}
          >
            ← {l.label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
