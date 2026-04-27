'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { palette } from '@/theme/theme';
import UnsplashImagePicker, {
  UnsplashImageChoice,
} from '@/components/admin/UnsplashImagePicker';

interface Draft {
  id: string;
  type: string;
  title: string;
  body: string;
  status: string;
  platform?: string;
  channel?: string | null;
  plannedPublishAt?: string | null;
  updatedAt: string;
}

interface FactCheckClaim {
  id: number;
  text: string;
  verdict: 'supported' | 'partially_supported' | 'unsupported' | 'contradictory';
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  suggestedFix?: string;
}

interface StyleRule {
  id: string;
  passed: boolean;
  notes: string;
}

type RefineMode = 'clarify' | 'shorten' | 'expand' | 'more_technical' | 'add_cta';

export default function DraftEditorPage() {
  const params = useParams<{ id: string }>();
  const draftId = params.id;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<string>('draft');
  const [channel, setChannel] = useState<string>('');
  const [plannedPublishDate, setPlannedPublishDate] = useState<string>('');
  const [refineMode, setRefineMode] = useState<RefineMode>('clarify');
  const [refining, setRefining] = useState(false);
  const [refineMessage, setRefineMessage] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [selectionText, setSelectionText] = useState('');
  const [selectionMenu, setSelectionMenu] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });
  const [refineInstruction, setRefineInstruction] = useState('');
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'refine' | 'quality'>('write');
  const [factChecking, setFactChecking] = useState(false);
  const [factError, setFactError] = useState<string | null>(null);
  const [factClaims, setFactClaims] = useState<FactCheckClaim[] | null>(null);
  const [factNote, setFactNote] = useState('');
  const [kbQuery, setKbQuery] = useState('');
  const [kbUsing, setKbUsing] = useState(false);
  const [styleChecking, setStyleChecking] = useState(false);
  const [styleError, setStyleError] = useState<string | null>(null);
  const [styleRules, setStyleRules] = useState<StyleRule[] | null>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [suggestingTitle, setSuggestingTitle] = useState(false);
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>('light');
  const [footerBio, setFooterBio] = useState('');
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [sendDryRun, setSendDryRun] = useState(true);
  const [sendStatus, setSendStatus] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/drafts/${draftId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || 'Failed to load draft.');
          setDraft(null);
        } else {
        setDraft(data);
        setTitle(data.title || '');
        setBody(data.body || '');
        setStatus(data.status || 'draft');
        setChannel(data.channel || '');
        setPlannedPublishDate(
          data.plannedPublishAt && typeof data.plannedPublishAt === 'string'
            ? data.plannedPublishAt.slice(0, 10)
            : '',
        );
        }
      } catch {
        setError('Network error while loading draft.');
        setDraft(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [draftId]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.settings) return;
        const theme =
          data.settings.editorTheme === 'dark' || data.settings.editorTheme === 'light'
            ? data.settings.editorTheme
            : 'light';
        setEditorTheme(theme);
        if (typeof data.settings.footerBio === 'string') {
          setFooterBio(data.settings.footerBio);
        }
      } catch {
        // ignore, fall back to default
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadSettings();
  }, []);

  const handleSelectionChange = () => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (end > start) {
      setSelection({ start, end });
      setSelectionText(body.slice(start, end));
    } else {
      setSelection(null);
      setSelectionText('');
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/drafts/${draft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          status,
          channel: channel || null,
          plannedPublishAt: plannedPublishDate || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to save draft.');
      } else {
        setDraft(data);
      }
    } catch {
      setError('Network error while saving draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleRefine = async () => {
    if (!draft) return;
    setRefining(true);
    setRefineMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/drafts/${draft.id}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body,
          selection,
          mode: refineMode,
          instruction: refineInstruction,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.draft) {
        setError(data.error || 'Refine failed.');
      } else {
        setDraft(data.draft);
        setBody(data.draft.body || '');
        setRefineMessage('Refine applied.');
        setTimeout(() => setRefineMessage(null), 3000);
      }
    } catch {
      setError('Network error while refining text.');
    } finally {
      setRefining(false);
    }
  };

  const handleContextMenu = (event: any) => {
    if (!selection || !selectionText.trim()) return;
    event.preventDefault();
    setSelectionMenu({
      x: event.clientX,
      y: event.clientY,
      visible: true,
    });
  };

  const hideSelectionMenu = () => {
    if (selectionMenu.visible) {
      setSelectionMenu((m) => ({ ...m, visible: false }));
    }
  };

  const handleQuickRefineSelection = async () => {
    if (!draft || !selection) return;
    hideSelectionMenu();
    // Move to the Refine tab so the editor can provide a targeted instruction
    // before we call the refine API. Selection info is already tracked in state
    // and will be used when "Apply refine" is clicked.
    setActiveTab('refine');
  };

  const handleQuickInterject = async () => {
    if (!draft || !selection) return;
    hideSelectionMenu();
    setRefineInstruction(
      'Inject a short, concrete anecdote or story that illustrates this point, then smoothly bridge back to the main concept. Keep it tight and non-hypey.',
    );
    await handleRefine();
  };

  const handleQuickFactCheckSelection = async () => {
    if (!draft || !selection || !selectionText.trim()) return;
    hideSelectionMenu();
    setActiveTab('quality');
    setFactChecking(true);
    setFactError(null);
    setFactClaims(null);
    try {
      let knowledgeContext: string[] | undefined;
      if (kbUsing && kbQuery.trim()) {
        const ragRes = await fetch('/api/knowledge/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: kbQuery.trim(), topK: 8 }),
        });
        const ragData = await ragRes.json().catch(() => ({}));
        if (ragRes.ok && Array.isArray(ragData.chunks)) {
          knowledgeContext = ragData.chunks.map(
            (c: any) => `[Source: ${c.sourceName} | ${c.originPath}]\n${c.content}`,
          );
        } else if (!ragRes.ok) {
          setFactError(
            ragData.error ||
              'Knowledge base search failed. Fact check will continue without KB context.',
          );
        }
      }

      const res = await fetch(`/api/drafts/${draft.id}/fact-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: selectionText,
          note:
            factNote && factNote.trim().length > 0
              ? factNote
              : 'The human editor is unsure whether this specific highlighted statement is accurate and wants you to scrutinize it carefully.',
          knowledgeContext,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFactError(data.error || 'Fact check failed.');
        return;
      }
      setFactClaims((data.claims || []) as FactCheckClaim[]);
    } catch {
      setFactError('Network error while running fact check.');
    } finally {
      setFactChecking(false);
    }
  };

  const handleFactCheck = async () => {
    if (!draft) return;
    setFactChecking(true);
    setFactError(null);
    setFactClaims(null);
    try {
      let knowledgeContext: string[] | undefined;
      if (kbUsing && kbQuery.trim()) {
        const ragRes = await fetch('/api/knowledge/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: kbQuery.trim(), topK: 8 }),
        });
        const ragData = await ragRes.json().catch(() => ({}));
        if (ragRes.ok && Array.isArray(ragData.chunks)) {
          knowledgeContext = ragData.chunks.map(
            (c: any) => `[Source: ${c.sourceName} | ${c.originPath}]\n${c.content}`,
          );
        } else if (!ragRes.ok) {
          setFactError(
            ragData.error ||
              'Knowledge base search failed. Fact check will continue without KB context.',
          );
        }
      }

      const res = await fetch(`/api/drafts/${draft.id}/fact-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body,
          note: factNote,
          knowledgeContext,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFactError(data.error || 'Fact check failed.');
        return;
      }
      setFactClaims((data.claims || []) as FactCheckClaim[]);
    } catch {
      setFactError('Network error while running fact check.');
    } finally {
      setFactChecking(false);
    }
  };

  const handleStyleCheck = async () => {
    if (!draft) return;
    setStyleChecking(true);
    setStyleError(null);
    setStyleRules(null);
    try {
      const res = await fetch(`/api/drafts/${draft.id}/style-validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStyleError(data.error || 'Style check failed.');
        return;
      }
      setStyleRules((data.rules || []) as StyleRule[]);
    } catch {
      setStyleError('Network error while running style check.');
    } finally {
      setStyleChecking(false);
    }
  };

  const handleInsertImage = (img: UnsplashImageChoice) => {
    const alt = img.alt || title || 'Image';
    const attribution = `Photo by [${img.photographer}](${img.photographerUrl}) on [Unsplash](${img.unsplashUrl}).`;

    if (!bodyRef.current) {
      const snippet = `\n\n![${alt}](${img.url})\n\n${attribution}\n`;
      setBody((prev) => (prev || '') + snippet);
      return;
    }

    const el = bodyRef.current;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const before = body.slice(0, start);
    const after = body.slice(end);
    const snippet = `![${alt}](${img.url})`;
    const attributionBlock = `\n\n${attribution}\n`;

    const nextBody = `${before}${snippet}${after}${
      body.includes('Photo by ') ? '' : attributionBlock
    }`;
    setBody(nextBody);
  };

  const applyInlineMarkdown = (wrapper: (selected: string) => string) => {
    if (!bodyRef.current) return;
    const el = bodyRef.current;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const before = body.slice(0, start);
    const sel = body.slice(start, end) || '';
    const after = body.slice(end);
    const next = `${before}${wrapper(sel || (wrapper === wrapBold ? 'bold text' : ''))}${after}`;
    setBody(next);
  };

  const wrapBold = (text: string) => `**${text || 'bold text'}**`;
  const wrapItalic = (text: string) => `*${text || 'italic text'}*`;

  const insertHeading = () => {
    if (!bodyRef.current) return;
    const el = bodyRef.current;
    const start = el.selectionStart ?? 0;
    const lineStart = body.lastIndexOf('\n', start - 1) + 1;
    const next = `${body.slice(0, lineStart)}## ${body.slice(lineStart)}`;
    setBody(next);
  };

  const insertListItem = () => {
    if (!bodyRef.current) return;
    const el = bodyRef.current;
    const start = el.selectionStart ?? 0;
    const lineStart = body.lastIndexOf('\n', start - 1) + 1;
    const next = `${body.slice(0, lineStart)}- ${body.slice(lineStart)}`;
    setBody(next);
  };

  const insertLink = () => {
    if (!bodyRef.current) return;
    const el = bodyRef.current;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const before = body.slice(0, start);
    const sel = body.slice(start, end) || 'link text';
    const after = body.slice(end);
    const next = `${before}[${sel}](https://example.com)${after}`;
    setBody(next);
  };

  const insertFooterBio = () => {
    if (!footerBio || !footerBio.trim()) return;
    const trimmed = footerBio.trim();
    if (body.includes(trimmed)) return;

    const separator = '\n\n---\n\n';
    const snippet = separator + trimmed;
    setBody((prev) => (prev || '') + snippet);
  };

  const handleSuggestTitle = async () => {
    if (!draft) return;
    if (!body.trim()) {
      setError('Body is required before suggesting a title.');
      return;
    }
    setSuggestingTitle(true);
    setError(null);
    try {
      const res = await fetch(`/api/drafts/${draft.id}/suggest-title`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, channel }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.suggestedTitle) {
        setError(data.error || 'Failed to suggest a title.');
        return;
      }
      setTitle(data.suggestedTitle);
    } catch {
      setError('Network error while suggesting title.');
    } finally {
      setSuggestingTitle(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!draft) return;
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required before sending a newsletter.');
      return;
    }

    setSendingNewsletter(true);
    setSendError(null);
    setSendStatus(null);
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: title,
          textBody: body,
          dryRun: sendDryRun,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setSendError(data.error || 'Newsletter send failed. Check server logs for details.');
      } else {
        const sent = data.sent || 0;
        const errors = (data.errors || []).length || 0;
        setSendStatus(
          sendDryRun
            ? `Dry run: would send to ${sent} active subscriber(s) with ${errors} error(s).`
            : `Sent to ${sent} active subscriber(s) with ${errors} error(s).`,
        );
      }
    } catch {
      setSendError('Network error while sending newsletter.');
    } finally {
      setSendingNewsletter(false);
    }
  };

  const isLight = editorTheme === 'light';

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: palette.accent }} />
      </Box>
    );
  }

  if (!draft) {
    return (
      <Box sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography sx={{ color: palette.textMuted }}>Draft not found.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{ py: 2 }}
      onClick={hideSelectionMenu}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center',  mb: 2 }}>
        <IconButton
          href="/admin/builder"
          sx={{ color: palette.textMuted }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: palette.accent,
            fontFamily: "'Source Code Pro', monospace",
          }}
        >
          Edit draft
        </Typography>
        <Chip
          label={draft.type}
          size="small"
          sx={{
            ml: 1,
            bgcolor: 'rgba(0,212,170,0.08)',
            color: palette.accent,
            fontSize: 11,
          }}
        />
        {draft.platform && (
          <Chip
            label={draft.platform}
            size="small"
            sx={{
              ml: 0.5,
              bgcolor: 'rgba(59,130,246,0.12)',
              color: '#3b82f6',
              fontSize: 11,
            }}
          />
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {sendError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {sendError}
        </Alert>
      )}
      {sendStatus && (
        <Alert severity={sendDryRun ? 'info' : 'success'} sx={{ mb: 2 }}>
          {sendStatus}
        </Alert>
      )}

      <Card
        sx={{
          bgcolor: palette.bgSurface,
          borderRadius: 1,
          border: `1px solid ${palette.border}`,
        }}
      >
        <CardContent sx={{ pb: 2 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
                alignItems: { xs: 'stretch', sm: 'flex-end' },
              }}
            >
              <TextField
                label="Title"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: palette.border },
                    '&:hover fieldset': { borderColor: palette.accent },
                    '&.Mui-focused fieldset': { borderColor: palette.accent },
                  },
                }}
              />
              <Button
                onClick={handleSuggestTitle}
                disabled={suggestingTitle || !body.trim()}
                sx={{
                  alignSelf: { xs: 'stretch', sm: 'auto' },
                  textTransform: 'none',
                  fontSize: 12,
                  bgcolor: 'rgba(0,212,170,0.08)',
                  color: palette.accent,
                  px: 2,
                  py: 0.6,
                  '&:hover': { bgcolor: 'rgba(0,212,170,0.16)' },
                }}
              >
                <AutoAwesomeIcon
                  fontSize="small"
                  sx={{ mr: 0.5 }}
                />
                {suggestingTitle ? 'Title…' : 'Magic title'}
              </Button>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1.1fr 0.9fr 1fr' },
                gap: 1.5,
              }}
            >
              <FormControl size="small" fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel id="channel-label">Channel</InputLabel>
                <Select
                  labelId="channel-label"
                  label="Channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <MenuItem value="">—</MenuItem>
                  <MenuItem value="newsletter">Newsletter</MenuItem>
                  <MenuItem value="blog">Blog</MenuItem>
                  <MenuItem value="linkedin">LinkedIn</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Planned publish date"
                type="date"
                size="small"
                value={plannedPublishDate}
                onChange={(e) => setPlannedPublishDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            <Box sx={{ borderBottom: `1px solid ${palette.border}` }}>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 0,
                  '& .MuiTab-root': {
                    minHeight: 0,
                    textTransform: 'none',
                    fontSize: 13,
                    color: palette.textMuted,
                  },
                  '& .Mui-selected': {
                    color: palette.accent,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: palette.accent,
                  },
                }}
              >
                <Tab value="write" label="Write" />
                <Tab value="preview" label="Preview" />
                <Tab value="refine" label="Refine" />
                <Tab value="quality" label="Quality" />
              </Tabs>
            </Box>

            {activeTab === 'write' && (
              <Stack spacing={1.5}>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: palette.textDim,
                  }}
                >
                  Body
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    <Button
                      size="small"
                      onClick={() => applyInlineMarkdown(wrapBold)}
                      sx={{
                        minWidth: 0,
                        px: 1.5,
                        py: 0.25,
                        fontSize: 11,
                        textTransform: 'none',
                        borderRadius: 999,
                        border: `1px solid ${palette.border}`,
                        color: palette.text,
                      }}
                    >
                      **B**
                    </Button>
                    <Button
                      size="small"
                      onClick={() => applyInlineMarkdown(wrapItalic)}
                      sx={{
                        minWidth: 0,
                        px: 1.5,
                        py: 0.25,
                        fontSize: 11,
                        textTransform: 'none',
                        borderRadius: 999,
                        border: `1px solid ${palette.border}`,
                        color: palette.text,
                      }}
                    >
                      *I*
                    </Button>
                    <Button
                      size="small"
                      onClick={insertHeading}
                      sx={{
                        minWidth: 0,
                        px: 1.5,
                        py: 0.25,
                        fontSize: 11,
                        textTransform: 'none',
                        borderRadius: 999,
                        border: `1px solid ${palette.border}`,
                        color: palette.text,
                      }}
                    >
                      H2
                    </Button>
                    <Button
                      size="small"
                      onClick={insertListItem}
                      sx={{
                        minWidth: 0,
                        px: 1.5,
                        py: 0.25,
                        fontSize: 11,
                        textTransform: 'none',
                        borderRadius: 999,
                        border: `1px solid ${palette.border}`,
                        color: palette.text,
                      }}
                    >
                      • List
                    </Button>
                    <Button
                      size="small"
                      onClick={insertLink}
                      sx={{
                        minWidth: 0,
                        px: 1.5,
                        py: 0.25,
                        fontSize: 11,
                        textTransform: 'none',
                        borderRadius: 999,
                        border: `1px solid ${palette.border}`,
                        color: palette.text,
                      }}
                    >
                      Link
                    </Button>
                    <Button
                      size="small"
                      onClick={insertFooterBio}
                      disabled={!footerBio.trim()}
                      sx={{
                        minWidth: 0,
                        px: 1.5,
                        py: 0.25,
                        fontSize: 11,
                        textTransform: 'none',
                        borderRadius: 999,
                        border: `1px solid ${palette.border}`,
                        color: footerBio.trim() ? palette.text : palette.textDim,
                        opacity: footerBio.trim() ? 1 : 0.5,
                      }}
                    >
                      Footer
                    </Button>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setImagePickerOpen(true)}
                    sx={{
                      borderColor: palette.border,
                      color: palette.text,
                      textTransform: 'none',
                      fontSize: 12,
                      '&:hover': { borderColor: palette.accent, bgcolor: 'transparent' },
                    }}
                  >
                    Insert image from Unsplash
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={16}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  inputRef={bodyRef}
                  onSelect={handleSelectionChange}
                  onContextMenu={handleContextMenu}
                  slotProps={{
                    input: {
                      sx: isLight
                        ? {
                            bgcolor: '#ffffff',
                            color: '#111827',
                            alignItems: 'flex-start',
                            '& fieldset': { borderColor: '#e5e7eb' },
                            '&:hover fieldset': { borderColor: '#9ca3af' },
                            '&.Mui-focused fieldset': { borderColor: '#4b5563' },
                            '& textarea': {
                              bgcolor: '#ffffff',
                              color: '#111827',
                            },
                          }
                        : {
                            bgcolor: palette.bgCard,
                            color: palette.text,
                            alignItems: 'flex-start',
                            '& fieldset': { borderColor: palette.border },
                            '&:hover fieldset': { borderColor: palette.accent },
                            '&.Mui-focused fieldset': { borderColor: palette.accent },
                            '& textarea': {
                              bgcolor: palette.bgCard,
                              color: palette.text,
                            },
                          },
                    },
                  }}
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: 13,
                  }}
                />
              </Stack>
            )}

            {activeTab === 'preview' && (
              <Box
                sx={{
                  maxHeight: 480,
                  overflowY: 'auto',
                  borderRadius: 0.5,
                  border: isLight ? '1px solid #e5e7eb' : `1px solid ${palette.border}`,
                  bgcolor: isLight ? '#ffffff' : palette.bgCard,
                  px: 2,
                  py: 1.5,
                  '& h1, & h2, & h3': {
                    color: isLight ? '#111827' : palette.text,
                    mt: 1.5,
                    mb: 0.5,
                  },
                  '& p': { color: isLight ? '#111827' : palette.text, mb: 1 },
                  '& ul, & ol': { color: isLight ? '#111827' : palette.text, mb: 1, pl: 3 },
                  '& pre': {
                    fontFamily: 'monospace',
                    bgcolor: isLight ? '#0f172a' : '#020617',
                    color: '#e5e7eb',
                    borderRadius: '4px !important',
                    padding: '10px 12px',
                    overflowX: 'auto',
                    fontSize: 12,
                    mb: 1.5,
                  },
                  '& pre code': {
                    color: '#e5e7eb',
                    bgcolor: 'transparent',
                  },
                  '& :not(pre) > code': {
                    fontFamily: 'monospace',
                    bgcolor: '#f3f4f6',
                    color: '#111827',
                    borderRadius: 4,
                    px: 0.5,
                    py: 0.25,
                  },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {body || '_Nothing to preview yet._'}
                </ReactMarkdown>
              </Box>
            )}

            {activeTab === 'refine' && (
              <Stack spacing={2}>
                {refineMessage && (
                  <Alert severity="success">
                    {refineMessage}
                  </Alert>
                )}

                <Box
                  sx={{
                    borderRadius: 1,
                    border: `1px solid ${palette.border}`,
                    bgcolor: palette.bgCard,
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: palette.textDim, mb: 0.5 }}>
                    Selected text to refine
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: selection ? palette.text : palette.textDim,
                      fontFamily: 'monospace',
                      maxHeight: 120,
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {selection && selectionText
                      ? selectionText
                      : 'No selection in the editor. The refine instruction will apply to the entire draft body.'}
                  </Typography>
                </Box>

                <TextField
                  label="Instruction"
                  size="small"
                  fullWidth
                  value={refineInstruction}
                  onChange={(e) => setRefineInstruction(e.target.value)}
                  placeholder="e.g. make this more concise, add a CTA, soften marketing tone…"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: palette.border },
                      '&:hover fieldset': { borderColor: palette.accent },
                      '&.Mui-focused fieldset': { borderColor: palette.accent },
                    },
                  }}
                />
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <Chip
                    label="Add story"
                    size="small"
                    onClick={() =>
                      setRefineInstruction(
                        'Add a short personal anecdote that follows the abstract_to_story pattern and bridge back to the main concept.',
                      )
                    }
                    sx={{
                      bgcolor: palette.bgCard,
                      color: palette.text,
                      fontSize: 11,
                    }}
                  />
                  <Chip
                    label="Examples + tradeoffs"
                    size="small"
                    onClick={() =>
                      setRefineInstruction(
                        'Tighten the concrete examples and make the tradeoffs more explicit.',
                      )
                    }
                    sx={{
                      bgcolor: palette.bgCard,
                      color: palette.text,
                      fontSize: 11,
                    }}
                  />
                  <Chip
                    label="Opening + next step"
                    size="small"
                    onClick={() =>
                      setRefineInstruction(
                        'Ensure the opening explains reader value and the ending gives a clear next step.',
                      )
                    }
                    sx={{
                      bgcolor: palette.bgCard,
                      color: palette.text,
                      fontSize: 11,
                    }}
                  />
                </Stack>

                <FormControl fullWidth size="small">
                  <InputLabel id="refine-mode-label">Mode</InputLabel>
                  <Select
                    labelId="refine-mode-label"
                    label="Mode"
                    value={refineMode}
                    onChange={(e) => setRefineMode(e.target.value as RefineMode)}
                  >
                    <MenuItem value="clarify">Clarify</MenuItem>
                    <MenuItem value="shorten">Shorten</MenuItem>
                    <MenuItem value="expand">Expand</MenuItem>
                    <MenuItem value="more_technical">More technical</MenuItem>
                    <MenuItem value="add_cta">Add CTA</MenuItem>
                  </Select>
                </FormControl>

                <Box>
                  <Typography sx={{ color: palette.textDim, fontSize: 12, mb: 0.5 }}>
                    Selection
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: selection ? palette.text : palette.textDim,
                      fontFamily: 'monospace',
                      bgcolor: palette.bgCard,
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                      border: `1px solid ${palette.border}`,
                    }}
                  >
                    {selection
                      ? `${selection.start}–${selection.end} (${selection.end - selection.start} chars)`
                      : 'No selection (whole draft will be refined)'}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: palette.border, my: 1 }} />

                <Button
                  variant="contained"
                  onClick={handleRefine}
                  disabled={refining}
                  sx={{
                    bgcolor: palette.accent,
                    color: palette.bg,
                    fontWeight: 700,
                    px: 3,
                    alignSelf: 'flex-start',
                    '&:hover': { bgcolor: palette.accentDim },
                  }}
                >
                  {refining ? 'Refining…' : 'Apply refine'}
                </Button>
              </Stack>
            )}

            {activeTab === 'quality' && (
              <Stack spacing={2} sx={{ fontSize: 13 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={{ color: palette.text, fontWeight: 600 }}>
                    Quality checks
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleFactCheck}
                      disabled={factChecking}
                      sx={{
                        borderColor: palette.border,
                        color: palette.text,
                        textTransform: 'none',
                        fontSize: 12,
                        '&:hover': { borderColor: palette.accent, bgcolor: 'transparent' },
                      }}
                    >
                      {factChecking ? 'Fact checking…' : 'Run fact check'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleStyleCheck}
                      disabled={styleChecking}
                      sx={{
                        borderColor: palette.border,
                        color: palette.text,
                        textTransform: 'none',
                        fontSize: 12,
                        '&:hover': { borderColor: palette.accent, bgcolor: 'transparent' },
                      }}
                    >
                      {styleChecking ? 'Checking style…' : 'Run style check'}
                    </Button>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: palette.border }} />

                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                      gap: 2,
                      alignItems: 'center',
                    }}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: palette.text }}>
                      Fact check
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setKbUsing((v) => !v)}
                      sx={{
                        textTransform: 'none',
                        fontSize: 11,
                        borderRadius: 999,
                        border: `1px solid ${kbUsing ? palette.accent : palette.border}`,
                        bgcolor: kbUsing ? 'rgba(0,212,170,0.12)' : 'transparent',
                        color: kbUsing ? palette.accent : palette.textDim,
                        px: 1.5,
                        py: 0.25,
                      }}
                    >
                      {kbUsing ? 'Using KB context' : 'Use KB context'}
                    </Button>
                  </Box>
                  {factError && (
                    <Typography sx={{ fontSize: 11, color: '#f97373', mb: 0.5 }}>
                      {factError}
                    </Typography>
                  )}
                  <TextField
                    label="Knowledge base query (optional)"
                    size="small"
                    fullWidth
                    value={kbQuery}
                    onChange={(e) => setKbQuery(e.target.value)}
                    placeholder="e.g. newsletter pipeline, Atlas Search index, author profile…"
                    sx={{
                      mt: 1,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: palette.border },
                        '&:hover fieldset': { borderColor: palette.accent },
                        '&.Mui-focused fieldset': { borderColor: palette.accent },
                      },
                    }}
                  />
                  <TextField
                    label="Reviewer note (optional)"
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    value={factNote}
                    onChange={(e) => setFactNote(e.target.value)}
                    placeholder="Add any doubts or context about the claims you want the fact-checker to pay special attention to."
                    sx={{
                      mt: 1,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: palette.border },
                        '&:hover fieldset': { borderColor: palette.accent },
                        '&.Mui-focused fieldset': { borderColor: palette.accent },
                      },
                    }}
                  />
                  {!factClaims && !factError && !factChecking && (
                    <Typography sx={{ fontSize: 12, color: palette.textDim }}>
                      Run a fact check to see which claims are supported by the current vai
                      knowledge context and which may need revision.
                    </Typography>
                  )}
                  {factChecking && (
                    <Typography sx={{ fontSize: 12, color: palette.textMuted }}>
                      Analyzing claims against vai knowledge…
                    </Typography>
                  )}
                  {factClaims && factClaims.length === 0 && !factChecking && (
                    <Typography sx={{ fontSize: 12, color: '#4ade80' }}>
                      No significant factual claims detected, or all appear trivial.
                    </Typography>
                  )}
                  {factClaims && factClaims.length > 0 && (
                    <Box
                      component="ul"
                      sx={{
                        listStyle: 'none',
                        p: 0,
                        mt: 1,
                        maxHeight: 220,
                        overflowY: 'auto',
                        pr: 1,
                      }}
                    >
                      {factClaims.map((c) => {
                        let badgeColor = 'rgba(56,189,248,0.15)';
                        let badgeBorder = 'rgba(56,189,248,0.5)';
                        if (c.verdict === 'supported') {
                          badgeColor = 'rgba(16,185,129,0.12)';
                          badgeBorder = 'rgba(16,185,129,0.6)';
                        } else if (c.verdict === 'partially_supported') {
                          badgeColor = 'rgba(245,158,11,0.12)';
                          badgeBorder = 'rgba(245,158,11,0.6)';
                        } else if (c.verdict === 'contradictory') {
                          badgeColor = 'rgba(239,68,68,0.15)';
                          badgeBorder = 'rgba(239,68,68,0.7)';
                        }
                        return (
                          <Box
                            key={c.id}
                            component="li"
                            sx={{
                              mb: 1.2,
                              borderRadius: 1,
                              border: `1px solid ${palette.border}`,
                              bgcolor: palette.bgCard,
                              px: 1.5,
                              py: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 0.5,
                              }}
                            >
                              <Box
                                sx={{
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 999,
                                  border: `1px solid ${badgeBorder}`,
                                  bgcolor: badgeColor,
                                  fontSize: 10,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {c.verdict.replace('_', ' ')}
                              </Box>
                              <Typography
                                sx={{
                                  fontSize: 10,
                                  color: palette.textDim,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {c.severity} impact
                              </Typography>
                            </Box>
                            <Typography sx={{ fontSize: 12, color: palette.text, mb: 0.5 }}>
                              “{c.text}”
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: palette.textMuted, mb: 0.5 }}>
                              {c.explanation}
                            </Typography>
                            {c.suggestedFix && (
                              <Typography sx={{ fontSize: 12, color: palette.textDim }}>
                                <strong>Suggested fix:</strong> {c.suggestedFix}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>

                <Divider sx={{ borderColor: palette.border }} />

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: palette.text }}>
                      Style checklist
                    </Typography>
                    {styleError && (
                      <Typography sx={{ fontSize: 11, color: '#f97373' }}>
                        {styleError}
                      </Typography>
                    )}
                  </Box>
                  {!styleRules && !styleError && !styleChecking && (
                    <Typography sx={{ fontSize: 12, color: palette.textDim }}>
                      Run a style check to see how well this draft matches the author’s structure and
                      clarity rules.
                    </Typography>
                  )}
                  {styleChecking && (
                    <Typography sx={{ fontSize: 12, color: palette.textMuted }}>
                      Evaluating draft against style rules…
                    </Typography>
                  )}
                  {styleRules && styleRules.length > 0 && (
                    <Box
                      component="ul"
                      sx={{ listStyle: 'none', p: 0, mt: 1, display: 'grid', rowGap: 0.75 }}
                    >
                      {styleRules.map((rule) => (
                        <Box
                          key={rule.id}
                          component="li"
                          sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}
                        >
                          <Box
                            sx={{
                              mt: 0.5,
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: rule.passed ? '#22c55e' : '#f97316',
                              flexShrink: 0,
                            }}
                          />
                          <Box>
                            <Typography
                              sx={{ fontSize: 12, fontWeight: 500, color: palette.text }}
                            >
                              {rule.id.replace(/_/g, ' ')}
                            </Typography>
                            {rule.notes && (
                              <Typography
                                sx={{ fontSize: 12, color: palette.textMuted, mt: 0.25 }}
                              >
                                {rule.notes}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Stack>
            )}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                mt: 2,
              }}
            >
              <Typography sx={{ color: palette.textDim, fontSize: 11 }}>
                Last updated:{' '}
                {draft.updatedAt ? new Date(draft.updatedAt).toLocaleString() : '—'}
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                {channel === 'newsletter' && (
                  <>
                    <Chip
                      label={sendDryRun ? 'Dry run' : 'Live send'}
                      size="small"
                      onClick={() => setSendDryRun((v) => !v)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: sendDryRun ? 'rgba(148,163,184,0.15)' : 'rgba(22,163,74,0.15)',
                        color: sendDryRun ? palette.textDim : '#16a34a',
                        fontSize: 11,
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleSendNewsletter}
                      disabled={sendingNewsletter}
                      sx={{
                        textTransform: 'none',
                        fontSize: 12,
                        borderColor: palette.border,
                        color: palette.text,
                        '&:hover': { borderColor: palette.accent, bgcolor: 'transparent' },
                      }}
                    >
                      {sendingNewsletter
                        ? 'Sending…'
                        : sendDryRun
                          ? 'Send issue (dry run)'
                          : 'Send issue'}
                    </Button>
                  </>
                )}
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    bgcolor: palette.accent,
                    color: palette.bg,
                    fontWeight: 700,
                    px: 3,
                    '&:hover': { bgcolor: palette.accentDim },
                  }}
                >
                  {saving ? 'Saving…' : 'Save draft'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {selectionMenu.visible && selectionText && (
        <Box
          sx={{
            position: 'fixed',
            top: selectionMenu.y,
            left: selectionMenu.x,
            zIndex: 1300,
            bgcolor: palette.bgSurface,
            borderRadius: 1,
            border: `1px solid ${palette.border}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            minWidth: 200,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderBottom: `1px solid ${palette.border}`,
            }}
          >
            <Typography sx={{ fontSize: 11, color: palette.textDim }}>
              On highlighted text
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Button
              onClick={handleQuickRefineSelection}
              sx={{
                justifyContent: 'flex-start',
                px: 1.5,
                py: 0.75,
                color: palette.text,
                fontSize: 13,
                textTransform: 'none',
                '&:hover': { bgcolor: palette.bgCard },
              }}
            >
              Refine selection…
            </Button>
            <Button
              onClick={handleQuickInterject}
              sx={{
                justifyContent: 'flex-start',
                px: 1.5,
                py: 0.75,
                color: palette.text,
                fontSize: 13,
                textTransform: 'none',
                '&:hover': { bgcolor: palette.bgCard },
              }}
            >
              Interject story here
            </Button>
            <Button
              onClick={handleQuickFactCheckSelection}
              sx={{
                justifyContent: 'flex-start',
                px: 1.5,
                py: 0.75,
                color: palette.text,
                fontSize: 13,
                textTransform: 'none',
                '&:hover': { bgcolor: palette.bgCard },
              }}
            >
              Fact check selection
            </Button>
          </Box>
        </Box>
      )}

      <UnsplashImagePicker
        open={imagePickerOpen}
        initialQuery={title || 'developer documentation'}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleInsertImage}
      />

      {/* Legacy refine card left in place until quality tools are wired in */}
      {/* Once fact-check and style-check are implemented, we can consolidate everything into the tabs above. */}
      {false && (
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1.5,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <Typography sx={{ fontWeight: 600, color: palette.text, mb: 1 }}>
              Refine with AI
            </Typography>
            <Typography sx={{ color: palette.textMuted, mb: 2, fontSize: 13 }}>
              Optionally type an instruction, choose a mode, and apply refine. If no selection is
              active, the whole draft will be refined.
            </Typography>

            {refineMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {refineMessage}
              </Alert>
            )}

            <Stack spacing={2}>
              <TextField
                label="Instruction"
                size="small"
                fullWidth
                value={refineInstruction}
                onChange={(e) => setRefineInstruction(e.target.value)}
                placeholder="e.g. make this more concise, add a CTA, soften marketing tone…"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: palette.border },
                    '&:hover fieldset': { borderColor: palette.accent },
                    '&.Mui-focused fieldset': { borderColor: palette.accent },
                  },
                }}
              />
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip
                  label="Add story"
                  size="small"
                  onClick={() =>
                    setRefineInstruction(
                      'Add a short personal anecdote that follows the abstract_to_story pattern and bridge back to the main concept.',
                    )
                  }
                  sx={{
                    bgcolor: palette.bgCard,
                    color: palette.text,
                    fontSize: 11,
                  }}
                />
                <Chip
                  label="Examples + tradeoffs"
                  size="small"
                  onClick={() =>
                    setRefineInstruction(
                      'Tighten the concrete examples and make the tradeoffs more explicit.',
                    )
                  }
                  sx={{
                    bgcolor: palette.bgCard,
                    color: palette.text,
                    fontSize: 11,
                  }}
                />
                <Chip
                  label="Opening + next step"
                  size="small"
                  onClick={() =>
                    setRefineInstruction(
                      'Ensure the opening explains reader value and the ending gives a clear next step.',
                    )
                  }
                  sx={{
                    bgcolor: palette.bgCard,
                    color: palette.text,
                    fontSize: 11,
                  }}
                />
              </Stack>

              <FormControl fullWidth size="small">
                <InputLabel id="refine-mode-label">Mode</InputLabel>
                <Select
                  labelId="refine-mode-label"
                  label="Mode"
                  value={refineMode}
                  onChange={(e) => setRefineMode(e.target.value as RefineMode)}
                >
                  <MenuItem value="clarify">Clarify</MenuItem>
                  <MenuItem value="shorten">Shorten</MenuItem>
                  <MenuItem value="expand">Expand</MenuItem>
                  <MenuItem value="more_technical">More technical</MenuItem>
                  <MenuItem value="add_cta">Add CTA</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography sx={{ color: palette.textDim, fontSize: 12, mb: 0.5 }}>
                  Selection
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: selection ? palette.text : palette.textDim,
                    fontFamily: 'monospace',
                    bgcolor: palette.bgCard,
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  {selection
                    ? `${selection!.start}–${selection!.end} (${selection!.end - selection!.start} chars)`
                    : 'No selection'}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: palette.border, my: 1 }} />

              <Button
                variant="contained"
                onClick={handleRefine}
                disabled={refining}
                sx={{
                  bgcolor: palette.accent,
                  color: palette.bg,
                  fontWeight: 700,
                  px: 3,
                  '&:hover': { bgcolor: palette.accentDim },
                }}
              >
                {refining ? 'Refining…' : 'Apply refine'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

