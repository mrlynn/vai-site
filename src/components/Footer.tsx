'use client';

import { Box, Container, Typography, Link, Divider, Chip } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { palette } from '@/theme/theme';

const links = [
  { label: 'GitHub', href: 'https://github.com/mrlynn/voyageai-cli' },
  { label: 'npm', href: 'https://www.npmjs.com/package/voyageai-cli' },
  { label: 'Documentation', href: 'https://github.com/mrlynn/voyageai-cli#readme' },
  { label: 'Releases', href: 'https://github.com/mrlynn/voyageai-cli/releases' },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 6, bgcolor: palette.bgSurface }}>
      <Container maxWidth="lg">
        <Divider sx={{ borderColor: palette.border, mb: 4 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: 3,
          }}
        >
          {/* Logo & attribution */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  color: palette.accent,
                  fontSize: '1.3rem',
                  fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                }}
              >
                vai
              </Typography>
              <Chip
                label="v1.0"
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  bgcolor: `${palette.accent}15`,
                  color: palette.accent,
                  fontWeight: 600,
                }}
              />
            </Box>
            <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem', maxWidth: 380 }}>
              Built by Michael Lynn — community tool, not affiliated with MongoDB or Voyage AI.
            </Typography>
          </Box>

          {/* Links */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{
                  color: palette.textDim,
                  fontSize: '0.9rem',
                  '&:hover': { color: palette.accent },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: `1px solid ${palette.border}`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <GitHubIcon sx={{ fontSize: 16, color: palette.textMuted }} />
          <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem' }}>
            Open source on GitHub
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
