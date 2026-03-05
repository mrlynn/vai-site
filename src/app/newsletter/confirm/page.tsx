'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { palette } from '@/theme/theme';

type Status = 'idle' | 'loading' | 'success' | 'error';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('idle');
  const [errorReason, setErrorReason] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorReason('missing');
      return;
    }

    let cancelled = false;

    async function confirm() {
      setStatus('loading');
      setErrorReason(null);
      try {
        const res = await fetch('/api/newsletter/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json().catch(() => ({}));

        if (cancelled) return;

        if (res.ok && data.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorReason(data.reason || 'invalid');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
          setErrorReason('network');
        }
      }
    }

    confirm();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const renderContent = () => {
    if (status === 'loading' || status === 'idle') {
      return (
        <>
          <CircularProgress size={32} sx={{ mb: 2, color: palette.accent }} />
          <Typography variant="h5" sx={{ color: palette.text, mb: 1, fontWeight: 600 }}>
            Confirming your subscription…
          </Typography>
          <Typography sx={{ color: palette.textMuted, maxWidth: 420 }}>
            Hold tight while we confirm your email address for the vai newsletter.
          </Typography>
        </>
      );
    }

    if (status === 'success') {
      return (
        <>
          <CheckCircleIcon sx={{ fontSize: 40, color: palette.accent, mb: 2 }} />
          <Typography variant="h5" sx={{ color: palette.text, mb: 1, fontWeight: 600 }}>
            You&apos;re subscribed to the vai newsletter
          </Typography>
          <Typography sx={{ color: palette.textMuted, maxWidth: 480, mb: 2 }}>
            You&apos;ll occasionally receive deep dives on Voyage AI embeddings, MongoDB Atlas Vector Search,
            and how developers are building real workflows with vai. Expect a low-volume, high-signal stream.
          </Typography>
          <Button
            variant="contained"
            href="/"
            sx={{
              bgcolor: palette.accent,
              color: palette.bg,
              fontWeight: 600,
              px: 3,
              '&:hover': { bgcolor: palette.accentDim },
            }}
          >
            Back to home
          </Button>
        </>
      );
    }

    // error
    let message =
      'We could not confirm your subscription. The link may be invalid or expired.';
    if (errorReason === 'expired') {
      message =
        'This confirmation link has expired. Please restart your subscription from the site and we’ll send a fresh email.';
    } else if (errorReason === 'network') {
      message =
        'We hit a network issue while confirming your subscription. Please refresh and try again in a moment.';
    } else if (errorReason === 'missing') {
      message =
        'This page is used to confirm newsletter subscriptions. Please follow the link from your confirmation email.';
    }

    return (
      <>
        <ErrorOutlineIcon sx={{ fontSize: 40, color: palette.textMuted, mb: 2 }} />
        <Typography variant="h5" sx={{ color: palette.text, mb: 1, fontWeight: 600 }}>
          We couldn&apos;t confirm your subscription
        </Typography>
        <Typography sx={{ color: palette.textMuted, maxWidth: 520, mb: 2 }}>
          {message}
        </Typography>
        <Button
          variant="contained"
          href="/"
          sx={{
            bgcolor: palette.accent,
            color: palette.bg,
            fontWeight: 600,
            px: 3,
            '&:hover': { bgcolor: palette.accentDim },
          }}
        >
          Back to home
        </Button>
      </>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.bg, display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Box
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 3,
            border: `1px solid ${palette.border}`,
            px: 4,
            py: 5,
            textAlign: 'center',
          }}
        >
          <Typography
            component="h1"
            sx={{
              color: palette.text,
              fontWeight: 700,
              mb: 3,
              fontSize: '1.8rem',
            }}
          >
            vai newsletter
          </Typography>
          {renderContent()}
        </Box>
      </Container>
    </Box>
  );
}

function ConfirmFallback() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.bg, display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Box
          sx={{
            bgcolor: palette.bgSurface,
            borderRadius: 3,
            border: `1px solid ${palette.border}`,
            px: 4,
            py: 5,
            textAlign: 'center',
          }}
        >
          <Typography
            component="h1"
            sx={{
              color: palette.text,
              fontWeight: 700,
              mb: 3,
              fontSize: '1.8rem',
            }}
          >
            vai newsletter
          </Typography>
          <CircularProgress size={32} sx={{ mb: 2, color: palette.accent }} />
          <Typography variant="h5" sx={{ color: palette.text, mb: 1, fontWeight: 600 }}>
            Confirming your subscription…
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default function NewsletterConfirmPage() {
  return (
    <Suspense fallback={<ConfirmFallback />}>
      <ConfirmContent />
    </Suspense>
  );
}

