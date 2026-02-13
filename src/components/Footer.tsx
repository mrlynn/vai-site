'use client';

import { Box, Container, Typography, Link, Divider, Chip, IconButton, TextField, Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import XIcon from '@mui/icons-material/X';
import FavoriteIcon from '@mui/icons-material/Favorite';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { palette } from '@/theme/theme';

const productLinks = [
  { label: 'GitHub', href: 'https://github.com/mrlynn/voyageai-cli' },
  { label: 'npm', href: 'https://www.npmjs.com/package/voyageai-cli' },
  { label: 'Releases', href: 'https://github.com/mrlynn/voyageai-cli/releases' },
  { label: 'Documentation', href: 'https://docs.vaicli.com' },
];

const resourceLinks = [
  { label: 'Voyage AI', href: 'https://voyageai.com', external: true },
  { label: 'MongoDB Atlas', href: 'https://www.mongodb.com/atlas', external: true },
  { label: 'Vector Search Docs', href: 'https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/', external: true },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 8, bgcolor: palette.bgSurface }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
            gap: 4,
            mb: 6,
          }}
        >
          {/* Brand column */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="vai logo"
                sx={{ height: 28, width: 28 }}
              />
              <Typography
                sx={{
                  fontWeight: 800,
                  color: palette.accent,
                  fontSize: '1.5rem',
                  fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                }}
              >
                vai
              </Typography>
              <Chip
                label="v1.20"
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
            <Typography sx={{ color: palette.textMuted, fontSize: '0.9rem', lineHeight: 1.7, mb: 2 }}>
              A community-built developer toolkit for exploring Voyage AI embeddings and MongoDB Atlas Vector Search.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                href="https://github.com/mrlynn/voyageai-cli"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ color: palette.textMuted, '&:hover': { color: palette.text } }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
              <IconButton
                href="https://x.com/mlynn"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ color: palette.textMuted, '&:hover': { color: palette.text } }}
              >
                <XIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Product links */}
          <Box>
            <Typography sx={{ color: palette.text, fontWeight: 600, mb: 2, fontSize: '0.9rem' }}>
              Product
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {productLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{
                    color: palette.textMuted,
                    fontSize: '0.85rem',
                    '&:hover': { color: palette.accent },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Box>

          {/* Resources */}
          <Box>
            <Typography sx={{ color: palette.text, fontWeight: 600, mb: 2, fontSize: '0.9rem' }}>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {resourceLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{
                    color: palette.textMuted,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': { color: palette.accent },
                  }}
                >
                  {link.label}
                  {link.external && <OpenInNewIcon sx={{ fontSize: 12 }} />}
                </Link>
              ))}
            </Box>
          </Box>

          {/* Newsletter signup */}
          <Box>
            <Typography sx={{ color: palette.text, fontWeight: 600, mb: 2, fontSize: '0.9rem' }}>
              Stay Updated
            </Typography>
            <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem', mb: 2 }}>
              Get notified about new features and releases.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                placeholder="your@email.com"
                size="small"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: palette.bgCard,
                    fontSize: '0.85rem',
                    '& fieldset': { borderColor: palette.border },
                    '&:hover fieldset': { borderColor: palette.accent },
                    '&.Mui-focused fieldset': { borderColor: palette.accent },
                  },
                  '& .MuiInputBase-input': { color: palette.text, py: 1 },
                }}
              />
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: palette.accent,
                  color: palette.bg,
                  fontWeight: 600,
                  px: 2,
                  '&:hover': { bgcolor: palette.accentDim },
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: palette.border, mb: 4 }} />

        {/* Bottom bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Built with <FavoriteIcon sx={{ fontSize: 14, color: '#FF6B6B' }} /> by{' '}
            <Link
              href="https://mlynn.org"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: palette.accent }}
            >
              Michael Lynn
            </Link>
          </Typography>
          
          <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem', textAlign: { xs: 'center', sm: 'right' }, maxWidth: 400 }}>
            Community project — not affiliated with or endorsed by MongoDB, Inc. or Voyage AI, Inc.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
