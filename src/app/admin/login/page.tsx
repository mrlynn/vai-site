'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { palette } from '@/theme/theme';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setError(
          data.error === 'invalid_credentials'
            ? 'Invalid email or password.'
            : 'Unable to sign in. Please try again.'
        );
        return;
      }

      router.push('/admin');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: palette.bg,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            bgcolor: palette.bgSurface,
            border: `1px solid ${palette.border}`,
            borderRadius: 3,
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.35)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: palette.accent,
                fontFamily: "'Source Code Pro', monospace",
                mb: 0.5,
              }}
            >
              vai admin
            </Typography>
            <Typography variant="body2" sx={{ color: palette.textMuted, mb: 3 }}>
              Sign in to access telemetry, newsletter tools, and internal dashboards.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                label="Email"
                type="email"
                fullWidth
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: palette.border },
                    '&:hover fieldset': { borderColor: palette.accent },
                    '&.Mui-focused fieldset': { borderColor: palette.accent },
                  },
                }}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: palette.border },
                    '&:hover fieldset': { borderColor: palette.accent },
                    '&.Mui-focused fieldset': { borderColor: palette.accent },
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !email || !password}
                sx={{
                  bgcolor: palette.accent,
                  color: palette.bg,
                  fontWeight: 700,
                  py: 1.2,
                  '&:hover': { bgcolor: palette.accentDim },
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

