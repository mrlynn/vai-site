'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid2 as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import DevicesIcon from '@mui/icons-material/Devices';
import PublicIcon from '@mui/icons-material/Public';
import TerminalIcon from '@mui/icons-material/Terminal';
import TabIcon from '@mui/icons-material/Tab';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChatIcon from '@mui/icons-material/Chat';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import SpeedIcon from '@mui/icons-material/Speed';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { BarChart, LineChart } from '@mui/x-charts';
import dynamic from 'next/dynamic';
import { palette } from '@/theme/theme';

// Lazy-load the map (SSR-unfriendly SVG library)
const WorldMap = dynamic(() => import('@/components/WorldMap'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: palette.accent }} />
    </Box>
  ),
});

interface Stats {
  meta: {
    days: number;
    totalEventsAllTime: number;
    totalEventsInRange: number;
    generatedAt: string;
  };
  eventsByType: { type: string; count: number }[];
  eventsByVersion: { version: string; count: number }[];
  eventsByPlatform: { platform: string; count: number }[];
  eventsByCountry: { country: string; count: number }[];
  eventsByContext: { context: string; count: number }[];
  eventsByTab: { tab: string; count: number }[];
  eventsByCommand: { command: string; count: number }[];
  eventsByCity: { city: string; region: string; country: string; count: number }[];
  cityLocations: { city: string; country: string; count: number; lat: number; lng: number }[];
  dailyActivity: { date: string; count: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  recentEvents: Record<string, unknown>[];
  useCasePageViews: { slug: string; count: number }[];
  useCaseChatQueries: { slug: string; count: number }[];
  useCaseChatModels: { model: string; count: number }[];
  useCaseDownloads: { slug: string; count: number }[];
  useCaseCtaClicks: { ctaType: string; slug: string; count: number }[];
  useCaseChatTopSources: { source: string; slug: string; count: number }[];
  useCaseDailyChat: { date: string; count: number }[];
  useCaseAvgLatency: { slug: string; avgLatency: number; count: number }[];
  recentChatQueries: Record<string, unknown>[];
  game: {
    sessionCount: number;
    gameOverCount: number;
    avgScore: number;
    highScores: { score: number; wave: number; durationMs: number; receivedAt: string; country?: string; platform?: string }[];
    avgDurationMs: number;
    totalPlayTimeMs: number;
    byCountry: { country: string; count: number }[];
    byTrigger: { trigger: string; count: number }[];
    dailyActivity: { date: string; starts: number; ends: number }[];
    scoreDistribution: { bucket: string; count: number }[];
    waveDistribution: { wave: number; count: number }[];
  };
}

function StatCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Card
      sx={{
        bgcolor: palette.bgSurface,
        border: `1px solid ${palette.border}`,
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
        <Box
          sx={{
            bgcolor: 'rgba(0, 237, 100, 0.1)',
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" sx={{ color: palette.textMuted, mb: 0.25 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: palette.text }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: palette.textDim }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function DataTable({
  title,
  icon,
  rows,
  labelKey,
  valueKey,
  maxRows = 15,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  maxRows?: number;
}) {
  if (!rows || rows.length === 0) return null;
  return (
    <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: palette.textMuted, borderColor: palette.border }}>
                  {labelKey.charAt(0).toUpperCase() + labelKey.slice(1)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: palette.textMuted, borderColor: palette.border }}
                >
                  Count
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(0, maxRows).map((row, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ borderColor: palette.border }}>
                    <Chip
                      label={String(row[labelKey] || 'unknown')}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(0, 237, 100, 0.08)',
                        color: palette.accent,
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 600, borderColor: palette.border }}
                  >
                    {(row[valueKey] as number).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<string>('30');
  const [activeTab, setActiveTab] = useState<'overview' | 'usecases' | 'game'>('overview');

  // Persist API key in sessionStorage
  useEffect(() => {
    const stored = localStorage.getItem('vai_dashboard_key');
    if (stored) {
      setApiKey(stored);
      setAuthenticated(true);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/telemetry/stats?API_KEY=${encodeURIComponent(apiKey)}&days=${days}`);
      if (res.status === 401) {
        setError('Invalid API key');
        setAuthenticated(false);
        localStorage.removeItem('vai_dashboard_key');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
      setAuthenticated(true);
      localStorage.setItem('vai_dashboard_key', apiKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [apiKey, days]);

  useEffect(() => {
    if (authenticated && apiKey) {
      fetchStats();
    }
  }, [authenticated, days]); // eslint-disable-line react-hooks/exhaustive-deps

  // Login screen
  if (!authenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: palette.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            border: `1px solid ${palette.border}`,
            maxWidth: 400,
            width: '100%',
            mx: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: palette.accent,
                fontFamily: "'Source Code Pro', monospace",
                mb: 0.5,
              }}
            >
              vai telemetry
            </Typography>
            <Typography variant="body2" sx={{ color: palette.textMuted, mb: 3 }}>
              Enter your API key to view telemetry data.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              type="password"
              label="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchStats();
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: palette.border },
                },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={fetchStats}
              disabled={!apiKey || loading}
              sx={{
                bgcolor: palette.accent,
                color: palette.bg,
                fontWeight: 700,
                '&:hover': { bgcolor: palette.accentDim },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'View Dashboard'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Loading state
  if (loading && !stats) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: palette.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: palette.accent }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.bg, py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: palette.accent,
                fontFamily: "'Source Code Pro', monospace",
              }}
            >
              vai telemetry
            </Typography>
            {stats?.meta && (
              <Typography variant="body2" sx={{ color: palette.textMuted }}>
                Last updated: {new Date(stats.meta.generatedAt).toLocaleString()}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              value={days}
              exclusive
              onChange={(_, v) => v && setDays(v)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: palette.textMuted,
                  borderColor: palette.border,
                  '&.Mui-selected': {
                    color: palette.accent,
                    bgcolor: 'rgba(0, 237, 100, 0.1)',
                  },
                },
              }}
            >
              <ToggleButton value="7">7d</ToggleButton>
              <ToggleButton value="30">30d</ToggleButton>
              <ToggleButton value="90">90d</ToggleButton>
              <ToggleButton value="365">1y</ToggleButton>
            </ToggleButtonGroup>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchStats} disabled={loading}>
                <RefreshIcon sx={{ color: loading ? palette.textMuted : palette.accent }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Tab Switcher */}
        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={activeTab}
            exclusive
            onChange={(_, v) => v && setActiveTab(v)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                color: palette.textMuted,
                borderColor: palette.border,
                px: 3,
                '&.Mui-selected': {
                  color: palette.accent,
                  bgcolor: 'rgba(0, 237, 100, 0.1)',
                },
              },
            }}
          >
            <ToggleButton value="overview">Overview</ToggleButton>
            <ToggleButton value="usecases">Use Cases</ToggleButton>
            <ToggleButton value="game">🎮 Game</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {stats && activeTab === 'overview' && (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total Events (All Time)"
                  value={stats.meta.totalEventsAllTime}
                  icon={<TrendingUpIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={`Events (${days}d)`}
                  value={stats.meta.totalEventsInRange}
                  icon={<EventIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Event Types"
                  value={stats.eventsByType.length}
                  icon={<BarChartIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Countries"
                  value={stats.eventsByCountry.length}
                  icon={<PublicIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
            </Grid>

            {/* Daily Activity Chart */}
            {stats.dailyActivity.length > 0 && (
              <Card
                sx={{
                  bgcolor: palette.bgSurface,
                  border: `1px solid ${palette.border}`,
                  mb: 4,
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TimelineIcon sx={{ color: palette.accent }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Daily Activity
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', height: 300 }}>
                  <LineChart
                    xAxis={[
                      {
                        data: stats.dailyActivity.map((d) => new Date(d.date)),
                        scaleType: 'time',
                        tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                      },
                    ]}
                    yAxis={[
                      {
                        tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                      },
                    ]}
                    series={[
                      {
                        data: stats.dailyActivity.map((d) => d.count),
                        color: palette.accent,
                        area: true,
                        showMark: false,
                      },
                    ]}
                    height={280}
                    sx={{
                      '& .MuiAreaElement-root': {
                        fill: 'url(#areaGradient)',
                        opacity: 0.3,
                      },
                    }}
                  />
                </Box>
              </Card>
            )}

            {/* Hourly Distribution Chart */}
            {stats.hourlyDistribution.length > 0 && (
              <Card
                sx={{
                  bgcolor: palette.bgSurface,
                  border: `1px solid ${palette.border}`,
                  mb: 4,
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BarChartIcon sx={{ color: palette.blue }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Hourly Distribution (UTC)
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', height: 250 }}>
                  <BarChart
                    xAxis={[
                      {
                        data: Array.from({ length: 24 }, (_, i) => i),
                        scaleType: 'band',
                        tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                        valueFormatter: (v: number) => `${v}:00`,
                      },
                    ]}
                    yAxis={[
                      {
                        tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                      },
                    ]}
                    series={[
                      {
                        data: Array.from({ length: 24 }, (_, i) => {
                          const found = stats.hourlyDistribution.find((h) => h.hour === i);
                          return found ? found.count : 0;
                        }),
                        color: palette.blue,
                      },
                    ]}
                    height={230}
                  />
                </Box>
              </Card>
            )}

            {/* World Map */}
            {stats.eventsByCountry.length > 0 && (
              <Card
                sx={{
                  bgcolor: palette.bgSurface,
                  border: `1px solid ${palette.border}`,
                  mb: 4,
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PublicIcon sx={{ color: palette.blue }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Usage by Country
                  </Typography>
                  <Typography variant="body2" sx={{ color: palette.textMuted, ml: 1 }}>
                    {stats.eventsByCountry.length} countries
                  </Typography>
                </Box>
                <WorldMap
                  countryData={stats.eventsByCountry}
                  cityData={stats.cityLocations}
                />
              </Card>
            )}

            {/* Data Tables Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <DataTable
                  title="Events by Type"
                  icon={<BarChartIcon sx={{ color: palette.accent, fontSize: 20 }} />}
                  rows={stats.eventsByType}
                  labelKey="type"
                  valueKey="count"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <DataTable
                  title="By Context"
                  icon={<DevicesIcon sx={{ color: palette.blue, fontSize: 20 }} />}
                  rows={stats.eventsByContext}
                  labelKey="context"
                  valueKey="count"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <DataTable
                  title="By Version"
                  icon={<BarChartIcon sx={{ color: palette.purple, fontSize: 20 }} />}
                  rows={stats.eventsByVersion}
                  labelKey="version"
                  valueKey="count"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <DataTable
                  title="By Platform"
                  icon={<DevicesIcon sx={{ color: palette.accent, fontSize: 20 }} />}
                  rows={stats.eventsByPlatform}
                  labelKey="platform"
                  valueKey="count"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <DataTable
                  title="By Country"
                  icon={<PublicIcon sx={{ color: palette.blue, fontSize: 20 }} />}
                  rows={stats.eventsByCountry}
                  labelKey="country"
                  valueKey="count"
                />
              </Grid>
              {stats.eventsByCity && stats.eventsByCity.length > 0 && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <DataTable
                    title="By City"
                    icon={<PublicIcon sx={{ color: palette.purple, fontSize: 20 }} />}
                    rows={stats.eventsByCity.map((c) => ({
                      city: `${c.city}, ${c.country}`,
                      count: c.count,
                    }))}
                    labelKey="city"
                    valueKey="count"
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <DataTable
                  title="CLI Commands"
                  icon={<TerminalIcon sx={{ color: palette.accent, fontSize: 20 }} />}
                  rows={stats.eventsByCommand}
                  labelKey="command"
                  valueKey="count"
                />
              </Grid>
              {stats.eventsByTab.length > 0 && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <DataTable
                    title="Playground Tabs"
                    icon={<TabIcon sx={{ color: palette.purple, fontSize: 20 }} />}
                    rows={stats.eventsByTab}
                    labelKey="tab"
                    valueKey="count"
                  />
                </Grid>
              )}
            </Grid>

            {/* Recent Events */}
            <Card
              sx={{
                bgcolor: palette.bgSurface,
                border: `1px solid ${palette.border}`,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Events
                </Typography>
                <TableContainer
                  component={Paper}
                  sx={{ bgcolor: 'transparent', boxShadow: 'none', maxHeight: 500 }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {['Event', 'Version', 'Context', 'Platform', 'Country', 'Time'].map(
                          (h) => (
                            <TableCell
                              key={h}
                              sx={{
                                bgcolor: palette.bgCard,
                                color: palette.textMuted,
                                borderColor: palette.border,
                                fontWeight: 600,
                              }}
                            >
                              {h}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.recentEvents.map((evt, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ borderColor: palette.border }}>
                            <Chip
                              label={String(evt.event)}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(0, 237, 100, 0.08)',
                                color: palette.accent,
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              borderColor: palette.border,
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                            }}
                          >
                            {String(evt.version || '—')}
                          </TableCell>
                          <TableCell sx={{ borderColor: palette.border }}>
                            {String(evt.context || '—')}
                          </TableCell>
                          <TableCell
                            sx={{
                              borderColor: palette.border,
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                            }}
                          >
                            {String(evt.platform || '—')}
                          </TableCell>
                          <TableCell sx={{ borderColor: palette.border }}>
                            {String(evt.country || '—')}
                          </TableCell>
                          <TableCell
                            sx={{
                              borderColor: palette.border,
                              fontSize: '0.8rem',
                              color: palette.textDim,
                            }}
                          >
                            {evt.receivedAt
                              ? new Date(String(evt.receivedAt)).toLocaleString()
                              : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </>
        )}

        {stats && activeTab === 'usecases' && (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Use Case Page Views"
                  value={stats.useCasePageViews?.reduce((s, e) => s + e.count, 0) || 0}
                  icon={<VisibilityIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Chatbot Queries"
                  value={stats.useCaseChatQueries?.reduce((s, e) => s + e.count, 0) || 0}
                  icon={<ChatIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Sample Downloads"
                  value={stats.useCaseDownloads?.reduce((s, e) => s + e.count, 0) || 0}
                  icon={<DownloadForOfflineIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Avg Chat Latency"
                  value={
                    stats.useCaseAvgLatency?.length
                      ? `${Math.round(stats.useCaseAvgLatency.reduce((s, e) => s + e.avgLatency * e.count, 0) / stats.useCaseAvgLatency.reduce((s, e) => s + e.count, 0))}ms`
                      : '—'
                  }
                  icon={<SpeedIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
            </Grid>

            {/* Page Views by Slug */}
            {stats.useCasePageViews?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <VisibilityIcon sx={{ color: palette.accent }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Page Views by Use Case</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 280 }}>
                  <BarChart
                    xAxis={[{
                      data: stats.useCasePageViews.map((e) => e.slug || 'unknown'),
                      scaleType: 'band',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                    }]}
                    yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={[{ data: stats.useCasePageViews.map((e) => e.count), color: palette.accent }]}
                    height={260}
                  />
                </Box>
              </Card>
            )}

            {/* Daily Chat Queries */}
            {stats.useCaseDailyChat?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TimelineIcon sx={{ color: palette.blue }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Daily Chatbot Queries</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 280 }}>
                  <LineChart
                    xAxis={[{
                      data: stats.useCaseDailyChat.map((d) => new Date(d.date)),
                      scaleType: 'time',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                    }]}
                    yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={[{
                      data: stats.useCaseDailyChat.map((d) => d.count),
                      color: palette.blue,
                      area: true,
                      showMark: false,
                    }]}
                    height={260}
                  />
                </Box>
              </Card>
            )}

            {/* Chat Queries by Slug */}
            {stats.useCaseChatQueries?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ChatIcon sx={{ color: palette.purple }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Chatbot Queries by Use Case</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 280 }}>
                  <BarChart
                    xAxis={[{
                      data: stats.useCaseChatQueries.map((e) => e.slug || 'unknown'),
                      scaleType: 'band',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                    }]}
                    yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={[{ data: stats.useCaseChatQueries.map((e) => e.count), color: palette.purple }]}
                    height={260}
                  />
                </Box>
              </Card>
            )}

            {/* Top Retrieved Sources */}
            {stats.useCaseChatTopSources?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BarChartIcon sx={{ color: palette.accent }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Most Retrieved Source Documents</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 300 }}>
                  <BarChart
                    layout="horizontal"
                    yAxis={[{
                      data: stats.useCaseChatTopSources.slice(0, 10).map((e) => e.source.length > 25 ? e.source.slice(0, 25) + '…' : e.source),
                      scaleType: 'band',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 10 },
                    }]}
                    xAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={[{ data: stats.useCaseChatTopSources.slice(0, 10).map((e) => e.count), color: palette.accent }]}
                    height={280}
                  />
                </Box>
              </Card>
            )}

            {/* CTA Click Breakdown */}
            {stats.useCaseCtaClicks?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TouchAppIcon sx={{ color: palette.blue }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>CTA Click Breakdown</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 280 }}>
                  <BarChart
                    xAxis={[{
                      data: stats.useCaseCtaClicks.map((e) => `${e.ctaType} (${e.slug})`),
                      scaleType: 'band',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 10, angle: -30 },
                    }]}
                    yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={[{ data: stats.useCaseCtaClicks.map((e) => e.count), color: palette.blue }]}
                    height={260}
                  />
                </Box>
              </Card>
            )}

            {/* Recent Chat Queries Table */}
            {stats.recentChatQueries?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Recent Chatbot Queries
                  </Typography>
                  <TableContainer
                    component={Paper}
                    sx={{ bgcolor: 'transparent', boxShadow: 'none', maxHeight: 500 }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {['Slug', 'Model', 'Latency', 'Sources', 'Chunks', 'Time'].map((h) => (
                            <TableCell
                              key={h}
                              sx={{
                                bgcolor: palette.bgCard,
                                color: palette.textMuted,
                                borderColor: palette.border,
                                fontWeight: 600,
                              }}
                            >
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.recentChatQueries.map((q, i) => (
                          <TableRow key={i} hover>
                            <TableCell sx={{ borderColor: palette.border }}>
                              <Chip
                                label={String(q.slug || '—')}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(0, 237, 100, 0.08)',
                                  color: palette.accent,
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ borderColor: palette.border, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              {String(q.model || '—')}
                            </TableCell>
                            <TableCell sx={{ borderColor: palette.border, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              {q.latencyMs ? `${Number(q.latencyMs).toLocaleString()}ms` : '—'}
                            </TableCell>
                            <TableCell sx={{ borderColor: palette.border, fontSize: '0.8rem' }}>
                              {Array.isArray(q.sources) ? (q.sources as string[]).length : '—'}
                            </TableCell>
                            <TableCell sx={{ borderColor: palette.border, fontSize: '0.8rem' }}>
                              {String(q.contextChunks ?? '—')}
                            </TableCell>
                            <TableCell sx={{ borderColor: palette.border, fontSize: '0.8rem', color: palette.textDim }}>
                              {q.timestamp ? new Date(String(q.timestamp)).toLocaleString() : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
        {stats && activeTab === 'game' && (
          <>
            {/* Game Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total Sessions"
                  value={stats.game?.sessionCount || 0}
                  icon={<SportsEsportsIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Avg Score"
                  value={stats.game?.avgScore || 0}
                  icon={<TrendingUpIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total Play Time"
                  value={
                    stats.game?.totalPlayTimeMs
                      ? `${Math.round(stats.game.totalPlayTimeMs / 60000)}m`
                      : '0m'
                  }
                  icon={<TimelineIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="High Score"
                  value={stats.game?.highScores?.[0]?.score || 0}
                  icon={<BarChartIcon sx={{ color: palette.accent }} />}
                  subtitle={
                    stats.game?.highScores?.[0]
                      ? `Wave ${stats.game.highScores[0].wave}`
                      : undefined
                  }
                />
              </Grid>
            </Grid>

            {/* High Scores Leaderboard */}
            {stats.game?.highScores?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SportsEsportsIcon sx={{ color: palette.accent, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      High Scores Leaderboard
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['#', 'Score', 'Wave', 'Duration', 'Country', 'Platform', 'Date'].map((h) => (
                            <TableCell key={h} sx={{ color: palette.textMuted, borderColor: palette.border, fontWeight: 600 }}>
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.game.highScores.map((hs, i) => (
                          <TableRow key={i} hover>
                            <TableCell sx={{ borderColor: palette.border, fontWeight: 700, color: i < 3 ? palette.accent : palette.text }}>
                              {i + 1}
                            </TableCell>
                            <TableCell sx={{ borderColor: palette.border, fontWeight: 700, fontFamily: 'monospace' }}>
                              {hs.score.toLocaleString()}
                            </TableCell>
                            <TableCell sx={{ borderColor: palette.border }}>{hs.wave}</TableCell>
                            <TableCell sx={{ borderColor: palette.border, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              {hs.durationMs ? `${Math.round(hs.durationMs / 1000)}s` : '—'}
                            </TableCell>
                            <TableCell sx={{ borderColor: palette.border }}>{hs.country || '—'}</TableCell>
                            <TableCell sx={{ borderColor: palette.border, fontSize: '0.8rem' }}>{hs.platform || '—'}</TableCell>
                            <TableCell sx={{ borderColor: palette.border, fontSize: '0.8rem', color: palette.textDim }}>
                              {hs.receivedAt ? new Date(hs.receivedAt).toLocaleDateString() : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}

            {/* Score Distribution */}
            {stats.game?.scoreDistribution?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BarChartIcon sx={{ color: palette.purple }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Score Distribution</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 280 }}>
                  <BarChart
                    xAxis={[{
                      data: stats.game.scoreDistribution.map((d) => d.bucket),
                      scaleType: 'band',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                    }]}
                    yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={[{ data: stats.game.scoreDistribution.map((d) => d.count), color: palette.purple }]}
                    height={260}
                  />
                </Box>
              </Card>
            )}

            {/* Wave Distribution */}
            {stats.game?.waveDistribution?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BarChartIcon sx={{ color: palette.blue }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Wave Distribution</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 280 }}>
                  <BarChart
                    xAxis={[{
                      data: stats.game.waveDistribution.map((d) => `Wave ${d.wave}`),
                      scaleType: 'band',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                    }]}
                    yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={[{ data: stats.game.waveDistribution.map((d) => d.count), color: palette.blue }]}
                    height={260}
                  />
                </Box>
              </Card>
            )}

            {/* Daily Game Activity */}
            {stats.game?.dailyActivity?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TimelineIcon sx={{ color: palette.accent }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Daily Game Activity</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 280 }}>
                  <LineChart
                    xAxis={[{
                      data: stats.game.dailyActivity.map((d) => new Date(d.date)),
                      scaleType: 'time',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                    }]}
                    yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={[
                      { data: stats.game.dailyActivity.map((d) => d.starts), color: palette.accent, label: 'Starts', showMark: false },
                      { data: stats.game.dailyActivity.map((d) => d.ends), color: palette.purple, label: 'Game Overs', showMark: false },
                    ]}
                    height={260}
                  />
                </Box>
              </Card>
            )}

            {/* Game by Country & Trigger */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.game?.byCountry?.length > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <DataTable
                    title="Game by Country"
                    icon={<PublicIcon sx={{ color: palette.blue, fontSize: 20 }} />}
                    rows={stats.game.byCountry}
                    labelKey="country"
                    valueKey="count"
                  />
                </Grid>
              )}
              {stats.game?.byTrigger?.length > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <DataTable
                    title="Trigger Method"
                    icon={<TouchAppIcon sx={{ color: palette.purple, fontSize: 20 }} />}
                    rows={stats.game.byTrigger}
                    labelKey="trigger"
                    valueKey="count"
                  />
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}
