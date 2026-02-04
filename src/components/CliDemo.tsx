'use client';

import { Box, Container, Typography } from '@mui/material';
import { palette } from '@/theme/theme';

interface CommandLine {
  command: string;
  output?: string;
}

const commands: CommandLine[] = [
  {
    command: 'vai embed "MongoDB Atlas provides vector search"',
    output: '✓ Model: voyage-4 | Dimensions: 1024 | Latency: 142ms',
  },
  {
    command: 'vai compare "NoSQL database" "document store"',
    output: '✓ Cosine: 0.8742 | Dot: 0.8612 | Euclidean: 0.5013',
  },
  {
    command: 'vai benchmark --models "voyage-4-large,voyage-4,voyage-4-lite"',
    output: '✓ Benchmarked 3 models × 5 iterations — results saved',
  },
  {
    command: 'vai playground',
    output: '✓ Playground running at http://localhost:3000',
  },
];

export default function CliDemo() {
  return (
    <Box
      component="section"
      id="cli-demo"
      sx={{ py: { xs: 8, md: 12 }, bgcolor: palette.bgSurface }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontSize: { xs: '1.8rem', md: '2.4rem' },
            color: palette.text,
          }}
        >
          Powerful from the command line
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            mb: 8,
            color: palette.textMuted,
            fontSize: '1.1rem',
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          Simple, intuitive commands that get out of your way.
        </Typography>

        <Box
          sx={{
            bgcolor: palette.bgCard,
            border: `1px solid ${palette.border}`,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Terminal title bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              px: 2,
              py: 1.5,
              bgcolor: 'rgba(0,0,0,0.3)',
              borderBottom: `1px solid ${palette.border}`,
            }}
          >
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
            <Typography
              sx={{
                ml: 2,
                color: palette.textMuted,
                fontSize: '0.8rem',
                fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
              }}
            >
              Terminal
            </Typography>
          </Box>

          {/* Terminal content */}
          <Box
            sx={{
              p: 3,
              fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
              fontSize: { xs: '0.78rem', sm: '0.88rem' },
              lineHeight: 2,
              overflowX: 'auto',
            }}
          >
            {commands.map((cmd, i) => (
              <Box key={i} sx={{ mb: i < commands.length - 1 ? 2.5 : 0 }}>
                <Box>
                  <Box component="span" sx={{ color: palette.accent, fontWeight: 600 }}>
                    ${' '}
                  </Box>
                  <Box component="span" sx={{ color: palette.text }}>
                    {cmd.command}
                  </Box>
                </Box>
                {cmd.output && (
                  <Box sx={{ color: palette.textMuted, pl: 2 }}>{cmd.output}</Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
