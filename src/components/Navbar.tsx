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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import GitHubIcon from '@mui/icons-material/GitHub';
import { palette } from '@/theme/theme';
import { useState } from 'react';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Models', href: '#models' },
  { label: 'CLI', href: '#cli-demo' },
  { label: 'Desktop App', href: '#desktop' },
];

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

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
            <Typography
              variant="h6"
              component="a"
              href="#"
              sx={{
                fontWeight: 800,
                color: palette.accent,
                textDecoration: 'none',
                fontSize: '1.5rem',
                letterSpacing: '-0.03em',
                mr: 4,
                fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
              }}
            >
              vai
            </Typography>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    href={item.href}
                    sx={{
                      color: palette.textDim,
                      '&:hover': { color: palette.text, bgcolor: 'rgba(255,255,255,0.05)' },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

            <IconButton
              href="https://github.com/mrlynn/voyageai-cli"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: palette.textDim, '&:hover': { color: palette.text } }}
            >
              <GitHubIcon />
            </IconButton>

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
          sx: { bgcolor: palette.bgSurface, width: 260 },
        }}
      >
        <List sx={{ pt: 4 }}>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                component="a"
                href={item.href}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary={item.label} sx={{ color: palette.text }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}
