import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PublicTelemetryDashboard from '@/components/telemetry/PublicTelemetryDashboard';
import { palette } from '@/theme/theme';

export const metadata: Metadata = {
  title: 'Public Telemetry Dashboard | vai',
  description:
    'A delayed, aggregate transparency dashboard showing how vai telemetry is used in practice without exposing raw or sensitive operational detail.',
};

const highlightCards = [
  {
    title: 'Public by design',
    body: 'This route is separate from the admin dashboard and works without admin auth or API keys.',
    icon: <PublicOutlinedIcon sx={{ fontSize: 22, color: palette.accent }} />,
  },
  {
    title: 'Bounded aggregate story',
    body: 'The page shows fixed-window, grouped telemetry for broad trends rather than filters, recent rows, or drilldowns.',
    icon: <QueryStatsOutlinedIcon sx={{ fontSize: 22, color: palette.blue }} />,
  },
  {
    title: 'Privacy-first visibility',
    body: 'Low-volume slices are suppressed or grouped, and internal operational details remain intentionally private.',
    icon: <ShieldOutlinedIcon sx={{ fontSize: 22, color: palette.purple }} />,
  },
];

export default function PublicTelemetryDashboardPage() {
  return (
    <>
      <Navbar />
      <Box
        sx={{
          bgcolor: palette.bg,
          minHeight: '100vh',
          backgroundImage: `
            radial-gradient(circle at 10% 0%, rgba(0,212,170,0.14), transparent 30%),
            radial-gradient(circle at 90% 12%, rgba(64,224,255,0.10), transparent 24%),
            linear-gradient(180deg, ${palette.bg} 0%, #06222f 100%)
          `,
        }}
      >
        <Container maxWidth="xl" sx={{ pt: { xs: 8, md: 10 }, pb: { xs: 8, md: 12 } }}>
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 5,
              border: `1px solid ${palette.border}`,
              bgcolor: 'rgba(11, 30, 40, 0.84)',
              boxShadow: '0 40px 100px rgba(0, 0, 0, 0.28)',
              px: { xs: 3, md: 5 },
              py: { xs: 4, md: 5 },
              mb: 4,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                  'radial-gradient(circle at top right, rgba(0,212,170,0.12), transparent 28%)',
              }}
            />

            <Grid container spacing={4} sx={{ position: 'relative' }}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      icon={<VisibilityOutlinedIcon sx={{ color: `${palette.accent} !important` }} />}
                      label="Public transparency dashboard"
                      sx={{
                        bgcolor: 'rgba(0, 212, 170, 0.12)',
                        color: palette.accent,
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      label="30-day delayed window"
                      sx={{
                        bgcolor: 'rgba(64, 224, 255, 0.12)',
                        color: palette.blue,
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      label="No admin access required"
                      sx={{
                        bgcolor: 'rgba(180, 90, 242, 0.12)',
                        color: palette.purple,
                        fontWeight: 700,
                      }}
                    />
                  </Stack>

                  <Typography
                    variant="h1"
                    sx={{
                      color: palette.text,
                      fontSize: { xs: '2.3rem', md: '3.6rem' },
                      lineHeight: 1.04,
                      letterSpacing: '-0.04em',
                      maxWidth: 900,
                    }}
                  >
                    See telemetry in practice without exposing private operational detail.
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: palette.textDim,
                      fontSize: { xs: '1rem', md: '1.08rem' },
                      lineHeight: 1.85,
                      maxWidth: 860,
                    }}
                  >
                    This page is the live public transparency view for vai telemetry. It shows a
                    delayed, aggregate read model built specifically for public visibility, while
                    keeping raw rows, sparse slices, and admin-oriented drilldowns out of bounds.
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                    <Button
                      component={Link}
                      href="/telemetry"
                      variant="contained"
                      sx={{
                        bgcolor: palette.accent,
                        color: palette.bg,
                        '&:hover': { bgcolor: palette.accentLight },
                      }}
                    >
                      Read telemetry policy
                    </Button>
                    <Button
                      component={Link}
                      href="https://docs.vaicli.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      sx={{
                        borderColor: palette.border,
                        color: palette.textDim,
                        '&:hover': {
                          borderColor: palette.accent,
                          color: palette.text,
                        },
                      }}
                    >
                      Open CLI docs
                    </Button>
                  </Stack>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={2}>
                  {highlightCards.map((card) => (
                    <Box
                      key={card.title}
                      sx={{
                        borderRadius: 4,
                        border: `1px solid rgba(255,255,255,0.08)`,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        px: 2.25,
                        py: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                        {card.icon}
                        <Typography variant="subtitle1" sx={{ color: palette.text, fontWeight: 700 }}>
                          {card.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: palette.textMuted, lineHeight: 1.75 }}>
                        {card.body}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <PublicTelemetryDashboard />
        </Container>
      </Box>
      <Footer />
    </>
  );
}
