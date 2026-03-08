import { Metadata } from 'next';
import Link from 'next/link';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { palette } from '@/theme/theme';

export const metadata: Metadata = {
  title: 'Telemetry | vai',
  description:
    'How vai captures telemetry across the CLI and desktop app, what is collected, what is never collected, and how users can inspect or disable telemetry.',
};

const principles = [
  {
    title: 'Notice before network',
    description:
      'No telemetry should leave the device until the first-run notice has been shown. The first launch that shows the notice suppresses telemetry for that process.',
    icon: <VisibilityOutlinedIcon sx={{ fontSize: 26, color: palette.accent }} />,
  },
  {
    title: 'One preference across surfaces',
    description:
      'The CLI and Electron desktop app share telemetry preference and notice state in a single config file so behavior stays consistent everywhere.',
    icon: <DesktopWindowsOutlinedIcon sx={{ fontSize: 26, color: palette.blue }} />,
  },
  {
    title: 'Inspectable, reversible controls',
    description:
      'Users can disable telemetry with config or environment flags, preview the next payload locally, and audit payloads without sending them to the network.',
    icon: <TerminalOutlinedIcon sx={{ fontSize: 26, color: palette.purple }} />,
  },
  {
    title: 'Truthful payload disclosure',
    description:
      'Public documentation should match the actual event catalog. That includes command names, runtime metadata, aggregate counts, durations, and workflow metadata where relevant.',
    icon: <RuleOutlinedIcon sx={{ fontSize: 26, color: palette.yellow }} />,
  },
];

const deliveryFlow = [
  {
    step: '01',
    title: 'Check overrides first',
    body: 'Runtime checks honor `VAI_TELEMETRY=0|false`, `DO_NOT_TRACK=1|true`, then config `telemetry: false`, before falling back to the default enabled state.',
  },
  {
    step: '02',
    title: 'Show the notice once',
    body: 'If the notice has never been shown, vai displays a non-blocking notice, persists the notice timestamp, and suppresses all telemetry for that launch.',
  },
  {
    step: '03',
    title: 'Emit only anonymous product telemetry',
    body: 'Subsequent launches can send anonymized usage events that help us understand which commands, workflows, and app surfaces are being used.',
  },
  {
    step: '04',
    title: 'Keep the user in control',
    body: 'At any point, telemetry can be disabled, reset, or inspected through the `vai telemetry` command family and debug mode.',
  },
];

const controlCards = [
  {
    title: '`vai telemetry`',
    description:
      'Shows the current state, endpoint, notice status, shared-surface behavior, and the code-backed event catalog.',
    accent: palette.accent,
  },
  {
    title: '`vai telemetry on|off`',
    description:
      'Turns persistent telemetry on or off in `~/.vai/config.json` without requiring users to remember environment variables.',
    accent: palette.blue,
  },
  {
    title: '`vai telemetry status`',
    description:
      'Prints a synthetic preview of the next `cli_command` payload so users can inspect shape and fields without sending anything.',
    accent: palette.purple,
  },
  {
    title: '`vai telemetry reset`',
    description:
      'Clears only the notice metadata so the notice is shown again on the next CLI or desktop launch. It does not change the enabled/disabled preference.',
    accent: palette.yellow,
  },
  {
    title: '`VAI_TELEMETRY=0` and `DO_NOT_TRACK=1`',
    description:
      'Environment-level controls act as universal opt-out paths, with `DO_NOT_TRACK` supported as a cross-tool signal.',
    accent: palette.red,
  },
  {
    title: '`VAI_TELEMETRY_DEBUG=1`',
    description:
      'Audit mode prints payloads locally to `stderr` and skips network delivery, making it safe to verify exactly what would be sent.',
    accent: palette.accentLight,
  },
];

const baseFields = [
  ['`event`', 'Telemetry event identifier such as `cli_command` or `desktop_launch`.'],
  ['`version`', 'The current vai version.'],
  ['`context`', 'The runtime surface, such as `cli` or `desktop`.'],
  ['`platform`', 'Operating system plus architecture.'],
  ['`locale`', 'Resolved runtime locale.'],
];

const representativeEvents = [
  {
    group: 'Command and navigation events',
    events: [
      '`cli_command`',
      '`cli_models`',
      '`cli_init`',
      '`cli_generate`',
      '`cli_content`',
      '`cli_mcp_start`',
    ],
  },
  {
    group: 'Timed workflow and execution events',
    events: [
      '`cli_query`',
      '`cli_embed`',
      '`cli_pipeline`',
      '`cli_rerank`',
      '`cli_search`',
      '`cli_chat`',
      '`cli_workflow_run`',
    ],
  },
  {
    group: 'Workspace, code, and demo events',
    events: [
      '`cli_index_workspace_run`',
      '`cli_search_code_run`',
      '`cli_code_search_query`',
      '`demo_cost_optimizer_completed`',
      '`demo_code_search_completed`',
      '`demo_chat_completed`',
    ],
  },
  {
    group: 'Operational and app lifecycle events',
    events: ['`cli_error`', '`cli_ping`', '`optimize_completed`', '`desktop_launch`'],
  },
];

const exampleFields = [
  'Command names and top-level subcommands',
  'Model identifiers and provider names',
  'Aggregate counts such as result counts, token counts, chunk counts, and step counts',
  'Timing and duration metadata',
  'Transport choices, booleans, and workflow metadata',
  'Desktop app and Electron version information',
];

const notCollected = [
  'API keys or access tokens',
  'File contents',
  'MongoDB connection strings or URIs',
  'LLM prompts or conversation text',
  'Environment variable values',
  'User names or email addresses',
];

const rolloutItems = [
  {
    title: 'Today',
    status: 'Current reality',
    icon: <WarningAmberOutlinedIcon sx={{ color: palette.yellow }} />,
    points: [
      'Telemetry exists in the CLI and Electron desktop app today.',
      'The current library already sends anonymous product telemetry to `https://vaicli.com/api/telemetry`.',
      'Users can already disable telemetry with config or `VAI_TELEMETRY=0`, but first-run notice and audit surfaces are still being standardized.',
    ],
  },
  {
    title: 'Rollout target',
    status: 'Approved implementation',
    icon: <CheckCircleOutlineOutlinedIcon sx={{ color: palette.accent }} />,
    points: [
      'A first-run notice will appear before any telemetry is sent.',
      'CLI and desktop will share one persisted telemetry preference plus internal notice metadata.',
      'Public docs will be backed by a code-level telemetry catalog so this page tracks implementation truthfully.',
    ],
  },
];

const openQuestions = [
  'What retention period is enforced server-side?',
  'Does the telemetry endpoint or gateway retain IP addresses in logs?',
  'Which privacy-policy location should the CLI notice and this page link to long term?',
];

const noticeText = [
  '┌──────────────────────────────────────────────────────────────┐',
  '│  vai collects anonymous usage data to improve the product.  │',
  '│                                                              │',
  '│  This includes command names, runtime metadata, aggregate    │',
  '│  counts, platform, and version. No API keys, file contents,  │',
  '│  or conversation text are sent.                              │',
  '│                                                              │',
  '│  Disable anytime:  vai telemetry off                         │',
  '│  Details:          https://vaicli.com/telemetry              │',
  '└──────────────────────────────────────────────────────────────┘',
].join('\n');

const statusPreview = `{
  "event": "cli_command",
  "version": "1.31.0",
  "context": "cli",
  "platform": "darwin-arm64",
  "locale": "en-US",
  "command": "<command>"
}`;

export default function TelemetryPage() {
  return (
    <>
      <Navbar />
      <Box
        sx={{
          bgcolor: palette.bg,
          minHeight: '100vh',
          backgroundImage: `
            radial-gradient(circle at 20% 0%, rgba(0,212,170,0.14), transparent 32%),
            radial-gradient(circle at 85% 12%, rgba(64,224,255,0.12), transparent 28%),
            linear-gradient(180deg, ${palette.bg} 0%, #072330 100%)
          `,
        }}
      >
        <Container maxWidth="xl" sx={{ pt: { xs: 8, md: 10 }, pb: { xs: 8, md: 12 } }}>
          <Box
            sx={{
              border: `1px solid ${palette.border}`,
              borderRadius: 6,
              overflow: 'hidden',
              background:
                'linear-gradient(135deg, rgba(0,212,170,0.09) 0%, rgba(17,39,51,0.96) 45%, rgba(0,30,43,0.98) 100%)',
              boxShadow: '0 24px 90px rgba(0, 0, 0, 0.28)',
            }}
          >
            <Grid container>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Box sx={{ p: { xs: 3, md: 5 } }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    <Chip
                      label="Telemetry"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(0,212,170,0.14)',
                        color: palette.accent,
                        border: `1px solid rgba(0,212,170,0.28)`,
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      label="CLI + desktop"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(64,224,255,0.12)',
                        color: palette.blue,
                        border: `1px solid rgba(64,224,255,0.24)`,
                      }}
                    />
                    <Chip
                      label="Notice-first rollout"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(180,90,242,0.12)',
                        color: palette.purple,
                        border: `1px solid rgba(180,90,242,0.24)`,
                      }}
                    />
                  </Stack>

                  <Typography
                    variant="h1"
                    sx={{
                      color: palette.text,
                      fontSize: { xs: '2.4rem', md: '4rem' },
                      lineHeight: 1.05,
                      mb: 2,
                      maxWidth: 900,
                    }}
                  >
                    Telemetry that is
                    <Box
                      component="span"
                      sx={{
                        display: 'block',
                        color: palette.accent,
                        fontFamily: "'Source Code Pro', 'SF Mono', monospace",
                      }}
                    >
                      visible, limited, and controllable.
                    </Box>
                  </Typography>

                  <Typography
                    sx={{
                      color: palette.textDim,
                      fontSize: { xs: '1rem', md: '1.15rem' },
                      lineHeight: 1.75,
                      maxWidth: 760,
                      mb: 4,
                    }}
                  >
                    This page documents how vai approaches telemetry capture across the CLI and
                    Electron desktop app. The goal is simple: explain what gets collected, explain
                    what never gets collected, and give users clear ways to inspect or disable
                    telemetry without hunting through source code.
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      component={Link}
                      href="#controls"
                      variant="contained"
                      sx={{
                        bgcolor: palette.accent,
                        color: palette.bg,
                        fontWeight: 700,
                        '&:hover': { bgcolor: palette.accentDim },
                      }}
                    >
                      See Controls
                    </Button>
                    <Button
                      component={Link}
                      href="#event-catalog"
                      variant="outlined"
                      sx={{
                        borderColor: palette.border,
                        color: palette.text,
                        '&:hover': {
                          borderColor: palette.accent,
                          bgcolor: 'rgba(0,212,170,0.05)',
                        },
                      }}
                    >
                      Explore Event Catalog
                    </Button>
                  </Stack>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Box
                  sx={{
                    height: '100%',
                    borderLeft: { xs: 'none', lg: `1px solid ${palette.border}` },
                    borderTop: { xs: `1px solid ${palette.border}`, lg: 'none' },
                    p: { xs: 3, md: 4 },
                    bgcolor: 'rgba(8, 26, 36, 0.65)',
                  }}
                >
                  <Stack spacing={2}>
                    <MetricCard
                      label="Default model"
                      value="Notice first, opt out after"
                      note="No event should be sent before the user has seen the first-run notice."
                    />
                    <MetricCard
                      label="Shared state"
                      value="One preference file"
                      note="CLI and desktop share telemetry state in `~/.vai/config.json`."
                    />
                    <MetricCard
                      label="Universal override"
                      value="`DO_NOT_TRACK=1`"
                      note="Runtime env vars can disable telemetry without touching config."
                    />
                    <MetricCard
                      label="Audit path"
                      value="`VAI_TELEMETRY_DEBUG=1`"
                      note="Payloads print locally and do not get sent over the network."
                    />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              mt: 2,
              p: { xs: 3, md: 3.5 },
              borderRadius: 4,
              border: `1px solid ${palette.border}`,
              bgcolor: 'rgba(17,39,51,0.82)',
            }}
          >
            <Stack spacing={1}>
              <Typography sx={{ color: palette.accent, fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Public Transparency Boundary
              </Typography>
              <Typography sx={{ color: palette.text, fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                The live public dashboard is now available as a delayed, aggregate-only surface.
              </Typography>
              <Typography sx={{ color: palette.textMuted, lineHeight: 1.75, maxWidth: 980 }}>
                The dashboard uses a dedicated public-safe route and shows only bounded aggregate trends such as activity, surfaces, grouped feature areas, platform health, and grouped reliability. Recent events, raw payloads, operational drilldowns, city-level geography, and other sparse slices remain private to the admin telemetry dashboard.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                <Button
                  component={Link}
                  href="/telemetry/dashboard"
                  variant="contained"
                  sx={{
                    alignSelf: 'flex-start',
                    bgcolor: palette.accent,
                    color: palette.bg,
                    fontWeight: 700,
                    '&:hover': { bgcolor: palette.accentDim },
                  }}
                >
                  Open Public Dashboard
                </Button>
                <Typography sx={{ color: palette.textMuted, lineHeight: 1.7, maxWidth: 720 }}>
                  Use `/telemetry` for policy, controls, and methodology. Use `/telemetry/dashboard`
                  for the live delayed transparency view.
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {principles.map((item) => (
              <Grid key={item.title} size={{ xs: 12, sm: 6, xl: 3 }}>
                <Box
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 4,
                    border: `1px solid ${palette.border}`,
                    bgcolor: 'rgba(17,39,51,0.82)',
                  }}
                >
                  <Box sx={{ mb: 1.5 }}>{item.icon}</Box>
                  <Typography sx={{ color: palette.text, fontWeight: 700, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ color: palette.textMuted, fontSize: '0.94rem', lineHeight: 1.7 }}>
                    {item.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Section
            id="approach"
            eyebrow="Approach"
            title="The telemetry model in plain English"
            intro="vai is not aiming for dark-pattern analytics. The model is: show the notice first, collect only limited anonymous product telemetry, and let users opt out or inspect behavior through stable controls."
          >
            <Grid container spacing={3}>
              {deliveryFlow.map((item) => (
                <Grid key={item.step} size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: `1px solid ${palette.border}`,
                      bgcolor: palette.bgSurface,
                      height: '100%',
                    }}
                  >
                    <Typography
                      sx={{
                        color: palette.accent,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        mb: 1,
                      }}
                    >
                      {item.step}
                    </Typography>
                    <Typography sx={{ color: palette.text, fontWeight: 700, mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: palette.textMuted, lineHeight: 1.75 }}>
                      {item.body}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Section>

          <Section
            id="controls"
            eyebrow="Controls"
            title="How users can inspect, disable, and reset telemetry"
            intro="The public contract is that telemetry should never feel irreversible or mysterious. These are the control surfaces the docs and product should expose."
          >
            <Grid container spacing={3}>
              {controlCards.map((item) => (
                <Grid key={item.title} size={{ xs: 12, md: 6, xl: 4 }}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: `1px solid ${palette.border}`,
                      bgcolor: 'rgba(17,39,51,0.86)',
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        bgcolor: `${item.accent}18`,
                        border: `1px solid ${item.accent}33`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <ToggleOnOutlinedIcon sx={{ color: item.accent }} />
                    </Box>
                    <Typography sx={{ color: palette.text, fontWeight: 700, mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: palette.textMuted, lineHeight: 1.7 }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <CodePanel
                  icon={<TravelExploreOutlinedIcon sx={{ color: palette.accent }} />}
                  title="First-run CLI notice"
                  body="The first-run notice should be non-blocking, accurate about the current payload surface, and shown before any telemetry is delivered."
                  code={noticeText}
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <CodePanel
                  icon={<BugReportOutlinedIcon sx={{ color: palette.blue }} />}
                  title="Status preview"
                  body="`vai telemetry status` should show a local preview of the next payload shape without transmitting anything."
                  code={statusPreview}
                />
              </Grid>
            </Grid>
          </Section>

          <Section
            id="payloads"
            eyebrow="Payload Shape"
            title="What telemetry includes"
            intro="Every event shares a small base payload and may add event-specific metadata such as model identifiers, durations, or aggregate counts. The docs should match the implementation, not an idealized subset."
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 5 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: `1px solid ${palette.border}`,
                    bgcolor: palette.bgSurface,
                    height: '100%',
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
                    <DataObjectOutlinedIcon sx={{ color: palette.accent }} />
                    <Typography sx={{ color: palette.text, fontWeight: 700 }}>
                      Base fields on every payload
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {baseFields.map(([name, description]) => (
                      <Box
                        key={name}
                        sx={{
                          p: 1.5,
                          borderRadius: 2.5,
                          bgcolor: palette.bgCard,
                          border: `1px solid ${palette.border}`,
                        }}
                      >
                        <Typography sx={{ color: palette.accent, fontWeight: 700, mb: 0.5 }}>
                          {name}
                        </Typography>
                        <Typography sx={{ color: palette.textMuted, fontSize: '0.92rem', lineHeight: 1.7 }}>
                          {description}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, lg: 7 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    border: `1px solid ${palette.border}`,
                    bgcolor: 'rgba(17,39,51,0.84)',
                    height: '100%',
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
                    <CodeOutlinedIcon sx={{ color: palette.blue }} />
                    <Typography sx={{ color: palette.text, fontWeight: 700 }}>
                      Representative event-specific fields
                    </Typography>
                  </Stack>
                  <Grid container spacing={1.5}>
                    {exampleFields.map((field) => (
                      <Grid key={field} size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2.5,
                            border: `1px solid ${palette.border}`,
                            bgcolor: 'rgba(28,45,56,0.8)',
                            color: palette.textMuted,
                            minHeight: 88,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {field}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Section>

          <Section
            id="event-catalog"
            eyebrow="Event Catalog"
            title="The current telemetry surface is broader than a single command ping"
            intro="vai already emits telemetry from multiple command families, workflow paths, demos, and the Electron app. Public documentation should be generated from a code-backed event catalog so these lists stay aligned with the codebase."
          >
            <Grid container spacing={3}>
              {representativeEvents.map((group) => (
                <Grid key={group.group} size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: `1px solid ${palette.border}`,
                      bgcolor: palette.bgSurface,
                      height: '100%',
                    }}
                  >
                    <Typography sx={{ color: palette.text, fontWeight: 700, mb: 2 }}>
                      {group.group}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {group.events.map((eventName) => (
                        <Chip
                          key={eventName}
                          label={eventName}
                          sx={{
                            color: palette.text,
                            bgcolor: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${palette.border}`,
                            fontFamily: "'Source Code Pro', monospace",
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Section>

          <Section
            id="not-collected"
            eyebrow="Boundaries"
            title="What vai explicitly does not collect"
            intro="The telemetry contract should be easy to explain. We do not want this page to bury the exclusions."
          >
            <Box
              sx={{
                p: 3,
                borderRadius: 4,
                border: `1px solid ${palette.border}`,
                bgcolor: 'rgba(17,39,51,0.84)',
              }}
            >
              <Grid container spacing={1.5}>
                {notCollected.map((item) => (
                  <Grid key={item} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: palette.bgCard,
                        border: `1px solid ${palette.border}`,
                        display: 'flex',
                        gap: 1.2,
                        alignItems: 'center',
                        color: palette.text,
                      }}
                    >
                      <ShieldOutlinedIcon sx={{ color: palette.accent, fontSize: 20 }} />
                      <Typography sx={{ fontSize: '0.94rem' }}>{item}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Section>

          <Section
            id="rollout-status"
            eyebrow="Status"
            title="Current state and rollout status"
            intro="This page is meant to be honest about both the product today and the consent/compliance work being rolled out next."
          >
            <Grid container spacing={3}>
              {rolloutItems.map((item) => (
                <Grid key={item.title} size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: `1px solid ${palette.border}`,
                      bgcolor: palette.bgSurface,
                      height: '100%',
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.5 }}>
                      {item.icon}
                      <Typography sx={{ color: palette.text, fontWeight: 700 }}>
                        {item.title}
                      </Typography>
                    </Stack>
                    <Typography sx={{ color: palette.textDim, fontSize: '0.86rem', mb: 2 }}>
                      {item.status}
                    </Typography>
                    <Stack spacing={1.2}>
                      {item.points.map((point) => (
                        <Box
                          key={point}
                          sx={{
                            p: 1.5,
                            borderRadius: 2.5,
                            bgcolor: palette.bgCard,
                            border: `1px solid ${palette.border}`,
                          }}
                        >
                          <Typography sx={{ color: palette.textMuted, lineHeight: 1.7 }}>
                            {point}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Section>

          <Section
            id="open-questions"
            eyebrow="Open Questions"
            title="Transparency items still to finalize"
            intro="Some parts of a complete privacy disclosure live outside the client-side telemetry library. We are calling those out directly rather than pretending they are settled."
          >
            <Box
              sx={{
                p: 3,
                borderRadius: 4,
                border: `1px solid ${palette.border}`,
                bgcolor: 'rgba(17,39,51,0.84)',
              }}
            >
              <Stack spacing={1.5}>
                {openQuestions.map((question) => (
                  <Box
                    key={question}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: `1px solid ${palette.border}`,
                      bgcolor: palette.bgCard,
                    }}
                  >
                    <Typography sx={{ color: palette.text, lineHeight: 1.7 }}>{question}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Section>

          <Box
            sx={{
              mt: 8,
              p: { xs: 3, md: 4 },
              borderRadius: 5,
              border: `1px solid ${palette.border}`,
              bgcolor: 'rgba(17,39,51,0.92)',
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                color: palette.text,
                fontSize: { xs: '1.4rem', md: '2rem' },
                fontWeight: 800,
                mb: 1.5,
              }}
            >
              The north star is simple:
            </Typography>
            <Typography
              sx={{
                color: palette.textDim,
                fontSize: { xs: '1rem', md: '1.12rem' },
                maxWidth: 760,
                mx: 'auto',
                lineHeight: 1.8,
              }}
            >
              telemetry should help improve vai without surprising the people using it. That
              means notice before delivery, limited payloads, explicit exclusions, shared controls,
              and docs that stay synced with the code.
            </Typography>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <Box id={id} sx={{ mt: { xs: 7, md: 9 }, scrollMarginTop: 88 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            color: palette.accent,
            fontSize: '0.82rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
            mb: 1,
          }}
        >
          {eyebrow}
        </Typography>
        <Typography
          sx={{
            color: palette.text,
            fontSize: { xs: '1.65rem', md: '2.35rem' },
            fontWeight: 800,
            mb: 1.2,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            color: palette.textMuted,
            maxWidth: 900,
            lineHeight: 1.8,
            fontSize: { xs: '0.98rem', md: '1.02rem' },
          }}
        >
          {intro}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Box
      sx={{
        p: 2.2,
        borderRadius: 3,
        border: `1px solid ${palette.border}`,
        bgcolor: 'rgba(28,45,56,0.88)',
      }}
    >
      <Typography sx={{ color: palette.textMuted, fontSize: '0.82rem', mb: 0.6 }}>
        {label}
      </Typography>
      <Typography sx={{ color: palette.text, fontWeight: 700, mb: 0.8 }}>
        {value}
      </Typography>
      <Typography sx={{ color: palette.textDim, fontSize: '0.88rem', lineHeight: 1.6 }}>
        {note}
      </Typography>
    </Box>
  );
}

function CodePanel({
  icon,
  title,
  body,
  code,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  code: string;
}) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 4,
        border: `1px solid ${palette.border}`,
        bgcolor: palette.bgSurface,
        height: '100%',
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.5 }}>
        {icon}
        <Typography sx={{ color: palette.text, fontWeight: 700 }}>{title}</Typography>
      </Stack>
      <Typography sx={{ color: palette.textMuted, lineHeight: 1.75, mb: 2 }}>{body}</Typography>
      <Divider sx={{ borderColor: palette.border, mb: 2 }} />
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 2,
          overflowX: 'auto',
          borderRadius: 3,
          border: `1px solid ${palette.border}`,
          bgcolor: '#081924',
          color: '#d2f8ef',
          fontSize: '0.84rem',
          lineHeight: 1.7,
          fontFamily: "'Source Code Pro', 'SF Mono', monospace",
        }}
      >
        {code}
      </Box>
    </Box>
  );
}
