'use client';

import Link from 'next/link';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import PublicTelemetryChartCard from '@/components/telemetry/PublicTelemetryChartCard';
import { palette } from '@/theme/theme';

const boundaryCards = [
  {
    title: 'What this page is for',
    description:
      'This dashboard shows delayed, aggregate product telemetry so users can verify that telemetry exists in practice and understand broad usage patterns without exposing operational detail.',
    icon: <VisibilityOutlinedIcon sx={{ fontSize: 22 }} />,
  },
  {
    title: 'What stays private',
    description:
      'Raw rows, recent events, city-level geography, workflow/package names, detailed command timing, model combinations, and debugging slices remain private and do not belong on the public route.',
    icon: <ShieldOutlinedIcon sx={{ fontSize: 22 }} />,
  },
  {
    title: 'Why the numbers are delayed',
    description:
      'Public telemetry is fixed-window, delayed, thresholded, and grouped. That lowers privacy risk, avoids exposing sparse slices, and keeps the public view from turning into an internal ops console.',
    icon: <RuleOutlinedIcon sx={{ fontSize: 22 }} />,
  },
];

const controlCards = [
  {
    command: 'vai telemetry',
    title: 'Inspect current telemetry behavior',
    description:
      'See current telemetry state, endpoint details, and the code-backed event catalog from the CLI.',
    accent: palette.accent,
  },
  {
    command: 'vai telemetry off',
    title: 'Turn telemetry off persistently',
    description:
      'Write the opt-out preference to the shared config so CLI and desktop behavior stay aligned.',
    accent: palette.blue,
  },
  {
    command: 'DO_NOT_TRACK=1',
    title: 'Use a universal environment opt-out',
    description:
      'Honor a cross-tool privacy signal without editing config files, which is useful in CI or shared shells.',
    accent: palette.yellow,
  },
  {
    command: 'VAI_TELEMETRY_DEBUG=1',
    title: 'Audit payloads locally',
    description:
      'Print telemetry payloads locally without sending them to the network so the shape can be verified safely.',
    accent: palette.purple,
  },
];

type PublicTelemetryMethodologyProps = {
  dataThrough: string;
  windowDays: number;
};

export default function PublicTelemetryMethodology({
  dataThrough,
  windowDays,
}: PublicTelemetryMethodologyProps) {
  return (
    <Box sx={{ mt: { xs: 6, md: 8 } }}>
      <Stack spacing={1.25} sx={{ mb: 3.5 }}>
        <Chip
          label="Methodology and Controls"
          sx={{
            alignSelf: 'flex-start',
            bgcolor: 'rgba(0, 212, 170, 0.12)',
            color: palette.accent,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        />
        <Typography variant="h4" sx={{ color: palette.text, fontWeight: 700 }}>
          Why this public view is intentionally bounded
        </Typography>
        <Typography
          variant="body1"
          sx={{ maxWidth: 900, color: palette.textDim, lineHeight: 1.8 }}
        >
          The public dashboard is designed to prove that telemetry is real and useful while
          preserving a clear privacy boundary. This snapshot covers the last {windowDays} days of
          delayed aggregate telemetry, with public data available through {dataThrough}.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {boundaryCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, md: 4 }}>
            <PublicTelemetryChartCard
              eyebrow="Privacy boundary"
              title={card.title}
              description={card.description}
              icon={card.icon}
              minHeight={250}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <PublicTelemetryChartCard
            eyebrow="Controls"
            title="Inspect or disable telemetry from the CLI"
            description="These controls let users understand what would be sent, disable telemetry entirely, or opt out at the environment level."
            icon={<TerminalOutlinedIcon sx={{ fontSize: 22 }} />}
            minHeight={360}
          >
            <Grid container spacing={2}>
              {controlCards.map((control) => (
                <Grid key={control.command} size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: `1px solid ${palette.border}`,
                      bgcolor: 'rgba(255,255,255,0.02)',
                      p: 2,
                    }}
                  >
                    <Typography
                      component="code"
                      sx={{
                        display: 'inline-block',
                        mb: 1.25,
                        px: 1.25,
                        py: 0.6,
                        borderRadius: 2,
                        bgcolor: `${control.accent}22`,
                        color: control.accent,
                        fontSize: '0.88rem',
                        fontFamily:
                          "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                      }}
                    >
                      {control.command}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: palette.text, fontWeight: 700 }}>
                      {control.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mt: 0.9, color: palette.textMuted, lineHeight: 1.7 }}
                    >
                      {control.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </PublicTelemetryChartCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <PublicTelemetryChartCard
            eyebrow="Read more"
            title="Deeper policy and collection details live on `/telemetry`"
            description="This public dashboard focuses on delayed aggregate proof. The full telemetry page remains the home for collection principles, example fields, the event catalog shape, and the broader policy narrative."
            icon={<OpenInNewOutlinedIcon sx={{ fontSize: 22 }} />}
            minHeight={360}
            footer={
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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
                  Open telemetry docs
                </Button>
                <Button
                  component={Link}
                  href="https://docs.vaicli.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  endIcon={<OpenInNewOutlinedIcon />}
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
            }
          >
            <Stack spacing={1.5}>
              <Typography variant="body2" sx={{ color: palette.textMuted, lineHeight: 1.7 }}>
                The public route does not accept filters or query parameters, and this page does
                not expose recent rows, exact recency, or admin-only drilldowns. Those omissions
                are intentional.
              </Typography>
              <Typography variant="body2" sx={{ color: palette.textMuted, lineHeight: 1.7 }}>
                If a bucket is too small to publish safely, it is suppressed or grouped into
                <Box
                  component="span"
                  sx={{ color: palette.text, fontWeight: 700, mx: 0.5 }}
                >
                  Other
                </Box>
                rather than revealed indirectly through the UI.
              </Typography>
              <Typography variant="body2" sx={{ color: palette.textMuted, lineHeight: 1.7 }}>
                That means an empty section can still represent healthy privacy protection rather
                than missing implementation.
              </Typography>
            </Stack>
          </PublicTelemetryChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
