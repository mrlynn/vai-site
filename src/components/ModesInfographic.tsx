'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import Link from 'next/link';
import { palette } from '@/theme/theme';
import ButtonLink from '@/components/ButtonLink';

const MONO = "'Source Code Pro', 'SF Mono', 'Fira Code', monospace";

interface Mode {
  id: string;
  label: string;
  badge: string;
  color: string;
  icon: string;
  tagline: string;
  description: string;
  steps: { label: string; detail: string; icon: string; copyable?: string }[];
  stat: { label: string; value: string; sub: string };
  cost: { label: string; value: string; sub: string };
  cta?: { label: string; href: string };
  bestFor: string;
  offline: boolean;
}

const modes: Mode[] = [
  {
    id: 'cli',
    label: 'CLI Mode',
    badge: 'TERMINAL',
    color: palette.accent,
    icon: '>_',
    tagline: '22 Commands. Zero Friction.',
    description:
      'Full RAG pipeline from terminal — ingest, chunk, embed, search, rerank.',
    steps: [
      { label: 'vai pipeline ./docs/', detail: 'Reads & chunks files recursively', icon: '📂', copyable: 'vai pipeline ./docs/' },
      { label: 'Voyage AI Embed', detail: 'Batch embedding with voyage-4-large', icon: '⚡' },
      { label: 'MongoDB Atlas Store', detail: 'Vectors + metadata persisted', icon: '🗄️' },
      { label: 'vai query "..."', detail: 'Embed query → $vectorSearch → rerank', icon: '🔍', copyable: 'vai query "your question here"' },
    ],
    stat: { label: 'RTEB Score', value: '71.41', sub: 'voyage-4-large' },
    cost: { label: 'API Models', value: '4', sub: 'voyage-4 family' },
    cta: { label: 'Try CLI demo', href: '/#cli-demo' },
    bestFor: 'Scripting, CI/CD',
    offline: false,
  },
  {
    id: 'local',
    label: 'Local / Nano Mode',
    badge: 'OFFLINE',
    color: palette.yellow,
    icon: '⬡',
    tagline: 'Zero API Keys. Full Power.',
    description:
      'voyage-4-nano runs locally via HuggingFace. Shared embedding space with cloud models.',
    steps: [
      { label: 'vai nano setup', detail: 'Downloads ONNX model once', icon: '⬇️', copyable: 'vai nano setup' },
      { label: 'vai pipeline --local', detail: 'CPU inference, no API call', icon: '💻', copyable: 'vai pipeline --local ./docs/' },
      { label: 'MongoDB Local/Atlas', detail: 'Works with Atlas CLI or free tier', icon: '🗄️' },
      { label: 'vai query --local', detail: 'Cross-bridge: nano ↔ API compatible', icon: '🔗', copyable: 'vai query --local "your question"' },
    ],
    stat: { label: 'Shared Space', value: '0.941', sub: 'cosine sim vs API' },
    cost: { label: 'API Cost', value: '$0', sub: 'indexing phase' },
    cta: { label: 'See local demos', href: '/demos' },
    bestFor: 'Privacy, no API keys',
    offline: true,
  },
  {
    id: 'playground',
    label: 'Web Playground',
    badge: 'BROWSER',
    color: palette.blue,
    icon: '◈',
    tagline: 'Explore. Visualize. Compare.',
    description:
      'Run vai playground to launch a 7-tab browser UI locally. Embedding inspection, similarity comparison, benchmarking, and PCA/t-SNE space visualization.',
    steps: [
      { label: 'vai playground', detail: 'Launches local server at http://localhost:3000', icon: '🚀', copyable: 'vai playground' },
      { label: 'Embed Tab', detail: 'Generate & inspect raw vectors', icon: '🧮' },
      { label: 'Compare Tab', detail: 'Similarity scoring side-by-side', icon: '⚖️' },
      { label: 'Search Tab', detail: 'Vector search with live filters', icon: '🔎' },
      { label: 'Explore Tab', detail: 'PCA / t-SNE space visualization', icon: '🌌' },
    ],
    stat: { label: 'Playground Tabs', value: '7', sub: 'interactive views' },
    cost: { label: 'Framework', value: 'Vanilla JS', sub: 'zero-dependency UI' },
    cta: { label: 'Run vai playground', href: '/#cli-demo' },
    bestFor: 'Exploration, debugging',
    offline: false,
  },
  {
    id: 'mcp',
    label: 'MCP Server Mode',
    badge: 'AGENT',
    color: palette.purple,
    icon: '⬡⬡',
    tagline: 'Your Knowledge Base as a Tool.',
    description:
      '10 MCP tools expose the full VAI pipeline to any MCP-compatible agent: Claude Desktop, Cursor, Windsurf, VS Code.',
    steps: [
      { label: 'vai mcp-server', detail: 'stdio (local) or HTTP (team)', icon: '🔌', copyable: 'vai mcp-server' },
      { label: 'vai_query / vai_search', detail: 'Agent calls retrieval tools', icon: '🤖' },
      { label: 'vai_embed / vai_rerank', detail: 'Embedding + re-ranking tools', icon: '⚡' },
      { label: 'vai_ingest / vai_explain', detail: 'Ingestion + education tools', icon: '📚' },
    ],
    stat: { label: 'MCP Tools', value: '10', sub: 'agent-accessible' },
    cost: { label: 'Clients', value: 'Any', sub: 'Claude, Cursor, etc.' },
    cta: { label: 'Setup MCP', href: '/#mcp' },
    bestFor: 'AI agents (Cursor, Claude)',
    offline: false,
  },
  {
    id: 'desktop',
    label: 'Desktop App',
    badge: 'ELECTRON',
    color: palette.red,
    icon: '▣',
    tagline: 'Native. Offline. OS Keychain.',
    description:
      'Electron app with LeafyGreen design, OS keychain integration, and full offline RAG capabilities.',
    steps: [
      { label: 'OS Keychain', detail: 'Secure API key storage', icon: '🔐' },
      { label: 'Offline Pipeline', detail: 'Full RAG without network', icon: '📡' },
      { label: 'LeafyGreen UI', detail: 'MongoDB design system', icon: '🍃' },
      { label: 'Workflow Canvas', detail: 'React Flow visual builder', icon: '🔀' },
    ],
    stat: { label: 'Platform', value: 'Mac/Win/Lin', sub: 'Electron builds' },
    cost: { label: 'Auth', value: 'OS Keychain', sub: 'zero plaintext keys' },
    cta: { label: 'Download Desktop', href: '/desktop' },
    bestFor: 'Visual workflows',
    offline: true,
  },
];

const pipelineNodes = [
  { id: 'docs', label: 'Documents', icon: '📄' },
  { id: 'chunk', label: 'Chunker', icon: '✂️' },
  { id: 'embed', label: 'Voyage AI Embed', icon: '⚡' },
  { id: 'store', label: 'MongoDB Atlas', icon: '🗄️' },
  { id: 'query', label: 'Query', icon: '❓' },
  { id: 'search', label: '$vectorSearch', icon: '🔍' },
  { id: 'rerank', label: 'Rerank', icon: '🏆' },
  { id: 'result', label: 'Results', icon: '✅' },
];

const sharedSpaceValues = [
  { model: 'voyage-4-large → voyage-4-lite', sim: '0.938' },
  { model: 'voyage-4-nano → voyage-4-lite', sim: '0.941' },
  { model: 'voyage-4 → voyage-4-large', sim: '0.935' },
];

const modelBenchmarks = [
  { name: 'voyage-4-large', score: 71.41, badge: 'MoE', color: palette.accent },
  { name: 'voyage-4', score: 70.07, badge: 'DENSE', color: palette.blue },
  { name: 'voyage-4-lite', score: 68.1, badge: 'BUDGET', color: palette.yellow },
  { name: 'voyage-4-nano', score: 66.5, badge: 'LOCAL', color: palette.purple },
];

const lessons = [
  { icon: '📐', title: 'Know Your Chunking', desc: '5 strategies: fixed, sentence, paragraph, recursive, markdown', href: '/demos' },
  { icon: '🎯', title: 'Pick the Right Model', desc: 'Domain models for code/finance/law outperform general models', href: '/use-cases' },
  { icon: '🔗', title: 'Shared Space = Freedom', desc: 'Index cheap, query smart — no lock-in to one inference path', href: '/shared-space' },
  { icon: '⚡', title: 'Two-Stage Retrieval', desc: 'Embed → $vectorSearch → Rerank = precision at scale', href: '/demos' },
  { icon: '🤖', title: 'Expose as MCP Tools', desc: 'Knowledge bases become agent-accessible via 10 focused tools', href: '/workflows' },
  { icon: '🛡️', title: 'Zero Infrastructure', desc: 'npm install -g. No auth, no hosting, no lock-in.' },
];

/* ─── Sub-components ─── */

function AnimatedArrow({ active, color }: { active: boolean; color: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative', mx: '2px' }}>
      <Box
        sx={{
          height: 2,
          width: '100%',
          background: active ? `linear-gradient(90deg, ${color}88, ${color})` : palette.border,
          transition: 'background 0.4s',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: -4,
          width: 0,
          height: 0,
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderLeft: `8px solid ${active ? color : palette.border}`,
          transition: 'border-left-color 0.4s',
        }}
      />
    </Box>
  );
}

function PipelineNode({
  node,
  color,
  animStep,
  idx,
}: {
  node: (typeof pipelineNodes)[number];
  color: string;
  animStep: number;
  idx: number;
}) {
  const lit = animStep > idx;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: { xs: 52, md: 72 }, maxWidth: { xs: 60, md: 80 }, flexShrink: 0 }}>
      <Box
        sx={{
          width: { xs: 36, md: 44 },
          height: { xs: 36, md: 44 },
          borderRadius: '10px',
          border: `2px solid ${lit ? color : palette.border}`,
          bgcolor: lit ? `${color}18` : palette.bgCard,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          boxShadow: lit ? `0 0 12px ${color}55` : 'none',
          transition: 'all 0.3s',
        }}
      >
        {node.icon}
      </Box>
      <Typography
        sx={{
          fontSize: 9,
          color: lit ? color : palette.textMuted,
          textAlign: 'center',
          mt: 0.5,
          lineHeight: 1.2,
          fontFamily: MONO,
          transition: 'color 0.3s',
        }}
      >
        {node.label}
      </Typography>
    </Box>
  );
}

function ModeCard({
  mode,
  selected,
  onClick,
}: {
  mode: Mode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        bgcolor: selected ? `${mode.color}18` : palette.bgSurface,
        border: `1.5px solid ${selected ? mode.color : palette.border}`,
        borderRadius: '12px',
        p: '10px 14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        transition: 'all 0.2s',
        boxShadow: selected ? `0 0 16px ${mode.color}33` : 'none',
        flex: '1 1 90px',
        minWidth: 90,
        outline: 'none',
        fontFamily: 'inherit',
        '&:hover': { borderColor: mode.color },
      }}
    >
      <Typography
        sx={{ fontSize: 20, width: 28, textAlign: 'center', fontFamily: MONO, color: mode.color, fontWeight: 700 }}
      >
        {mode.icon}
      </Typography>
      <Box sx={{ textAlign: 'left' }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: selected ? mode.color : palette.text, lineHeight: 1.2 }}>
          {mode.label}
        </Typography>
        <Typography
          sx={{
            fontSize: 9,
            color: mode.color,
            bgcolor: `${mode.color}22`,
            borderRadius: '4px',
            px: '5px',
            py: '1px',
            mt: 0.4,
            display: 'inline-block',
            fontFamily: MONO,
            fontWeight: 700,
          }}
        >
          {mode.badge}
        </Typography>
      </Box>
    </Box>
  );
}

function StepRow({
  step,
  color,
  delay,
}: {
  step: { label: string; detail: string; icon: string; copyable?: string };
  color: string;
  delay: number;
}) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const handleCopy = () => {
    if (step.copyable) {
      navigator.clipboard.writeText(step.copyable);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        opacity: show ? 1 : 0,
        transform: show ? 'translateX(0)' : 'translateX(-10px)',
        transition: 'all 0.35s',
        p: '8px 12px',
        borderRadius: '8px',
        bgcolor: palette.bgCard,
        border: `1px solid ${palette.border}`,
      }}
    >
      <Typography sx={{ fontSize: 16 }}>{step.icon}</Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color }}>{step.label}</Typography>
        <Typography sx={{ fontSize: 11, color: palette.textMuted, mt: 0.25 }}>{step.detail}</Typography>
      </Box>
      {step.copyable && (
        <Tooltip title={copied ? 'Copied!' : 'Copy command'}>
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              color: copied ? palette.accent : palette.textMuted,
              p: 0.5,
              '&:hover': { color: color },
            }}
          >
            {copied ? (
              <CheckIcon sx={{ fontSize: 14 }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: 14 }} />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

/* ─── Main Component ─── */

const MODE_IDS = modes.map((m) => m.id);

export default function ModesInfographic() {
  const [selected, setSelected] = useState(0);
  const [animStep, setAnimStep] = useState(0);
  const [tick, setTick] = useState(0);
  const [installCopied, setInstallCopied] = useState(false);
  const mode = modes[selected];

  // URL hash sync: read on mount, update when selected changes
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    const idx = MODE_IDS.indexOf(hash);
    if (idx >= 0) setSelected(idx);
  }, []);

  useEffect(() => {
    const id = modes[selected].id;
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}#${id}`);
    }
  }, [selected]);

  // Pipeline animation
  useEffect(() => {
    setAnimStep(0);
    let step = 0;
    const t = setInterval(() => {
      step++;
      if (step > pipelineNodes.length) step = 0;
      setAnimStep(step);
    }, 400);
    return () => clearInterval(t);
  }, [selected]);

  // Shared space ticker
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const ssv = sharedSpaceValues[tick % sharedSpaceValues.length];

  const handleInstallCopy = () => {
    navigator.clipboard.writeText('npm install -g voyageai-cli');
    setInstallCopied(true);
    setTimeout(() => setInstallCopied(false), 1500);
  };

  return (
    <Box sx={{ bgcolor: palette.bg, minHeight: '100vh', fontFamily: MONO, color: palette.text }}>
      {/* ── Header ── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${palette.bgSurface} 0%, ${palette.bg} 100%)`,
          borderBottom: `1px solid ${palette.border}`,
          px: { xs: 2, md: 3.5 },
          py: { xs: 2, md: 2.5 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${palette.accent}, ${palette.blue})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 14,
                color: palette.bg,
              }}
            >
              VAI
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 16, md: 18 },
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  background: `linear-gradient(135deg, ${palette.accent}, ${palette.blue})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                voyageai-cli
              </Typography>
              <Typography sx={{ fontSize: 10, color: palette.textMuted, letterSpacing: '0.1em' }}>
                OPERATIONAL MODES & VECTOR SEARCH PIPELINE
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, alignItems: { xs: 'stretch', sm: 'center' } }}>
          {/* Install CTA */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: palette.bgCard,
              border: `1px solid ${palette.border}`,
              borderRadius: '10px',
              px: 1.5,
              py: 1,
              minWidth: { xs: '100%', sm: 280 },
            }}
          >
            <Typography sx={{ fontSize: 10, fontFamily: MONO, color: palette.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              npm install -g voyageai-cli
            </Typography>
            <Tooltip title={installCopied ? 'Copied!' : 'Copy'}>
              <IconButton size="small" onClick={handleInstallCopy} sx={{ color: palette.textMuted, p: 0.5 }}>
                {installCopied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Shared Space Live Badge */}
          <Box
            sx={{
              bgcolor: palette.bgCard,
              border: `1px solid ${palette.border}`,
              borderRadius: '10px',
              p: '8px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.25,
              minWidth: { xs: '100%', sm: 220 },
            }}
          >
            <Typography sx={{ fontSize: 9, color: palette.textMuted, letterSpacing: '0.08em' }}>
              SHARED EMBEDDING SPACE · LIVE VALIDATION
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: palette.accent,
                  boxShadow: `0 0 6px ${palette.accent}`,
                  animation: 'vai-pulse 1.5s infinite',
                }}
              />
              <Typography sx={{ fontSize: 11, color: palette.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ssv.model}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: palette.accent, ml: 'auto', flexShrink: 0 }}>
                {ssv.sim}
              </Typography>
            </Box>
            <Box sx={{ height: 3, borderRadius: 2, bgcolor: palette.border, overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${parseFloat(ssv.sim) * 100}%`,
                  background: `linear-gradient(90deg, ${palette.accent}, ${palette.blue})`,
                  transition: 'width 0.8s',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ p: { xs: 2, md: 3.5 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Intro */}
        <Typography sx={{ fontSize: { xs: 13, md: 14 }, color: palette.text, lineHeight: 1.6 }}>
          <Box component="strong" sx={{ color: palette.accent }}>How do you want to run VAI?</Box> Pick a mode below to see its flow, commands, and next steps.
        </Typography>

        {/* I want to... decision guide */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 0.75, md: 1 },
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Typography sx={{ fontSize: 10, color: palette.textMuted, alignSelf: 'center', mr: { xs: 0, sm: 0.5 } }}>
            I want to…
          </Typography>
          {[
            { label: 'prototype quickly', idx: 0 },
            { label: 'run without API keys', idx: 1 },
            { label: 'explore visually', idx: 2 },
            { label: 'wire my AI assistant', idx: 3 },
            { label: 'use a native app', idx: 4 },
          ].map(({ label, idx }) => (
            <Box
              key={label}
              component="button"
              onClick={() => setSelected(idx)}
              sx={{
                fontSize: 10,
                fontFamily: MONO,
                color: selected === idx ? modes[idx].color : palette.textDim,
                bgcolor: selected === idx ? `${modes[idx].color}18` : 'transparent',
                border: `1px solid ${selected === idx ? modes[idx].color : palette.border}`,
                borderRadius: '6px',
                px: 1.25,
                py: 0.5,
                cursor: 'pointer',
                outline: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { borderColor: modes[idx].color, color: modes[idx].color },
              }}
            >
              {label}
            </Box>
          ))}
        </Box>

        {/* Mode Selector */}
        <Box>
          <Typography sx={{ fontSize: 9, color: palette.textMuted, letterSpacing: '0.1em', mb: 1 }}>
            SELECT OPERATIONAL MODE
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {modes.map((m, i) => (
              <ModeCard key={m.id} mode={m} selected={selected === i} onClick={() => setSelected(i)} />
            ))}
          </Box>
        </Box>

        {/* Quick comparison table - hidden on very small screens */}
        <Box sx={{ display: { xs: 'none', sm: 'block' }, overflowX: 'auto' }}>
          <TableContainer
            sx={{
              bgcolor: palette.bgSurface,
              border: `1px solid ${palette.border}`,
              borderRadius: '12px',
              '& .MuiTableCell-root': { borderColor: palette.border, fontSize: 10, py: 1, fontFamily: MONO },
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Mode</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Best for</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Offline?</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modes.map((m, i) => (
                  <TableRow
                    key={m.id}
                    onClick={() => setSelected(i)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: selected === i ? `${m.color}12` : 'transparent',
                      '&:hover': { bgcolor: `${m.color}0a` },
                    }}
                  >
                    <TableCell sx={{ color: m.color, fontWeight: 600 }}>{m.label}</TableCell>
                    <TableCell>{m.bestFor}</TableCell>
                    <TableCell>{m.offline ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{m.cost.sub}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Main content row - stack on mobile */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2 }}>
          {/* Left: Mode Detail */}
          <Box
            sx={{
              flex: '1 1 260px',
              minWidth: 0,
              bgcolor: palette.bgSurface,
              border: `1px solid ${mode.color}44`,
              borderRadius: '14px',
              p: { xs: 1.75, md: 2.25 },
              display: 'flex',
              flexDirection: 'column',
              gap: 1.75,
              boxShadow: `0 0 24px ${mode.color}18`,
              transition: 'box-shadow 0.3s, border-color 0.3s',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: { xs: 20, md: 24 }, color: mode.color }}>{mode.icon}</Typography>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: 14, md: 16 }, color: palette.text }}>{mode.label}</Typography>
                  <Typography
                    sx={{
                      fontSize: 9,
                      color: mode.color,
                      bgcolor: `${mode.color}22`,
                      borderRadius: '4px',
                      px: '7px',
                      py: '2px',
                      display: 'inline-block',
                      letterSpacing: '0.08em',
                      fontWeight: 700,
                    }}
                  >
                    {mode.badge}
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: { xs: 12, md: 13 }, fontWeight: 700, color: mode.color, mb: 0.75 }}>
                {mode.tagline}
              </Typography>
              <Typography sx={{ fontSize: 11, color: palette.textMuted, lineHeight: 1.6 }}>
                {mode.description}
              </Typography>
            </Box>

            {/* CTA */}
            {mode.cta && (
              <ButtonLink
                href={mode.cta.href}
                variant="contained"
                size="small"
                sx={{
                  bgcolor: mode.color,
                  color: mode.id === 'local' ? palette.bg : palette.bg,
                  fontWeight: 700,
                  alignSelf: 'flex-start',
                  '&:hover': { bgcolor: mode.color, opacity: 0.9 },
                }}
              >
                {mode.cta.label}
              </ButtonLink>
            )}

            {/* Stats row */}
            <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
              {[mode.stat, mode.cost].map((s, i) => (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    bgcolor: palette.bgCard,
                    border: `1px solid ${palette.border}`,
                    borderRadius: '8px',
                    p: '8px 10px',
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 900, color: mode.color }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: 9, color: palette.text, fontWeight: 700 }}>{s.label}</Typography>
                  <Typography sx={{ fontSize: 9, color: palette.textMuted }}>{s.sub}</Typography>
                </Box>
              ))}
            </Box>

            {/* Steps */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.875 }}>
              <Typography sx={{ fontSize: 9, color: palette.textMuted, letterSpacing: '0.1em' }}>
                EXECUTION STEPS
              </Typography>
              {mode.steps.map((step, i) => (
                <StepRow key={`${mode.id}-${i}`} step={step} color={mode.color} delay={i * 120} />
              ))}
            </Box>
          </Box>

          {/* Right: Pipeline + Stats */}
          <Box sx={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {/* Pipeline Visualization */}
            <Box
              sx={{
                bgcolor: palette.bgSurface,
                border: `1px solid ${palette.border}`,
                borderRadius: '14px',
                p: { xs: 1.5, md: 2.25 },
              }}
            >
              <Typography sx={{ fontSize: 9, color: palette.textMuted, letterSpacing: '0.1em', mb: 1.75 }}>
                RAG PIPELINE FLOW
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', overflowX: 'auto', pb: 0.5, WebkitOverflowScrolling: 'touch' }}>
                {pipelineNodes.map((node, i) => (
                  <Box
                    key={node.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: i === pipelineNodes.length - 1 ? '0 0 auto' : 1,
                    }}
                  >
                    <PipelineNode node={node} color={mode.color} animStep={animStep} idx={i} />
                    {i < pipelineNodes.length - 1 && <AnimatedArrow active={animStep > i} color={mode.color} />}
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', mt: 1.25, fontSize: 9, color: palette.textMuted, letterSpacing: '0.06em' }}>
                <Box sx={{ flex: 4, borderTop: `1px dashed ${palette.border}`, pt: 0.5, textAlign: 'center' }}>
                  ← INGESTION PHASE →
                </Box>
                <Box sx={{ flex: 4, borderTop: `1px dashed ${palette.border}`, pt: 0.5, textAlign: 'center' }}>
                  ← RETRIEVAL PHASE →
                </Box>
              </Box>
            </Box>

            {/* Model Comparison */}
            <Box
              sx={{
                bgcolor: palette.bgSurface,
                border: `1px solid ${palette.border}`,
                borderRadius: '14px',
                p: 2.25,
              }}
            >
              <Typography sx={{ fontSize: 9, color: palette.textMuted, letterSpacing: '0.1em', mb: 1.5 }}>
                MODEL PERFORMANCE · RTEB NDCG@10
              </Typography>
              {modelBenchmarks.map((m) => (
                <Box key={m.name} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Typography sx={{ fontSize: 10, color: palette.text, fontFamily: MONO }}>{m.name}</Typography>
                      <Typography
                        sx={{
                          fontSize: 8,
                          color: m.color,
                          bgcolor: `${m.color}22`,
                          borderRadius: '3px',
                          px: '5px',
                          py: '1px',
                          fontWeight: 700,
                        }}
                      >
                        {m.badge}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 10, color: m.color, fontWeight: 700 }}>{m.score}</Typography>
                  </Box>
                  <Box sx={{ height: 4, bgcolor: palette.bgCard, borderRadius: 2, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: `${((m.score - 64) / 10) * 100}%`,
                        bgcolor: m.color,
                        borderRadius: 2,
                        transition: 'width 0.6s',
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Cost Optimizer */}
            <Box
              component={Link}
              href="/shared-space"
              sx={{
                bgcolor: `${palette.accent}0F`,
                border: `1px solid ${palette.accent}44`,
                borderRadius: '14px',
                p: 1.75,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                transition: 'all 0.2s',
                '&:hover': { borderColor: palette.accent, bgcolor: `${palette.accent}18` },
              }}
            >
              <Typography sx={{ fontSize: 28, width: 40, textAlign: 'center' }}>💰</Typography>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 10, fontWeight: 800, color: palette.accent, mb: 0.25 }}>
                  SHARED SPACE · COST OPTIMIZER
                </Typography>
                <Typography sx={{ fontSize: 10, color: palette.text, lineHeight: 1.5 }}>
                  Index with <Box component="span" sx={{ color: palette.accent }}>voyage-4-nano (free)</Box>.{' '}
                  Query with <Box component="span" sx={{ color: palette.blue }}>voyage-4-lite ($)</Box>.{' '}
                  No re-indexing needed.
                </Typography>
                <Typography sx={{ mt: 0.75, fontSize: 11, fontWeight: 800, color: palette.accent }}>
                  ~83% cost reduction on indexing phase ↓
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Bottom: Reusable Lessons */}
        <Box
          sx={{
            bgcolor: palette.bgSurface,
            border: `1px solid ${palette.border}`,
            borderRadius: '14px',
            p: 2,
          }}
        >
          <Typography sx={{ fontSize: 9, color: palette.textMuted, letterSpacing: '0.1em', mb: 1.5 }}>
            THE REUSABLE LESSONS · VAI DESIGN PRINCIPLES
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
            {lessons.map((lesson, i) => {
              const cardSx = {
                flex: '1 1 140px',
                minWidth: { xs: '100%', sm: 140 },
                bgcolor: palette.bgCard,
                border: `1px solid ${palette.border}`,
                borderRadius: '10px',
                p: '10px 12px',
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
                ...(lesson.href && {
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  '&:hover': { borderColor: palette.accent, bgcolor: `${palette.accent}0a` },
                }),
              };
              const content = (
                <>
                  <Typography sx={{ fontSize: 18 }}>{lesson.icon}</Typography>
                  <Box>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: palette.text, mb: 0.25 }}>
                      {lesson.title}
                    </Typography>
                    <Typography sx={{ fontSize: 9, color: palette.textMuted, lineHeight: 1.4 }}>
                      {lesson.desc}
                    </Typography>
                  </Box>
                </>
              );
              return lesson.href ? (
                <Box key={i} component={Link} href={lesson.href} sx={cardSx}>
                  {content}
                </Box>
              ) : (
                <Box key={i} sx={cardSx}>
                  {content}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Pulse animation */}
      <style>{`
        @keyframes vai-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </Box>
  );
}
