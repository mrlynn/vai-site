'use client';

import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import GitHubIcon from '@mui/icons-material/GitHub';
import StarIcon from '@mui/icons-material/Star';
import { palette } from '@/theme/theme';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Why Voyage AI', href: '#why-voyage' },
  { label: 'Features', href: '#features' },
  { label: 'Models', href: '#models' },
  { label: 'Workflows', href: '/workflows' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'CLI', href: '#cli-demo' },
  { label: 'MCP', href: '#mcp' },
  { label: 'Docs', href: 'https://docs.vaicli.com', external: true },
];

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStars(data.stars))
      .catch(() => setStars(null));
  }, []);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(0, 30, 43, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${palette.border}`,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 64 }}>
            <Box
              component="a"
              href="#"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
                mr: 4,
              }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="vai logo"
                sx={{ height: 30, width: 30 }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: palette.accent,
                  fontSize: '1.5rem',
                  letterSpacing: '-0.03em',
                  fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                }}
              >
                vai
              </Typography>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    sx={{
                      color: palette.textDim,
                      fontSize: '0.9rem',
                      '&:hover': { color: palette.text, bgcolor: 'rgba(255,255,255,0.05)' },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

            {/* GitHub with stars */}
            <Box
              component="a"
              href="https://github.com/mrlynn/voyageai-cli"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.5,
                py: 0.6,
                borderRadius: 2,
                textDecoration: 'none',
                color: palette.textDim,
                transition: 'all 0.2s',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: palette.text,
                },
              }}
            >
              <GitHubIcon sx={{ fontSize: 20 }} />
              {stars !== null && stars > 0 && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: 12, color: '#FFD700 !important' }} />}
                  label={stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}
                  size="small"
                  sx={{
                    height: 22,
                    bgcolor: 'rgba(255, 215, 0, 0.1)',
                    color: '#FFD700',
                    border: '1px solid rgba(255, 215, 0, 0.25)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    '& .MuiChip-icon': { ml: 0.5 },
                  }}
                />
              )}
            </Box>

            {/* Get Started CTA */}
            {!isMobile && (
              <Button
                variant="contained"
                size="small"
                href="#cli-demo"
                sx={{
                  ml: 2,
                  bgcolor: palette.accent,
                  color: palette.bg,
                  fontWeight: 700,
                  px: 2.5,
                  '&:hover': { bgcolor: palette.accentDim },
                }}
              >
                Get Started
              </Button>
            )}

            {isMobile && (
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{ color: palette.textDim, ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { bgcolor: palette.bgSurface, width: 280 },
        }}
      >
        <List sx={{ pt: 4 }}>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                component="a"
                href={item.href}
                target={item.external ? '_blank' : undefined}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary={item.label} sx={{ color: palette.text }} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding sx={{ mt: 2, px: 2 }}>
            <Button
              variant="contained"
              fullWidth
              href="#cli-demo"
              onClick={() => setDrawerOpen(false)}
              sx={{
                bgcolor: palette.accent,
                color: palette.bg,
                fontWeight: 700,
                '&:hover': { bgcolor: palette.accentDim },
              }}
            >
              Get Started
            </Button>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
