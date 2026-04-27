'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { palette } from '@/theme/theme';

interface IssueSummary {
  _id: string;
  issueNumber: number;
  publishDate?: string;
  theme?: string;
  status?: string;
  updatedAt?: string;
}

export default function NewsletterIssuesPage() {
  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [theme, setTheme] = useState('');

  const loadIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/newsletter/issues');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to load issues.');
        setIssues([]);
        return;
      }
      setIssues(data.issues || []);
    } catch {
      setError('Network error while loading issues.');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadIssues();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/newsletter/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: theme || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to create issue.');
      } else {
        setTheme('');
        await loadIssues();
      }
    } catch {
      setError('Network error while creating issue.');
    } finally {
      setCreating(false);
    }
  };

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
        Newsletter issues
      </Typography>
      <Typography sx={{ color: palette.textMuted, mb: 3 }}>
        Structured issues for Vector Log. Each issue follows the five-section schema and can be
        edited and exported into the send pipeline.
      </Typography>

      <Stack spacing={2}>
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
              spacing={2}
             
             
             sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, color: palette.text, mb: 1 }}>
                  Create new issue
                </Typography>
                <TextField
                  label="Theme (optional)"
                  size="small"
                  fullWidth
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder='e.g. "cost optimization", "agentic workflows"'
                  sx={{
                    maxWidth: 360,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: palette.border },
                      '&:hover fieldset': { borderColor: palette.accent },
                      '&.Mui-focused fieldset': { borderColor: palette.accent },
                    },
                  }}
                />
              </Box>
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={creating}
                startIcon={<AddIcon fontSize="small" />}
                sx={{
                  textTransform: 'none',
                  fontSize: 13,
                  bgcolor: palette.accent,
                  color: palette.bg,
                  fontWeight: 700,
                  px: 3,
                  '&:hover': { bgcolor: palette.accentDim },
                }}
              >
                {creating ? 'Creating…' : 'New issue'}
              </Button>
            </Stack>
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
              spacing={2}
             
             
             
             sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontWeight: 600, color: palette.text }}>
                Issues
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={loadIssues}
                disabled={loading}
                sx={{ borderColor: palette.border, color: palette.textMuted }}
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </Button>
            </Stack>

            {error && (
              <Typography sx={{ fontSize: 12, color: '#f97373', mb: 1 }}>
                {error}
              </Typography>
            )}

            {loading && issues.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: palette.accent }} />
                <Typography sx={{ fontSize: 13, color: palette.textMuted }}>
                  Loading issues…
                </Typography>
              </Box>
            ) : issues.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: palette.textDim }}>
                No issues yet. Create the first Vector Log issue above.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {issues.map((issue) => (
                  <Box
                    key={issue.issueNumber}
                    component={Link}
                    href={`/admin/newsletter/issues/${issue.issueNumber}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.5,
                      py: 1,
                      borderRadius: 1,
                      border: `1px solid ${palette.border}`,
                      bgcolor: palette.bgCard,
                      textDecoration: 'none',
                      '&:hover': { bgcolor: palette.bgSurface },
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: palette.text,
                        }}
                      >
                        Issue #{issue.issueNumber}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: palette.textDim,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 420,
                        }}
                      >
                        {issue.theme || 'No theme'} ·{' '}
                        {issue.publishDate
                          ? new Date(issue.publishDate).toLocaleDateString()
                          : 'No date'}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Chip
                        label={issue.status || 'draft'}
                        size="small"
                        sx={{
                          fontSize: 10,
                          textTransform: 'capitalize',
                          bgcolor:
                            issue.status === 'published'
                              ? 'rgba(34,197,94,0.12)'
                              : issue.status === 'approved'
                                ? 'rgba(59,130,246,0.12)'
                                : 'rgba(148,163,184,0.12)',
                          color:
                            issue.status === 'published'
                              ? '#4ade80'
                              : issue.status === 'approved'
                                ? '#93c5fd'
                                : '#e5e7eb',
                        }}
                      />
                      {issue.updatedAt && (
                        <Typography sx={{ fontSize: 10, color: palette.textDim }}>
                          Updated {new Date(issue.updatedAt).toLocaleString()}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

