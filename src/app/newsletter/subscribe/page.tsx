import { Box, Container, Typography } from '@mui/material';
import { palette } from '@/theme/theme';

export default function NewsletterSubscribePage() {
  return (
    <Box sx={{ py: 8, minHeight: '70vh' }}>
      <Container maxWidth="sm">
        <Typography
          component="a"
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

        <Box
          sx={{
            p: 3,
            borderRadius: 1,
            border: `1px solid ${palette.border}`,
            bgcolor: palette.bgCard,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: '1.75rem', mb: 1.5 }}>🔧</Typography>
          <Typography sx={{ fontWeight: 600, color: palette.text, mb: 1 }}>
            Subscriptions Paused
          </Typography>
          <Typography sx={{ color: palette.textMuted, fontSize: 14, lineHeight: 1.7 }}>
            The newsletter is no longer accepting new subscribers. Past issues remain available to
            read below.
          </Typography>
        </Box>


      </Container>
    </Box>
  );
}
