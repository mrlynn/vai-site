'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Visibility as ViewIcon,
  GitHub as GitHubIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

interface Bug {
  _id: string;
  bugId: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  status: 'new' | 'investigating' | 'resolved' | 'closed' | 'wontfix';
  source: string;
  platform?: string;
  cliVersion?: string;
  appVersion?: string;
  email?: string;
  errorMessage?: string;
  errorStack?: string;
  country?: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
  new: 'error',
  investigating: 'warning',
  resolved: 'success',
  closed: 'default',
  wontfix: 'default',
};

export default function BugsAdminPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState<{ _id: string; count: number }[]>([]);

  const fetchBugs = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/bugs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        setAuthenticated(false);
        setError('Invalid token');
        return;
      }
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      setBugs(data.bugs || []);
      setStats(data.stats || []);
      setAuthenticated(true);
      
      // Save token to localStorage
      localStorage.setItem('vai_bugs_token', token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bugs');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('vai_bugs_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Auto-fetch when token changes
  useEffect(() => {
    if (token && !authenticated) {
      fetchBugs();
    }
  }, [token, authenticated, fetchBugs]);

  const updateBugStatus = async (bugId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/bugs', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bugId, status: newStatus }),
      });
      
      if (res.ok) {
        setBugs(bugs.map(b => b.bugId === bugId ? { ...b, status: newStatus as Bug['status'] } : b));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredBugs = statusFilter === 'all' 
    ? bugs 
    : bugs.filter(b => b.status === statusFilter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generateGitHubUrl = (bug: Bug) => {
    const title = encodeURIComponent(`[Bug] ${bug.title}`);
    const body = encodeURIComponent(`## Description\n${bug.description}\n\n## Steps to Reproduce\n${bug.stepsToReproduce || 'Not provided'}\n\n## Environment\n- Source: ${bug.source}\n- Platform: ${bug.platform || 'N/A'}\n- CLI Version: ${bug.cliVersion || 'N/A'}\n\n---\n*Bug ID: ${bug.bugId}*`);
    return `https://github.com/mrlynn/voyageai-cli/issues/new?title=${title}&body=${body}&labels=bug`;
  };

  if (!authenticated) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#001E2B', py: 8 }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, bgcolor: '#112733', textAlign: 'center' }}>
            <LockIcon sx={{ fontSize: 48, color: '#00ED64', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#fff', mb: 3 }}>
              Bug Tracker Admin
            </Typography>
            <TextField
              fullWidth
              type="password"
              label="Admin Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBugs()}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { color: '#fff' },
              }}
              InputLabelProps={{
                sx: { color: '#889397' },
              }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
              variant="contained"
              onClick={fetchBugs}
              disabled={!token || loading}
              sx={{ bgcolor: '#00ED64', color: '#000', '&:hover': { bgcolor: '#00c853' } }}
            >
              {loading ? <CircularProgress size={24} /> : 'Access Dashboard'}
            </Button>
            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#889397' }}>
              Set BUGS_ADMIN_TOKEN in Vercel env vars
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#001E2B', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600 }}>
              🐛 Bug Tracker
            </Typography>
            <Typography variant="body2" sx={{ color: '#889397' }}>
              {bugs.length} total bugs • vaicli.com
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: '#889397' }}>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                sx={{ color: '#fff', '.MuiOutlinedInput-notchedOutline': { borderColor: '#3D4F58' } }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="investigating">Investigating</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="wontfix">Won&apos;t Fix</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={fetchBugs} sx={{ color: '#00ED64' }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          {['new', 'investigating', 'resolved', 'closed'].map(status => {
            const count = stats.find(s => s._id === status)?.count || 0;
            return (
              <Paper
                key={status}
                sx={{
                  p: 2,
                  bgcolor: '#112733',
                  minWidth: 120,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: statusFilter === status ? '1px solid #00ED64' : '1px solid transparent',
                }}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              >
                <Typography variant="h4" sx={{ color: '#fff' }}>{count}</Typography>
                <Chip
                  label={status}
                  size="small"
                  color={STATUS_COLORS[status]}
                  sx={{ mt: 1, textTransform: 'capitalize' }}
                />
              </Paper>
            );
          })}
        </Box>

        {/* Bug Table */}
        <TableContainer component={Paper} sx={{ bgcolor: '#112733' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#889397', fontWeight: 600 }}>Bug ID</TableCell>
                <TableCell sx={{ color: '#889397', fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ color: '#889397', fontWeight: 600 }}>Source</TableCell>
                <TableCell sx={{ color: '#889397', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: '#889397', fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ color: '#889397', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBugs.map((bug) => (
                <TableRow key={bug._id} hover sx={{ '&:hover': { bgcolor: '#1C2D38' } }}>
                  <TableCell sx={{ color: '#00ED64', fontFamily: 'monospace', fontSize: 12 }}>
                    {bug.bugId}
                  </TableCell>
                  <TableCell sx={{ color: '#fff', maxWidth: 300 }}>
                    <Typography noWrap>{bug.title}</Typography>
                    {bug.email && (
                      <Typography variant="caption" sx={{ color: '#889397' }}>
                        {bug.email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={bug.source}
                      size="small"
                      sx={{
                        bgcolor: bug.source === 'desktop-app' ? '#5E0C9E' : '#016BF8',
                        color: '#fff',
                      }}
                    />
                    {bug.platform && (
                      <Typography variant="caption" sx={{ display: 'block', color: '#889397' }}>
                        {bug.platform}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={bug.status}
                      onChange={(e) => updateBugStatus(bug.bugId, e.target.value)}
                      size="small"
                      sx={{
                        color: '#fff',
                        '.MuiOutlinedInput-notchedOutline': { borderColor: '#3D4F58' },
                        minWidth: 130,
                      }}
                    >
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="investigating">Investigating</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                      <MenuItem value="wontfix">Won&apos;t Fix</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell sx={{ color: '#889397' }}>
                    {formatDate(bug.createdAt)}
                    {bug.country && (
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        {bug.country}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => setSelectedBug(bug)} sx={{ color: '#889397' }}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Create GitHub Issue">
                      <IconButton
                        size="small"
                        onClick={() => window.open(generateGitHubUrl(bug), '_blank')}
                        sx={{ color: '#889397' }}
                      >
                        <GitHubIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBugs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', color: '#889397', py: 4 }}>
                    No bugs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Bug Detail Dialog */}
        <Dialog
          open={!!selectedBug}
          onClose={() => setSelectedBug(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { bgcolor: '#112733', color: '#fff' } }}
        >
          {selectedBug && (
            <>
              <DialogTitle sx={{ borderBottom: '1px solid #3D4F58' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <span>🐛</span>
                  <Box>
                    <Typography variant="h6">{selectedBug.title}</Typography>
                    <Typography variant="caption" sx={{ color: '#889397' }}>
                      {selectedBug.bugId} • {formatDate(selectedBug.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#00ED64', mb: 1 }}>
                  Description
                </Typography>
                <Typography sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                  {selectedBug.description}
                </Typography>

                {selectedBug.stepsToReproduce && (
                  <>
                    <Typography variant="subtitle2" sx={{ color: '#00ED64', mb: 1 }}>
                      Steps to Reproduce
                    </Typography>
                    <Typography sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                      {selectedBug.stepsToReproduce}
                    </Typography>
                  </>
                )}

                {selectedBug.errorMessage && (
                  <>
                    <Typography variant="subtitle2" sx={{ color: '#FF6960', mb: 1 }}>
                      Error Message
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#001E2B', mb: 3, fontFamily: 'monospace', fontSize: 12 }}>
                      {selectedBug.errorMessage}
                    </Paper>
                  </>
                )}

                {selectedBug.errorStack && (
                  <>
                    <Typography variant="subtitle2" sx={{ color: '#FF6960', mb: 1 }}>
                      Stack Trace
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#001E2B', mb: 3, fontFamily: 'monospace', fontSize: 11, maxHeight: 200, overflow: 'auto' }}>
                      {selectedBug.errorStack}
                    </Paper>
                  </>
                )}

                <Typography variant="subtitle2" sx={{ color: '#00ED64', mb: 1 }}>
                  Environment
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                  <Typography variant="body2"><strong>Source:</strong> {selectedBug.source}</Typography>
                  <Typography variant="body2"><strong>Platform:</strong> {selectedBug.platform || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>CLI Version:</strong> {selectedBug.cliVersion || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>App Version:</strong> {selectedBug.appVersion || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Country:</strong> {selectedBug.country || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {selectedBug.email || 'Not provided'}</Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ borderTop: '1px solid #3D4F58', p: 2 }}>
                <Button
                  startIcon={<GitHubIcon />}
                  onClick={() => window.open(generateGitHubUrl(selectedBug), '_blank')}
                  sx={{ color: '#fff' }}
                >
                  Create GitHub Issue
                </Button>
                <Button onClick={() => setSelectedBug(null)} variant="contained" sx={{ bgcolor: '#00ED64', color: '#000' }}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
}
