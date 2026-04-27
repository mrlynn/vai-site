'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { palette } from '@/theme/theme';

interface SummaryResponse {
  ok: boolean;
  counts?: Record<string, number>;
  total?: number;
  error?: string;
}

interface DraftSummary {
  id: string;
  title: string;
  updatedAt?: string;
}

export default function AdminNewsletterPage() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; errors: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newsletterDrafts, setNewsletterDrafts] = useState<DraftSummary[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

  const loadSummary = async () => {
    setLoadingSummary(true);
    setError(null);
    try {
      const res = await fetch('/api/newsletter/admin/summary');
      const data = (await res.json()) as SummaryResponse;
      if (!res.ok || !data.ok) {
        setError('Unable to load subscriber summary.');
        setSummary(null);
      } else {
        setSummary(data);
      }
    } catch {
      setError('Network error while loading summary.');
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadNewsletterDrafts();
  }, []);

  const loadNewsletterDrafts = async () => {
    setLoadingDrafts(true);
    try {
      const res = await fetch('/api/drafts');
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(data.drafts)) {
        setNewsletterDrafts([]);
        return;
      }
      const filtered = (data.drafts as any[])
        .filter((d) => d.channel === 'newsletter')
        .slice(0, 8)
        .map((d) => ({
          id: d.id as string,
          title: (d.title as string) || 'Untitled',
          updatedAt: d.updatedAt as string | undefined,
        }));
      setNewsletterDrafts(filtered);
    } catch {
      setNewsletterDrafts([]);
    } finally {
      setLoadingDrafts(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and body are required.');
      return;
    }
    setSending(true);
    setSendResult(null);
    setError(null);
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          textBody: body,
          dryRun,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError('Newsletter send failed. Check server logs for details.');
      } else {
        setSendResult({ sent: data.sent || 0, errors: (data.errors || []).length || 0 });
        if (!dryRun) {
          setSubject('');
          setBody('');
          loadSummary();
        }
      }
    } catch {
      setError('Network error while sending newsletter.');
    } finally {
      setSending(false);
    }
  };

  const activeCount = summary?.counts?.active || 0;

  return (
    <Box sx={{ py: 2 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: palette.accent,
          fontFamily: "'Source Code Pro', monospace",
          mb: 1,
        }}
      >
        Newsletter
      </Typography>
      <Typography sx={{ color: palette.textMuted, mb: 3 }}>
        View subscriber health and send issues to active subscribers. Start with dry runs before sending real mail.
      </Typography>

      <Stack spacing={3}>
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography sx={{ fontWeight: 600, color: palette.text }}>
                Subscribers
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={loadSummary}
                disabled={loadingSummary}
                sx={{ borderColor: palette.border, color: palette.textMuted }}
              >
                {loadingSummary ? 'Refreshing…' : 'Refresh'}
              </Button>
            </Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {summary && (
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                <Chip
                  label={`Total: ${summary.total ?? 0}`}
                  sx={{
                    bgcolor: 'rgba(0,212,170,0.08)',
                    color: palette.accent,
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={`Active: ${summary.counts?.active ?? 0}`}
                  sx={{
                    bgcolor: 'rgba(34,197,94,0.08)',
                    color: '#22c55e',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={`Pending: ${summary.counts?.pending ?? 0}`}
                  sx={{
                    bgcolor: 'rgba(59,130,246,0.08)',
                    color: '#3b82f6',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={`Unsubscribed: ${summary.counts?.unsubscribed ?? 0}`}
                  sx={{
                    bgcolor: 'rgba(248,113,113,0.08)',
                    color: '#f87171',
                    fontWeight: 600,
                  }}
                />
              </Stack>
            )}
            {loadingSummary && !summary && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CircularProgress size={20} sx={{ color: palette.accent, mr: 1 }} />
                <Typography sx={{ color: palette.textMuted, fontSize: 13 }}>
                  Loading subscriber summary…
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
             
             
             
             sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontWeight: 600, color: palette.text }}>
                Newsletter drafts
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={loadNewsletterDrafts}
                disabled={loadingDrafts}
                sx={{ borderColor: palette.border, color: palette.textMuted }}
              >
                {loadingDrafts ? 'Refreshing…' : 'Refresh'}
              </Button>
            </Stack>
            {newsletterDrafts.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: palette.textDim }}>
                No drafts with channel <code>newsletter</code> yet. Generate or edit a draft in the
                Builder and set its channel to newsletter.
              </Typography>
            ) : (
              <List dense>
                {newsletterDrafts.map((d) => (
                  <ListItem
                    key={d.id}
                    component={Link}
                    href={`/admin/builder/drafts/${d.id}`}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.5,
                      border: `1px solid ${palette.border}`,
                      bgcolor: palette.bgCard,
                      '&:hover': { bgcolor: palette.bgSurface },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            color: palette.text,
                            fontSize: 13,
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {d.title}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ fontSize: 11, color: palette.textDim }}>
                          {d.updatedAt
                            ? new Date(d.updatedAt).toLocaleString()
                            : 'Unsaved draft'}
                        </Typography>
                      }
                      slotProps={{ secondary: { component: 'div' } }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <Typography sx={{ fontWeight: 600, color: palette.text, mb: 1 }}>
              Send issue
            </Typography>
            <Typography sx={{ color: palette.textMuted, mb: 3, fontSize: 13 }}>
              This sends a plaintext issue to all <strong>active</strong> subscribers using the existing send pipeline.
              Start with a dry run to verify counts before sending for real.
            </Typography>

            {sendResult && (
              <Alert
                severity={dryRun ? 'info' : 'success'}
                sx={{ mb: 2 }}
              >
                {dryRun
                  ? `Dry run: would send to ${sendResult.sent} active subscriber(s) with ${sendResult.errors} error(s).`
                  : `Sent to ${sendResult.sent} active subscriber(s) with ${sendResult.errors} error(s).`}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={2}>
              <TextField
                label="Subject"
                fullWidth
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: palette.border },
                    '&:hover fieldset': { borderColor: palette.accent },
                    '&.Mui-focused fieldset': { borderColor: palette.accent },
                  },
                }}
              />
              <TextField
                label="Body (plaintext or markdown)"
                fullWidth
                value={body}
                onChange={(e) => setBody(e.target.value)}
                multiline
                minRows={6}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: palette.border },
                    '&:hover fieldset': { borderColor: palette.accent },
                    '&.Mui-focused fieldset': { borderColor: palette.accent },
                  },
                  fontFamily: 'monospace',
                  fontSize: 13,
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  mt: 1,
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip
                    label={dryRun ? 'Dry run' : 'Live send'}
                    color={dryRun ? 'default' : 'success'}
                    onClick={() => setDryRun((v) => !v)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: dryRun ? 'rgba(148,163,184,0.15)' : 'rgba(22,163,74,0.15)',
                      color: dryRun ? palette.textMuted : '#16a34a',
                    }}
                  />
                  <Typography sx={{ color: palette.textDim, fontSize: 12 }}>
                    {dryRun
                      ? 'No emails will be sent; see how many would be targeted.'
                      : 'This will send immediately to all active subscribers.'}
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  disabled={sending || !subject.trim() || !body.trim() || activeCount === 0}
                  onClick={handleSend}
                  sx={{
                    bgcolor: palette.accent,
                    color: palette.bg,
                    fontWeight: 700,
                    px: 3,
                    '&:hover': { bgcolor: palette.accentDim },
                  }}
                >
                  {sending
                    ? 'Sending…'
                    : dryRun
                    ? `Dry run${activeCount ? ` (${activeCount} active)` : ''}`
                    : `Send to ${activeCount} active`}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

