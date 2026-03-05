'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { palette } from '@/theme/theme';

interface DraftSummary {
  id: string;
  title: string;
  channel?: string | null;
  plannedPublishAt?: string | null;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function getCalendarGrid(date: Date) {
  const start = startOfMonth(date);
  const firstDay = start.getDay(); // 0-6
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();

  const cells: Array<{ date: Date | null }> = [];

  // Leading blanks
  for (let i = 0; i < firstDay; i += 1) {
    cells.push({ date: null });
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ date: new Date(start.getFullYear(), start.getMonth(), d) });
  }

  // Pad to full weeks (rows of 7)
  while (cells.length % 7 !== 0) {
    cells.push({ date: null });
  }

  return cells;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function PublicationCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/drafts');
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || 'Failed to load drafts for calendar.');
          return;
        }
        const list: DraftSummary[] = Array.isArray(data.drafts)
          ? data.drafts.map((d: any) => ({
              id: d.id,
              title: d.title || 'Untitled',
              channel: d.channel ?? d.platform ?? null,
              plannedPublishAt: d.plannedPublishAt ?? null,
            }))
          : [];
        setDrafts(list);
      } catch {
        setError('Network error while loading drafts for calendar.');
      } finally {
        setLoading(false);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, []);

  const draftsByDate = useMemo(() => {
    const map: Record<string, DraftSummary[]> = {};
    for (const d of drafts) {
      if (!d.plannedPublishAt) continue;
      const key = String(d.plannedPublishAt).slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(d);
    }
    return map;
  }, [drafts]);

  const cells = useMemo(() => getCalendarGrid(currentMonth), [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: palette.accent,
              fontFamily: "'Source Code Pro', monospace",
            }}
          >
            Publication calendar
          </Typography>
          <Typography sx={{ fontSize: 13, color: palette.textDim, mt: 0.5 }}>
            Visualize drafts by planned publish date across channels.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={handlePrevMonth}
            sx={{ color: palette.textMuted }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: palette.text }}>
            {formatMonthLabel(currentMonth)}
          </Typography>
          <IconButton
            size="small"
            onClick={handleNextMonth}
            sx={{ color: palette.textMuted }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            minHeight: '40vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress sx={{ color: palette.accent }} />
        </Box>
      ) : (
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1.5,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent sx={{ pb: 1.5 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: 0.75,
                mb: 1,
              }}
            >
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <Typography
                  key={d}
                  sx={{
                    fontSize: 11,
                    textAlign: 'center',
                    color: palette.textDim,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {d}
                </Typography>
              ))}
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: 0.75,
              }}
            >
              {cells.map((cell, idx) => {
                const date = cell.date;
                const key = date ? toDateKey(date) : `blank-${idx}`;
                const dayDrafts = date ? draftsByDate[key] || [] : [];
                const isToday =
                  date &&
                  toDateKey(date) ===
                    new Date().toISOString().slice(0, 10);
                return (
                  <Box
                    key={key}
                    sx={{
                      minHeight: 90,
                      borderRadius: 1,
                      border: `1px solid ${palette.border}`,
                      bgcolor: palette.bgCard,
                      px: 0.75,
                      py: 0.5,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.25,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: palette.text,
                          fontWeight: isToday ? 700 : 500,
                        }}
                      >
                        {date ? date.getDate() : ''}
                      </Typography>
                      {isToday && (
                        <Chip
                          label="Today"
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: 9,
                            bgcolor: 'rgba(0,212,170,0.12)',
                            color: palette.accent,
                            borderRadius: 999,
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                      {dayDrafts.slice(0, 3).map((d) => (
                        <Typography
                          key={d.id}
                          sx={{
                            fontSize: 11,
                            color: palette.text,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {d.title}
                          {d.channel && (
                            <Typography
                              component="span"
                              sx={{
                                ml: 0.5,
                                fontSize: 10,
                                color: palette.textDim,
                              }}
                            >
                              ({d.channel})
                            </Typography>
                          )}
                        </Typography>
                      ))}
                      {dayDrafts.length > 3 && (
                        <Typography
                          sx={{
                            fontSize: 10,
                            color: palette.textDim,
                            mt: 0.25,
                          }}
                        >
                          +{dayDrafts.length - 3} more…
                        </Typography>
                      )}
                      {dayDrafts.length === 0 && (
                        <Typography
                          sx={{
                            fontSize: 10,
                            color: palette.textMuted,
                            fontStyle: 'italic',
                          }}
                        >
                          —
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

