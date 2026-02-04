'use client';

import { createTheme } from '@mui/material/styles';

// MongoDB Design System palette
export const palette = {
  bg: '#001E2B',
  bgSurface: '#112733',
  bgCard: '#1C2D38',
  accent: '#00ED64',
  accentDim: '#00A35C',
  text: '#E8EDEB',
  textDim: '#C1C7C6',
  textMuted: '#889397',
  border: '#3D4F58',
  blue: '#0498EC',
  purple: '#B45AF2',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: palette.accent,
      dark: palette.accentDim,
    },
    secondary: {
      main: palette.blue,
    },
    background: {
      default: palette.bg,
      paper: palette.bgCard,
    },
    text: {
      primary: palette.text,
      secondary: palette.textDim,
      disabled: palette.textMuted,
    },
    divider: palette.border,
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${palette.border}`,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: palette.bg,
        },
      },
    },
  },
});

export default theme;
