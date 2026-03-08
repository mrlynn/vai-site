'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SaveIcon from '@mui/icons-material/Save';
import { palette } from '@/theme/theme';

type BugStatus = 'new' | 'investigating' | 'resolved' | 'closed' | 'wontfix';
type BugPriority = 'low' | 'medium' | 'high' | 'critical';

interface Bug {
  _id: string;
  bugId: string;
  title: string;
  description: string;
  stepsToReproduce?: string | null;
  status: BugStatus;
  priority: BugPriority;
  source: string;
  platform?: string | null;
  cliVersion?: string | null;
  appVersion?: string | null;
  arch?: string | null;
  nodeVersion?: string | null;
  electronVersion?: string | null;
  email?: string | null;
  userId?: string | null;
  accountId?: string | null;
  sessionId?: string | null;
  currentScreen?: string | null;
  currentCommand?: string | null;
  currentUrl?: string | null;
  errorMessage?: string | null;
  errorStack?: string | null;
  consoleLogs?: string | null;
  githubIssueUrl?: string | null;
  githubIssueNumber?: number | null;
  assignee?: string | null;
  labels?: string[];
  resolution?: string | null;
  fingerprint?: string | null;
  country?: string | null;
  region?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  lastActivityAt?: string | null;
}

interface StatBucket {
  _id: string;
  count: number;
}

interface TriageDraft {
  status: BugStatus;
  priority: BugPriority;
  assignee: string;
  labels: string;
  githubIssueUrl: string;
  githubIssueNumber: string;
  resolution: string;
}

const STATUS_OPTIONS: BugStatus[] = ['new', 'investigating', 'resolved', 'closed', 'wontfix'];
const PRIORITY_OPTIONS: BugPriority[] = ['low', 'medium', 'high', 'critical'];

const STATUS_COLORS: Record<BugStatus, string> = {
  new: palette.red,
  investigating: palette.yellow,
  resolved: palette.accent,
  closed: palette.textMuted,
  wontfix: palette.purple,
};

const PRIORITY_COLORS: Record<BugPriority, string> = {
  low: palette.textMuted,
  medium: palette.blue,
  high: palette.yellow,
  critical: palette.red,
};

function formatDate(value?: string | null) {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function defaultDraft(bug: Bug): TriageDraft {
  return {
    status: bug.status,
    priority: bug.priority || 'medium',
    assignee: bug.assignee || '',
    labels: (bug.labels || []).join(', '),
    githubIssueUrl: bug.githubIssueUrl || '',
    githubIssueNumber: bug.githubIssueNumber ? String(bug.githubIssueNumber) : '',
    resolution: bug.resolution || '',
  };
}

function fallbackGitHubUrl(bug: Bug) {
  const title = encodeURIComponent(`[Bug] ${bug.title}`);
  const body = encodeURIComponent(`## Description
${bug.description}

## Steps to Reproduce
${bug.stepsToReproduce || 'Not provided'}

## Environment
- Source: ${bug.source}
- Platform: ${bug.platform || 'N/A'}
- CLI Version: ${bug.cliVersion || 'N/A'}
- App Version: ${bug.appVersion || 'N/A'}

---
*Bug ID: ${bug.bugId}*`);
  return `https://github.com/mrlynn/voyageai-cli/issues/new?title=${title}&body=${body}&labels=bug`;
}

export default function BugsAdminPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [triageDraft, setTriageDraft] = useState<TriageDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [versionFilter, setVersionFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [stats, setStats] = useState<{
    status: StatBucket[];
    priority: StatBucket[];
    source: StatBucket[];
  }>({
    status: [],
    priority: [],
    source: [],
  });

  const loadBugs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/bugs', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to load bugs.');
        setBugs([]);
        return;
      }

      setBugs(data.bugs || []);
      setStats(
        data.stats || {
          status: [],
          priority: [],
          source: [],
        }
      );
    } catch {
      setError('Network error while loading bug reports.');
      setBugs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBugs();
  }, [loadBugs]);

  const sourceOptions = useMemo(
    () => Array.from(new Set(bugs.map((bug) => bug.source).filter(Boolean))).sort(),
    [bugs]
  );
  const platformOptions = useMemo(
    () => Array.from(new Set(bugs.map((bug) => bug.platform).filter(Boolean) as string[])).sort(),
    [bugs]
  );
  const versionOptions = useMemo(() => {
    const values = bugs.flatMap((bug) => [bug.appVersion, bug.cliVersion]).filter(Boolean) as string[];
    return Array.from(new Set(values)).sort().reverse();
  }, [bugs]);

  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        [
          bug.bugId,
          bug.title,
          bug.description,
          bug.email,
          bug.errorMessage,
          bug.userId,
          bug.accountId,
          bug.currentCommand,
          bug.currentScreen,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || bug.source === sourceFilter;
      const matchesPlatform = platformFilter === 'all' || bug.platform === platformFilter;
      const matchesPriority = priorityFilter === 'all' || bug.priority === priorityFilter;
      const matchesVersion =
        versionFilter === 'all' || bug.appVersion === versionFilter || bug.cliVersion === versionFilter;
      const matchesFromDate =
        !fromDate || new Date(bug.createdAt).getTime() >= new Date(`${fromDate}T00:00:00`).getTime();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSource &&
        matchesPlatform &&
        matchesPriority &&
        matchesVersion &&
        matchesFromDate
      );
    });
  }, [bugs, fromDate, platformFilter, priorityFilter, search, sourceFilter, statusFilter, versionFilter]);

  const updateBugInState = useCallback((bugId: string, patch: Partial<Bug>) => {
    setBugs((current) => current.map((bug) => (bug.bugId === bugId ? { ...bug, ...patch } : bug)));
    setSelectedBug((current) => (current && current.bugId === bugId ? { ...current, ...patch } : current));
  }, []);

  const patchBug = useCallback(
    async (bugId: string, patch: Record<string, unknown>) => {
      const res = await fetch('/api/bugs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bugId, ...patch }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update bug.');
      }

      updateBugInState(bugId, patch as Partial<Bug>);
      return data;
    },
    [updateBugInState]
  );

  const saveTriage = async () => {
    if (!selectedBug || !triageDraft) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const patch = {
        status: triageDraft.status,
        priority: triageDraft.priority,
        assignee: triageDraft.assignee || null,
        labels: triageDraft.labels
          .split(',')
          .map((label) => label.trim())
          .filter(Boolean),
        githubIssueUrl: triageDraft.githubIssueUrl || null,
        githubIssueNumber: triageDraft.githubIssueNumber
          ? Number(triageDraft.githubIssueNumber)
          : null,
        resolution: triageDraft.resolution || null,
      };

      await patchBug(selectedBug.bugId, patch);
      await loadBugs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save triage changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" mb={3}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: palette.accent,
              fontFamily: "'Source Code Pro', monospace",
              mb: 1,
            }}
          >
            Bug reports
          </Typography>
          <Typography sx={{ color: palette.textMuted }}>
            Unified intake from CLI, playground, and desktop clients. {bugs.length} reports loaded.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon fontSize="small" />}
          onClick={loadBugs}
          disabled={loading}
          sx={{ alignSelf: 'flex-start', borderColor: palette.border, color: palette.textMuted }}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ bgcolor: palette.bgSurface, mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
              <TextField
                label="Search bugs"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                fullWidth
                size="small"
                placeholder="Title, bug ID, email, command, account ID..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: palette.textMuted }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="From date"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 180 }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} useFlexGap flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(event) => setStatusFilter(event.target.value)}>
                  <MenuItem value="all">All statuses</MenuItem>
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Priority</InputLabel>
                <Select value={priorityFilter} label="Priority" onChange={(event) => setPriorityFilter(event.target.value)}>
                  <MenuItem value="all">All priorities</MenuItem>
                  {PRIORITY_OPTIONS.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Source</InputLabel>
                <Select value={sourceFilter} label="Source" onChange={(event) => setSourceFilter(event.target.value)}>
                  <MenuItem value="all">All sources</MenuItem>
                  {sourceOptions.map((source) => (
                    <MenuItem key={source} value={source}>
                      {source}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Platform</InputLabel>
                <Select value={platformFilter} label="Platform" onChange={(event) => setPlatformFilter(event.target.value)}>
                  <MenuItem value="all">All platforms</MenuItem>
                  {platformOptions.map((platform) => (
                    <MenuItem key={platform} value={platform}>
                      {platform}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel>Version</InputLabel>
                <Select value={versionFilter} label="Version" onChange={(event) => setVersionFilter(event.target.value)}>
                  <MenuItem value="all">All versions</MenuItem>
                  {versionOptions.map((version) => (
                    <MenuItem key={version} value={version}>
                      {version}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} mb={3}>
        <Card sx={{ flex: 1, bgcolor: palette.bgSurface }}>
          <CardContent>
            <Typography sx={{ fontWeight: 700, color: palette.text, mb: 1 }}>Status</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {stats.status.map((bucket) => (
                <Chip
                  key={bucket._id}
                  label={`${bucket._id}: ${bucket.count}`}
                  onClick={() => setStatusFilter(statusFilter === bucket._id ? 'all' : bucket._id)}
                  sx={{
                    color: '#001E2B',
                    bgcolor: STATUS_COLORS[bucket._id as BugStatus] || palette.textMuted,
                    border: statusFilter === bucket._id ? `1px solid ${palette.text}` : 'none',
                  }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, bgcolor: palette.bgSurface }}>
          <CardContent>
            <Typography sx={{ fontWeight: 700, color: palette.text, mb: 1 }}>Priority</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {stats.priority.map((bucket) => (
                <Chip
                  key={bucket._id}
                  label={`${bucket._id}: ${bucket.count}`}
                  onClick={() => setPriorityFilter(priorityFilter === bucket._id ? 'all' : bucket._id)}
                  sx={{
                    color: bucket._id === 'low' ? palette.text : '#001E2B',
                    bgcolor: PRIORITY_COLORS[bucket._id as BugPriority] || palette.textMuted,
                    border: priorityFilter === bucket._id ? `1px solid ${palette.text}` : 'none',
                  }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <TableContainer component={Paper} sx={{ bgcolor: palette.bgSurface }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: palette.textMuted, fontWeight: 700 }}>Bug</TableCell>
              <TableCell sx={{ color: palette.textMuted, fontWeight: 700 }}>Source</TableCell>
              <TableCell sx={{ color: palette.textMuted, fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: palette.textMuted, fontWeight: 700 }}>Priority</TableCell>
              <TableCell sx={{ color: palette.textMuted, fontWeight: 700 }}>Version</TableCell>
              <TableCell sx={{ color: palette.textMuted, fontWeight: 700 }}>Created</TableCell>
              <TableCell sx={{ color: palette.textMuted, fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && bugs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center' }}>
                  <CircularProgress size={24} sx={{ color: palette.accent }} />
                </TableCell>
              </TableRow>
            ) : filteredBugs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center', color: palette.textMuted }}>
                  No bug reports match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredBugs.map((bug) => (
                <TableRow key={bug._id} hover sx={{ '&:hover': { bgcolor: palette.bgCard } }}>
                  <TableCell sx={{ minWidth: 280 }}>
                    <Typography sx={{ color: palette.text, fontWeight: 600 }}>{bug.title}</Typography>
                    <Typography sx={{ color: palette.accent, fontFamily: 'monospace', fontSize: 12 }}>
                      {bug.bugId}
                    </Typography>
                    <Typography sx={{ color: palette.textMuted, fontSize: 12 }}>
                      {bug.email || bug.accountId || bug.userId || 'No contact identifier'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={bug.source} size="small" sx={{ bgcolor: palette.blueDark, color: '#fff' }} />
                    <Typography sx={{ color: palette.textMuted, fontSize: 12, mt: 0.5 }}>
                      {bug.platform || 'Unknown platform'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={bug.status}
                      size="small"
                      onChange={(event) => {
                        void patchBug(bug.bugId, { status: event.target.value });
                      }}
                      sx={{ minWidth: 150 }}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={bug.priority || 'medium'}
                      size="small"
                      onChange={(event) => {
                        void patchBug(bug.bugId, { priority: event.target.value });
                      }}
                      sx={{ minWidth: 120 }}
                    >
                      {PRIORITY_OPTIONS.map((priority) => (
                        <MenuItem key={priority} value={priority}>
                          {priority}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell sx={{ color: palette.textMuted }}>
                    {bug.appVersion || bug.cliVersion || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: palette.textMuted }}>
                    {formatDate(bug.createdAt)}
                    <Typography sx={{ fontSize: 12, color: palette.textMuted }}>
                      {bug.country || 'Unknown region'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View triage details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedBug(bug);
                          setTriageDraft(defaultDraft(bug));
                        }}
                        sx={{ color: palette.textMuted }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Open GitHub issue flow">
                      <IconButton
                        size="small"
                        onClick={() => window.open(bug.githubIssueUrl || fallbackGitHubUrl(bug), '_blank')}
                        sx={{ color: palette.textMuted }}
                      >
                        <GitHubIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={Boolean(selectedBug)}
        onClose={() => setSelectedBug(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { bgcolor: palette.bgSurface, color: palette.text } }}
      >
        {selectedBug && triageDraft && (
          <>
            <DialogTitle sx={{ borderBottom: `1px solid ${palette.border}` }}>
              <Typography component="div" variant="h6" sx={{ fontWeight: 700 }}>
                {selectedBug.title}
              </Typography>
              <Typography component="div" sx={{ color: palette.textMuted, fontSize: 12 }}>
                {selectedBug.bugId} · opened {formatDate(selectedBug.createdAt)}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: palette.accent, mb: 1 }}>Description</Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selectedBug.description}</Typography>
                </Box>

                {selectedBug.stepsToReproduce && (
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: palette.accent, mb: 1 }}>
                      Steps to reproduce
                    </Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selectedBug.stepsToReproduce}</Typography>
                  </Box>
                )}

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    select
                    label="Status"
                    value={triageDraft.status}
                    onChange={(event) =>
                      setTriageDraft((draft) => (draft ? { ...draft, status: event.target.value as BugStatus } : draft))
                    }
                    fullWidth
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Priority"
                    value={triageDraft.priority}
                    onChange={(event) =>
                      setTriageDraft((draft) =>
                        draft ? { ...draft, priority: event.target.value as BugPriority } : draft
                      )
                    }
                    fullWidth
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Assignee"
                    value={triageDraft.assignee}
                    onChange={(event) =>
                      setTriageDraft((draft) => (draft ? { ...draft, assignee: event.target.value } : draft))
                    }
                    fullWidth
                  />
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Labels"
                    value={triageDraft.labels}
                    onChange={(event) =>
                      setTriageDraft((draft) => (draft ? { ...draft, labels: event.target.value } : draft))
                    }
                    helperText="Comma-separated labels"
                    fullWidth
                  />
                  <TextField
                    label="GitHub issue URL"
                    value={triageDraft.githubIssueUrl}
                    onChange={(event) =>
                      setTriageDraft((draft) =>
                        draft ? { ...draft, githubIssueUrl: event.target.value } : draft
                      )
                    }
                    fullWidth
                  />
                  <TextField
                    label="GitHub issue #"
                    value={triageDraft.githubIssueNumber}
                    onChange={(event) =>
                      setTriageDraft((draft) =>
                        draft ? { ...draft, githubIssueNumber: event.target.value } : draft
                      )
                    }
                    sx={{ minWidth: 180 }}
                  />
                </Stack>

                <TextField
                  label="Resolution notes"
                  value={triageDraft.resolution}
                  onChange={(event) =>
                    setTriageDraft((draft) => (draft ? { ...draft, resolution: event.target.value } : draft))
                  }
                  multiline
                  minRows={2}
                />

                <Box>
                  <Typography sx={{ fontWeight: 700, color: palette.accent, mb: 1 }}>
                    Contact and identity
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography>Email: {selectedBug.email || 'Not provided'}</Typography>
                    <Typography>Account ID: {selectedBug.accountId || 'Not provided'}</Typography>
                    <Typography>User ID: {selectedBug.userId || 'Not provided'}</Typography>
                    <Typography>Session ID: {selectedBug.sessionId || 'Not provided'}</Typography>
                  </Stack>
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 700, color: palette.accent, mb: 1 }}>
                    Runtime context
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography>Source: {selectedBug.source}</Typography>
                    <Typography>Current screen: {selectedBug.currentScreen || 'N/A'}</Typography>
                    <Typography>Current command: {selectedBug.currentCommand || 'N/A'}</Typography>
                    <Typography>Current URL: {selectedBug.currentUrl || 'N/A'}</Typography>
                    <Typography>Platform: {selectedBug.platform || 'N/A'}</Typography>
                    <Typography>Arch: {selectedBug.arch || 'N/A'}</Typography>
                    <Typography>CLI version: {selectedBug.cliVersion || 'N/A'}</Typography>
                    <Typography>App version: {selectedBug.appVersion || 'N/A'}</Typography>
                    <Typography>Electron version: {selectedBug.electronVersion || 'N/A'}</Typography>
                    <Typography>Node version: {selectedBug.nodeVersion || 'N/A'}</Typography>
                    <Typography>Fingerprint: {selectedBug.fingerprint || 'N/A'}</Typography>
                  </Stack>
                </Box>

                {selectedBug.errorMessage && (
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: palette.red, mb: 1 }}>Error message</Typography>
                    <Paper sx={{ p: 2, bgcolor: palette.bg, fontFamily: 'monospace', fontSize: 12 }}>
                      {selectedBug.errorMessage}
                    </Paper>
                  </Box>
                )}

                {selectedBug.errorStack && (
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: palette.red, mb: 1 }}>Stack trace</Typography>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: palette.bg,
                        fontFamily: 'monospace',
                        fontSize: 11,
                        maxHeight: 220,
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {selectedBug.errorStack}
                    </Paper>
                  </Box>
                )}

                {selectedBug.consoleLogs && (
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: palette.accent, mb: 1 }}>Console logs</Typography>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: palette.bg,
                        fontFamily: 'monospace',
                        fontSize: 11,
                        maxHeight: 180,
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {selectedBug.consoleLogs}
                    </Paper>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ borderTop: `1px solid ${palette.border}`, p: 2 }}>
              <Button
                startIcon={<OpenInNewIcon fontSize="small" />}
                onClick={() => window.open(selectedBug.githubIssueUrl || fallbackGitHubUrl(selectedBug), '_blank')}
                sx={{ color: palette.text }}
              >
                Open GitHub issue
              </Button>
              <Button
                startIcon={<SaveIcon fontSize="small" />}
                variant="contained"
                onClick={() => void saveTriage()}
                disabled={saving}
                sx={{ bgcolor: palette.accent, color: palette.bg, '&:hover': { bgcolor: palette.accentDim } }}
              >
                {saving ? 'Saving…' : 'Save triage'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
