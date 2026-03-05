'use client';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Container, Typography } from '@mui/material';
import { palette } from '@/theme/theme';

// What I'm Reading (s6) before Want More? (s5)
const SECTION_HEADINGS: { key: keyof typeof sectionKeys; label: string }[] = [
  { key: 's1', label: 'FROM THE FIELD' },
  { key: 's2', label: 'AI NEWS ROUNDUP' },
  { key: 's3', label: 'DEVELOPER INTELLIGENCE' },
  { key: 's4', label: 'VAI PRODUCT TIP' },
  { key: 's6', label: "WHAT I'M READING" },
  { key: 's5', label: 'WANT MORE?' },
];

/** Remove AI section delimiter lines from content so they don't show on the hosted page. */
function stripSectionDelimiters(text: string): string {
  const sectionDelimiter = /^\s*===\s*(SECTION\s+\d+:.*|END OF ISSUE)\s*={2,3}\s*$/im;
  return text
    .split('\n')
    .filter((line) => !sectionDelimiter.test(line.trim()))
    .join('\n');
}

const sectionKeys = {
  s1: true,
  s2: true,
  s3: true,
  s4: true,
  s5: true,
  s6: true,
};

type SectionKey = keyof typeof sectionKeys;

interface Section {
  content?: string;
  enabled?: boolean;
}

interface SerializedIssue {
  issueNumber: number;
  theme: string;
  publishDate: string;
  sections: Record<SectionKey, Section | undefined>;
}

export function IssueView({ issue }: { issue: SerializedIssue }) {
  const dateStr = issue.publishDate
    ? new Date(issue.publishDate + 'Z').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <Box sx={{ py: 6, minHeight: '60vh' }}>
      <Container maxWidth="md">
        <Typography
          component={Link}
          href="/newsletter"
          sx={{
            display: 'inline-block',
            fontSize: 12,
            color: palette.textMuted,
            textDecoration: 'none',
            mb: 2,
            '&:hover': { color: palette.accent },
          }}
        >
          ← All issues
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            color: palette.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            mb: 0.5,
          }}
        >
          Vector Log
        </Typography>
        <Typography sx={{ fontSize: 12, color: palette.textMuted, mb: 1 }}>
          Notes from building AI systems in the field
        </Typography>
        <Typography
          variant="h1"
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: palette.text,
            mb: 0.5,
          }}
        >
          Issue #{issue.issueNumber}
          {issue.theme ? ` — ${issue.theme}` : ''}
        </Typography>
        {dateStr && (
          <Typography sx={{ fontSize: 14, color: palette.textDim, mb: 4 }}>
            {dateStr}
          </Typography>
        )}

        <Box
          sx={{
            '& h1, & h2, & h3': {
              color: palette.text,
              mt: 3,
              mb: 1,
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            },
            '& p': { color: palette.text, mb: 1.5, lineHeight: 1.7 },
            '& ul, & ol': { color: palette.text, mb: 1.5, pl: 3 },
            '& a': { color: palette.accent, textDecoration: 'underline' },
            '& pre': {
              fontFamily: 'monospace',
              bgcolor: palette.bgCard,
              color: palette.text,
              borderRadius: 1,
              p: 1.5,
              overflowX: 'auto',
              fontSize: 13,
              mb: 1.5,
              border: `1px solid ${palette.border}`,
            },
            '& pre code': { bgcolor: 'transparent', color: 'inherit' },
            '& :not(pre) > code': {
              fontFamily: 'monospace',
              bgcolor: palette.bgCard,
              color: palette.accentLight,
              borderRadius: 0.5,
              px: 0.5,
              py: 0.25,
              fontSize: '0.9em',
            },
            '& blockquote': {
              borderLeft: `4px solid ${palette.border}`,
              pl: 2,
              ml: 0,
              color: palette.textDim,
              fontStyle: 'italic',
            },
            '& figure': { my: 2 },
            '& img': { maxWidth: '100%', borderRadius: 1 },
            '& figcaption': { fontSize: 12, color: palette.textMuted, mt: 0.5 },
          }}
        >
          {SECTION_HEADINGS.map(({ key, label }) => {
            const section = issue.sections[key];
            const raw = section?.content?.trim() ?? '';
            const content = stripSectionDelimiters(raw);
            const enabled = section?.enabled !== false;
            if (!enabled || !content) return null;
            return (
              <Box key={key} component="section" sx={{ mb: 4 }}>
                <Typography
                  component="h2"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: palette.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    mb: 1.5,
                  }}
                >
                  {label}
                </Typography>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ mt: 6, pt: 3, borderTop: `1px solid ${palette.border}` }}>
          <Typography sx={{ fontSize: 14, color: palette.textMuted, mb: 1 }}>
            Get the next issue in your inbox.
          </Typography>
          <Typography
            component={Link}
            href="/newsletter/subscribe"
            sx={{ color: palette.accent, textDecoration: 'underline', fontSize: 14 }}
          >
            Subscribe to Vector Log →
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
