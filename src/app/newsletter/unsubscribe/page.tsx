'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { palette } from '@/theme/theme';

type Status = 'idle' | 'loading' | 'success' | 'error';

function UnsubscribeContent() {
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

    async function unsubscribe() {
      setStatus('loading');
      setErrorReason(null);
      try {
        const res = await fetch('/api/newsletter/unsubscribe', {
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

    unsubscribe();

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
            Updating your preferences…
          </Typography>
          <Typography sx={{ color: palette.textMuted, maxWidth: 420 }}>
            Hold tight while we unsubscribe this address from the vai newsletter.
          </Typography>
        </>
      );
    }

    if (status === 'success') {
      return (
        <>
          <CheckCircleIcon sx={{ fontSize: 40, color: palette.accent, mb: 2 }} />
          <Typography variant="h5" sx={{ color: palette.text, mb: 1, fontWeight: 600 }}>
            You&apos;ve been unsubscribed
          </Typography>
          <Typography sx={{ color: palette.textMuted, maxWidth: 480, mb: 2 }}>
            You won&apos;t receive further issues of the vai newsletter at this address. You can always
            re-subscribe from the site footer if you change your mind.
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
      'We could not process this unsubscribe request. The link may be invalid or expired.';
    if (errorReason === 'expired') {
      message =
        'This unsubscribe link has expired. If you are still receiving emails, please use the unsubscribe link in a recent email.';
    } else if (errorReason === 'network') {
      message =
        'We hit a network issue while updating your preferences. Please refresh and try again in a moment.';
    } else if (errorReason === 'missing') {
      message =
        'This page is used to manage vai newsletter preferences. Please follow the link from your email footer.';
    }

    return (
      <>
        <ErrorOutlineIcon sx={{ fontSize: 40, color: palette.textMuted, mb: 2 }} />
        <Typography variant="h5" sx={{ color: palette.text, mb: 1, fontWeight: 600 }}>
          We couldn&apos;t update your preferences
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

function UnsubscribeFallback() {
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
            Updating your preferences…
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense fallback={<UnsubscribeFallback />}>
      <UnsubscribeContent />
    </Suspense>
  );
}

