'use client';

import { Box, Card, CardContent, IconButton, Typography, Tooltip, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { palette } from '@/theme/theme';
import { SectionTitle, SectionSubtitle } from './shared';

const logos = [
  { name: 'Logo (Light BG)', file: '/logo.png', bg: '#F9FBFA', description: 'Use on light backgrounds. Transparent PNG.' },
  { name: 'Logo (Dark BG)', file: '/logo-dark.png', bg: '#001E2B', description: 'Use on dark backgrounds. Includes rounded container.' },
  { name: 'Icon Mark', file: '/watermark.png', bg: '#F9FBFA', description: 'Standalone V mark. Black on transparent. Use as watermark or favicon source.' },
  { name: 'Icon Mark (Inverted)', file: '/watermark.png', bg: '#001E2B', description: 'V mark inverted for dark backgrounds (apply CSS filter: invert(1)).', invert: true },
];

const doDonts = [
  { ok: true, label: 'Correct usage on light background', transform: 'none', filter: 'none', bg: '#F9FBFA' },
  { ok: true, label: 'Correct usage on dark background', transform: 'none', filter: 'none', bg: '#001E2B', useDark: true },
  { ok: false, label: 'Don\'t stretch or distort', transform: 'scaleX(1.5)', filter: 'none', bg: '#F9FBFA' },
  { ok: false, label: 'Don\'t recolor the logo', transform: 'none', filter: 'hue-rotate(180deg) saturate(2)', bg: '#F9FBFA' },
  { ok: false, label: 'Don\'t use on busy backgrounds', transform: 'none', filter: 'none', bg: 'linear-gradient(45deg, #FF6960, #B45AF2, #FFC010)' },
  { ok: false, label: 'Don\'t go below 32px height', transform: 'none', filter: 'none', bg: '#F9FBFA', tiny: true },
];

export default function LogoSection({ onSnack }: { onSnack: (msg: string) => void }) {
  const handleDownload = (file: string, name: string) => {
    const a = document.createElement('a');
    a.href = file;
    a.download = name;
    a.click();
    onSnack(`Downloaded ${name}`);
  };

  return (
    <Box sx={{ mb: 10 }} id="logos">
      <SectionTitle id="logos">Logos</SectionTitle>
      <SectionSubtitle>
        Download and use the appropriate logo variant for your context. Always maintain clear space around the logo.
      </SectionSubtitle>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
        {logos.map((logo) => (
          <Card key={logo.name} sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}`, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: logo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, minHeight: 200, position: 'relative' }}>
              <Box component="img" src={logo.file} alt={logo.name} sx={{ maxHeight: 140, maxWidth: '70%', objectFit: 'contain', filter: logo.invert ? 'invert(1)' : 'none' }} />
              <Tooltip title="Download">
                <IconButton
                  onClick={() => handleDownload(logo.file, `vai-${logo.name.toLowerCase().replace(/\s+/g, '-')}.png`)}
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.4)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}
                  size="small"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontWeight: 600, color: palette.text, mb: 0.5, fontSize: '0.95rem' }}>{logo.name}</Typography>
              <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem', lineHeight: 1.5 }}>{logo.description}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Clear space diagram */}
      <Box sx={{ mt: 5 }}>
        <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Clear Space</Typography>
        <Box sx={{ display: 'inline-flex', bgcolor: '#F9FBFA', borderRadius: 2, p: 1, border: `1px solid ${palette.border}` }}>
          <Box
            sx={{
              border: '2px dashed rgba(0,212,170,0.5)',
              borderRadius: 1,
              p: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Box component="img" src="/logo.png" alt="vai" sx={{ height: 64 }} />
            {/* dimension labels */}
            <Typography sx={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', color: '#00D4AA', fontFamily: "'Source Code Pro', monospace" }}>
              ≥ &quot;a&quot; width
            </Typography>
            <Typography sx={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontSize: '0.6rem', color: '#00D4AA', fontFamily: "'Source Code Pro', monospace" }}>
              ≥ &quot;a&quot; width
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem', mt: 1 }}>
          Minimum clear space around the logo equals the width of the &quot;a&quot; character in the vai logotype.
        </Typography>
      </Box>

      {/* Minimum size */}
      <Box sx={{ mt: 4 }}>
        <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Minimum Size</Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box component="img" src="/logo.png" alt="vai" sx={{ height: 32 }} />
            <Typography sx={{ fontSize: '0.7rem', color: palette.accent, mt: 0.5, fontFamily: "'Source Code Pro', monospace" }}>32px ✓</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', opacity: 0.4 }}>
            <Box component="img" src="/logo.png" alt="vai" sx={{ height: 20 }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#FF6960', mt: 0.5, fontFamily: "'Source Code Pro', monospace" }}>20px ✗</Typography>
          </Box>
        </Box>
        <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem', mt: 1 }}>
          Don&apos;t use the logo smaller than 32px in height.
        </Typography>
      </Box>

      {/* Do / Don't grid */}
      <Box sx={{ mt: 5 }}>
        <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Do / Don&apos;t</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {doDonts.map((item, i) => (
            <Box key={i} sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${palette.border}` }}>
              <Box
                sx={{
                  background: item.bg,
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Box
                  component="img"
                  src={item.useDark ? '/logo-dark.png' : '/logo.png'}
                  alt="vai"
                  sx={{
                    height: item.tiny ? 18 : 48,
                    transform: item.transform,
                    filter: item.filter,
                    objectFit: 'contain',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: item.ok ? 'rgba(0,212,170,0.2)' : 'rgba(255,105,96,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.ok ? <CheckIcon sx={{ fontSize: 14, color: '#00D4AA' }} /> : <CloseIcon sx={{ fontSize: 14, color: '#FF6960' }} />}
                </Box>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: palette.bgCard }}>
                <Typography sx={{ fontSize: '0.75rem', color: item.ok ? palette.accent : '#FF6960', fontWeight: 600 }}>
                  {item.ok ? 'Do' : 'Don\'t'}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>{item.label}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Download all */}
      <Box sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => {
            ['/logo.png', '/logo-dark.png', '/watermark.png'].forEach((f) => {
              const a = document.createElement('a');
              a.href = f;
              a.download = f.split('/').pop() || '';
              a.click();
            });
            onSnack('Downloading all logo assets');
          }}
          sx={{
            borderColor: palette.border,
            color: palette.text,
            '&:hover': { borderColor: palette.accent, bgcolor: 'rgba(0,212,170,0.05)' },
          }}
        >
          Download All Assets
        </Button>
      </Box>
    </Box>
  );
}
