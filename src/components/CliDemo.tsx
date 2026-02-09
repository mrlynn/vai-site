'use client';

import { Box, Container, Typography, Tabs, Tab, Snackbar, Button } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { palette } from '@/theme/theme';
import { useState } from 'react';

interface CommandLine {
  command: string;
  output?: string;
}

interface Workflow {
  label: string;
  commands: CommandLine[];
}

const workflows: Workflow[] = [
  {
    label: 'Quick Start',
    commands: [
      { command: 'npm install -g voyageai-cli', output: '✓ Installed voyageai-cli globally' },
      { command: 'vai config set api-key YOUR_VOYAGE_API_KEY', output: '✓ API key saved securely' },
      { command: 'vai embed "Hello, vector world!"', output: '✓ Model: voyage-3 | Dimensions: 1024 | Latency: 89ms' },
    ],
  },
  {
    label: 'RAG Pipeline',
    commands: [
      { command: 'vai chunk document.pdf --strategy semantic', output: '✓ Created 47 chunks from document.pdf' },
      { command: 'vai embed chunks/*.txt --output embeddings.json', output: '✓ Embedded 47 chunks with voyage-3-large' },
      { command: 'vai search "quarterly revenue" --db mongodb', output: '✓ Found 5 relevant chunks (0.91, 0.87, 0.85...)' },
      { command: 'vai rerank "quarterly revenue" chunks.json --top 3', output: '✓ Reranked to [2, 1, 5] with rerank-2.5' },
    ],
  },
  {
    label: 'Benchmarking',
    commands: [
      { command: 'vai benchmark latency --models voyage-3,voyage-3-lite', output: '✓ voyage-3: 142ms | voyage-3-lite: 67ms' },
      { command: 'vai benchmark cost --tokens 1000000', output: '✓ voyage-3: $0.06 | voyage-3-lite: $0.02 | OpenAI: $0.13' },
      { command: 'vai compare "semantic search" "keyword search" --explain', output: '✓ Cosine: 0.72 | These concepts are related but distinct...' },
    ],
  },
  {
    label: 'Interactive',
    commands: [
      { command: 'vai playground', output: '✓ Playground running at http://localhost:3000' },
      { command: 'vai app', output: '✓ Opening Vai Desktop App...' },
      { command: 'vai explore embeddings', output: '✓ What are embeddings? Embeddings are dense vector representations...' },
    ],
  },
];

const quickStartSteps = [
  { step: '1', label: 'Install', command: 'npm i -g voyageai-cli' },
  { step: '2', label: 'Configure', command: 'vai config set api-key YOUR_KEY' },
  { step: '3', label: 'Embed', command: 'vai embed "Your text here"' },
];

export default function CliDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <Box
      component="section"
      id="cli-demo"
      sx={{ py: { xs: 8, md: 12 }, bgcolor: palette.bgSurface }}
    >
      <Container maxWidth="lg">
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
            mb: 6,
            color: palette.textMuted,
            fontSize: '1.1rem',
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          Simple, intuitive commands that get out of your way.
        </Typography>

        {/* Quick start steps */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 6,
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          {quickStartSteps.map((item) => (
            <Box
              key={item.step}
              sx={{
                bgcolor: palette.bgCard,
                border: `1px solid ${palette.border}`,
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: palette.accent,
                },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: `${palette.accent}20`,
                  color: palette.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {item.step}
              </Box>
              <Typography sx={{ color: palette.text, fontWeight: 600, mb: 1 }}>
                {item.label}
              </Typography>
              <Button
                size="small"
                onClick={() => handleCopy(item.command)}
                sx={{
                  fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                  fontSize: '0.8rem',
                  color: palette.textMuted,
                  textTransform: 'none',
                  '&:hover': { color: palette.accent, bgcolor: 'transparent' },
                }}
                endIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
              >
                {item.command}
              </Button>
            </Box>
          ))}
        </Box>

        {/* Tabbed terminal */}
        <Box
          sx={{
            bgcolor: palette.bgCard,
            border: `1px solid ${palette.border}`,
            borderRadius: 3,
            overflow: 'hidden',
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          {/* Terminal title bar with tabs */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 2,
              py: 1,
              bgcolor: 'rgba(0,0,0,0.3)',
              borderBottom: `1px solid ${palette.border}`,
            }}
          >
            <Box sx={{ display: 'flex', gap: 0.8, mr: 3 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
            </Box>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                minHeight: 36,
                '& .MuiTab-root': {
                  minHeight: 36,
                  py: 0.5,
                  px: 2,
                  fontSize: '0.8rem',
                  color: palette.textMuted,
                  textTransform: 'none',
                  '&.Mui-selected': { color: palette.accent },
                },
                '& .MuiTabs-indicator': {
                  bgcolor: palette.accent,
                  height: 2,
                },
              }}
            >
              {workflows.map((w) => (
                <Tab key={w.label} label={w.label} />
              ))}
            </Tabs>
          </Box>

          {/* Terminal content */}
          <Box
            sx={{
              p: 3,
              fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
              fontSize: { xs: '0.78rem', sm: '0.88rem' },
              lineHeight: 2,
              overflowX: 'auto',
              minHeight: 200,
            }}
          >
            {workflows[activeTab].commands.map((cmd, i) => (
              <Box key={i} sx={{ mb: i < workflows[activeTab].commands.length - 1 ? 2.5 : 0 }}>
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

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
