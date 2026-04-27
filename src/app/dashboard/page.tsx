'use client';

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  MenuItem,
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
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import InsightsIcon from '@mui/icons-material/Insights';
import HubIcon from '@mui/icons-material/Hub';
import { BarChart, LineChart, PieChart } from '@mui/x-charts';
import nextDynamic from 'next/dynamic';
import { palette } from '@/theme/theme';

const DASHBOARD_TABS = [
  'overview',
  'commands',
  'models',
  'workflows',
  'usecases',
  'errors',
  'game',
] as const;

const DAY_OPTIONS = ['7', '30', '90', '365'] as const;
const MODEL_LOCAL_OPTIONS = ['all', 'local', 'remote'] as const;

type DashboardTab = (typeof DASHBOARD_TABS)[number];
type DayOption = (typeof DAY_OPTIONS)[number];
type ModelLocalFilter = (typeof MODEL_LOCAL_OPTIONS)[number];

// Lazy-load the map (SSR-unfriendly SVG library)
const WorldMap = nextDynamic(() => import('@/components/WorldMap'), {
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
  commands: {
    commandBreakdown: { event: string; count: number }[];
    commandTiming: { event: string; avgMs: number; maxMs: number; count: number }[];
    pipelineStrategies: { strategy: string; count: number }[];
  };
  models: {
    modelDistribution: { model: string; count: number }[];
    modelBreakdown: {
      model: string;
      role: string;
      event: string;
      context: string;
      local: boolean;
      count: number;
    }[];
    modelTimeline: {
      date: string;
      model: string;
      role: string;
      event: string;
      context: string;
      local: boolean;
      count: number;
    }[];
    modelRoleBreakdown: { role: string; count: number }[];
    modelEventBreakdown: { model: string; event: string; role: string; count: number }[];
    localVsRemote: { local: boolean; count: number }[];
    asymmetricPairs: { embedModel: string; rerankModel: string; count: number }[];
  };
  workflows: {
    workflowRuns: { workflowName: string; count: number }[];
    workflowInstalls: { packageName: string; count: number }[];
    workflowOrigin: { builtin: number; community: number; other: number };
  };
  errors: {
    errorsByCommand: { command: string; count: number }[];
    errorsByType: { errorType: string; count: number }[];
    dailyErrors: { date: string; count: number }[];
    errorsByVersion: { version: string; count: number }[];
  };
  contextTimeline: { date: string; context: string; count: number }[];
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
            bgcolor: 'rgba(0, 212, 170, 0.1)',
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
                        bgcolor: 'rgba(0, 212, 170, 0.08)',
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

function truncateLabel(value: unknown, max = 26) {
  const normalized = typeof value === 'string' ? value : String(value ?? 'unknown');
  return normalized.length > max ? `${normalized.slice(0, max)}…` : normalized;
}

function aggregateCounts<T extends string>(
  rows: Array<{ count: number } & Record<T, string>>,
  key: T
) {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const bucket = row[key] || 'unknown';
    counts.set(bucket, (counts.get(bucket) || 0) + row.count);
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

function buildModelTimelineChart(
  timelineRows: Stats['models']['modelTimeline'],
  breakdownRows: Stats['models']['modelBreakdown'],
  limit = 5
) {
  if (!timelineRows.length) {
    return { dates: [] as Date[], series: [] as { label: string; data: number[]; color: string }[] };
  }

  const topModels = aggregateCounts(breakdownRows, 'model')
    .slice(0, limit)
    .map((row) => row.value);

  const dateKeys = Array.from(new Set(timelineRows.map((point) => point.date))).sort();
  const lookup = new Map<string, number>();
  timelineRows.forEach((point) => {
    const key = `${point.date}::${point.model}`;
    lookup.set(key, (lookup.get(key) || 0) + point.count);
  });

  const chartColors = [
    palette.accent,
    palette.blue,
    palette.purple,
    palette.yellow,
    palette.red,
  ];

  return {
    dates: dateKeys.map((date) => new Date(date)),
    series: topModels.map((model, index) => ({
      label: truncateLabel(model, 22),
      data: dateKeys.map((date) => lookup.get(`${date}::${model}`) || 0),
      color: chartColors[index % chartColors.length],
    })),
  };
}

function buildRolePieData(rows: Stats['models']['modelBreakdown']) {
  const roleColors: Record<string, string> = {
    embedding: palette.accent,
    rerank: palette.blue,
    llm: palette.purple,
  };

  return aggregateCounts(rows, 'role').map((item, index) => ({
    id: item.value || `role-${index}`,
    value: item.count,
    label: item.value || 'unknown',
    color: roleColors[item.value] || palette.yellow,
  }));
}

function buildLocalVsRemotePieData(rows: Stats['models']['modelBreakdown']) {
  const localCount = rows
    .filter((row) => row.local)
    .reduce((sum, row) => sum + row.count, 0);
  const remoteCount = rows
    .filter((row) => !row.local)
    .reduce((sum, row) => sum + row.count, 0);

  return [
    { id: 'local', value: localCount, label: 'Local', color: palette.accent },
    { id: 'remote', value: remoteCount, label: 'Remote', color: palette.blue },
  ].filter((item) => item.value > 0);
}

function normalizeQueryFilter(value: string | null, allowedValues?: string[]) {
  if (!value || value === 'all') return 'all';
  if (allowedValues && !allowedValues.includes(value)) return 'all';
  return value;
}

function DashboardLoadingFallback() {
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

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdminTelemetryView = pathname.startsWith('/admin');
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const daysParam = searchParams.get('days');
  const tabParam = searchParams.get('tab');
  const contextParam = searchParams.get('context');
  const eventParam = searchParams.get('event');
  const roleParam = searchParams.get('role');
  const localParam = searchParams.get('local');

  const days: DayOption = DAY_OPTIONS.includes(daysParam as DayOption) ? (daysParam as DayOption) : '30';
  const activeTab: DashboardTab = DASHBOARD_TABS.includes(tabParam as DashboardTab)
    ? (tabParam as DashboardTab)
    : 'overview';
  const modelContextFilter = contextParam || 'all';
  const modelEventFilter = eventParam || 'all';
  const modelRoleFilter = roleParam || 'all';
  const modelLocalFilter: ModelLocalFilter = MODEL_LOCAL_OPTIONS.includes(localParam as ModelLocalFilter)
    ? (localParam as ModelLocalFilter)
    : 'all';

  useEffect(() => {
    let cancelled = false;
    const stored = localStorage.getItem('vai_dashboard_key');

    async function bootstrapAuth() {
      if (stored) {
        if (!cancelled) {
          setApiKey(stored);
          setAuthenticated(true);
          setAuthResolved(true);
        }
        return;
      }

      if (!isAdminTelemetryView) {
        if (!cancelled) {
          setAuthResolved(true);
        }
        return;
      }

      try {
        const res = await fetch('/api/admin/session', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin',
        });
        const data = await res.json().catch(() => ({}));

        if (!cancelled && data.authenticated) {
          setAuthenticated(true);
        }
      } finally {
        if (!cancelled) {
          setAuthResolved(true);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, [isAdminTelemetryView]);

  const fetchStats = useCallback(async () => {
    const canUseAdminSession = isAdminTelemetryView && !apiKey;
    if (!apiKey && !canUseAdminSession) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ days });
      if (apiKey) {
        params.set('API_KEY', apiKey);
      }

      const res = await fetch(`/api/telemetry/stats?${params.toString()}`, {
        credentials: 'same-origin',
      });

      if (res.status === 401) {
        setError(apiKey ? 'Invalid API key' : 'Admin session expired');
        setAuthenticated(false);
        if (apiKey) {
          localStorage.removeItem('vai_dashboard_key');
        }
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
      setAuthenticated(true);
      if (apiKey) {
        localStorage.setItem('vai_dashboard_key', apiKey);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [apiKey, days, isAdminTelemetryView]);

  useEffect(() => {
    if (authResolved && authenticated && (apiKey || isAdminTelemetryView)) {
      fetchStats();
    }
  }, [authResolved, authenticated, days, fetchStats, apiKey, isAdminTelemetryView]);

  const modelFilterOptions = useMemo(() => {
    const rows = stats?.models?.modelBreakdown || [];

    return {
      contexts: aggregateCounts(rows, 'context').map((row) => row.value),
      events: aggregateCounts(rows, 'event').map((row) => row.value),
      roles: aggregateCounts(rows, 'role').map((row) => row.value),
    };
  }, [stats]);

  const selectedModelContextFilter = useMemo(
    () => normalizeQueryFilter(modelContextFilter, modelFilterOptions.contexts),
    [modelContextFilter, modelFilterOptions.contexts]
  );
  const selectedModelEventFilter = useMemo(
    () => normalizeQueryFilter(modelEventFilter, modelFilterOptions.events),
    [modelEventFilter, modelFilterOptions.events]
  );
  const selectedModelRoleFilter = useMemo(
    () => normalizeQueryFilter(modelRoleFilter, modelFilterOptions.roles),
    [modelRoleFilter, modelFilterOptions.roles]
  );

  const updateDashboardQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'all') {
          params.delete(key);
          return;
        }

        params.set(key, value);
      });

      const nextQuery = params.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const filteredModelBreakdown = useMemo(() => {
    const rows = stats?.models?.modelBreakdown || [];

    return rows.filter((row) => {
      if (selectedModelContextFilter !== 'all' && row.context !== selectedModelContextFilter) return false;
      if (selectedModelEventFilter !== 'all' && row.event !== selectedModelEventFilter) return false;
      if (selectedModelRoleFilter !== 'all' && row.role !== selectedModelRoleFilter) return false;
      if (modelLocalFilter === 'local' && !row.local) return false;
      if (modelLocalFilter === 'remote' && row.local) return false;
      return true;
    });
  }, [stats, selectedModelContextFilter, selectedModelEventFilter, selectedModelRoleFilter, modelLocalFilter]);

  const filteredModelTimeline = useMemo(() => {
    const rows = stats?.models?.modelTimeline || [];

    return rows.filter((row) => {
      if (selectedModelContextFilter !== 'all' && row.context !== selectedModelContextFilter) return false;
      if (selectedModelEventFilter !== 'all' && row.event !== selectedModelEventFilter) return false;
      if (selectedModelRoleFilter !== 'all' && row.role !== selectedModelRoleFilter) return false;
      if (modelLocalFilter === 'local' && !row.local) return false;
      if (modelLocalFilter === 'remote' && row.local) return false;
      return true;
    });
  }, [stats, selectedModelContextFilter, selectedModelEventFilter, selectedModelRoleFilter, modelLocalFilter]);

  const filteredModelDistribution = useMemo(
    () => aggregateCounts(filteredModelBreakdown, 'model').map((row) => ({ model: row.value, count: row.count })),
    [filteredModelBreakdown]
  );

  const filteredModelEventBreakdown = useMemo(() => {
    const counts = new Map<string, { model: string; event: string; role: string; count: number }>();

    filteredModelBreakdown.forEach((row) => {
      const key = `${row.model}::${row.event}::${row.role}`;
      const existing = counts.get(key);
      if (existing) {
        existing.count += row.count;
        return;
      }

      counts.set(key, {
        model: row.model,
        event: row.event,
        role: row.role,
        count: row.count,
      });
    });

    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  }, [filteredModelBreakdown]);

  const filteredAsymmetricPairs = useMemo(() => {
    const pairs = stats?.models?.asymmetricPairs || [];

    return pairs.filter((row) => {
      if (selectedModelRoleFilter !== 'all' && selectedModelRoleFilter !== 'embedding') return false;
      if (selectedModelEventFilter !== 'all' && selectedModelEventFilter !== 'cli_query') return false;
      if (modelLocalFilter === 'local' && row.embedModel !== 'voyage-4-nano') return false;
      if (modelLocalFilter === 'remote' && row.embedModel === 'voyage-4-nano') return false;
      return true;
    });
  }, [stats, selectedModelRoleFilter, selectedModelEventFilter, modelLocalFilter]);

  const modelTimelineChart = useMemo(
    () => buildModelTimelineChart(filteredModelTimeline, filteredModelBreakdown),
    [filteredModelTimeline, filteredModelBreakdown]
  );
  const modelRolePieData = useMemo(
    () => buildRolePieData(filteredModelBreakdown),
    [filteredModelBreakdown]
  );
  const localVsRemotePieData = useMemo(
    () => buildLocalVsRemotePieData(filteredModelBreakdown),
    [filteredModelBreakdown]
  );
  const localModelMentions = filteredModelBreakdown
    .filter((item) => item.local)
    .reduce((sum, item) => sum + item.count, 0);
  const remoteModelMentions = filteredModelBreakdown
    .filter((item) => !item.local)
    .reduce((sum, item) => sum + item.count, 0);

  if (!authResolved) {
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
              onChange={(_, v) => {
                if (v) {
                  updateDashboardQuery({ days: v === '30' ? null : v });
                }
              }}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: palette.textMuted,
                  borderColor: palette.border,
                  '&.Mui-selected': {
                    color: palette.accent,
                    bgcolor: 'rgba(0, 212, 170, 0.1)',
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
            onChange={(_, v) => {
              if (v) {
                updateDashboardQuery({ tab: v === 'overview' ? null : v });
              }
            }}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                color: palette.textMuted,
                borderColor: palette.border,
                px: 3,
                '&.Mui-selected': {
                  color: palette.accent,
                  bgcolor: 'rgba(0, 212, 170, 0.1)',
                },
              },
            }}
          >
            <ToggleButton value="overview">Overview</ToggleButton>
            <ToggleButton value="commands">Commands</ToggleButton>
            <ToggleButton value="models">Models</ToggleButton>
            <ToggleButton value="workflows">Workflows</ToggleButton>
            <ToggleButton value="usecases">Use Cases</ToggleButton>
            <ToggleButton value="errors">Errors</ToggleButton>
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
                                bgcolor: 'rgba(0, 212, 170, 0.08)',
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
                                  bgcolor: 'rgba(0, 212, 170, 0.08)',
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
        {stats && activeTab === 'commands' && (
          <>
            {/* Command Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total Command Executions"
                  value={stats.commands?.commandBreakdown?.reduce((s, e) => s + e.count, 0) || 0}
                  icon={<TerminalIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Unique Commands"
                  value={stats.commands?.commandBreakdown?.length || 0}
                  icon={<BarChartIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Avg Execution Time"
                  value={
                    stats.commands?.commandTiming?.length
                      ? `${Math.round(stats.commands.commandTiming.reduce((s, e) => s + e.avgMs * e.count, 0) / stats.commands.commandTiming.reduce((s, e) => s + e.count, 0))}ms`
                      : '—'
                  }
                  icon={<SpeedIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Error Rate"
                  value={
                    (() => {
                      const totalCmd = stats.commands?.commandBreakdown?.reduce((s, e) => s + e.count, 0) || 0;
                      const totalErr = stats.errors?.errorsByCommand?.reduce((s, e) => s + e.count, 0) || 0;
                      return totalCmd > 0 ? `${((totalErr / totalCmd) * 100).toFixed(1)}%` : '—';
                    })()
                  }
                  icon={<ErrorOutlineIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
            </Grid>

            {/* Command Frequency Chart */}
            {stats.commands?.commandBreakdown?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TerminalIcon sx={{ color: palette.accent }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Command Frequency (Top 15)</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 300 }}>
                  <BarChart
                    xAxis={[{
                      data: stats.commands.commandBreakdown.slice(0, 15).map((e) => e.event.replace('cli_', '')),
                      scaleType: 'band',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 10, angle: -30 },
                    }]}
                    yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={[{ data: stats.commands.commandBreakdown.slice(0, 15).map((e) => e.count), color: palette.accent }]}
                    height={280}
                  />
                </Box>
              </Card>
            )}

            {/* Command Timing & Pipeline Strategies */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.commands?.commandTiming?.length > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}` }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <SpeedIcon sx={{ color: palette.blue, fontSize: 20 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Command Timing</Typography>
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ color: palette.textMuted, borderColor: palette.border }}>Event</TableCell>
                              <TableCell align="right" sx={{ color: palette.textMuted, borderColor: palette.border }}>Avg (ms)</TableCell>
                              <TableCell align="right" sx={{ color: palette.textMuted, borderColor: palette.border }}>Max (ms)</TableCell>
                              <TableCell align="right" sx={{ color: palette.textMuted, borderColor: palette.border }}>Count</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stats.commands.commandTiming.slice(0, 15).map((row, i) => (
                              <TableRow key={i}>
                                <TableCell sx={{ borderColor: palette.border }}>
                                  <Chip label={row.event} size="small" sx={{ bgcolor: 'rgba(0, 212, 170, 0.08)', color: palette.accent, fontFamily: 'monospace', fontSize: '0.8rem' }} />
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, borderColor: palette.border, fontFamily: 'monospace' }}>{row.avgMs.toLocaleString()}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, borderColor: palette.border, fontFamily: 'monospace' }}>{row.maxMs.toLocaleString()}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, borderColor: palette.border }}>{row.count.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {stats.commands?.pipelineStrategies?.length > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <DataTable
                    title="Pipeline Chunk Strategies"
                    icon={<AccountTreeIcon sx={{ color: palette.purple, fontSize: 20 }} />}
                    rows={stats.commands.pipelineStrategies}
                    labelKey="strategy"
                    valueKey="count"
                  />
                </Grid>
              )}
            </Grid>
          </>
        )}

        {stats && activeTab === 'models' && (
          <>
            <Card
              sx={{
                bgcolor: palette.bgSurface,
                border: `1px solid ${palette.border}`,
                mb: 4,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 2,
                    flexDirection: { xs: 'column', md: 'row' },
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Model Filters
                    </Typography>
                    <Typography variant="body2" sx={{ color: palette.textMuted }}>
                      Slice the models view by context, event family, role, and local usage.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      updateDashboardQuery({
                        context: null,
                        event: null,
                        role: null,
                        local: null,
                      })
                    }
                    sx={{
                      borderColor: palette.border,
                      color: palette.text,
                    }}
                  >
                    Reset Filters
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Context"
                      value={selectedModelContextFilter}
                      onChange={(e) =>
                        updateDashboardQuery({
                          context: e.target.value === 'all' ? null : e.target.value,
                        })
                      }
                    >
                      <MenuItem value="all">All contexts</MenuItem>
                      {modelFilterOptions.contexts.map((context) => (
                        <MenuItem key={context} value={context}>
                          {context}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Event"
                      value={selectedModelEventFilter}
                      onChange={(e) =>
                        updateDashboardQuery({
                          event: e.target.value === 'all' ? null : e.target.value,
                        })
                      }
                    >
                      <MenuItem value="all">All events</MenuItem>
                      {modelFilterOptions.events.map((event) => (
                        <MenuItem key={event} value={event}>
                          {event}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Role"
                      value={selectedModelRoleFilter}
                      onChange={(e) =>
                        updateDashboardQuery({
                          role: e.target.value === 'all' ? null : e.target.value,
                        })
                      }
                    >
                      <MenuItem value="all">All roles</MenuItem>
                      {modelFilterOptions.roles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Transport"
                      value={modelLocalFilter}
                      onChange={(e) =>
                        updateDashboardQuery({
                          local: e.target.value === 'all' ? null : e.target.value,
                        })
                      }
                    >
                      <MenuItem value="all">All usage</MenuItem>
                      <MenuItem value="local">Local only</MenuItem>
                      <MenuItem value="remote">Remote only</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Model Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Most Mentioned Model"
                  value={filteredModelDistribution[0]?.model || '—'}
                  icon={<ModelTrainingIcon sx={{ color: palette.accent }} />}
                  subtitle={
                    filteredModelDistribution[0]
                      ? `${filteredModelDistribution[0].count} mentions`
                      : undefined
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Models Tracked"
                  value={filteredModelDistribution.length}
                  icon={<BarChartIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Local Model Mentions"
                  value={localModelMentions}
                  icon={<DevicesIcon sx={{ color: palette.accent }} />}
                  subtitle={
                    remoteModelMentions > 0
                      ? `${((localModelMentions / (localModelMentions + remoteModelMentions)) * 100).toFixed(1)}% of tracked usage`
                      : undefined
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total Model Mentions"
                  value={filteredModelBreakdown.reduce((s, e) => s + e.count, 0)}
                  icon={<TrendingUpIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
            </Grid>

            {filteredModelBreakdown.length === 0 && (
              <Alert severity="info" sx={{ mb: 4 }}>
                No model telemetry matches the current filters.
              </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {filteredModelDistribution.length > 0 && (
                <Grid size={{ xs: 12, xl: 7 }}>
                  <Card
                    sx={{
                      bgcolor: palette.bgSurface,
                      border: `1px solid ${palette.border}`,
                      height: '100%',
                      p: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <ModelTrainingIcon sx={{ color: palette.accent }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Model Distribution
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 320 }}>
                      <BarChart
                        xAxis={[
                          {
                            data: filteredModelDistribution
                              .slice(0, 12)
                              .map((e) => truncateLabel(e.model, 20)),
                            scaleType: 'band',
                            tickLabelStyle: { fill: palette.textMuted, fontSize: 10, angle: -30 },
                          },
                        ]}
                        yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                        series={[
                          {
                            data: filteredModelDistribution.slice(0, 12).map((e) => e.count),
                            color: palette.purple,
                            label: 'Mentions',
                          },
                        ]}
                        height={300}
                      />
                    </Box>
                  </Card>
                </Grid>
              )}

              {modelRolePieData.length > 0 && (
                <Grid size={{ xs: 12, md: 6, xl: 2.5 }}>
                  <Card
                    sx={{
                      bgcolor: palette.bgSurface,
                      border: `1px solid ${palette.border}`,
                      height: '100%',
                      p: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <HubIcon sx={{ color: palette.blue }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Role Mix
                      </Typography>
                    </Box>
                    <PieChart
                      height={240}
                      series={[
                        {
                          data: modelRolePieData,
                          innerRadius: 48,
                          outerRadius: 88,
                          paddingAngle: 2,
                          cornerRadius: 4,
                        },
                      ]}
                      slotProps={{
                        legend: {
                          direction: 'vertical',
                          position: { vertical: 'middle', horizontal: 'end' },
                        },
                      }}
                    />
                  </Card>
                </Grid>
              )}

              {localVsRemotePieData.length > 0 && (
                <Grid size={{ xs: 12, md: 6, xl: 2.5 }}>
                  <Card
                    sx={{
                      bgcolor: palette.bgSurface,
                      border: `1px solid ${palette.border}`,
                      height: '100%',
                      p: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <DevicesIcon sx={{ color: palette.accent }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Local vs Remote
                      </Typography>
                    </Box>
                    <PieChart
                      height={240}
                      series={[
                        {
                          data: localVsRemotePieData,
                          innerRadius: 48,
                          outerRadius: 88,
                          paddingAngle: 2,
                          cornerRadius: 4,
                        },
                      ]}
                      slotProps={{
                        legend: {
                          direction: 'vertical',
                          position: { vertical: 'middle', horizontal: 'end' },
                        },
                      }}
                    />
                  </Card>
                </Grid>
              )}
            </Grid>

            {modelTimelineChart.series.length > 0 && (
              <Card
                sx={{
                  bgcolor: palette.bgSurface,
                  border: `1px solid ${palette.border}`,
                  mb: 4,
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <InsightsIcon sx={{ color: palette.accent }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Model Usage Over Time
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', height: 320 }}>
                  <LineChart
                    xAxis={[
                      {
                        data: modelTimelineChart.dates,
                        scaleType: 'time',
                        tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                      },
                    ]}
                    yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={modelTimelineChart.series.map((series) => ({
                      data: series.data,
                      label: series.label,
                      color: series.color,
                      showMark: false,
                    }))}
                    height={300}
                    slotProps={{
                      legend: {
                        direction: 'horizontal',
                        position: { vertical: 'top', horizontal: 'center' },
                      },
                    }}
                  />
                </Box>
              </Card>
            )}

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {filteredModelEventBreakdown.length > 0 && (
                <Grid size={{ xs: 12, lg: 7 }}>
                  <Card
                    sx={{
                      bgcolor: palette.bgSurface,
                      border: `1px solid ${palette.border}`,
                      height: '100%',
                      p: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <BarChartIcon sx={{ color: palette.blue }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Top Model and Event Combinations
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 340 }}>
                      <BarChart
                        layout="horizontal"
                        yAxis={[
                          {
                            data: filteredModelEventBreakdown
                              .slice(0, 10)
                              .map((row) =>
                                truncateLabel(
                                  `${String(row.model ?? 'unknown')} · ${String(row.event ?? 'unknown').replace(/^cli_/, '')}`,
                                  32
                                )
                              ),
                            scaleType: 'band',
                            tickLabelStyle: { fill: palette.textMuted, fontSize: 10 },
                          },
                        ]}
                        xAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                        series={[
                          {
                            data: filteredModelEventBreakdown.slice(0, 10).map((row) => row.count),
                            color: palette.blue,
                            label: 'Mentions',
                          },
                        ]}
                        height={320}
                      />
                    </Box>
                  </Card>
                </Grid>
              )}

              {filteredModelEventBreakdown.length > 0 && (
                <Grid size={{ xs: 12, lg: 5 }}>
                  <DataTable
                    title="Top Model / Event Rows"
                    icon={<HubIcon sx={{ color: palette.purple, fontSize: 20 }} />}
                    rows={filteredModelEventBreakdown.slice(0, 12).map((row) => ({
                      label: `${truncateLabel(row.model, 16)} · ${String(row.event ?? 'unknown').replace(/^cli_/, '')}`,
                      count: row.count,
                    }))}
                    labelKey="label"
                    valueKey="count"
                    maxRows={12}
                  />
                </Grid>
              )}
            </Grid>

            {filteredAsymmetricPairs.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <DevicesIcon sx={{ color: palette.blue, fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Asymmetric Retrieval Pairs
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: palette.textMuted, borderColor: palette.border }}>
                            Embed Model
                          </TableCell>
                          <TableCell sx={{ color: palette.textMuted, borderColor: palette.border }}>
                            Rerank Model
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
                        {filteredAsymmetricPairs.slice(0, 15).map((row, i) => (
                          <TableRow key={i}>
                            <TableCell sx={{ borderColor: palette.border }}>
                              <Chip
                                label={row.embedModel}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(0, 212, 170, 0.08)',
                                  color: palette.accent,
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ borderColor: palette.border }}>
                              <Chip
                                label={row.rerankModel}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                                  color: palette.blue,
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                }}
                              />
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: 600, borderColor: palette.border }}
                            >
                              {row.count.toLocaleString()}
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

        {stats && activeTab === 'workflows' && (
          <>
            {/* Workflow Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total Workflow Runs"
                  value={stats.workflows?.workflowRuns?.reduce((s, e) => s + e.count, 0) || 0}
                  icon={<AccountTreeIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Unique Workflows"
                  value={stats.workflows?.workflowRuns?.length || 0}
                  icon={<BarChartIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Community Installs"
                  value={stats.workflows?.workflowInstalls?.reduce((s, e) => s + e.count, 0) || 0}
                  icon={<DownloadForOfflineIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Builtin vs Community"
                  value={`${stats.workflows?.workflowOrigin?.builtin || 0} / ${stats.workflows?.workflowOrigin?.community || 0}`}
                  icon={<DevicesIcon sx={{ color: palette.accent }} />}
                  subtitle="builtin / community runs"
                />
              </Grid>
            </Grid>

            {/* Top Workflows Chart */}
            {stats.workflows?.workflowRuns?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AccountTreeIcon sx={{ color: palette.accent }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Top Workflows by Run Count</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 300 }}>
                  <BarChart
                    xAxis={[{
                      data: stats.workflows.workflowRuns.slice(0, 15).map((e) => e.workflowName),
                      scaleType: 'band',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 10, angle: -30 },
                    }]}
                    yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={[{ data: stats.workflows.workflowRuns.slice(0, 15).map((e) => e.count), color: palette.accent }]}
                    height={280}
                  />
                </Box>
              </Card>
            )}

            {/* Workflow Installs Table */}
            {stats.workflows?.workflowInstalls?.length > 0 && (
              <DataTable
                title="Workflow Installs"
                icon={<DownloadForOfflineIcon sx={{ color: palette.blue, fontSize: 20 }} />}
                rows={stats.workflows.workflowInstalls}
                labelKey="packageName"
                valueKey="count"
              />
            )}
          </>
        )}

        {stats && activeTab === 'errors' && (
          <>
            {/* Error Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total Errors"
                  value={stats.errors?.errorsByCommand?.reduce((s, e) => s + e.count, 0) || 0}
                  icon={<ErrorOutlineIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Error Rate"
                  value={
                    (() => {
                      const totalCmd = stats.commands?.commandBreakdown?.reduce((s, e) => s + e.count, 0) || 0;
                      const totalErr = stats.errors?.errorsByCommand?.reduce((s, e) => s + e.count, 0) || 0;
                      return totalCmd > 0 ? `${((totalErr / totalCmd) * 100).toFixed(1)}%` : '—';
                    })()
                  }
                  icon={<TrendingUpIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Most Errored Command"
                  value={stats.errors?.errorsByCommand?.[0]?.command || '—'}
                  icon={<TerminalIcon sx={{ color: palette.accent }} />}
                  subtitle={stats.errors?.errorsByCommand?.[0] ? `${stats.errors.errorsByCommand[0].count} errors` : undefined}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Error Types"
                  value={stats.errors?.errorsByType?.length || 0}
                  icon={<BarChartIcon sx={{ color: palette.accent }} />}
                />
              </Grid>
            </Grid>

            {/* Errors by Command Chart */}
            {stats.errors?.errorsByCommand?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TerminalIcon sx={{ color: palette.accent }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Errors by Command</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 280 }}>
                  <BarChart
                    xAxis={[{
                      data: stats.errors.errorsByCommand.slice(0, 15).map((e) => e.command),
                      scaleType: 'band',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 10, angle: -30 },
                    }]}
                    yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={[{ data: stats.errors.errorsByCommand.slice(0, 15).map((e) => e.count), color: '#ff6b6b' }]}
                    height={260}
                  />
                </Box>
              </Card>
            )}

            {/* Errors by Type Chart */}
            {stats.errors?.errorsByType?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ErrorOutlineIcon sx={{ color: '#ff6b6b' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Errors by Type</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 280 }}>
                  <BarChart
                    xAxis={[{
                      data: stats.errors.errorsByType.map((e) => e.errorType),
                      scaleType: 'band',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 10, angle: -30 },
                    }]}
                    yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={[{ data: stats.errors.errorsByType.map((e) => e.count), color: palette.purple }]}
                    height={260}
                  />
                </Box>
              </Card>
            )}

            {/* Daily Error Rate */}
            {stats.errors?.dailyErrors?.length > 0 && (
              <Card sx={{ bgcolor: palette.bgSurface, border: `1px solid ${palette.border}`, mb: 4, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TimelineIcon sx={{ color: '#ff6b6b' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Daily Error Rate</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 280 }}>
                  <LineChart
                    xAxis={[{
                      data: stats.errors.dailyErrors.map((d) => new Date(d.date)),
                      scaleType: 'time',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                    }]}
                    yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                    series={[{
                      data: stats.errors.dailyErrors.map((d) => d.count),
                      color: '#ff6b6b',
                      area: true,
                      showMark: false,
                    }]}
                    height={260}
                  />
                </Box>
              </Card>
            )}

            {/* Errors by Version */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.errors?.errorsByVersion?.length > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <DataTable
                    title="Errors by Version"
                    icon={<BarChartIcon sx={{ color: palette.blue, fontSize: 20 }} />}
                    rows={stats.errors.errorsByVersion}
                    labelKey="version"
                    valueKey="count"
                  />
                </Grid>
              )}
              {stats.errors?.errorsByType?.length > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <DataTable
                    title="Error Types"
                    icon={<ErrorOutlineIcon sx={{ color: '#ff6b6b', fontSize: 20 }} />}
                    rows={stats.errors.errorsByType}
                    labelKey="errorType"
                    valueKey="count"
                  />
                </Grid>
              )}
            </Grid>
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
