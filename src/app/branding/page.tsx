'use client';

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Tooltip,
  Chip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { palette } from '@/theme/theme';
import { useState } from 'react';

// Brand color definitions matching the new teal/cyan palette
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
};

const logos = [
  {
    name: 'Logo (Light BG)',
    file: '/logo.png',
    bg: '#F9FBFA',
    description: 'Use on light backgrounds. Transparent PNG.',
  },
  {
    name: 'Logo (Dark BG)',
    file: '/logo-dark.png',
    bg: '#001E2B',
    description: 'Use on dark backgrounds. Includes rounded container.',
  },
  {
    name: 'Icon Mark',
    file: '/watermark.png',
    bg: '#F9FBFA',
    description: 'Standalone V mark. Black on transparent. Use as watermark or favicon source.',
  },
  {
    name: 'Icon Mark (Inverted)',
    file: '/watermark.png',
    bg: '#001E2B',
    description: 'V mark inverted for dark backgrounds (apply CSS filter: invert(1)).',
    invert: true,
  },
];

const typographySpecs = [
  { name: 'Display / Logo', family: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace", weight: 800, sample: 'vai' },
  { name: 'Headings', family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", weight: 700, sample: 'Ship semantic search in minutes' },
  { name: 'Body', family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", weight: 400, sample: 'The complete developer toolkit for Voyage AI embeddings, vector search, and RAG pipelines.' },
  { name: 'Code / Terminal', family: "'Source Code Pro', 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace", weight: 400, sample: 'vai embed "Hello, vector world!"' },
];

function ColorSwatch({ name, hex, usage }: { name: string; hex: string; usage: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Determine if text should be light or dark based on luminance
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = luminance > 0.5 ? '#001E2B' : '#FFFFFF';

  return (
    <Box
      onClick={handleCopy}
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${palette.border}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px rgba(0,0,0,0.3)`,
        },
      }}
    >
      <Box
        sx={{
          bgcolor: hex,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {copied ? (
          <CheckIcon sx={{ color: textColor, fontSize: 20 }} />
        ) : (
          <ContentCopyIcon sx={{ color: textColor, fontSize: 16, opacity: 0 , transition: 'opacity 0.2s',
            '.MuiBox-root:hover &': { opacity: 0.6 },
          }} />
        )}
      </Box>
      <Box sx={{ p: 1.5, bgcolor: palette.bgCard }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: palette.text, mb: 0.3 }}>
          {name}
        </Typography>
        <Typography sx={{
          fontSize: '0.75rem',
          fontFamily: "'Source Code Pro', monospace",
          color: palette.textMuted,
          mb: 0.5,
        }}>
          {hex}
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted, lineHeight: 1.4 }}>
          {usage}
        </Typography>
      </Box>
    </Box>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="h4"
      sx={{
        fontWeight: 700,
        color: palette.text,
        mb: 1,
        fontSize: { xs: '1.5rem', md: '1.8rem' },
      }}
    >
      {children}
    </Typography>
  );
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ color: palette.textMuted, mb: 4, fontSize: '1rem', maxWidth: 600 }}>
      {children}
    </Typography>
  );
}

export default function BrandingPage() {
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const showSnack = (msg: string) => {
    setSnackMsg(msg);
    setSnackOpen(true);
  };

  const handleDownload = (file: string, name: string) => {
    const a = document.createElement('a');
    a.href = file;
    a.download = name;
    a.click();
    showSnack(`Downloaded ${name}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.bg, pb: 10 }}>
      {/* Header */}
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-30%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="vai"
              sx={{ height: 48, width: 48 }}
            />
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '2.2rem',
                fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                background: 'linear-gradient(135deg, #00D4AA 0%, #40E0FF 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              vai
            </Typography>
            <Chip
              label="Brand Guide"
              size="small"
              sx={{
                bgcolor: 'rgba(0,212,170,0.1)',
                color: '#00D4AA',
                border: '1px solid rgba(0,212,170,0.3)',
                fontWeight: 600,
              }}
            />
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.8rem' },
              color: palette.text,
              mb: 2,
              letterSpacing: '-0.02em',
            }}
          >
            Brand Guidelines
          </Typography>
          <Typography
            sx={{
              color: palette.textDim,
              fontSize: { xs: '1rem', md: '1.15rem' },
              maxWidth: 600,
              lineHeight: 1.6,
            }}
          >
            Logos, colors, typography, and usage rules for the Vai brand.
            Internal reference for maintaining visual consistency across all surfaces.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Logos */}
        <Box sx={{ mb: 10 }}>
          <SectionTitle>Logos</SectionTitle>
          <SectionSubtitle>
            Download and use the appropriate logo variant for your context.
            Always maintain clear space around the logo.
          </SectionSubtitle>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 3,
            }}
          >
            {logos.map((logo) => (
              <Card
                key={logo.name}
                sx={{
                  bgcolor: palette.bgCard,
                  border: `1px solid ${palette.border}`,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    bgcolor: logo.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    minHeight: 200,
                    position: 'relative',
                  }}
                >
                  <Box
                    component="img"
                    src={logo.file}
                    alt={logo.name}
                    sx={{
                      maxHeight: 140,
                      maxWidth: '70%',
                      objectFit: 'contain',
                      filter: logo.invert ? 'invert(1)' : 'none',
                    }}
                  />
                  <Tooltip title="Download">
                    <IconButton
                      onClick={() => handleDownload(logo.file, `vai-${logo.name.toLowerCase().replace(/\s+/g, '-')}.png`)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.4)',
                        color: '#fff',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
                      }}
                      size="small"
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontWeight: 600, color: palette.text, mb: 0.5, fontSize: '0.95rem' }}>
                    {logo.name}
                  </Typography>
                  <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {logo.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Logo Don'ts */}
          <Box sx={{ mt: 4 }}>
            <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>
              Logo Usage Rules
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              {[
                { icon: <CloseIcon sx={{ color: '#FF6960', fontSize: 18 }} />, rule: 'Don\'t stretch or distort the logo' },
                { icon: <CloseIcon sx={{ color: '#FF6960', fontSize: 18 }} />, rule: 'Don\'t change the logo colors' },
                { icon: <CloseIcon sx={{ color: '#FF6960', fontSize: 18 }} />, rule: 'Don\'t add effects like drop shadows or glows' },
                { icon: <CheckIcon sx={{ color: '#00D4AA', fontSize: 18 }} />, rule: 'Do maintain minimum clear space equal to the "a" width' },
              ].map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'flex-start',
                    p: 2,
                    bgcolor: palette.bgSurface,
                    borderRadius: 2,
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  {item.icon}
                  <Typography sx={{ color: palette.textDim, fontSize: '0.8rem', lineHeight: 1.4 }}>
                    {item.rule}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Colors */}
        <Box sx={{ mb: 10 }}>
          <SectionTitle>Color Palette</SectionTitle>
          <SectionSubtitle>
            Click any swatch to copy its hex value.
            The palette uses a teal/cyan accent anchored to a dark neutral base.
          </SectionSubtitle>

          {/* Primary */}
          <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>
            Primary (Teal)
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 2,
              mb: 4,
            }}
          >
            {brandColors.primary.map((c) => (
              <ColorSwatch key={c.hex} {...c} />
            ))}
          </Box>

          {/* Secondary */}
          <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>
            Secondary (Cyan)
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 2,
              mb: 4,
            }}
          >
            {brandColors.secondary.map((c) => (
              <ColorSwatch key={c.hex} {...c} />
            ))}
          </Box>

          {/* Neutrals - Dark */}
          <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>
            Neutrals (Dark Mode)
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)', md: 'repeat(7, 1fr)' },
              gap: 2,
              mb: 4,
            }}
          >
            {brandColors.neutralsDark.map((c) => (
              <ColorSwatch key={c.hex} {...c} />
            ))}
          </Box>

          {/* Neutrals - Light */}
          <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>
            Neutrals (Light Mode)
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 2,
              mb: 4,
            }}
          >
            {brandColors.neutralsLight.map((c) => (
              <ColorSwatch key={c.hex} {...c} />
            ))}
          </Box>

          {/* Semantic */}
          <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>
            Semantic
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {brandColors.semantic.map((c) => (
              <ColorSwatch key={c.hex} {...c} />
            ))}
          </Box>
        </Box>

        {/* Typography */}
        <Box sx={{ mb: 10 }}>
          <SectionTitle>Typography</SectionTitle>
          <SectionSubtitle>
            The type system uses system fonts for body and a monospace stack for branding and code.
          </SectionSubtitle>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {typographySpecs.map((spec) => (
              <Card
                key={spec.name}
                sx={{
                  bgcolor: palette.bgCard,
                  border: `1px solid ${palette.border}`,
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: palette.accent, fontSize: '0.85rem' }}>
                    {spec.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Source Code Pro', monospace",
                      fontSize: '0.75rem',
                      color: palette.textMuted,
                      bgcolor: palette.bgSurface,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {spec.weight} &middot; {spec.family.split(',')[0].replace(/'/g, '')}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: spec.family,
                    fontWeight: spec.weight,
                    color: palette.text,
                    fontSize: spec.name === 'Display / Logo' ? '2.5rem' : spec.name === 'Headings' ? '1.4rem' : '1rem',
                    lineHeight: 1.4,
                  }}
                >
                  {spec.sample}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Gradients */}
        <Box sx={{ mb: 10 }}>
          <SectionTitle>Gradients</SectionTitle>
          <SectionSubtitle>
            Used sparingly for emphasis, hero text, and interactive highlights.
          </SectionSubtitle>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {[
              {
                name: 'Hero Text',
                css: 'linear-gradient(135deg, #00D4AA 0%, #40E0FF 100%)',
                usage: 'Headline accents, hero text spans',
              },
              {
                name: 'Success Bar',
                css: 'linear-gradient(90deg, #00D4AA, #5CE8CC)',
                usage: 'Progress bars, meter fills, positive indicators',
              },
              {
                name: 'Info Bar',
                css: 'linear-gradient(90deg, #40E0FF, #0088CC)',
                usage: 'Secondary progress bars, latency indicators',
              },
            ].map((grad) => (
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
                  showSnack(`Copied: ${grad.css}`);
                }}
              >
                <Box sx={{ height: 80, background: grad.css }} />
                <Box sx={{ p: 2, bgcolor: palette.bgCard }}>
                  <Typography sx={{ fontWeight: 600, color: palette.text, fontSize: '0.85rem', mb: 0.5 }}>
                    {grad.name}
                  </Typography>
                  <Typography sx={{
                    fontFamily: "'Source Code Pro', monospace",
                    fontSize: '0.7rem',
                    color: palette.textMuted,
                    mb: 0.5,
                    wordBreak: 'break-all',
                  }}>
                    {grad.css}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>
                    {grad.usage}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Spacing & Radii */}
        <Box sx={{ mb: 10 }}>
          <SectionTitle>Spacing and Radii</SectionTitle>
          <SectionSubtitle>
            Consistent spacing and border radius values used throughout the UI.
          </SectionSubtitle>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 3,
            }}
          >
            <Card sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}`, p: 3 }}>
              <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '0.95rem' }}>
                Border Radius
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                {[
                  { label: 'Small', value: '4px' },
                  { label: 'Default', value: '8px' },
                  { label: 'Card', value: '12px' },
                  { label: 'Large', value: '16px' },
                ].map((r) => (
                  <Box key={r.label} sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        border: `2px solid ${palette.accent}`,
                        borderRadius: r.value,
                        mb: 1,
                      }}
                    />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: palette.text }}>
                      {r.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: palette.textMuted }}>
                      {r.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>

            <Card sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}`, p: 3 }}>
              <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '0.95rem' }}>
                Spacing Scale
              </Typography>
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
                    <Typography sx={{
                      fontSize: '0.75rem',
                      fontFamily: "'Source Code Pro', monospace",
                      color: palette.textMuted,
                      width: 40,
                    }}>
                      {s.label}
                    </Typography>
                    <Box
                      sx={{
                        height: 8,
                        width: s.value,
                        bgcolor: palette.accent,
                        borderRadius: 1,
                      }}
                    />
                    <Typography sx={{
                      fontSize: '0.7rem',
                      fontFamily: "'Source Code Pro', monospace",
                      color: palette.textMuted,
                    }}>
                      {s.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>
        </Box>

        {/* Footer note */}
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            borderTop: `1px solid ${palette.border}`,
          }}
        >
          <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem' }}>
            Vai Brand Guidelines. Internal reference only.
          </Typography>
          <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem', mt: 1 }}>
            Community project by Michael Lynn. Not affiliated with Voyage AI, Inc. or MongoDB, Inc.
          </Typography>
        </Box>
      </Container>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
        message={snackMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
