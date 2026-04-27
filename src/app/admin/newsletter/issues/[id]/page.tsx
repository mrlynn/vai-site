'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams } from 'next/navigation';
import {
  Alert,
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
import { palette } from '@/theme/theme';
import UnsplashImagePicker, {
  UnsplashImageChoice,
} from '@/components/admin/UnsplashImagePicker';

interface Section {
  content: string;
  status?: string;
  sources?: string[];
  tipTopic?: string;
  updatedAt?: string;
  enabled?: boolean;
}

interface Issue {
  _id: string;
  issueNumber: number;
  publishDate?: string;
  theme?: string;
  status?: string;
  sections: {
    s1: Section;
    s2: Section;
    s3: Section;
    s4: Section;
    s5: Section;
    s6?: Section;
  };
}

export default function NewsletterIssueEditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishDryRun, setPublishDryRun] = useState(true);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const [theme, setTheme] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [status, setStatus] = useState('draft');

  const [s1, setS1] = useState('');
  const [s2, setS2] = useState('');
  const [s3, setS3] = useState('');
  const [s4, setS4] = useState('');
  const [s5, setS5] = useState('');
  const [s6, setS6] = useState('');
  const [s1Enabled, setS1Enabled] = useState(true);
  const [s2Enabled, setS2Enabled] = useState(true);
  const [s3Enabled, setS3Enabled] = useState(true);
  const [s4Enabled, setS4Enabled] = useState(true);
  const [s5Enabled, setS5Enabled] = useState(true);
  const [s6Enabled, setS6Enabled] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imageTarget, setImageTarget] = useState<'s1' | 's2' | 's3' | 's4' | 's5' | null>(null);
  const [authorStoryLoading, setAuthorStoryLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/newsletter/issues/${id}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || 'Failed to load issue.');
          setIssue(null);
          return;
        }
        setIssue(data);
        setTheme(data.theme || '');
        setStatus(data.status || 'draft');
        if (data.publishDate) {
          const d = new Date(data.publishDate);
          // ISO date (yyyy-mm-dd)
          setPublishDate(d.toISOString().slice(0, 10));
        }
        setS1(data.sections?.s1?.content || '');
        setS2(data.sections?.s2?.content || '');
        setS3(data.sections?.s3?.content || '');
        setS4(data.sections?.s4?.content || '');
        setS5(data.sections?.s5?.content || '');
        setS6(data.sections?.s6?.content || '');
        setS1Enabled(
          data.sections?.s1?.enabled !== false && !!(data.sections?.s1?.content || '').trim(),
        );
        setS2Enabled(
          data.sections?.s2?.enabled !== false && !!(data.sections?.s2?.content || '').trim(),
        );
        setS3Enabled(
          data.sections?.s3?.enabled !== false && !!(data.sections?.s3?.content || '').trim(),
        );
        setS4Enabled(
          data.sections?.s4?.enabled !== false && !!(data.sections?.s4?.content || '').trim(),
        );
        setS5Enabled(
          data.sections?.s5?.enabled !== false && !!(data.sections?.s5?.content || '').trim(),
        );
        setS6Enabled(
          data.sections?.s6?.enabled === true && !!(data.sections?.s6?.content || '').trim(),
        );
      } catch {
        setError('Network error while loading issue.');
        setIssue(null);
      } finally {
        setLoading(false);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, [id]);

  const handleSave = async () => {
    if (!issue) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/newsletter/issues/${issue.issueNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          status,
          publishDate: publishDate || undefined,
          sections: {
            s1: { content: s1, enabled: s1Enabled },
            s2: { content: s2, enabled: s2Enabled },
            s3: { content: s3, enabled: s3Enabled },
            s4: { content: s4, enabled: s4Enabled },
            s5: { content: s5, enabled: s5Enabled },
            s6: { content: s6, enabled: s6Enabled },
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to save issue.');
      } else {
        setIssue(data);
      }
    } catch {
      setError('Network error while saving issue.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!issue) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/newsletter/issues/${issue.issueNumber}/generate`, {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'AI generation failed.');
        return;
      }
      setIssue(data);
      setS1(data.sections?.s1?.content || '');
      setS2(data.sections?.s2?.content || '');
      setS3(data.sections?.s3?.content || '');
      setS4(data.sections?.s4?.content || '');
      setS5(data.sections?.s5?.content || '');
      setS6(data.sections?.s6?.content || '');
    } catch {
      setError('Network error while generating issue.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!issue) return;
    setPublishing(true);
    setPublishError(null);
    setPublishStatus(null);
    try {
      const res = await fetch(`/api/newsletter/issues/${issue.issueNumber}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun: publishDryRun }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setPublishError(data.error || 'Publish/send failed.');
        return;
      }
      const msg = publishDryRun
        ? `Dry run: would send to ${data.sent || 0} active subscriber(s) with ${
            (data.errors || []).length || 0
          } error(s).`
        : `Sent to ${data.sent || 0} active subscriber(s) with ${
            (data.errors || []).length || 0
          } error(s).`;
      setPublishStatus(msg);
    } catch {
      setPublishError('Network error while publishing issue.');
    } finally {
      setPublishing(false);
    }
  };

  const handleOpenImagePicker = (sectionKey: 's1' | 's2' | 's3' | 's4' | 's5') => {
    setImageTarget(sectionKey);
    setImagePickerOpen(true);
  };

  const applyImageToSection = (sectionKey: 's1' | 's2' | 's3' | 's4' | 's5', content: string) => {
    if (sectionKey === 's1') setS1(content);
    else if (sectionKey === 's2') setS2(content);
    else if (sectionKey === 's3') setS3(content);
    else if (sectionKey === 's4') setS4(content);
    else if (sectionKey === 's5') setS5(content);
  };

  const handleInsertImage = (img: UnsplashImageChoice) => {
    if (!imageTarget) return;
    const alt = img.alt || theme || `Image for issue ${issue?.issueNumber ?? ''}`;
    const attribution = `Photo by [${img.photographer}](${img.photographerUrl}) on [Unsplash](${img.unsplashUrl}).`;

    const current =
      imageTarget === 's1'
        ? s1
        : imageTarget === 's2'
          ? s2
          : imageTarget === 's3'
            ? s3
            : imageTarget === 's4'
              ? s4
              : s5;

    const snippet = `![${alt}](${img.url})`;
    const attributionBlock = `\n\n${attribution}\n`;
    const nextBody = `${current || ''}\n\n${snippet}${
      (current || '').includes('Photo by ') ? '' : attributionBlock
    }`;
    applyImageToSection(imageTarget, nextBody.trimStart());
  };

  const handleAuthorStory = async () => {
    if (!issue) return;
    if (!s1.trim()) return;
    setAuthorStoryLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/newsletter/issues/${issue.issueNumber}/sections/s1/story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Author story transform failed.');
        return;
      }
      if (typeof data.content === 'string') {
        setS1(data.content);
      }
    } catch {
      setError('Network error while transforming From the Field into a story.');
    } finally {
      setAuthorStoryLoading(false);
    }
  };

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

  if (!issue) {
    return (
      <Box sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography sx={{ color: palette.textMuted }}>Issue not found.</Typography>
      </Box>
    );
  }

  const previewLines: string[] = [];
  const dateForPreview = publishDate || (issue.publishDate as string) || '';
  previewLines.push(`ISSUE: ${issue.issueNumber}`);
  previewLines.push(`DATE: ${dateForPreview}`);
  previewLines.push(`THEME: ${theme || issue.theme || ''}`);
  previewLines.push('');
  const addPreviewSection = (heading: string, enabled: boolean, content: string) => {
    if (!enabled) return;
    const trimmed = content?.trim();
    if (!trimmed) return;
    previewLines.push(heading);
    previewLines.push('');
    previewLines.push(trimmed);
    previewLines.push('');
  };
  addPreviewSection('FROM THE FIELD', s1Enabled, s1 || issue.sections.s1.content || '');
  addPreviewSection('AI NEWS ROUNDUP', s2Enabled, s2 || issue.sections.s2.content || '');
  addPreviewSection(
    'DEVELOPER INTELLIGENCE',
    s3Enabled,
    s3 || issue.sections.s3.content || '',
  );
  addPreviewSection('VAI PRODUCT TIP', s4Enabled, s4 || issue.sections.s4.content || '');
  addPreviewSection(
    "WHAT I'M READING",
    s6Enabled,
    s6 || issue.sections.s6?.content || '',
  );
  addPreviewSection('WANT MORE?', s5Enabled, s5 || issue.sections.s5.content || '');
  const previewMarkdown = previewLines.join('\n');

  return (
    <Box sx={{ py: 2 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          color: palette.accent,
          fontFamily: "'Source Code Pro', monospace",
          mb: 1,
        }}
      >
        Issue #{issue.issueNumber}
      </Typography>
      <Typography sx={{ color: palette.textDim, mb: 2, fontSize: 13 }}>
        Edit the five sections of this issue. AI-assisted generation and publishing will plug into
        this workspace next.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {publishError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {publishError}
        </Alert>
      )}
      {publishStatus && (
        <Alert severity={publishDryRun ? 'info' : 'success'} sx={{ mb: 2 }}>
          {publishStatus}
        </Alert>
      )}

      <Stack spacing={2}>
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
               
               sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
                <TextField
                  label="Theme"
                  size="small"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  sx={{
                    minWidth: 240,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: palette.border },
                      '&:hover fieldset': { borderColor: palette.accent },
                      '&.Mui-focused fieldset': { borderColor: palette.accent },
                    },
                  }}
                />
                <TextField
                  label="Publish date"
                  type="date"
                  size="small"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label="Status"
                  size="small"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  helperText='draft · reviewed · approved · published'
                  sx={{
                    minWidth: 180,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: palette.border },
                      '&:hover fieldset': { borderColor: palette.accent },
                      '&.Mui-focused fieldset': { borderColor: palette.accent },
                    },
                  }}
                />
              </Stack>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleGenerate}
                    disabled={generating}
                    sx={{
                      textTransform: 'none',
                      fontSize: 12,
                      borderColor: palette.border,
                      color: palette.text,
                      '&:hover': { borderColor: palette.accent, bgcolor: 'transparent' },
                    }}
                  >
                    {generating ? 'Generating…' : 'Generate full issue with AI'}
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Chip
                    label={publishDryRun ? 'Dry run' : 'Live send'}
                    size="small"
                    onClick={() => setPublishDryRun((v) => !v)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: publishDryRun ? 'rgba(148,163,184,0.15)' : 'rgba(22,163,74,0.15)',
                      color: publishDryRun ? palette.textDim : '#16a34a',
                      fontSize: 11,
                    }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handlePublish}
                    disabled={publishing}
                    sx={{
                      textTransform: 'none',
                      fontSize: 12,
                      borderColor: palette.border,
                      color: palette.text,
                      '&:hover': { borderColor: palette.accent, bgcolor: 'transparent' },
                    }}
                  >
                    {publishing
                      ? 'Sending…'
                      : publishDryRun
                        ? 'Send issue (dry run)'
                        : 'Send issue'}
                  </Button>
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
                    {saving ? 'Saving…' : 'Save issue'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <SectionEditor
                label={authorStoryLoading ? "FROM THE FIELD (shaping story…)" : "FROM THE FIELD"}
                helper="Human-authored; AI will assist with polishing, titles, and pull quotes."
                value={s1}
                onChange={setS1}
                issueNumber={issue.issueNumber}
                sectionKey="s1"
                onInsertImage={() => handleOpenImagePicker('s1')}
                onAuthorStory={handleAuthorStory}
              />
              <SectionEditor
                label="AI NEWS ROUNDUP"
                helper="3–5 news items with source URLs. AI will help with web search and summarization."
                value={s2}
                onChange={setS2}
                issueNumber={issue.issueNumber}
                sectionKey="s2"
                onInsertImage={() => handleOpenImagePicker('s2')}
              />
              <SectionEditor
                label="DEVELOPER INTELLIGENCE"
                helper="2–4 tactical items for AI devs. Grounded in your VAI knowledge base."
                value={s3}
                onChange={setS3}
                issueNumber={issue.issueNumber}
                sectionKey="s3"
                onInsertImage={() => handleOpenImagePicker('s3')}
              />
              <SectionEditor
                label="VAI PRODUCT TIP"
                helper="One actionable VAI tip with CLI and code. Connected to the rotation schedule."
                value={s4}
                onChange={setS4}
                issueNumber={issue.issueNumber}
                sectionKey="s4"
                onInsertImage={() => handleOpenImagePicker('s4')}
              />
              <SectionEditor
                label="WHAT I'M READING"
                helper="Optional: links and short commentary on articles, posts, or papers you recommend."
                value={s6}
                onChange={setS6}
                issueNumber={issue.issueNumber}
                sectionKey="s6"
                onInsertImage={() => handleOpenImagePicker('s5')}
              />
              <SectionEditor
                label="WANT MORE?"
                helper="Invite readers to subscribe, share, or try VAI with one clear, specific ask."
                value={s5}
                onChange={setS5}
                issueNumber={issue.issueNumber}
                sectionKey="s5"
                onInsertImage={() => handleOpenImagePicker('s5')}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 1,
            border: `1px solid ${palette.border}`,
          }}
        >
          <CardContent>
            <Typography
              sx={{
                fontWeight: 600,
                color: palette.text,
                mb: 1,
              }}
            >
              Preview
            </Typography>
            <Typography sx={{ fontSize: 12, color: palette.textDim, mb: 1 }}>
              This is how the composed markdown issue will look before it is sent to subscribers.
            </Typography>
            <Box
              sx={{
                maxHeight: 420,
                overflowY: 'auto',
                borderRadius: 0.5,
                border: '1px solid #e5e7eb',
                bgcolor: '#ffffff',
                px: 2,
                py: 1.5,
                '& h1, & h2, & h3': {
                  color: '#111827',
                  mt: 1.5,
                  mb: 0.5,
                },
                '& p': { color: '#111827', mb: 1 },
                '& ul, & ol': { color: '#111827', mb: 1, pl: 3 },
                '& pre': {
                  fontFamily: 'monospace',
                  bgcolor: '#0f172a',
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
                {previewMarkdown || '_Nothing to preview yet._'}
              </ReactMarkdown>
            </Box>
          </CardContent>
        </Card>

        <UnsplashImagePicker
          open={imagePickerOpen}
          initialQuery={theme || 'AI developers'}
          onClose={() => setImagePickerOpen(false)}
          onSelect={(img) => {
            handleInsertImage(img);
            setImagePickerOpen(false);
          }}
        />
      </Stack>
    </Box>
  );
}

function SectionEditor({
  label,
  helper,
  value,
  onChange,
  issueNumber,
  sectionKey,
  onInsertImage,
  onAuthorStory,
}: {
  label: string;
  helper: string;
  value: string;
  onChange: (next: string) => void;
  issueNumber: number;
  sectionKey: 's1' | 's2' | 's3' | 's4' | 's5' | 's6';
  onInsertImage: () => void;
  onAuthorStory?: () => void;
}) {
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [factChecking, setFactChecking] = useState(false);
  const [factError, setFactError] = useState<string | null>(null);
  const [claims, setClaims] = useState<
    { id: number; text: string; verdict: string; severity: string; explanation: string; suggestedFix?: string }[]
  >([]);

  const handleRefine = async () => {
    if (!value.trim()) return;
    setRefining(true);
    setRefineError(null);
    try {
      const res = await fetch(
        `/api/newsletter/issues/${issueNumber}/sections/${sectionKey}/refine`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRefineError(data.error || 'Refine failed.');
        return;
      }
      if (typeof data.content === 'string') {
        onChange(data.content);
      }
    } catch {
      setRefineError('Network error while refining section.');
    } finally {
      setRefining(false);
    }
  };

  const handleFactCheck = async () => {
    if (!value.trim()) return;
    setFactChecking(true);
    setFactError(null);
    setClaims([]);
    try {
      const res = await fetch(
        `/api/newsletter/issues/${issueNumber}/sections/${sectionKey}/fact-check`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFactError(data.error || 'Fact check failed.');
        return;
      }
      if (Array.isArray(data.claims)) {
        setClaims(data.claims);
      }
    } catch {
      setFactError('Network error while running fact check.');
    } finally {
      setFactChecking(false);
    }
  };

  return (
    <Box
      sx={{
        borderRadius: 1,
        border: `1px solid ${palette.border}`,
        bgcolor: palette.bgCard,
        px: 1.5,
        py: 1,
      }}
    >
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: palette.text }}>
            {label}
          </Typography>
          <Chip
            label={refining ? 'Refining…' : 'Markdown'}
            size="small"
            sx={{
              fontSize: 10,
              bgcolor: 'rgba(148,163,184,0.15)',
              color: palette.textDim,
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: 11, color: palette.textDim }}>{helper}</Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleRefine}
              disabled={refining || !value.trim()}
              sx={{
                textTransform: 'none',
                fontSize: 11,
                borderColor: palette.border,
                color: palette.text,
                '&:hover': { borderColor: palette.accent, bgcolor: 'transparent' },
              }}
            >
              Refine with AI
            </Button>
            {onAuthorStory && (
              <Button
                size="small"
                variant="outlined"
                onClick={onAuthorStory}
                disabled={!value.trim()}
                sx={{
                  textTransform: 'none',
                  fontSize: 11,
                  borderColor: palette.border,
                  color: palette.text,
                  '&:hover': { borderColor: palette.accent, bgcolor: 'transparent' },
                }}
              >
                Author story
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              onClick={onInsertImage}
              sx={{
                textTransform: 'none',
                fontSize: 11,
                borderColor: palette.border,
                color: palette.text,
                '&:hover': { borderColor: palette.accent, bgcolor: 'transparent' },
              }}
            >
              Insert image
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handleFactCheck}
              disabled={factChecking || !value.trim()}
              sx={{
                textTransform: 'none',
                fontSize: 11,
                borderColor: palette.border,
                color: palette.text,
                '&:hover': { borderColor: palette.accent, bgcolor: 'transparent' },
              }}
            >
              {factChecking ? 'Fact checking…' : 'Fact check'}
            </Button>
          </Stack>
        </Box>
        {refineError && (
          <Typography sx={{ fontSize: 11, color: '#f97373' }}>{refineError}</Typography>
        )}
        {factError && (
          <Typography sx={{ fontSize: 11, color: '#f97373' }}>{factError}</Typography>
        )}
        {claims.length > 0 && (
          <Box
            sx={{
              mt: 0.5,
              borderRadius: 1,
              border: `1px solid ${palette.border}`,
              bgcolor: palette.bgSurface,
              px: 1,
              py: 0.75,
              maxHeight: 160,
              overflowY: 'auto',
            }}
          >
            <Typography sx={{ fontSize: 11, color: palette.textDim, mb: 0.5 }}>
              Fact check findings
            </Typography>
            <Stack spacing={0.75}>
              {claims.map((c) => (
                <Box key={c.id}>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: palette.text,
                      mb: 0.25,
                    }}
                  >
                    “{c.text}”
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: palette.textDim, mb: 0.25 }}>
                    {c.verdict.replace('_', ' ')} · {c.severity} impact
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: palette.textDim }}>
                    {c.explanation}
                    {c.suggestedFix ? ` Suggested fix: ${c.suggestedFix}` : ''}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
        <TextField
          value={value}
          onChange={(e) => onChange(e.target.value)}
          multiline
          minRows={6}
          fullWidth
          placeholder="Write or paste markdown for this section…"
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
      </Stack>
    </Box>
  );
}

