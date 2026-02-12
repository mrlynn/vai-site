'use client';

import { Box, Typography } from '@mui/material';
import { palette } from '@/theme/theme';
import { useEffect, useState } from 'react';

const sections = [
  { id: 'logos', label: 'Logos' },
  { id: 'voice-tone', label: 'Voice & Tone' },
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'gradients', label: 'Gradients' },
  { id: 'components', label: 'Components' },
  { id: 'iconography', label: 'Iconography' },
  { id: 'motion', label: 'Motion' },
  { id: 'layout', label: 'Layout' },
  { id: 'dark-light', label: 'Dark / Light' },
  { id: 'spacing', label: 'Spacing & Radii' },
];

export default function DesignSystemNav() {
  const [active, setActive] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Box
      component="nav"
      sx={{
        position: 'sticky',
        top: 80,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        gap: 0.5,
        minWidth: 180,
        maxWidth: 180,
        pt: 2,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: palette.textMuted,
          mb: 1,
          px: 1,
        }}
      >
        On this page
      </Typography>
      {sections.map(({ id, label }) => (
        <Box
          key={id}
          component="a"
          href={`#${id}`}
          sx={{
            textDecoration: 'none',
            fontSize: '0.8rem',
            color: active === id ? palette.accent : palette.textMuted,
            fontWeight: active === id ? 600 : 400,
            px: 1,
            py: 0.5,
            borderLeft: `2px solid ${active === id ? palette.accent : 'transparent'}`,
            transition: 'all 0.15s ease',
            '&:hover': { color: palette.text },
          }}
        >
          {label}
        </Box>
      ))}
    </Box>
  );
}
