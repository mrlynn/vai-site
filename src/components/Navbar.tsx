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
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import GitHubIcon from '@mui/icons-material/GitHub';
import StarIcon from '@mui/icons-material/Star';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { palette } from '@/theme/theme';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    label: 'Product',
    dropdown: [
      { label: 'Why Voyage AI', href: '#why-voyage' },
      { label: 'Features', href: '#features' },
      { label: 'Models', href: '#models' },
      { label: 'Desktop App', href: '/desktop' },
    ],
  },
  {
    label: 'Developer Tools',
    dropdown: [
      { label: 'CLI', href: '#cli-demo' },
      { label: 'Operational Modes', href: '/modes' },
      { label: 'Demo Gallery', href: '/demos' },
      { label: 'MCP Server', href: '#mcp' },
      { label: 'Workflows', href: '/workflows' },
    ],
  },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'Shared Space', href: '/shared-space' },
  { label: 'Docs', href: 'https://docs.vaicli.com', external: true },
];

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:1024px)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stars, setStars] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<{
    [key: string]: HTMLElement | null;
  }>({});
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStars(data.stars))
      .catch(() => setStars(null));
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, label: string) => {
    setAnchorEl({ ...anchorEl, [label]: event.currentTarget });
  };

  const handleMenuClose = (label: string) => {
    setAnchorEl({ ...anchorEl, [label]: null });
  };

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
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 64 }}>
            <Box
              component="a"
              href="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
                mr: 3,
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
              <Box sx={{ display: 'flex', gap: 0.25, flexGrow: 1 }}>
                {navItems.map((item) => {
                  // Handle dropdown items
                  if ('dropdown' in item && item.dropdown) {
                    return (
                      <Box key={item.label}>
                        <Button
                          onClick={(e) => handleMenuOpen(e, item.label)}
                          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            color: palette.textDim,
                            fontSize: '0.82rem',
                            px: 1.2,
                            py: 0.8,
                            minWidth: 'auto',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            '&:hover': {
                              color: palette.text,
                              bgcolor: 'rgba(255,255,255,0.05)',
                            },
                          }}
                        >
                          {item.label}
                        </Button>
                        <Menu
                          anchorEl={anchorEl[item.label]}
                          open={Boolean(anchorEl[item.label])}
                          onClose={() => handleMenuClose(item.label)}
                          sx={{
                            '& .MuiPaper-root': {
                              bgcolor: palette.bgCard,
                              border: `1px solid ${palette.border}`,
                              mt: 1,
                              minWidth: 180,
                            },
                          }}
                        >
                          {item.dropdown.map((subItem) => {
                            const href =
                              !isHome && subItem.href.startsWith('#')
                                ? `/${subItem.href}`
                                : subItem.href;
                            return (
                              <MenuItem
                                key={subItem.label}
                                component="a"
                                href={href}
                                onClick={() => handleMenuClose(item.label)}
                                sx={{
                                  color: palette.text,
                                  fontSize: '0.85rem',
                                  py: 1.2,
                                  '&:hover': {
                                    bgcolor: 'rgba(0, 212, 170, 0.05)',
                                  },
                                }}
                              >
                                {subItem.label}
                              </MenuItem>
                            );
                          })}
                        </Menu>
                      </Box>
                    );
                  }

                  // Handle regular nav items
                  const href =
                    !isHome && 'href' in item && item.href.startsWith('#')
                      ? `/${item.href}`
                      : 'href' in item
                        ? item.href
                        : '#';
                  return (
                    <Button
                      key={item.label}
                      href={href}
                      target={'external' in item && item.external ? '_blank' : undefined}
                      rel={
                        'external' in item && item.external
                          ? 'noopener noreferrer'
                          : undefined
                      }
                      sx={{
                        color: palette.textDim,
                        fontSize: '0.82rem',
                        px: 1.2,
                        py: 0.8,
                        minWidth: 'auto',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        '&:hover': {
                          color: palette.text,
                          bgcolor: 'rgba(255,255,255,0.05)',
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
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
                href={isHome ? '#cli-demo' : '/#cli-demo'}
                sx={{
                  ml: 1.5,
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
          {navItems.map((item) => {
            // Handle dropdown items in mobile
            if ('dropdown' in item && item.dropdown) {
              return (
                <Box key={item.label}>
                  <ListItem disablePadding>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        px: 2,
                        py: 1,
                        color: palette.textDim,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    />
                  </ListItem>
                  {item.dropdown.map((subItem) => {
                    const href =
                      !isHome && subItem.href.startsWith('#')
                        ? `/${subItem.href}`
                        : subItem.href;
                    return (
                      <ListItem key={subItem.label} disablePadding sx={{ pl: 2 }}>
                        <ListItemButton
                          component="a"
                          href={href}
                          onClick={() => setDrawerOpen(false)}
                        >
                          <ListItemText
                            primary={subItem.label}
                            sx={{ color: palette.text }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </Box>
              );
            }

            // Handle regular nav items in mobile
            const href =
              !isHome && 'href' in item && item.href.startsWith('#')
                ? `/${item.href}`
                : 'href' in item
                  ? item.href
                  : '#';
            return (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  component="a"
                  href={href}
                  target={'external' in item && item.external ? '_blank' : undefined}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary={item.label} sx={{ color: palette.text }} />
                </ListItemButton>
              </ListItem>
            );
          })}
          <ListItem disablePadding sx={{ mt: 2, px: 2 }}>
            <Button
              variant="contained"
              fullWidth
              href={isHome ? '#cli-demo' : '/#cli-demo'}
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
