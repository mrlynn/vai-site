'use client';

import { Box, Button, Chip, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import DownloadIcon from '@mui/icons-material/Download';
import AppleIcon from '@mui/icons-material/Apple';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import ComputerIcon from '@mui/icons-material/Computer';
import VerifiedIcon from '@mui/icons-material/Verified';
import UpdateIcon from '@mui/icons-material/Update';
import { palette } from '@/theme/theme';

const platforms = [
  {
    name: 'macOS',
    ext: 'DMG',
    icon: <AppleIcon />,
  },
  {
    name: 'Windows',
    ext: 'EXE',
    icon: <DesktopWindowsIcon />,
  },
  {
    name: 'Linux',
    ext: 'AppImage',
    icon: <ComputerIcon />,
  },
];

export default function DesktopApp() {
  return (
    <Box component="section" id="desktop" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Chip
              label="Desktop App"
              size="small"
              sx={{
                mb: 2,
                bgcolor: `${palette.blue}20`,
                color: palette.blue,
                border: `1px solid ${palette.blue}33`,
                fontWeight: 600,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                mb: 2,
                fontSize: { xs: '1.8rem', md: '2.4rem' },
                color: palette.text,
              }}
            >
              A full desktop experience
            </Typography>
            <Typography
              sx={{
                color: palette.textMuted,
                mb: 3,
                fontSize: '1.05rem',
                lineHeight: 1.7,
              }}
            >
              The Vai desktop app wraps the entire CLI experience in a beautiful
              Electron interface. Embed text, compare documents, run benchmarks,
              and explore vector search concepts — all with a visual interface.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: palette.textDim }}>
                <VerifiedIcon sx={{ fontSize: 18, color: palette.accent }} />
                <Typography variant="body2">Signed &amp; notarized</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: palette.textDim }}>
                <UpdateIcon sx={{ fontSize: 18, color: palette.accent }} />
                <Typography variant="body2">Auto-updates</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {platforms.map((p) => (
                <Button
                  key={p.name}
                  variant="outlined"
                  startIcon={p.icon}
                  href="https://github.com/mrlynn/voyageai-cli/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    borderColor: palette.border,
                    color: palette.text,
                    '&:hover': {
                      borderColor: palette.accent,
                      bgcolor: 'rgba(0, 212, 170, 0.05)',
                    },
                  }}
                >
                  {p.name}
                  <Box
                    component="span"
                    sx={{ ml: 0.8, color: palette.textMuted, fontSize: '0.8rem' }}
                  >
                    .{p.ext}
                  </Box>
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {/* App window mockup */}
            <Box
              sx={{
                bgcolor: palette.bgCard,
                border: `1px solid ${palette.border}`,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Title bar */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  px: 2,
                  py: 1.5,
                  bgcolor: 'rgba(0,0,0,0.3)',
                  borderBottom: `1px solid ${palette.border}`,
                }}
              >
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
                <Typography
                  sx={{
                    ml: 2,
                    color: palette.textMuted,
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                >
                  Vai Desktop
                </Typography>
              </Box>

              {/* App content mockup */}
              <Box sx={{ p: 3 }}>
                {/* Tab bar */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  {['Embed', 'Compare', 'Benchmark', 'Explore'].map((tab, i) => (
                    <Box
                      key={tab}
                      sx={{
                        px: 2,
                        py: 0.8,
                        borderRadius: 1.5,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        bgcolor: i === 0 ? `${palette.accent}20` : 'transparent',
                        color: i === 0 ? palette.accent : palette.textMuted,
                        border: `1px solid ${i === 0 ? palette.accent + '33' : 'transparent'}`,
                      }}
                    >
                      {tab}
                    </Box>
                  ))}
                </Box>

                {/* Input area */}
                <Box
                  sx={{
                    bgcolor: palette.bgSurface,
                    border: `1px solid ${palette.border}`,
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                  }}
                >
                  <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem' }}>
                    Enter text to embed...
                  </Typography>
                </Box>

                {/* Result */}
                <Box
                  sx={{
                    bgcolor: palette.bgSurface,
                    border: `1px solid ${palette.accent}33`,
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography
                    sx={{
                      color: palette.accent,
                      fontSize: '0.78rem',
                      fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                    }}
                  >
                    [0.0234, -0.0891, 0.1456, 0.0023, ...]
                  </Typography>
                  <Typography sx={{ color: palette.textMuted, fontSize: '0.75rem', mt: 1 }}>
                    voyage-4 · 1024 dimensions · 138ms
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
