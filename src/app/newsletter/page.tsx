import Link from 'next/link';
import { getPublishedIssuesList } from '@/lib/content/issues';
import {
  Box,
  Container,
  Typography,
  Button,
  Link as MuiLink,
  Stack,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeIcon from '@mui/icons-material/Code';
import { palette } from '@/theme/theme';

export const metadata = {
  title: 'Vector Log — Newsletter for AI Builders',
  description:
    'Ship smarter. Bi-weekly field notes for founders and devs: real AI implementation insights, curated news, and practical tips from Michael Lynn. No hype.',
};

const BENEFITS = [
  {
    icon: ArticleOutlinedIcon,
    title: 'From the field',
    text: 'Real implementation notes from building AI systems — not theory or hype.',
  },
  {
    icon: TrendingUpIcon,
    title: 'Curated AI intelligence',
    text: 'News roundups and signal you can use, so you stay ahead without the noise.',
  },
  {
    icon: CodeIcon,
    title: 'Developer-first',
    text: 'Practical tips, product updates, and “what I’m reading” for builders.',
  },
  {
    icon: CheckCircleOutlineIcon,
    title: 'No spam, ever',
    text: 'Bi-weekly. Unsubscribe anytime. Your inbox stays clean.',
  },
] as const;

export default async function NewsletterIndexPage() {
  const issues = await getPublishedIssuesList();
  const issueCount = issues?.length ?? 0;

  return (
    <Box
      sx={{
        minHeight: '70vh',
        py: { xs: 5, md: 8 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -120,
          right: -120,
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.accent}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative' }}>
        {/* Hero — outcome-focused value prop for founders & devs */}
        <Box sx={{ mb: 6 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: palette.accent,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              mb: 1.5,
            }}
          >
            Newsletter
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.25rem', md: '2.75rem' },
              fontWeight: 800,
              color: palette.text,
              fontFamily: "'Source Code Pro', monospace",
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              mb: 2,
            }}
          >
            Vector Log
          </Typography>
          <Box
            sx={{
              width: 48,
              height: 3,
              borderRadius: 2,
              bgcolor: palette.accent,
              mb: 2,
            }}
          />
          <Typography
            sx={{
              color: palette.text,
              fontSize: { xs: 18, md: 20 },
              fontWeight: 600,
              lineHeight: 1.4,
              mb: 1,
            }}
          >
            Ship smarter. Real AI notes for founders and developers.
          </Typography>
          <Typography
            sx={{
              color: palette.textMuted,
              fontSize: 17,
              lineHeight: 1.65,
              maxWidth: 540,
            }}
          >
            Bi-weekly field notes from Michael Lynn: implementation insights, curated AI news, and
            practical tips. No fluff — just signal you can use.
          </Typography>
        </Box>

        {/* Primary CTA above the fold */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${palette.border}`,
            bgcolor: palette.bgSurface,
            backgroundImage: `linear-gradient(135deg, ${palette.accent}0c 0%, transparent 50%)`,
            mb: 6,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: palette.accent,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              mb: 1,
            }}
          >
            Get the next issue
          </Typography>
          <Typography sx={{ color: palette.text, fontWeight: 700, fontSize: 20, mb: 0.5 }}>
            Join builders who get Vector Log in their inbox
          </Typography>
          <Typography sx={{ color: palette.textMuted, fontSize: 14, mb: 2, lineHeight: 1.5 }}>
            One email every two weeks. Unsubscribe anytime. We only use your address for the
            newsletter.
          </Typography>
          <Button
            component={Link}
            href="/newsletter/subscribe"
            variant="contained"
            size="large"
            sx={{
              bgcolor: palette.accent,
              color: palette.bg,
              fontWeight: 700,
              px: 3,
              py: 1.5,
              fontSize: 15,
              '&:hover': {
                bgcolor: palette.accentDim,
              },
            }}
          >
            Subscribe — it&apos;s free
          </Button>
        </Box>

        {/* What you get — GTM benefit bullets */}
        <Box sx={{ mb: 6 }}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: palette.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              mb: 2,
            }}
          >
            What you get
          </Typography>
          <Stack spacing={2}>
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <Box
                key={title}
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${palette.border}`,
                  bgcolor: palette.bgCard,
                }}
              >
                <Box sx={{ color: palette.accent, mt: 0.25 }}>
                  <Icon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: palette.text, fontSize: 15, mb: 0.25 }}>
                    {title}
                  </Typography>
                  <Typography sx={{ color: palette.textMuted, fontSize: 14, lineHeight: 1.5 }}>
                    {text}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Past issues — proof of consistency & quality */}
        <Box sx={{ mb: 6 }}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: palette.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              mb: 1,
            }}
          >
            Past issues
          </Typography>
          {issueCount > 0 && (
            <Typography sx={{ color: palette.textDim, fontSize: 13, mb: 2 }}>
              {issueCount} {issueCount === 1 ? 'issue' : 'issues'} so far — see what you&apos;ll
              get.
            </Typography>
          )}
          {!issues || issues.length === 0 ? (
            <Typography sx={{ color: palette.textDim, fontSize: 14 }}>
              No published issues yet. Check back soon.
            </Typography>
          ) : (
            <Box
              component="ul"
              sx={{
                m: 0,
                p: 0,
                listStyle: 'none',
                borderTop: `1px solid ${palette.border}`,
              }}
            >
              {issues.map((issue) => {
                const dateStr = issue.publishDate
                  ? new Date(issue.publishDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '';
                return (
                  <Box
                    component="li"
                    key={issue.issueNumber}
                    sx={{
                      borderBottom: `1px solid ${palette.border}`,
                    }}
                  >
                    <MuiLink
                      component={Link}
                      href={`/newsletter/${issue.issueNumber}`}
                      underline="hover"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                        py: 2,
                        color: palette.accent,
                        fontWeight: 600,
                        fontSize: 15,
                        '&:visited': { color: palette.accent },
                        '&:hover': { color: palette.accentLight },
                      }}
                    >
                      <span>
                        Issue #{issue.issueNumber}
                        {issue.theme ? ` — ${issue.theme}` : ''}
                      </span>
                      {dateStr && (
                        <Typography
                          component="span"
                          sx={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: palette.textMuted,
                          }}
                        >
                          {dateStr}
                        </Typography>
                      )}
                    </MuiLink>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Secondary CTA */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${palette.border}`,
            bgcolor: palette.bgSurface,
            backgroundImage: `linear-gradient(135deg, ${palette.accent}08 0%, transparent 50%)`,
          }}
        >
          <Typography sx={{ color: palette.text, fontWeight: 600, fontSize: 17, mb: 1 }}>
            Ready for the next issue?
          </Typography>
          <Typography sx={{ color: palette.textMuted, fontSize: 14, mb: 2, lineHeight: 1.5 }}>
            Get Vector Log in your inbox. No spam — just developer-focused AI notes, bi-weekly.
          </Typography>
          <Button
            component={Link}
            href="/newsletter/subscribe"
            variant="contained"
            sx={{
              bgcolor: palette.accent,
              color: palette.bg,
              fontWeight: 700,
              px: 3,
              py: 1.25,
              '&:hover': {
                bgcolor: palette.accentDim,
              },
            }}
          >
            Subscribe to Vector Log
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
