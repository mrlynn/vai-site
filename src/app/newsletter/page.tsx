import Link from 'next/link';
import { getPublishedIssuesList } from '@/lib/content/issues';
import { Box, Container, Typography, Button } from '@mui/material';
import { palette } from '@/theme/theme';

export const metadata = {
  title: 'Vector Log — Newsletter',
  description:
    'Notes from building AI systems in the field. Bi-weekly newsletter for developers: AI news, practical tips, and insights from Michael Lynn.',
};

export default async function NewsletterIndexPage() {
  const issues = await getPublishedIssuesList();

  return (
    <Box sx={{ py: 6, minHeight: '60vh' }}>
      <Container maxWidth="md">
        <Typography
          variant="h1"
          sx={{
            fontSize: '2rem',
            fontWeight: 800,
            color: palette.accent,
            fontFamily: "'Source Code Pro', monospace",
            mb: 1,
          }}
        >
          Vector Log
        </Typography>
        <Typography sx={{ color: palette.textMuted, mb: 4 }}>
          Notes from building AI systems in the field. Bi-weekly newsletter for developers: AI
          news, practical tips, and insights from Michael Lynn.
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2 }}>
            Past issues
          </Typography>
          {!issues || issues.length === 0 ? (
            <Typography sx={{ color: palette.textDim, fontSize: 14 }}>
              No published issues yet. Check back soon.
            </Typography>
          ) : (
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {issues.map((issue) => {
                const dateStr = issue.publishDate
                  ? new Date(issue.publishDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '';
                return (
                  <Box component="li" key={issue.issueNumber} sx={{ mb: 1.5 }}>
                    <Link
                      href={`/newsletter/${issue.issueNumber}`}
                      style={{
                        color: palette.accent,
                        textDecoration: 'underline',
                        fontSize: 15,
                      }}
                    >
                      Issue #{issue.issueNumber}
                      {issue.theme ? ` — ${issue.theme}` : ''}
                      {dateStr ? ` (${dateStr})` : ''}
                    </Link>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <Typography sx={{ fontWeight: 600, color: palette.text, mb: 1.5 }}>
          Subscribe
        </Typography>
        <Typography sx={{ color: palette.textMuted, mb: 2, fontSize: 14 }}>
          Get new issues in your inbox. No spam — just developer-focused AI notes.
        </Typography>
        <Button
          component={Link}
          href="/newsletter/subscribe"
          variant="outlined"
          sx={{
            borderColor: palette.accent,
            color: palette.accent,
            '&:hover': { borderColor: palette.accentLight, bgcolor: `${palette.accent}12` },
          }}
        >
          Subscribe to Vector Log
        </Button>
      </Container>
    </Box>
  );
}
