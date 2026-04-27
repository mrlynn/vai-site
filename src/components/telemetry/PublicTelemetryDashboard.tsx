'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import ModelTrainingOutlinedIcon from '@mui/icons-material/ModelTrainingOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import { BarChart, LineChart, PieChart } from '@mui/x-charts';
import PublicTelemetryChartCard from '@/components/telemetry/PublicTelemetryChartCard';
import PublicTelemetryMethodology from '@/components/telemetry/PublicTelemetryMethodology';
import { palette } from '@/theme/theme';

type CountRow = {
  label: string;
  count: number;
};

type PublicTelemetryPayload = {
  meta: {
    schemaVersion: number;
    windowDays: number;
    dataThrough: string;
    generatedAt: string;
  };
  kpis: {
    totalEvents: number;
    activeSurfaces: number;
    countries: number;
  };
  dailyActivity: Array<{ date: string; count: number }>;
  surfaceMix: CountRow[];
  featureAreaMix: CountRow[];
  platformMix: CountRow[];
  versionMix: CountRow[];
  errorTrend: Array<{ date: string; count: number }>;
  errorCategories: CountRow[];
  topCommands: CountRow[];
  topModels: CountRow[];
};

const chartPalette = [
  palette.accent,
  palette.blue,
  palette.purple,
  palette.yellow,
  palette.red,
  palette.accentLight,
  '#7BD6FF',
  '#66E7B9',
];

function formatNumber(value: number) {
  return value.toLocaleString();
}

function truncateLabel(value: string, max = 18) {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function buildPieData(rows: CountRow[]) {
  return rows.map((row, index) => ({
    id: `${row.label}-${index}`,
    value: row.count,
    label: row.label,
    color: chartPalette[index % chartPalette.length],
  }));
}

function buildTimeSeries(rows: Array<{ date: string; count: number }>) {
  return rows.map((row) => ({
    date: new Date(`${row.date}T00:00:00Z`),
    count: row.count,
    label: row.date,
  }));
}

function hasRows(rows: CountRow[] | Array<{ date: string; count: number }>) {
  return rows.length > 0 && rows.some((row) => row.count > 0);
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: palette.bgSurface,
        border: `1px solid ${palette.border}`,
        boxShadow: '0 18px 50px rgba(0,0,0,0.16)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: palette.textMuted, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ color: palette.text, fontWeight: 800, letterSpacing: '-0.03em' }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: palette.textDim, lineHeight: 1.7 }}>
              {subtitle}
            </Typography>
          </Box>
          <Box
            sx={{
              flexShrink: 0,
              width: 48,
              height: 48,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0, 212, 170, 0.12)',
              color: palette.accent,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function PublicTelemetryDashboard() {
  const [payload, setPayload] = useState<PublicTelemetryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPublicTelemetry() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/telemetry/public', {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(
            response.status === 429
              ? 'The public telemetry snapshot is being rate limited right now. Please try again shortly.'
              : 'Unable to load the public telemetry dashboard right now.'
          );
        }

        const data = (await response.json()) as PublicTelemetryPayload;
        if (!controller.signal.aborted) {
          setPayload(data);
        }
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Unable to load the public telemetry dashboard right now.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPublicTelemetry();

    return () => controller.abort();
  }, []);

  const dailyActivitySeries = useMemo(
    () => buildTimeSeries(payload?.dailyActivity || []),
    [payload]
  );
  const errorTrendSeries = useMemo(
    () => buildTimeSeries(payload?.errorTrend || []),
    [payload]
  );
  const surfacePieData = useMemo(
    () => buildPieData(payload?.surfaceMix || []),
    [payload]
  );
  const featureAreaPieData = useMemo(
    () => buildPieData(payload?.featureAreaMix || []),
    [payload]
  );
  const platformPieData = useMemo(
    () => buildPieData(payload?.platformMix || []),
    [payload]
  );
  const versionPieData = useMemo(
    () => buildPieData(payload?.versionMix || []),
    [payload]
  );
  const errorCategoryPieData = useMemo(
    () => buildPieData(payload?.errorCategories || []),
    [payload]
  );

  if (loading && !payload) {
    return (
      <Box
        sx={{
          minHeight: 420,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 4,
          border: `1px solid ${palette.border}`,
          bgcolor: 'rgba(255,255,255,0.02)',
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress sx={{ color: palette.accent }} />
          <Typography variant="body2" sx={{ color: palette.textMuted }}>
            Loading the delayed public telemetry snapshot…
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error && !payload) {
    return (
      <Alert
        severity="error"
        sx={{
          bgcolor: 'rgba(255, 105, 96, 0.08)',
          color: palette.text,
          border: `1px solid rgba(255, 105, 96, 0.24)`,
        }}
      >
        {error}
      </Alert>
    );
  }

  if (!payload) {
    return (
      <Alert
        severity="info"
        sx={{
          bgcolor: 'rgba(64, 224, 255, 0.08)',
          color: palette.text,
          border: `1px solid rgba(64, 224, 255, 0.24)`,
        }}
      >
        No public telemetry snapshot is available yet.
      </Alert>
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
       
       
        sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between',  mb: 3 }}
      >
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Chip
            label={`Data through ${payload.meta.dataThrough}`}
            sx={{
              bgcolor: 'rgba(0, 212, 170, 0.12)',
              color: palette.accent,
              fontWeight: 700,
            }}
          />
          <Chip
            label={`${payload.meta.windowDays}-day fixed public window`}
            sx={{
              bgcolor: 'rgba(64, 224, 255, 0.12)',
              color: palette.blue,
              fontWeight: 700,
            }}
          />
          <Chip
            label="Delayed, grouped, thresholded"
            sx={{
              bgcolor: 'rgba(180, 90, 242, 0.12)',
              color: palette.purple,
              fontWeight: 700,
            }}
          />
        </Stack>

        {error && (
          <Typography variant="body2" sx={{ color: palette.textMuted }}>
            Showing the latest available public snapshot.
          </Typography>
        )}
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard
            title="Delayed telemetry events"
            value={formatNumber(payload.kpis.totalEvents)}
            subtitle={`Public aggregate events seen over the last ${payload.meta.windowDays} days.`}
            icon={<InsightsOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard
            title="Active product surfaces"
            value={payload.kpis.activeSurfaces}
            subtitle="High-level surfaces represented in the delayed snapshot."
            icon={<HubOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <KpiCard
            title="Represented countries"
            value={payload.kpis.countries}
            subtitle="Country count only. No city, region, or coordinates are published here."
            icon={<PublicOutlinedIcon />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <PublicTelemetryChartCard
            eyebrow="Activity"
            title="Daily delayed activity"
            description="A fixed-window view of total public telemetry events per day. This shows broad product activity over time, not recent or user-level behavior."
            icon={<TimelineOutlinedIcon sx={{ fontSize: 22 }} />}
            emptyMessage="Daily activity will appear here once delayed public data is available for this window."
          >
            {hasRows(payload.dailyActivity) ? (
              <Box sx={{ width: '100%', height: 290 }}>
                <LineChart
                  xAxis={[
                    {
                      data: dailyActivitySeries.map((point) => point.date),
                      scaleType: 'time',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                    },
                  ]}
                  yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                  series={[
                    {
                      data: dailyActivitySeries.map((point) => point.count),
                      color: palette.accent,
                      area: true,
                      showMark: false,
                    },
                  ]}
                  height={270}
                  sx={{
                    '& .MuiAreaElement-root': {
                      opacity: 0.22,
                    },
                  }}
                />
              </Box>
            ) : null}
          </PublicTelemetryChartCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <PublicTelemetryChartCard
            eyebrow="Surfaces"
            title="Surface mix"
            description="Counts are grouped into broad surfaces only, such as CLI, desktop, web, playground, and other."
            icon={<DevicesOutlinedIcon sx={{ fontSize: 22 }} />}
            emptyMessage="Surface mix is hidden when the delayed snapshot does not have enough safe aggregate data."
          >
            {surfacePieData.length > 0 ? (
              <PieChart
                height={260}
                series={[
                  {
                    data: surfacePieData,
                    innerRadius: 44,
                    outerRadius: 86,
                    paddingAngle: 2,
                    cornerRadius: 5,
                  },
                ]}
                slotProps={{
                  legend: {
                    direction: 'vertical',
                    position: { vertical: 'middle', horizontal: 'end' },
                  },
                }}
              />
            ) : null}
          </PublicTelemetryChartCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <PublicTelemetryChartCard
            eyebrow="Feature areas"
            title="What parts of the product are active"
            description="Events are grouped into public-safe product areas like lifecycle, embeddings, search, rerank, chat, workflows, docs/site, and other."
            icon={<HubOutlinedIcon sx={{ fontSize: 22 }} />}
            emptyMessage="Feature-area groupings appear only when enough delayed data can be published safely."
          >
            {featureAreaPieData.length > 0 ? (
              <PieChart
                height={280}
                series={[
                  {
                    data: featureAreaPieData,
                    innerRadius: 52,
                    outerRadius: 92,
                    paddingAngle: 2,
                    cornerRadius: 5,
                  },
                ]}
                slotProps={{
                  legend: {
                    direction: 'vertical',
                    position: { vertical: 'middle', horizontal: 'end' },
                  },
                }}
              />
            ) : null}
          </PublicTelemetryChartCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <PublicTelemetryChartCard
            eyebrow="Platforms"
            title="Platform health"
            description="Operating systems are grouped into broad public-safe buckets rather than exposing exact runtime signatures."
            icon={<DevicesOutlinedIcon sx={{ fontSize: 22 }} />}
            emptyMessage="Platform health will appear when grouped OS buckets clear the public threshold."
          >
            {platformPieData.length > 0 ? (
              <PieChart
                height={280}
                series={[
                  {
                    data: platformPieData,
                    innerRadius: 52,
                    outerRadius: 92,
                    paddingAngle: 2,
                    cornerRadius: 5,
                  },
                ]}
                slotProps={{
                  legend: {
                    direction: 'vertical',
                    position: { vertical: 'middle', horizontal: 'end' },
                  },
                }}
              />
            ) : null}
          </PublicTelemetryChartCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <PublicTelemetryChartCard
            eyebrow="Versions"
            title="Version health"
            description="Published version buckets are intentionally broad so users can see whether activity trends toward current supported releases without exposing a long tail of exact versions."
            icon={<VerifiedOutlinedIcon sx={{ fontSize: 22 }} />}
            emptyMessage="Version health is omitted when the delayed grouped buckets are too sparse to show responsibly."
          >
            {versionPieData.length > 0 ? (
              <PieChart
                height={280}
                series={[
                  {
                    data: versionPieData,
                    innerRadius: 52,
                    outerRadius: 92,
                    paddingAngle: 2,
                    cornerRadius: 5,
                  },
                ]}
                slotProps={{
                  legend: {
                    direction: 'vertical',
                    position: { vertical: 'middle', horizontal: 'end' },
                  },
                }}
              />
            ) : null}
          </PublicTelemetryChartCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <PublicTelemetryChartCard
            eyebrow="Reliability"
            title="Grouped reliability view"
            description="The public route exposes a delayed error trend and grouped categories only. It does not include raw stack traces, exact cohorts, or operational drilldowns."
            icon={<ErrorOutlineOutlinedIcon sx={{ fontSize: 22 }} />}
            footer={
              <Typography variant="body2" sx={{ color: palette.textMuted }}>
                Error categories are broad by design: auth, rate limit, network, config, input,
                runtime, and other.
              </Typography>
            }
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                {hasRows(payload.errorTrend) ? (
                  <Box sx={{ width: '100%', height: 210 }}>
                    <LineChart
                      xAxis={[
                        {
                          data: errorTrendSeries.map((point) => point.date),
                          scaleType: 'time',
                          tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                        },
                      ]}
                      yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                      series={[
                        {
                          data: errorTrendSeries.map((point) => point.count),
                          color: palette.red,
                          area: true,
                          showMark: false,
                        },
                      ]}
                      height={190}
                      sx={{
                        '& .MuiAreaElement-root': {
                          opacity: 0.18,
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      minHeight: 140,
                      borderRadius: 3,
                      border: `1px dashed rgba(255,255,255,0.12)`,
                      bgcolor: 'rgba(255,255,255,0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: palette.textMuted, textAlign: 'center', lineHeight: 1.7 }}>
                      No grouped reliability trend is available for this delayed public window.
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid size={{ xs: 12 }}>
                {errorCategoryPieData.length > 0 ? (
                  <PieChart
                    height={220}
                    series={[
                      {
                        data: errorCategoryPieData,
                        innerRadius: 42,
                        outerRadius: 76,
                        paddingAngle: 2,
                        cornerRadius: 4,
                      },
                    ]}
                    slotProps={{
                      legend: {
                        direction: 'horizontal',
                        position: { vertical: 'bottom', horizontal: 'center' },
                      },
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      minHeight: 140,
                      borderRadius: 3,
                      border: `1px dashed rgba(255,255,255,0.12)`,
                      bgcolor: 'rgba(255,255,255,0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: palette.textMuted, textAlign: 'center', lineHeight: 1.7 }}>
                      Grouped error categories are omitted when the public-safe buckets are too sparse.
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </PublicTelemetryChartCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <PublicTelemetryChartCard
            eyebrow="Exact commands"
            title="Thresholded top commands"
            description="Only top-level public command names that clear the exact publication threshold are shown here. Subcommands and internal command families stay private."
            icon={<TerminalOutlinedIcon sx={{ fontSize: 22 }} />}
            emptyMessage="Top commands are published only when delayed public buckets clear the exact threshold."
          >
            {hasRows(payload.topCommands) ? (
              <Box sx={{ width: '100%', height: 280 }}>
                <BarChart
                  xAxis={[
                    {
                      data: payload.topCommands.map((row) => truncateLabel(row.label)),
                      scaleType: 'band',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                    },
                  ]}
                  yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                  series={[
                    {
                      data: payload.topCommands.map((row) => row.count),
                      color: palette.blue,
                    },
                  ]}
                  height={260}
                />
              </Box>
            ) : null}
          </PublicTelemetryChartCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <PublicTelemetryChartCard
            eyebrow="Exact models"
            title="Thresholded top Voyage models"
            description="Only first-party Voyage model identifiers that clear the exact publication threshold are eligible for public display. Third-party provider model IDs do not appear here."
            icon={<ModelTrainingOutlinedIcon sx={{ fontSize: 22 }} />}
            emptyMessage="Top models are omitted when the delayed public-safe buckets are too small to publish directly."
          >
            {hasRows(payload.topModels) ? (
              <Box sx={{ width: '100%', height: 280 }}>
                <BarChart
                  xAxis={[
                    {
                      data: payload.topModels.map((row) => truncateLabel(row.label, 20)),
                      scaleType: 'band',
                      tickLabelStyle: { fill: palette.textMuted, fontSize: 11 },
                    },
                  ]}
                  yAxis={[{ tickLabelStyle: { fill: palette.textMuted, fontSize: 11 } }]}
                  series={[
                    {
                      data: payload.topModels.map((row) => row.count),
                      color: palette.accent,
                    },
                  ]}
                  height={260}
                />
              </Box>
            ) : null}
          </PublicTelemetryChartCard>
        </Grid>
      </Grid>

      <PublicTelemetryMethodology
        dataThrough={payload.meta.dataThrough}
        windowDays={payload.meta.windowDays}
      />
    </Box>
  );
}
