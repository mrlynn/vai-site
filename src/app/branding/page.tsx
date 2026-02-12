'use client';

import { Box, Container, Typography, Chip, Snackbar } from '@mui/material';
import { palette } from '@/theme/theme';
import { useState } from 'react';
import DesignSystemNav from '@/components/branding/DesignSystemNav';
import LogoSection from '@/components/branding/LogoSection';
import VoiceToneSection from '@/components/branding/VoiceToneSection';
import ColorSection from '@/components/branding/ColorSection';
import TypographySection from '@/components/branding/TypographySection';
import GradientSection from '@/components/branding/GradientSection';
import ComponentsSection from '@/components/branding/ComponentsSection';
import IconographySection from '@/components/branding/IconographySection';
import MotionSection from '@/components/branding/MotionSection';
import LayoutSection from '@/components/branding/LayoutSection';
import DarkLightSection from '@/components/branding/DarkLightSection';
import SpacingSection from '@/components/branding/SpacingSection';

export default function BrandingPage() {
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const showSnack = (msg: string) => {
    setSnackMsg(msg);
    setSnackOpen(true);
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
            <Box component="img" src="/logo.png" alt="vai" sx={{ height: 48, width: 48 }} />
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
              label="Design System"
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
            Design System
          </Typography>
          <Typography
            sx={{
              color: palette.textDim,
              fontSize: { xs: '1rem', md: '1.15rem' },
              maxWidth: 680,
              lineHeight: 1.6,
            }}
          >
            The complete visual language for vai. Logos, colors, typography, components,
            patterns, and usage guidelines for building consistent experiences across all surfaces.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', gap: 6 }}>
          <DesignSystemNav />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <LogoSection onSnack={showSnack} />
            <VoiceToneSection />
            <ColorSection onSnack={showSnack} />
            <TypographySection />
            <GradientSection onSnack={showSnack} />
            <ComponentsSection />
            <IconographySection />
            <MotionSection />
            <LayoutSection />
            <DarkLightSection />
            <SpacingSection />
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            borderTop: `1px solid ${palette.border}`,
            mt: 4,
          }}
        >
          <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem' }}>
            vai Design System v1.0
          </Typography>
          <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem', mt: 0.5 }}>
            Last updated February 2026
          </Typography>
          <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem', mt: 1 }}>
            Community project by Michael Lynn. Not affiliated with Voyage AI, Inc. or MongoDB, Inc.
          </Typography>
          <Typography
            component="a"
            href="/"
            sx={{ color: palette.accent, fontSize: '0.8rem', mt: 1, display: 'inline-block', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            ← Back to vai
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
