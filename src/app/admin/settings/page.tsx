'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { palette } from '@/theme/theme';

type EditorTheme = 'light' | 'dark';

interface AdminSettings {
  id: string;
  editorTheme: EditorTheme;
  footerBio: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [editorTheme, setEditorTheme] = useState<EditorTheme>('light');
  const [footerBio, setFooterBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || 'Failed to load settings.');
          return;
        }
        const s = data.settings as AdminSettings;
        setSettings(s);
        setEditorTheme((s.editorTheme as EditorTheme) || 'light');
        setFooterBio(s.footerBio || '');
      } catch {
        setError('Network error while loading settings.');
      } finally {
        setLoading(false);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editorTheme,
          footerBio,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to save settings.');
        return;
      }
      setSettings(data.settings as AdminSettings);
      setSuccess('Settings saved.');
      setTimeout(() => setSuccess(null), 2500);
    } catch {
      setError('Network error while saving settings.');
    } finally {
      setSaving(false);
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
          mb: 1,
        }}
      >
        Admin settings
      </Typography>
      <Typography sx={{ color: palette.textMuted, mb: 3, fontSize: 13 }}>
        Configure common options like the editor theme and the shared footer bio used across newsletters and
        content.
      </Typography>

      <Card
        sx={{
          bgcolor: palette.bgSurface,
          borderRadius: 1.5,
          border: `1px solid ${palette.border}`,
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 1 }}>
                {success}
              </Alert>
            )}

            <FormControl size="small" sx={{ maxWidth: 260 }}>
              <InputLabel id="editor-theme-label">Editor theme</InputLabel>
              <Select
                labelId="editor-theme-label"
                label="Editor theme"
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value as EditorTheme)}
              >
                <MenuItem value="light">Light (white page)</MenuItem>
                <MenuItem value="dark">Dark (dark page)</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography sx={{ fontSize: 12, color: palette.textDim, mb: 0.5 }}>
                Common footer bio (Markdown)
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={5}
                value={footerBio}
                onChange={(e) => setFooterBio(e.target.value)}
                placeholder="Short bio, links, and call-to-action to appear at the end of newsletters and other content."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: palette.border },
                    '&:hover fieldset': { borderColor: palette.accent },
                    '&.Mui-focused fieldset': { borderColor: palette.accent },
                  },
                  fontSize: 13,
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || loading}
                sx={{
                  bgcolor: palette.accent,
                  color: palette.bg,
                  fontWeight: 700,
                  px: 3,
                  '&:hover': { bgcolor: palette.accentDim },
                }}
              >
                {saving ? 'Saving…' : 'Save settings'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

