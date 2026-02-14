'use client';

import { createTheme } from '@mui/material/styles';

// vai Design System palette — aligned with /branding#colors
export const palette = {
  bg: '#001E2B',
  bgSurface: '#112733',
  bgCard: '#1C2D38',
  accent: '#00D4AA',
  accentDim: '#009E80',
  accentLight: '#5CE8CC',
  text: '#E8EDEB',
  textDim: '#C1C7C6',
  textMuted: '#889397',
  border: '#3D4F58',
  blue: '#40E0FF',
  blueDark: '#0088CC',
  purple: '#B45AF2',
  red: '#FF6960',
  yellow: '#FFC010',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: palette.accent,
      dark: palette.accentDim,
      light: palette.accentLight,
    },
    secondary: {
      main: palette.blue,
      dark: palette.blueDark,
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
