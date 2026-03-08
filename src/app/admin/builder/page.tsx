'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { palette } from '@/theme/theme';

interface Draft {
  id: string;
  type: string;
  title: string;
  body: string;
  status: string;
  platform?: string;
  channel?: string | null;
  updatedAt: string;
}

function getDraftTimestamp(updatedAt: string) {
  const timestamp = Date.parse(updatedAt);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function dedupeDrafts(nextDrafts: Draft[]) {
  const draftsById = new Map<string, Draft>();

  for (const draft of nextDrafts) {
    const existingDraft = draftsById.get(draft.id);
    if (!existingDraft || getDraftTimestamp(draft.updatedAt) >= getDraftTimestamp(existingDraft.updatedAt)) {
      draftsById.set(draft.id, draft);
    }
  }

  return [...draftsById.values()].sort(
    (left, right) => getDraftTimestamp(right.updatedAt) - getDraftTimestamp(left.updatedAt),
  );
}

export default function AdminBuilderPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newDraft, setNewDraft] = useState({
    title: '',
    type: 'blog-post',
    platform: '',
    body: '',
  });
  const [genTopic, setGenTopic] = useState('');
  const [genType, setGenType] = useState('blog-post');
  const [genPlatform, setGenPlatform] = useState('');
  const [genExtra, setGenExtra] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genBody, setGenBody] = useState('');
  const [ragQuery, setRagQuery] = useState('');
  const [ragUsing, setRagUsing] = useState(false);

  const loadDrafts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/drafts');
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to load drafts.');
        setDrafts([]);
        return;
      }

      setDrafts(dedupeDrafts(Array.isArray(data.drafts) ? data.drafts : []));
    } catch {
      setError('Network error while loading drafts.');
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this draft?')) return;
    try {
      const res = await fetch(`/api/drafts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const filteredDrafts = drafts.filter((d) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      (d.platform || '').toLowerCase().includes(q)
    );
  });

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
        Content Builder
      </Typography>
      <Typography sx={{ color: palette.textMuted, mb: 3 }}>
        Manage AI-generated drafts that will feed newsletters, blog posts, and social campaigns. Generation and rich
        editing tools will plug into this library next.
      </Typography>

      <Stack spacing={2}>
        {/* AI generation */}
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <Typography sx={{ fontWeight: 600, color: palette.text, mb: 1 }}>
              Generate with AI
            </Typography>
            <Typography sx={{ color: palette.textMuted, mb: 2, fontSize: 13 }}>
              Use OpenAI to generate vai-grounded drafts for blogs, social posts, code examples, and video
              scripts. You can edit and save results into the draft library.
            </Typography>
            {genError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {genError}
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField
                label="Topic"
                fullWidth
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: palette.border },
                    '&:hover fieldset': { borderColor: palette.accent },
                    '&.Mui-focused fieldset': { borderColor: palette.accent },
                  },
                }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="gen-type-label">Type</InputLabel>
                  <Select
                    labelId="gen-type-label"
                    label="Type"
                    value={genType}
                    onChange={(e) => setGenType(e.target.value as string)}
                  >
                    <MenuItem value="blog-post">Blog post</MenuItem>
                    <MenuItem value="social-post">Social post</MenuItem>
                    <MenuItem value="code-example">Code example</MenuItem>
                    <MenuItem value="video-script">Video script</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel id="gen-platform-label">Platform</InputLabel>
                  <Select
                    labelId="gen-platform-label"
                    label="Platform"
                    value={genPlatform}
                    onChange={(e) => setGenPlatform(e.target.value as string)}
                  >
                    <MenuItem value="">Generic</MenuItem>
                    <MenuItem value="linkedin">LinkedIn</MenuItem>
                    <MenuItem value="devto">Dev.to</MenuItem>
                    <MenuItem value="hashnode">Hashnode</MenuItem>
                    <MenuItem value="discord">Discord</MenuItem>
                    <MenuItem value="slack">Slack</MenuItem>
                    <MenuItem value="newsletter">Newsletter</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <TextField
                label="Additional instructions (optional)"
                fullWidth
                value={genExtra}
                onChange={(e) => setGenExtra(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: palette.border },
                    '&:hover fieldset': { borderColor: palette.accent },
                    '&.Mui-focused fieldset': { borderColor: palette.accent },
                  },
                }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Knowledge base query (optional)"
                  fullWidth
                  value={ragQuery}
                  onChange={(e) => setRagQuery(e.target.value)}
                  placeholder="e.g. MongoDB Atlas Search index config, newsletter architecture…"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: palette.border },
                      '&:hover fieldset': { borderColor: palette.accent },
                      '&.Mui-focused fieldset': { borderColor: palette.accent },
                    },
                  }}
                />
                <Chip
                  label={ragUsing ? 'Using KB context' : 'Use KB context'}
                  onClick={() => setRagUsing((v) => !v)}
                  sx={{
                    alignSelf: { xs: 'flex-start', sm: 'center' },
                    cursor: 'pointer',
                    bgcolor: ragUsing ? 'rgba(0,212,170,0.16)' : 'transparent',
                    border: `1px solid ${ragUsing ? palette.accent : palette.border}`,
                    color: ragUsing ? palette.accent : palette.textDim,
                    fontSize: 12,
                    px: 1.5,
                    py: 0.5,
                  }}
                />
              </Stack>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Typography sx={{ color: palette.textDim, fontSize: 12 }}>
                  Model: {process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o'}
                </Typography>
                <Chip
                  label={genLoading ? 'Generating…' : 'Generate draft'}
                  onClick={async () => {
                    if (!genTopic.trim()) {
                      setGenError('Topic is required.');
                      return;
                    }
                    setGenError(null);
                    setGenLoading(true);
                    setGenBody('');
                    try {
                      let knowledgeContext: string[] | undefined;
                      if (ragUsing && ragQuery.trim()) {
                        const ragRes = await fetch('/api/knowledge/search', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ query: ragQuery.trim(), topK: 8 }),
                        });
                        const ragData = await ragRes.json().catch(() => ({}));
                        if (ragRes.ok && Array.isArray(ragData.chunks)) {
                          knowledgeContext = ragData.chunks.map(
                            (c: any) => `[Source: ${c.sourceName} | ${c.originPath}]\n${c.content}`,
                          );
                        } else if (!ragRes.ok) {
                          setGenError(
                            ragData.error ||
                              'Knowledge base search failed. Generation will continue without KB context.',
                          );
                        }
                      }

                      const res = await fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          topic: genTopic,
                          contentType: genType,
                          platform: genPlatform || undefined,
                          additionalInstructions: genExtra || undefined,
                          knowledgeContext,
                        }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok || !data.draft) {
                        setGenError(data.error || 'Generation failed.');
                      } else {
                        setGenBody(data.draft.body || '');
                        setNewDraft({
                          title: data.draft.title || genTopic,
                          type: data.draft.type || genType,
                          platform: data.draft.platform || genPlatform || '',
                          body: data.draft.body || '',
                        });
                      }
                    } catch {
                      setGenError('Network error while generating content.');
                    } finally {
                      setGenLoading(false);
                    }
                  }}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: palette.accent,
                    color: palette.bg,
                    fontWeight: 600,
                    '&:hover': { bgcolor: palette.accentDim },
                  }}
                />
              </Box>
              {genBody && (
                <TextField
                  label="Generated draft (editable)"
                  fullWidth
                  multiline
                  minRows={6}
                  value={newDraft.body}
                  onChange={(e) =>
                    setNewDraft((d) => ({
                      ...d,
                      body: e.target.value,
                    }))
                  }
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
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* New draft composer (manual for now; AI generation will plug in later) */}
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <Typography sx={{ fontWeight: 600, color: palette.text, mb: 1 }}>
              New draft
            </Typography>
            <Typography sx={{ color: palette.textMuted, mb: 2, fontSize: 13 }}>
              Start a draft manually. Later, AI-generated content from vai will flow into this composer.
            </Typography>
            {createError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {createError}
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField
                label="Title"
                fullWidth
                value={newDraft.title}
                onChange={(e) => setNewDraft((d) => ({ ...d, title: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: palette.border },
                    '&:hover fieldset': { borderColor: palette.accent },
                    '&.Mui-focused fieldset': { borderColor: palette.accent },
                  },
                }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="draft-type-label">Type</InputLabel>
                  <Select
                    labelId="draft-type-label"
                    label="Type"
                    value={newDraft.type}
                    onChange={(e) =>
                      setNewDraft((d) => ({ ...d, type: e.target.value as string }))
                    }
                  >
                    <MenuItem value="blog-post">Blog post</MenuItem>
                    <MenuItem value="social-post">Social post</MenuItem>
                    <MenuItem value="code-example">Code example</MenuItem>
                    <MenuItem value="video-script">Video script</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel id="draft-platform-label">Platform</InputLabel>
                  <Select
                    labelId="draft-platform-label"
                    label="Platform"
                    value={newDraft.platform}
                    onChange={(e) =>
                      setNewDraft((d) => ({ ...d, platform: e.target.value as string }))
                    }
                  >
                    <MenuItem value="">Generic</MenuItem>
                    <MenuItem value="linkedin">LinkedIn</MenuItem>
                    <MenuItem value="devto">Dev.to</MenuItem>
                    <MenuItem value="hashnode">Hashnode</MenuItem>
                    <MenuItem value="discord">Discord</MenuItem>
                    <MenuItem value="slack">Slack</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <TextField
                label="Body"
                fullWidth
                multiline
                minRows={5}
                value={newDraft.body}
                onChange={(e) => setNewDraft((d) => ({ ...d, body: e.target.value }))}
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Chip
                  label={creating ? 'Saving…' : 'Save draft'}
                  color="primary"
                  onClick={async () => {
                    if (!newDraft.title.trim() || !newDraft.body.trim()) {
                      setCreateError('Title and body are required.');
                      return;
                    }
                    setCreateError(null);
                    setCreating(true);
                    try {
                      const res = await fetch('/api/drafts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: newDraft.title,
                          type: newDraft.type,
                          platform: newDraft.platform || undefined,
                          body: newDraft.body,
                        }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        setCreateError(data.error || 'Failed to save draft.');
                      } else {
                        setDrafts((prev) => dedupeDrafts([data, ...prev]));
                        setNewDraft({ title: '', type: 'blog-post', platform: '', body: '' });
                      }
                    } catch {
                      setCreateError('Network error while saving draft.');
                    } finally {
                      setCreating(false);
                    }
                  }}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: palette.accent,
                    color: palette.bg,
                    fontWeight: 600,
                    '&:hover': { bgcolor: palette.accentDim },
                  }}
                />
              </Box>
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
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              mb={2}
            >
              <Typography sx={{ fontWeight: 600, color: palette.text }}>
                Draft library
              </Typography>
              <TextField
                size="small"
                placeholder="Filter by title, type, or platform…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{
                  minWidth: { xs: '100%', sm: 260 },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: palette.border },
                    '&:hover fieldset': { borderColor: palette.accent },
                    '&.Mui-focused fieldset': { borderColor: palette.accent },
                  },
                }}
              />
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CircularProgress size={20} sx={{ color: palette.accent, mr: 1 }} />
                <Typography sx={{ color: palette.textMuted, fontSize: 13 }}>
                  Loading drafts…
                </Typography>
              </Box>
            ) : filteredDrafts.length === 0 ? (
              <Typography sx={{ color: palette.textDim, fontSize: 14 }}>
                No drafts yet. Once generation tools are connected, saved drafts will appear here.
              </Typography>
            ) : (
              <List dense>
                {filteredDrafts.map((draft) => (
                    <ListItem
                      key={draft.id}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleDelete(draft.id)} sx={{ color: '#f97373' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        border: `1px solid ${palette.border}`,
                        bgcolor: palette.bgCard,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Link
                            href={`/admin/builder/drafts/${draft.id}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <Typography
                              sx={{
                                color: palette.text,
                                fontWeight: 600,
                                fontSize: 14,
                                '&:hover': { textDecoration: 'underline' },
                              }}
                            >
                              {draft.title}
                            </Typography>
                          </Link>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                        secondary={
                          <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
                            <Chip
                              label={draft.type}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(0,212,170,0.08)',
                                color: palette.accent,
                                fontSize: 11,
                              }}
                            />
                            <Chip
                              label={draft.status}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(148,163,184,0.15)',
                                color: palette.textMuted,
                                fontSize: 11,
                              }}
                            />
                            {draft.platform && (
                              <Chip
                                label={draft.platform}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(59,130,246,0.12)',
                                  color: '#3b82f6',
                                  fontSize: 11,
                                }}
                              />
                            )}
                            <Typography sx={{ color: palette.textDim, fontSize: 11 }}>
                              {new Date(draft.updatedAt).toLocaleString()}
                            </Typography>
                          </Stack>
                        }
                      />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

