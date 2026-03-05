'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Container, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import StorageIcon from '@mui/icons-material/Storage';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { palette } from '@/theme/theme';

const navItems = [
  { href: '/admin/telemetry', label: 'Telemetry', icon: <DashboardIcon fontSize="small" /> },
  { href: '/admin/builder', label: 'Builder', icon: <ArticleIcon fontSize="small" /> },
  { href: '/admin/batch', label: 'Batch', icon: <PlaylistAddIcon fontSize="small" /> },
  { href: '/admin/knowledge', label: 'Knowledge', icon: <StorageIcon fontSize="small" /> },
  { href: '/admin/calendar', label: 'Calendar', icon: <EventNoteIcon fontSize="small" /> },
  { href: '/admin/newsletter/issues', label: 'Newsletter', icon: <MarkEmailReadIcon fontSize="small" /> },
  { href: '/admin/settings', label: 'Settings', icon: <SettingsIcon fontSize="small" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch {
      window.location.href = '/admin/login';
    }
  };

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
          <List dense disablePadding>
            {navItems.map((item) => {
              const selected = pathname.startsWith(item.href);
              return (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  selected={selected}
                  sx={{
                    px: 3,
                    py: 1.2,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(0, 212, 170, 0.08)',
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
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: selected ? 600 : 500,
                      color: selected ? palette.accent : palette.textMuted,
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
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

