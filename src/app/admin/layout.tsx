'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  CircularProgress,
  Container,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import StorageIcon from '@mui/icons-material/Storage';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import BugReportIcon from '@mui/icons-material/BugReport';
import { palette } from '@/theme/theme';

const navSections = [
  {
    title: 'Content Ops',
    subtitle: 'Create, schedule, and publish',
    items: [
      { href: '/admin/builder', label: 'Builder', icon: <ArticleIcon fontSize="small" /> },
      { href: '/admin/batch', label: 'Batch', icon: <PlaylistAddIcon fontSize="small" /> },
      { href: '/admin/knowledge', label: 'Knowledge', icon: <StorageIcon fontSize="small" /> },
      { href: '/admin/calendar', label: 'Calendar', icon: <EventNoteIcon fontSize="small" /> },
      {
        href: '/admin/newsletter/issues',
        label: 'Newsletter',
        icon: <MarkEmailReadIcon fontSize="small" />,
      },
    ],
  },
  {
    title: 'Project Admin',
    subtitle: 'Operational visibility and triage',
    items: [
      { href: '/admin/telemetry', label: 'Telemetry', icon: <DashboardIcon fontSize="small" /> },
      { href: '/admin/bugs', label: 'Bugs', icon: <BugReportIcon fontSize="small" /> },
    ],
  },
  {
    title: 'System',
    subtitle: 'Environment and configuration',
    items: [{ href: '/admin/settings', label: 'Settings', icon: <SettingsIcon fontSize="small" /> }],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const isLoginPage = useMemo(() => pathname.startsWith('/admin/login'), [pathname]);

  useEffect(() => {
    if (isLoginPage) {
      setAuthStatus('authenticated');
      return;
    }

    let cancelled = false;

    async function verifySession() {
      setAuthStatus('checking');

      try {
        const res = await fetch('/api/admin/session', {
          method: 'GET',
          cache: 'no-store',
        });
        const data = await res.json().catch(() => ({}));

        if (!cancelled && data.authenticated) {
          setAuthStatus('authenticated');
          return;
        }
      } catch {
        // fall through to redirect
      }

      if (!cancelled) {
        setAuthStatus('unauthenticated');
        const loginUrl = new URL('/admin/login', window.location.origin);
        loginUrl.searchParams.set('next', pathname);
        window.location.replace(loginUrl.toString());
      }
    }

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, [isLoginPage, pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch {
      window.location.href = '/admin/login';
    }
  };

  if (isLoginPage) {
    return children;
  }

  if (authStatus !== 'authenticated') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: palette.bg,
        }}
      >
        <CircularProgress sx={{ color: palette.accent }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.bg, display: 'flex' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: 260,
          flexShrink: 0,
          borderRight: `1px solid ${palette.border}`,
          bgcolor: palette.bgSurface,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
        }}
      >
        <Toolbar sx={{ px: 3, py: 2, minHeight: 64 }}>
          <Typography
            sx={{
              fontWeight: 800,
              color: palette.accent,
              fontFamily: "'Source Code Pro', monospace",
              letterSpacing: 0.5,
            }}
          >
            vai admin
          </Typography>
        </Toolbar>
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {navSections.map((section) => (
            <List
              key={section.title}
              dense
              disablePadding
              subheader={
                <ListSubheader
                  disableSticky
                  sx={{
                    bgcolor: 'transparent',
                    px: 3,
                    pt: 2.25,
                    pb: 1,
                    borderTop: `1px solid ${palette.border}`,
                  }}
                >
                  <Typography
                    sx={{
                      color: palette.text,
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {section.title}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.45,
                      color: palette.textDim,
                      fontSize: 11,
                      lineHeight: 1.45,
                    }}
                  >
                    {section.subtitle}
                  </Typography>
                </ListSubheader>
              }
            >
              {section.items.map((item) => {
                const selected = pathname.startsWith(item.href);
                return (
                  <ListItemButton
                    key={item.href}
                    component={Link}
                    href={item.href}
                    selected={selected}
                    sx={{
                      mx: 1.5,
                      mb: 0.5,
                      px: 1.5,
                      py: 1.1,
                      borderRadius: 2,
                      '&.Mui-selected': {
                        bgcolor: 'rgba(0, 212, 170, 0.1)',
                        border: '1px solid rgba(0, 212, 170, 0.16)',
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 32,
                        color: selected ? palette.accent : palette.textMuted,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: 13,
                            fontWeight: selected ? 700 : 500,
                            color: selected ? palette.accent : palette.textMuted,
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          ))}
        </Box>
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderTop: `1px solid ${palette.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              color: palette.textDim,
              fontFamily: 'monospace',
            }}
          >
            {process.env.NEXT_PUBLIC_VAI_ENV || 'local'}
          </Typography>
          <IconButton size="small" onClick={handleLogout} sx={{ color: palette.textMuted }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Box
          component="header"
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderBottom: `1px solid ${palette.border}`,
            bgcolor: palette.bgSurface,
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              color: palette.accent,
              fontFamily: "'Source Code Pro', monospace",
              fontSize: 16,
            }}
          >
            vai admin
          </Typography>
          <IconButton size="small" onClick={handleLogout} sx={{ color: palette.textMuted }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box component="main" sx={{ flex: 1, py: 4 }}>
          <Container maxWidth="xl">{children}</Container>
        </Box>
      </Box>
    </Box>
  );
}

