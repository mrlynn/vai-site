'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { palette } from '@/theme/theme';

export default function NewsletterSubscribePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'subscribe_page' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('success');
        setEmail('');
      } else if (data.error === 'invalid_email') {
        setError('Enter a valid email address.');
        setStatus('error');
      } else {
        setError('Something went wrong. Please try again in a moment.');
        setStatus('error');
      }
    } catch {
      setError('Network error. Please try again.');
      setStatus('error');
    }
  };

  return (
    <Box sx={{ py: 8, minHeight: '70vh' }}>
      <Container maxWidth="sm">
        <Typography
          component={Link}
          href="/newsletter"
          sx={{
            display: 'inline-block',
            fontSize: 12,
            color: palette.textMuted,
            textDecoration: 'none',
            mb: 3,
            '&:hover': { color: palette.accent },
          }}
        >
          ← Back to past issues
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            color: palette.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            mb: 1,
          }}
        >
          Vector Log
        </Typography>
        <Typography
          variant="h1"
          sx={{
            fontSize: '2rem',
            fontWeight: 700,
            color: palette.text,
            mb: 1,
          }}
        >
          Subscribe
        </Typography>
        <Typography sx={{ color: palette.textMuted, mb: 4, lineHeight: 1.6 }}>
          Notes from building AI systems in the field. Bi-weekly issues: AI news, practical tips, and
          insights from Michael Lynn. No spam.
        </Typography>

        {status === 'success' ? (
          <Box
            sx={{
              p: 3,
              borderRadius: 1,
              border: `1px solid ${palette.border}`,
              bgcolor: palette.bgCard,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 28 }} />
              <Typography sx={{ fontWeight: 600, color: palette.text }}>
                Check your inbox
              </Typography>
            </Box>
            <Typography sx={{ color: palette.textMuted, fontSize: 14 }}>
              We sent a confirmation link. Click it to confirm your subscription and start receiving
              Vector Log.
            </Typography>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 3,
              borderRadius: 1,
              border: `1px solid ${palette.border}`,
              bgcolor: palette.bgCard,
            }}
          >
            <TextField
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
                if (error) setError(null);
              }}
              size="medium"
              fullWidth
              placeholder="you@example.com"
              autoComplete="email"
              error={!!error}
              helperText={error}
              disabled={status === 'loading'}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: palette.bg,
                  '& fieldset': { borderColor: palette.border },
                  '&:hover fieldset': { borderColor: palette.accent },
                  '&.Mui-focused fieldset': { borderColor: palette.accent },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={status === 'loading'}
              sx={{
                py: 1.5,
                bgcolor: palette.accent,
                color: palette.bg,
                fontWeight: 600,
                '&:hover': { bgcolor: palette.accentDim },
              }}
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe to Vector Log'}
            </Button>
          </Box>
        )}

        <Typography sx={{ mt: 4, fontSize: 13, color: palette.textDim }}>
          You can unsubscribe anytime from the link in any issue. We use your email only to send
          Vector Log and don’t share it.
        </Typography>
      </Container>
    </Box>
  );
}
