'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { palette } from '@/theme/theme';

const MONO = "'Source Code Pro', 'SF Mono', 'Fira Code', monospace";

interface Mode {
  id: string;
  label: string;
  badge: string;
  color: string;
  icon: string;
  tagline: string;
  description: string;
  steps: { label: string; detail: string; icon: string }[];
  stat: { label: string; value: string; sub: string };
  cost: { label: string; value: string; sub: string };
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
      { label: 'vai pipeline ./docs/', detail: 'Reads & chunks files recursively', icon: '📂' },
      { label: 'Voyage AI Embed', detail: 'Batch embedding with voyage-4-large', icon: '⚡' },
      { label: 'MongoDB Atlas Store', detail: 'Vectors + metadata persisted', icon: '🗄️' },
      { label: 'vai query "..."', detail: 'Embed query → $vectorSearch → rerank', icon: '🔍' },
    ],
    stat: { label: 'RTEB Score', value: '71.41', sub: 'voyage-4-large' },
    cost: { label: 'API Models', value: '4', sub: 'voyage-4 family' },
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
      { label: 'vai nano setup', detail: 'Downloads ONNX model once', icon: '⬇️' },
      { label: 'vai pipeline --local', detail: 'CPU inference, no API call', icon: '💻' },
      { label: 'MongoDB Local/Atlas', detail: 'Works with Atlas CLI or free tier', icon: '🗄️' },
      { label: 'vai query --local', detail: 'Cross-bridge: nano ↔ API compatible', icon: '🔗' },
    ],
    stat: { label: 'Shared Space', value: '0.941', sub: 'cosine sim vs API' },
    cost: { label: 'API Cost', value: '$0', sub: 'indexing phase' },
  },
  {
    id: 'playground',
    label: 'Web Playground',
    badge: 'BROWSER',
    color: palette.blue,
    icon: '◈',
    tagline: 'Explore. Visualize. Compare.',
    description:
      '7-tab browser UI for embedding inspection, similarity comparison, benchmarking, and PCA/t-SNE space visualization.',
    steps: [
      { label: 'Embed Tab', detail: 'Generate & inspect raw vectors', icon: '🧮' },
      { label: 'Compare Tab', detail: 'Similarity scoring side-by-side', icon: '⚖️' },
      { label: 'Search Tab', detail: 'Vector search with live filters', icon: '🔎' },
      { label: 'Explore Tab', detail: 'PCA / t-SNE space visualization', icon: '🌌' },
    ],
    stat: { label: 'Playground Tabs', value: '7', sub: 'interactive views' },
    cost: { label: 'Framework', value: 'Vanilla JS', sub: 'zero-dependency UI' },
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
      { label: 'vai mcp-server', detail: 'stdio (local) or HTTP (team)', icon: '🔌' },
      { label: 'vai_query / vai_search', detail: 'Agent calls retrieval tools', icon: '🤖' },
      { label: 'vai_embed / vai_rerank', detail: 'Embedding + re-ranking tools', icon: '⚡' },
      { label: 'vai_ingest / vai_explain', detail: 'Ingestion + education tools', icon: '📚' },
    ],
    stat: { label: 'MCP Tools', value: '10', sub: 'agent-accessible' },
    cost: { label: 'Clients', value: 'Any', sub: 'Claude, Cursor, etc.' },
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
  { icon: '📐', title: 'Know Your Chunking', desc: '5 strategies: fixed, sentence, paragraph, recursive, markdown' },
  { icon: '🎯', title: 'Pick the Right Model', desc: 'Domain models for code/finance/law outperform general models' },
  { icon: '🔗', title: 'Shared Space = Freedom', desc: 'Index cheap, query smart — no lock-in to one inference path' },
  { icon: '⚡', title: 'Two-Stage Retrieval', desc: 'Embed → $vectorSearch → Rerank = precision at scale' },
  { icon: '🤖', title: 'Expose as MCP Tools', desc: 'Knowledge bases become agent-accessible via 10 focused tools' },
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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72, maxWidth: 80 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
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
        flex: 1,
        minWidth: 120,
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
  step: { label: string; detail: string; icon: string };
  color: string;
  delay: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

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
      <Box>
        <Typography sx={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color }}>{step.label}</Typography>
        <Typography sx={{ fontSize: 11, color: palette.textMuted, mt: 0.25 }}>{step.detail}</Typography>
      </Box>
    </Box>
  );
}

/* ─── Main Component ─── */

export default function ModesInfographic() {
  const [selected, setSelected] = useState(0);
  const [animStep, setAnimStep] = useState(0);
  const [tick, setTick] = useState(0);
  const mode = modes[selected];

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
          alignItems: 'center',
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
                  fontSize: 18,
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
            minWidth: 220,
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
            <Typography sx={{ fontSize: 11, color: palette.text }}>{ssv.model}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: palette.accent, ml: 'auto' }}>
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

      {/* ── Body ── */}
      <Box sx={{ p: { xs: 2, md: 3.5 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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

        {/* Main content row */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Left: Mode Detail */}
          <Box
            sx={{
              flex: '1 1 260px',
              bgcolor: palette.bgSurface,
              border: `1px solid ${mode.color}44`,
              borderRadius: '14px',
              p: 2.25,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.75,
              boxShadow: `0 0 24px ${mode.color}18`,
              transition: 'box-shadow 0.3s, border-color 0.3s',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <Typography sx={{ fontSize: 24, color: mode.color }}>{mode.icon}</Typography>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: 16, color: palette.text }}>{mode.label}</Typography>
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
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: mode.color, mb: 0.75 }}>
                {mode.tagline}
              </Typography>
              <Typography sx={{ fontSize: 11, color: palette.textMuted, lineHeight: 1.6 }}>
                {mode.description}
              </Typography>
            </Box>

            {/* Stats row */}
            <Box sx={{ display: 'flex', gap: 1.25 }}>
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
          <Box sx={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {/* Pipeline Visualization */}
            <Box
              sx={{
                bgcolor: palette.bgSurface,
                border: `1px solid ${palette.border}`,
                borderRadius: '14px',
                p: 2.25,
              }}
            >
              <Typography sx={{ fontSize: 9, color: palette.textMuted, letterSpacing: '0.1em', mb: 1.75 }}>
                RAG PIPELINE FLOW
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', overflowX: 'auto', pb: 0.5 }}>
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
              sx={{
                bgcolor: `${palette.accent}0F`,
                border: `1px solid ${palette.accent}44`,
                borderRadius: '14px',
                p: 1.75,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
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
            {lessons.map((lesson, i) => (
              <Box
                key={i}
                sx={{
                  flex: '1 1 150px',
                  bgcolor: palette.bgCard,
                  border: `1px solid ${palette.border}`,
                  borderRadius: '10px',
                  p: '10px 12px',
                  display: 'flex',
                  gap: 1,
                  alignItems: 'flex-start',
                }}
              >
                <Typography sx={{ fontSize: 18 }}>{lesson.icon}</Typography>
                <Box>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: palette.text, mb: 0.25 }}>
                    {lesson.title}
                  </Typography>
                  <Typography sx={{ fontSize: 9, color: palette.textMuted, lineHeight: 1.4 }}>
                    {lesson.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
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
