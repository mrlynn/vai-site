'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { palette } from '@/theme/theme';

const SOURCE_TYPES = ['file', 'url', 'codebase', 'text'];

export default function KnowledgePage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [sourcesError, setSourcesError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState('file');
  const [sourcePath, setSourcePath] = useState('');
  const [textContent, setTextContent] = useState('');
  const [crawlDepth, setCrawlDepth] = useState<number>(0);
  const [maxPages, setMaxPages] = useState<number>(20);
  const [sameHostOnly, setSameHostOnly] = useState(true);
  const [pathPrefix, setPathPrefix] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [debugQuery, setDebugQuery] = useState('');
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any | null>(null);

  async function fetchSources() {
    setLoadingSources(true);
    setSourcesError(null);
    try {
      const res = await fetch('/api/knowledge/sources');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSourcesError(data.error || 'Failed to load knowledge sources');
      } else {
        setSources(data.sources || []);
      }
    } catch {
      setSourcesError('Network error while loading sources');
    } finally {
      setLoadingSources(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchSources();
  }, []);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddError(null);

    const body: any = {
      name,
      type,
    };
    if (type === 'text') {
      body.sourcePath = textContent;
    } else {
      body.sourcePath = sourcePath || null;
    }

    if (type === 'url') {
      body.crawlDepth = crawlDepth;
      body.maxPages = maxPages;
      body.sameHostOnly = sameHostOnly;
      body.pathPrefix = pathPrefix || undefined;
    }

    try {
      const res = await fetch('/api/knowledge/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddError(data.error || 'Failed to add source');
      } else {
        setName('');
        setSourcePath('');
        setTextContent('');
        setCrawlDepth(0);
        setMaxPages(20);
        setSameHostOnly(true);
        setPathPrefix('');
        setType('file');
        await fetchSources();
      }
    } catch {
      setAddError('Network error. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleIndex = async (id: string) => {
    const confirmed = window.confirm('Run indexing for this source now?');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/knowledge/sources/${id}/index`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // eslint-disable-next-line no-alert
        alert(data.error || 'Indexing failed');
      }
    } catch {
      // eslint-disable-next-line no-alert
      alert('Network error while indexing');
    } finally {
      // refresh list regardless
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchSources();
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this knowledge source and its chunks?');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/knowledge/sources/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // eslint-disable-next-line no-alert
        alert(data.error || 'Delete failed');
      } else {
        setSources((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      // eslint-disable-next-line no-alert
      alert('Network error while deleting source');
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    setResults(null);
    try {
      const res = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), topK: 8 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSearchError(data.error || 'Search failed');
      } else {
        setResults(data.chunks || []);
      }
    } catch {
      setSearchError('Network error while searching');
    } finally {
      setSearching(false);
    }
  };

  const isText = type === 'text';
  const isUrl = type === 'url';

  return (
    <Box sx={{ py: 2 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          color: palette.accent,
          fontFamily: "'Source Code Pro', monospace",
          mb: 0.5,
        }}
      >
        Knowledge Base
      </Typography>
      <Typography sx={{ color: palette.textDim, fontSize: 13, mb: 3 }}>
        Index documentation, code, and web content to ground content generation.
      </Typography>

      <Stack spacing={3}>
        {/* Add Source */}
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1.5,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <Typography sx={{ fontWeight: 600, color: palette.text, mb: 1 }}>
              Add knowledge source
            </Typography>
            <Typography sx={{ color: palette.textMuted, fontSize: 13, mb: 2 }}>
              Add files, URLs, codebases, or pasted text. Then run indexing to create embeddings.
            </Typography>

            <Box
              component="form"
              onSubmit={handleAddSource}
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}
            >
              <Stack spacing={1.5}>
                <TextField
                  label="Name"
                  size="small"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My vai docs"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: palette.border },
                      '&:hover fieldset': { borderColor: palette.accent },
                      '&.Mui-focused fieldset': { borderColor: palette.accent },
                    },
                  }}
                />

                <FormControl size="small" fullWidth>
                  <InputLabel id="source-type-label">Type</InputLabel>
                  <Select
                    labelId="source-type-label"
                    label="Type"
                    value={type}
                    onChange={(e) => setType(e.target.value as string)}
                  >
                    <MenuItem value="file">File</MenuItem>
                    <MenuItem value="url">URL</MenuItem>
                    <MenuItem value="codebase">Codebase</MenuItem>
                    <MenuItem value="text">Text</MenuItem>
                  </Select>
                </FormControl>

                {isText ? (
                  <TextField
                    label="Paste content"
                    size="small"
                    multiline
                    minRows={4}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Paste documentation, notes, or other reference text here."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: palette.border },
                        '&:hover fieldset': { borderColor: palette.accent },
                        '&.Mui-focused fieldset': { borderColor: palette.accent },
                      },
                    }}
                  />
                ) : (
                  <Stack spacing={1.5}>
                    <TextField
                      label={type === 'url' ? 'URL' : 'Source path'}
                      size="small"
                      value={sourcePath}
                      onChange={(e) => setSourcePath(e.target.value)}
                      placeholder={
                        type === 'url'
                          ? 'https://docs.example.com'
                          : '/absolute/path/to/repo-or-file'
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: palette.border },
                          '&:hover fieldset': { borderColor: palette.accent },
                          '&.Mui-focused fieldset': { borderColor: palette.accent },
                        },
                      }}
                    />
                    {isUrl && (
                      <Stack spacing={1}>
                        <Typography sx={{ fontSize: 11, color: palette.textDim }}>
                          Optional crawl settings
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                          <TextField
                            label="Max depth"
                            size="small"
                            type="number"
                            value={crawlDepth}
                            onChange={(e) => setCrawlDepth(Number(e.target.value) || 0)}
                            helperText="0 = this page only"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: palette.border },
                                '&:hover fieldset': { borderColor: palette.accent },
                                '&.Mui-focused fieldset': { borderColor: palette.accent },
                              },
                            }}
                          />
                          <TextField
                            label="Max pages"
                            size="small"
                            type="number"
                            value={maxPages}
                            onChange={(e) => setMaxPages(Number(e.target.value) || 20)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: palette.border },
                                '&:hover fieldset': { borderColor: palette.accent },
                                '&.Mui-focused fieldset': { borderColor: palette.accent },
                              },
                            }}
                          />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                          <Button
                            size="small"
                            onClick={() => setSameHostOnly((v) => !v)}
                            sx={{
                              textTransform: 'none',
                              fontSize: 11,
                              borderRadius: 999,
                              border: `1px solid ${sameHostOnly ? palette.accent : palette.border}`,
                              bgcolor: sameHostOnly ? 'rgba(0,212,170,0.12)' : 'transparent',
                              color: sameHostOnly ? palette.accent : palette.textDim,
                              px: 1.5,
                              py: 0.25,
                            }}
                          >
                            {sameHostOnly ? 'Same host only' : 'Allow external hosts'}
                          </Button>
                          <TextField
                            label="Path prefix filter (optional)"
                            size="small"
                            fullWidth
                            value={pathPrefix}
                            onChange={(e) => setPathPrefix(e.target.value)}
                            placeholder="/docs"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: palette.border },
                                '&:hover fieldset': { borderColor: palette.accent },
                                '&.Mui-focused fieldset': { borderColor: palette.accent },
                              },
                            }}
                          />
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                )}

                {addError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {addError}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={adding}
                  sx={{
                    alignSelf: 'flex-start',
                    bgcolor: palette.accent,
                    color: palette.bg,
                    fontWeight: 700,
                    px: 3,
                    '&:hover': { bgcolor: palette.accentDim },
                  }}
                >
                  {adding ? 'Adding…' : 'Add source'}
                </Button>
              </Stack>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography sx={{ fontSize: 12, color: palette.textDim }}>
                  Tips:
                  <br />- Use <code>/Users/…</code> absolute paths for local docs and repos.
                  <br />- Index your `memory-bank` and docs to ground generation.
                  <br />- Large codebases will index in batches; re-run indexing to continue.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Source list */}
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1.5,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography sx={{ fontWeight: 600, color: palette.text }}>
                Knowledge sources
              </Typography>
              <Button
                size="small"
                onClick={fetchSources}
                startIcon={<RefreshIcon fontSize="small" />}
                sx={{
                  textTransform: 'none',
                  fontSize: 12,
                  color: palette.textMuted,
                  borderRadius: 999,
                  border: `1px solid ${palette.border}`,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                Refresh
              </Button>
            </Stack>

            {loadingSources ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: palette.textDim }}>
                <CircularProgress size={16} sx={{ color: palette.accent }} />
                <Typography sx={{ fontSize: 13 }}>Loading sources…</Typography>
              </Box>
            ) : sourcesError ? (
              <Alert severity="error">{sourcesError}</Alert>
            ) : sources.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: palette.textMuted, fontStyle: 'italic' }}>
                No knowledge sources yet. Add one above.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {sources.map((s) => (
                  <Box
                    key={s.id}
                    sx={{
                      borderRadius: 1,
                      border: `1px solid ${palette.border}`,
                      bgcolor: palette.bgCard,
                      px: 1.5,
                      py: 1,
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 1,
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: palette.text,
                          mb: 0.25,
                        }}
                      >
                        {s.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: palette.textDim,
                          wordBreak: 'break-all',
                        }}
                      >
                        {s.sourcePath || (s.type === 'text' ? 'pasted text' : '—')}
                      </Typography>
                      <Stack direction="row" spacing={1} mt={0.75} flexWrap="wrap">
                        <Chip
                          size="small"
                          label={s.type}
                          sx={{
                            fontSize: 10,
                            bgcolor: 'rgba(148, 163, 184, 0.12)',
                            color: '#e5e7eb',
                          }}
                        />
                        <Chip
                          size="small"
                          label={s.status}
                          sx={{
                            fontSize: 10,
                            textTransform: 'capitalize',
                            bgcolor:
                              s.status === 'indexed'
                                ? 'rgba(34,197,94,0.12)'
                                : s.status === 'error'
                                  ? 'rgba(239,68,68,0.12)'
                                  : 'rgba(148,163,184,0.12)',
                            color:
                              s.status === 'indexed'
                                ? '#4ade80'
                                : s.status === 'error'
                                  ? '#fca5a5'
                                  : '#e5e7eb',
                          }}
                        />
                        <Chip
                          size="small"
                          label={s.tag || 'docs'}
                          sx={{
                            fontSize: 10,
                            bgcolor: 'rgba(59,130,246,0.12)',
                            color: '#93c5fd',
                          }}
                        />
                      </Stack>
                    </Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                    >
                      <Typography sx={{ fontSize: 11, color: palette.textDim }}>
                        {s.chunkCount ?? 0} chunks
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleIndex(s.id)}
                        sx={{
                          textTransform: 'none',
                          fontSize: 12,
                          borderColor: palette.border,
                          color: palette.text,
                          '&:hover': { borderColor: palette.accent, bgcolor: 'transparent' },
                        }}
                      >
                        Index
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(s.id)}
                        sx={{
                          textTransform: 'none',
                          fontSize: 12,
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Test retrieval */}
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1.5,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 600, color: palette.text }}>
                Test retrieval
              </Typography>
              <Typography sx={{ fontSize: 13, color: palette.textMuted }}>
                Run a query to see which chunks are retrieved and how they would be injected into
                AI prompts.
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. How does the newsletter system handle double opt-in?"
                  InputProps={{
                    sx: {
                      '& fieldset': { borderColor: palette.border },
                      '&:hover fieldset': { borderColor: palette.accent },
                      '&.Mui-focused fieldset': { borderColor: palette.accent },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={searching || !query.trim()}
                  startIcon={<SearchIcon fontSize="small" />}
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
                  {searching ? 'Searching…' : 'Search'}
                </Button>
              </Stack>

              {searchError && <Alert severity="error">{searchError}</Alert>}

              {results && (
                <>
                  <Divider sx={{ borderColor: palette.border }} />
                  {results.length === 0 ? (
                    <Typography sx={{ fontSize: 13, color: palette.textDim }}>
                      No chunks matched this query above the similarity threshold.
                    </Typography>
                  ) : (
                    <Stack spacing={1.5} sx={{ maxHeight: 340, overflowY: 'auto', pr: 1 }}>
                      {results.map((r) => (
                        <Box
                          key={r.chunkId}
                          sx={{
                            borderRadius: 1,
                            border: `1px solid ${palette.border}`,
                            bgcolor: palette.bgCard,
                            px: 1.5,
                            py: 1,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography
                              sx={{
                                fontSize: 12,
                                color: palette.textDim,
                                maxWidth: '70%',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={`${r.sourceName} — ${r.originPath}`}
                            >
                              {r.sourceName} — {r.originPath}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                size="small"
                                label={r.tag}
                                sx={{
                                  fontSize: 10,
                                  bgcolor: 'rgba(59,130,246,0.12)',
                                  color: '#93c5fd',
                                }}
                              />
                              <Typography
                                sx={{ fontSize: 11, color: palette.textDim, fontFamily: 'monospace' }}
                              >
                                {r.score.toFixed(3)}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Typography
                            sx={{
                              mt: 0.75,
                              fontSize: 12,
                              color: palette.text,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {r.content}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Debug panel */}
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1.5,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 600, color: palette.text }}>
                Debug (database & vector index)
              </Typography>
              <Typography sx={{ fontSize: 13, color: palette.textMuted }}>
                Inspect knowledge base counts and run a low-level test query against the Atlas vector
                index to verify that embeddings and search are wired correctly.
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={debugQuery}
                  onChange={(e) => setDebugQuery(e.target.value)}
                  placeholder="Optional debug query, e.g. newsletter pipeline, Atlas Search, author style…"
                  InputProps={{
                    sx: {
                      '& fieldset': { borderColor: palette.border },
                      '&:hover fieldset': { borderColor: palette.accent },
                      '&.Mui-focused fieldset': { borderColor: palette.accent },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={async () => {
                    setDebugLoading(true);
                    setDebugError(null);
                    try {
                      const res = await fetch('/api/knowledge/debug', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: debugQuery.trim() || undefined }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        setDebugError(data.error || 'Debug request failed');
                        setDebugInfo(null);
                      } else {
                        setDebugInfo(data);
                      }
                    } catch {
                      setDebugError('Network error while running debug request');
                      setDebugInfo(null);
                    } finally {
                      setDebugLoading(false);
                    }
                  }}
                  startIcon={<RefreshIcon fontSize="small" />}
                  sx={{
                    textTransform: 'none',
                    fontSize: 12,
                    borderColor: palette.border,
                    color: palette.text,
                    '&:hover': { borderColor: palette.accent, bgcolor: 'transparent' },
                  }}
                >
                  {debugLoading ? 'Checking…' : 'Run debug check'}
                </Button>
              </Stack>

              {debugError && <Alert severity="error">{debugError}</Alert>}

              {debugInfo && (
                <Stack spacing={1.5} sx={{ fontSize: 12, color: palette.text }}>
                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: palette.text }}>
                      MongoDB
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: palette.textDim }}>
                      DB: <code>{debugInfo.dbName}</code>
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: palette.textDim }}>
                      Collections:{' '}
                      <code>{debugInfo.collections?.sources}</code>,{' '}
                      <code>{debugInfo.collections?.chunks}</code>,{' '}
                      <code>{debugInfo.collections?.versions}</code>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: palette.text }}>
                      Vector index (Atlas Search)
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: palette.textDim }}>
                      Collection: <code>{debugInfo.expectedVectorIndex?.collection}</code>, Field:{' '}
                      <code>{debugInfo.expectedVectorIndex?.field}</code>, Index name:{' '}
                      <code>{debugInfo.expectedVectorIndex?.indexName}</code>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: palette.text }}>
                      Document counts
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: palette.textDim }}>
                      Sources: {debugInfo.counts?.sources ?? 0} · Chunks:{' '}
                      {debugInfo.counts?.chunks ?? 0} · Versions:{' '}
                      {debugInfo.counts?.versions ?? 0}
                    </Typography>
                  </Box>
                  {Array.isArray(debugInfo.sampleSources) && debugInfo.sampleSources.length > 0 && (
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: palette.text }}>
                        Sample sources
                      </Typography>
                      {debugInfo.sampleSources.map((s: any) => (
                        <Typography
                          key={s.id}
                          sx={{ fontSize: 12, color: palette.textDim, whiteSpace: 'nowrap' }}
                        >
                          {s.name} ({s.type}, {s.status}) — chunks: {s.chunkCount ?? 0}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  {debugInfo.sampleSearch && (
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: palette.text }}>
                        Sample search
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: palette.textDim, mb: 0.5 }}>
                        Query: <code>{debugInfo.sampleSearch.query}</code> · Results:{' '}
                        {debugInfo.sampleSearch.count}
                      </Typography>
                      {Array.isArray(debugInfo.sampleSearch.chunks) &&
                        debugInfo.sampleSearch.chunks.length > 0 && (
                          <Typography sx={{ fontSize: 12, color: palette.textDim }}>
                            Top result:{' '}
                            {debugInfo.sampleSearch.chunks[0].sourceName} —{' '}
                            {debugInfo.sampleSearch.chunks[0].originPath} (
                            {debugInfo.sampleSearch.chunks[0].score.toFixed(3)})
                          </Typography>
                        )}
                      {debugInfo.searchError && (
                        <Typography sx={{ fontSize: 11, color: '#f97373', mt: 0.5 }}>
                          Search error: {debugInfo.searchError}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

