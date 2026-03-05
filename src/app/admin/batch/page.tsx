'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { palette } from '@/theme/theme';

type Platform = 'linkedin' | 'devto' | 'hashnode' | 'discord' | 'slack';

interface TopicIdea {
  id: string;
  title: string;
  summary: string;
  keywords?: string[];
}

type SelectedConfig = {
  channel: Platform | string | '';
  articleCount: number;
};

const CHANNELS: (Platform | '')[] = ['', 'linkedin', 'devto', 'hashnode', 'discord', 'slack'];
const PLATFORMS: Platform[] = ['linkedin', 'devto', 'hashnode', 'discord', 'slack'];

export default function BatchPage() {
  const [prompt, setPrompt] = useState('');
  const [topics, setTopics] = useState<TopicIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [config, setConfig] = useState<Record<string, SelectedConfig>>({});
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);

  const handleGenerateTopics = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/generate/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.details ?? data?.error ?? 'Failed to generate topics');
        return;
      }
      setTopics(data.topics ?? []);
      setSelected(new Set());
      setConfig({});
    } catch {
      setError('Network error while generating topics');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setConfig((c) => {
          const copy = { ...c };
          delete copy[id];
          return copy;
        });
      } else {
        next.add(id);
        setConfig((c) => ({
          ...c,
          [id]: c[id] ?? { channel: '', articleCount: 1 },
        }));
      }
      return next;
    });
  };

  const setChannel = (id: string, channel: Platform | '') => {
    setConfig((c) => ({
      ...c,
      [id]: { ...(c[id] ?? { channel: '', articleCount: 1 }), channel },
    }));
  };

  const setArticleCount = (id: string, count: number) => {
    setConfig((c) => ({
      ...c,
      [id]: {
        ...(c[id] ?? { channel: '', articleCount: 1 }),
        articleCount: Math.max(1, Math.min(99, count)),
      },
    }));
  };

  const handleAddToPlan = async () => {
    if (selected.size === 0 || adding) return;
    setAddMessage(null);
    setGenerateMessage(null);
    setAdding(true);
    try {
      const items = topics
        .filter((t) => selected.has(t.id))
        .map((t) => {
          const cf = config[t.id];
          return {
            topicTitle: t.title,
            summary: t.summary,
            keywords: t.keywords,
            channel: cf?.channel && String(cf.channel).trim() ? cf.channel : null,
            articleCount: cf?.articleCount ?? 1,
          };
        });
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddMessage(data?.error ?? 'Failed to add to plan');
        return;
      }
      setAddMessage(
        `Added ${items.length} topic${items.length > 1 ? 's' : ''} to your content plan. Use Generate to create drafts from these topics.`,
      );
      setTimeout(() => setAddMessage(null), 5000);
    } catch {
      setAddMessage('Network error while adding to plan');
    } finally {
      setAdding(false);
    }
  };

  const handleGenerateDrafts = async () => {
    if (selected.size === 0 || generating) return;
    setGenerateMessage(null);
    setError(null);
    setGenerating(true);
    let created = 0;

    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const topic of topics) {
        if (!selected.has(topic.id)) continue;

        const cf = config[topic.id];
        const articleCount = cf?.articleCount ?? 1;
        const channel =
          cf?.channel && String(cf.channel).trim() ? String(cf.channel).trim() : undefined;
        const platform =
          channel && PLATFORMS.includes(channel as Platform) ? (channel as Platform) : undefined;

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < articleCount; i++) {
          // Generate draft
          // eslint-disable-next-line no-await-in-loop
          const genRes = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contentType: 'blog-post',
              topic: topic.title,
              platform,
              additionalInstructions: `Base this draft on the following topic summary and keywords.\n\nSummary: ${
                topic.summary
              }${
                topic.keywords && topic.keywords.length
                  ? `\nKeywords: ${topic.keywords.join(', ')}`
                  : ''
              }${channel ? `\nTarget channel: ${channel}.` : ''}`,
            }),
          });
          // eslint-disable-next-line no-await-in-loop
          const genData = await genRes.json().catch(() => ({}));
          if (!genRes.ok || !genData?.draft) {
            setGenerateMessage(genData?.error ?? 'Failed to generate one or more drafts');
            break;
          }

          const draftToSave = {
            ...genData.draft,
            channel: channel ?? null,
          };

          // eslint-disable-next-line no-await-in-loop
          const saveRes = await fetch('/api/drafts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(draftToSave),
          });
          if (!saveRes.ok) {
            // eslint-disable-next-line no-await-in-loop
            const saveData = await saveRes.json().catch(() => ({}));
            setGenerateMessage(saveData?.error ?? 'Failed to save one or more drafts');
            break;
          }

          created += 1;
        }
      }

      if (created > 0) {
        setGenerateMessage(
          `Generated ${created} draft${created > 1 ? 's' : ''}. View them in the Draft library.`,
        );
        setTimeout(() => setGenerateMessage(null), 6000);
      } else if (!generateMessage) {
        setGenerateMessage('No drafts were generated.');
      }
    } catch {
      setGenerateMessage('Network error while generating drafts');
    } finally {
      setGenerating(false);
    }
  };

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
        Batch topic ideas
      </Typography>
      <Typography sx={{ color: palette.textDim, fontSize: 13, mb: 3 }}>
        Describe the kind of content you want. We’ll suggest topics and brief summaries. Select
        topics to add to your content plan and generate multiple drafts per channel.
      </Typography>

      <Stack spacing={2}>
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1.5,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <form onSubmit={handleGenerateTopics}>
              <Stack spacing={2}>
                <TextField
                  label="Request"
                  multiline
                  minRows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Blog ideas about Voyage AI CLI and RAG for developers. Keywords: vai, embeddings, retrieval. Mix tutorials and conceptual posts. 10–12 topics."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: palette.border },
                      '&:hover fieldset': { borderColor: palette.accent },
                      '&.Mui-focused fieldset': { borderColor: palette.accent },
                    },
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !prompt.trim()}
                    startIcon={<AutoAwesomeIcon fontSize="small" />}
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
                    {loading ? 'Generating…' : 'Generate topic ideas'}
                  </Button>
                  {error && (
                    <Typography sx={{ fontSize: 12, color: '#f97373' }}>{error}</Typography>
                  )}
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>

        {topics.length > 0 && (
          <Card
            sx={{
              bgcolor: palette.bgSurface,
              borderRadius: 1.5,
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
                <Typography sx={{ fontWeight: 600, color: palette.text }}>Topics</Typography>
                {selected.size > 0 && (
                  <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                    <Typography sx={{ fontSize: 12, color: palette.textDim }}>
                      {selected.size} selected
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleAddToPlan}
                      disabled={adding}
                      sx={{
                        textTransform: 'none',
                        fontSize: 12,
                        borderColor: palette.border,
                        color: palette.text,
                        '&:hover': { borderColor: palette.accent, bgcolor: 'transparent' },
                      }}
                      startIcon={<PlaylistAddIcon fontSize="small" />}
                    >
                      {adding ? 'Adding…' : 'Add to plan'}
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleGenerateDrafts}
                      disabled={generating}
                      sx={{
                        textTransform: 'none',
                        fontSize: 12,
                        bgcolor: palette.accent,
                        color: palette.bg,
                        fontWeight: 700,
                        '&:hover': { bgcolor: palette.accentDim },
                      }}
                    >
                      {generating ? 'Generating drafts…' : 'Generate drafts'}
                    </Button>
                  </Stack>
                )}
              </Stack>
              {addMessage && (
                <Alert severity="success" sx={{ mb: 1 }}>
                  {addMessage}
                </Alert>
              )}
              {generateMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {generateMessage}
                </Alert>
              )}

              <Stack spacing={1.5}>
                {topics.map((t) => {
                  const isSelected = selected.has(t.id);
                  return (
                    <Box
                      key={t.id}
                      sx={{
                        borderRadius: 1,
                        border: `1px solid ${isSelected ? palette.border : '#1f2933'}`,
                        bgcolor: isSelected ? palette.bgCard : palette.bgSurface,
                        px: 1.5,
                        py: 1.25,
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleSelected(t.id)}
                    >
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: palette.text, mb: 0.5 }}>
                        {t.title}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: palette.textDim, mb: 0.5 }}>
                        {t.summary}
                      </Typography>
                      {t.keywords && t.keywords.length > 0 && (
                        <Typography sx={{ fontSize: 11, color: palette.textMuted }}>
                          {t.keywords.join(', ')}
                        </Typography>
                      )}
                      {isSelected && (
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1.5}
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          mt={1.5}
                        >
                          <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel id={`channel-${t.id}`}>Channel</InputLabel>
                            <Select
                              labelId={`channel-${t.id}`}
                              label="Channel"
                              value={config[t.id]?.channel ?? ''}
                              onChange={(e) =>
                                setChannel(t.id, e.target.value as Platform | '')
                              }
                              onClick={(e) => e.stopPropagation()}
                            >
                              {CHANNELS.map((ch) => (
                                <MenuItem key={ch || 'none'} value={ch || ''}>
                                  {ch || '—'}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: 11, color: palette.textDim }}>
                              # pieces
                            </Typography>
                            <TextField
                              size="small"
                              type="number"
                              inputProps={{ min: 1, max: 99 }}
                              value={config[t.id]?.articleCount ?? 1}
                              onChange={(e) =>
                                setArticleCount(t.id, Number(e.target.value) || 1)
                              }
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                width: 72,
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': { borderColor: palette.border },
                                  '&:hover fieldset': { borderColor: palette.accent },
                                  '&.Mui-focused fieldset': { borderColor: palette.accent },
                                },
                              }}
                            />
                          </Box>
                        </Stack>
                      )}
                      {isSelected && (
                        <Stack direction="row" spacing={1} mt={1}>
                          <Chip
                            size="small"
                            label={
                              (config[t.id]?.channel && String(config[t.id].channel)) ||
                              'Channel: —'
                            }
                            sx={{
                              fontSize: 10,
                              bgcolor: 'rgba(148,163,184,0.12)',
                              color: '#e5e7eb',
                            }}
                          />
                          <Chip
                            size="small"
                            label={`Pieces: ${config[t.id]?.articleCount ?? 1}`}
                            sx={{
                              fontSize: 10,
                              bgcolor: 'rgba(34,197,94,0.12)',
                              color: '#bbf7d0',
                            }}
                          />
                        </Stack>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}

