'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Snackbar,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import DataObjectIcon from '@mui/icons-material/DataObject';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import StorageIcon from '@mui/icons-material/Storage';
import CategoryIcon from '@mui/icons-material/Category';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import CalculateIcon from '@mui/icons-material/Calculate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TerminalIcon from '@mui/icons-material/Terminal';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import CodeIcon from '@mui/icons-material/Code';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { palette } from '@/theme/theme';
import { useState } from 'react';

const clients = [
  { label: 'Claude Code', icon: <TerminalIcon sx={{ fontSize: 16 }} /> },
  { label: 'Claude Desktop', icon: <SmartToyIcon sx={{ fontSize: 16 }} /> },
  { label: 'Cursor', icon: <EditNoteIcon sx={{ fontSize: 16 }} /> },
  { label: 'Windsurf', icon: <CodeIcon sx={{ fontSize: 16 }} /> },
  { label: 'VS Code', icon: <LaptopMacIcon sx={{ fontSize: 16 }} /> },
];

const installSteps = [
  { step: '1', label: 'Install', command: 'npm i -g voyageai-cli' },
  { step: '2', label: 'Connect', command: 'vai mcp install claude-code' },
  { step: '3', label: 'Use', command: 'Agent calls vai_query automatically' },
];

interface ToolInfo {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: string;
}

const tools: ToolInfo[] = [
  { name: 'vai_query', description: 'Full RAG: embed, search, rerank', icon: <SearchIcon />, color: palette.purple, category: 'Retrieval' },
  { name: 'vai_search', description: 'Raw vector similarity search', icon: <TravelExploreIcon />, color: palette.purple, category: 'Retrieval' },
  { name: 'vai_rerank', description: 'Rerank documents by relevance', icon: <SwapVertIcon />, color: palette.purple, category: 'Retrieval' },
  { name: 'vai_embed', description: 'Generate embedding vectors', icon: <DataObjectIcon />, color: palette.blue, category: 'Embedding' },
  { name: 'vai_similarity', description: 'Cosine similarity between texts', icon: <CompareArrowsIcon />, color: palette.blue, category: 'Embedding' },
  { name: 'vai_collections', description: 'List collections and indexes', icon: <StorageIcon />, color: palette.accent, category: 'Management' },
  { name: 'vai_models', description: 'Browse Voyage AI models', icon: <CategoryIcon />, color: palette.accent, category: 'Management' },
  { name: 'vai_topics', description: 'Discover educational topics', icon: <MenuBookIcon />, color: '#FFA94D', category: 'Utility' },
  { name: 'vai_explain', description: 'Deep-dive on any topic', icon: <SchoolIcon />, color: '#FFA94D', category: 'Utility' },
  { name: 'vai_estimate', description: 'Cost calculator for operations', icon: <CalculateIcon />, color: '#FFA94D', category: 'Utility' },
  { name: 'vai_ingest', description: 'Chunk, embed, store documents', icon: <CloudUploadIcon />, color: '#FF6B6B', category: 'Ingestion' },
];

interface TerminalLine {
  command?: string;
  output?: string;
}

interface TerminalTab {
  label: string;
  lines: TerminalLine[];
}

const terminalTabs: TerminalTab[] = [
  {
    label: 'Install',
    lines: [
      { command: 'vai mcp install all' },
      { output: '✅ Claude Desktop: installed vai' },
      { output: '✅ Claude Code: installed vai' },
      { output: '✅ Cursor: installed vai' },
      { output: '✅ Windsurf: installed vai' },
      { output: '' },
      { command: 'vai mcp status' },
      { output: '  ✅ installed      Claude Desktop   ~/Library/.../claude_desktop_config.json' },
      { output: '  ✅ installed      Claude Code      ~/.claude/settings.json' },
      { output: '  ✅ installed      Cursor           ~/.cursor/mcp.json' },
      { output: '  ✅ installed      Windsurf         ~/.codeium/windsurf/mcp_config.json' },
    ],
  },
  {
    label: 'Stdio',
    lines: [
      { command: 'echo \'{"jsonrpc":"2.0","id":1,"method":"initialize",...}\' | vai mcp' },
      { output: '{"jsonrpc":"2.0","id":1,"result":{"serverInfo":{"name":"vai-mcp-server","version":"1.25.0"}}}' },
      { output: '' },
      { command: '# Agent automatically discovers 11 tools via tools/list' },
      { command: '# Then calls them as needed during conversation' },
    ],
  },
  {
    label: 'HTTP',
    lines: [
      { command: 'vai mcp --transport http --port 3100' },
      { output: 'vai MCP server v1.25.0 running on http://127.0.0.1:3100/mcp' },
      { output: '' },
      { command: 'curl http://127.0.0.1:3100/health' },
      { output: '{"status":"ok","version":"1.25.0","voyageAi":"configured","mongodb":"configured"}' },
    ],
  },
];

export default function McpServer() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <Box
      component="section"
      id="mcp"
      sx={{ py: { xs: 8, md: 12 }, bgcolor: palette.bg }}
    >
      <Container maxWidth="lg">
        {/* Section header */}
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontSize: { xs: '1.8rem', md: '2.4rem' },
            color: palette.text,
          }}
        >
          Give your AI agent a knowledge base
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            mb: 4,
            color: palette.textMuted,
            fontSize: '1.1rem',
            maxWidth: 620,
            mx: 'auto',
          }}
        >
          The vai MCP server exposes 11 tools over the Model Context Protocol.
          Any compatible agent can search, embed, rerank, and ingest documents from your collections.
        </Typography>

        {/* Supported clients */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 6,
          }}
        >
          {clients.map((c) => (
            <Chip
              key={c.label}
              icon={c.icon}
              label={c.label}
              variant="outlined"
              sx={{
                borderColor: palette.border,
                color: palette.textDim,
                fontSize: '0.85rem',
                '& .MuiChip-icon': { color: palette.purple },
              }}
            />
          ))}
        </Box>

        {/* 3-step install */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 8,
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          {installSteps.map((item) => (
            <Box
              key={item.step}
              sx={{
                bgcolor: palette.bgCard,
                border: `1px solid ${palette.border}`,
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover': { borderColor: palette.purple },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: `${palette.purple}20`,
                  color: palette.purple,
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
              {item.step !== '3' ? (
                <Button
                  size="small"
                  onClick={() => handleCopy(item.command)}
                  sx={{
                    fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                    fontSize: '0.8rem',
                    color: palette.textMuted,
                    textTransform: 'none',
                    '&:hover': { color: palette.purple, bgcolor: 'transparent' },
                  }}
                  endIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                >
                  {item.command}
                </Button>
              ) : (
                <Typography
                  sx={{
                    fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                    fontSize: '0.8rem',
                    color: palette.textMuted,
                  }}
                >
                  {item.command}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {/* Tool grid */}
        <Typography
          variant="h5"
          sx={{
            textAlign: 'center',
            mb: 1,
            color: palette.text,
            fontSize: { xs: '1.3rem', md: '1.5rem' },
          }}
        >
          11 tools, one protocol
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            mb: 5,
            color: palette.textMuted,
            fontSize: '0.95rem',
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          Your agent picks the right tool for the task. No prompting required.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 8 }}>
          {tools.map((tool) => (
            <Grid key={tool.name} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: palette.bgCard,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: `${tool.color}66`,
                    boxShadow: `0 8px 32px ${tool.color}15`,
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      minWidth: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1.5,
                      bgcolor: `${tool.color}15`,
                      color: tool.color,
                      '& svg': { fontSize: 20 },
                    }}
                  >
                    {tool.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: palette.text,
                        mb: 0.3,
                      }}
                    >
                      {tool.name}
                    </Typography>
                    <Typography sx={{ color: palette.textMuted, fontSize: '0.82rem', lineHeight: 1.4 }}>
                      {tool.description}
                    </Typography>
                  </Box>
                  <Chip
                    label={tool.category}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      bgcolor: `${tool.color}15`,
                      color: tool.color,
                      border: 'none',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tabbed terminal */}
        <Box
          sx={{
            bgcolor: palette.bgCard,
            border: `1px solid ${palette.border}`,
            borderRadius: 3,
            overflow: 'hidden',
            maxWidth: 900,
            mx: 'auto',
            mb: 5,
          }}
        >
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
                  '&.Mui-selected': { color: palette.purple },
                },
                '& .MuiTabs-indicator': {
                  bgcolor: palette.purple,
                  height: 2,
                },
              }}
            >
              {terminalTabs.map((t) => (
                <Tab key={t.label} label={t.label} />
              ))}
            </Tabs>
          </Box>

          <Box
            sx={{
              p: 3,
              fontFamily: "'Source Code Pro', 'SF Mono', 'Fira Code', monospace",
              fontSize: { xs: '0.72rem', sm: '0.82rem' },
              lineHeight: 1.9,
              overflowX: 'auto',
              minHeight: 180,
            }}
          >
            {terminalTabs[activeTab].lines.map((line, i) => (
              <Box key={i}>
                {line.command !== undefined && (
                  <Box>
                    <Box component="span" sx={{ color: palette.purple, fontWeight: 600 }}>
                      ${' '}
                    </Box>
                    <Box component="span" sx={{ color: palette.text }}>
                      {line.command}
                    </Box>
                  </Box>
                )}
                {line.output !== undefined && (
                  <Box sx={{ color: palette.textMuted, pl: line.command !== undefined ? 0 : 0 }}>
                    {line.output}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            href="https://github.com/mrlynn/voyageai-cli/blob/main/docs/mcp-server.md"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderColor: palette.purple,
              color: palette.purple,
              fontWeight: 600,
              px: 4,
              '&:hover': {
                borderColor: palette.purple,
                bgcolor: `${palette.purple}15`,
              },
            }}
          >
            View MCP Server docs
          </Button>
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
