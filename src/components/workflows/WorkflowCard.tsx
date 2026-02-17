'use client';

import {
  Box, Card, CardActionArea, CardContent, Chip, Typography,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { palette } from '@/theme/theme';
import { useRouter } from 'next/navigation';

/* ── tool → color mapping (matches Playground canvas) ── */
const toolColorMap: Record<string, string> = {
  query: '#00BCD4', search: '#00BCD4', rerank: '#00BCD4',
  embed: '#9C27B0', similarity: '#9C27B0',
  estimate: '#FF9800', models: '#FF9800', collections: '#FF9800', explain: '#FF9800',
  merge: '#607D8B', filter: '#607D8B', transform: '#607D8B',
  generate: '#4CAF50',
  ingest: '#2196F3',
};

function toolColor(tool: string) {
  return toolColorMap[tool] || palette.textMuted;
}

const categoryColors: Record<string, string> = {
  retrieval: palette.blue,
  analysis: palette.purple,
  'domain-specific': '#FF6F61',
  ingestion: palette.accent,
  utility: palette.textMuted,
  integration: '#F5A623',
};

export interface WorkflowEntry {
  name: string;
  slug: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  tools: string[];
  minVaiVersion: string;
  stepsCount: number;
  layersCount: number;
  inputs: Record<string, { type?: string; required?: boolean; default?: unknown; description?: string }>;
  steps: Array<{ id: string; tool: string; name: string }>;
}

interface WorkflowCardProps {
  workflow: WorkflowEntry;
  /** compact mode for featured row */
  compact?: boolean;
}

export default function WorkflowCard({ workflow: w, compact }: WorkflowCardProps) {
  const router = useRouter();
  const displayName = w.slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
  const isOfficial = w.name.startsWith('@vaicli/');
  const maxTools = compact ? 3 : 4;
  const overflow = w.tools.length - maxTools;

  return (
    <Card
      sx={{
        bgcolor: palette.bgCard,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          borderColor: palette.accent,
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 20px rgba(0, 212, 170, 0.15)`,
        },
        ...(compact && { minWidth: 260, maxWidth: 300 }),
      }}
    >
      <CardActionArea
        onClick={() => router.push(`/workflows/${w.slug}`)}
        sx={{ flexGrow: 1, p: 0 }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Top row: official badge + version */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            {isOfficial ? (
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                label="@vaicli"
                size="small"
                sx={{
                  bgcolor: `${palette.accent}22`,
                  color: palette.accent,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  height: 22,
                  '& .MuiChip-icon': { color: palette.accent },
                }}
              />
            ) : (
              <Box />
            )}
            <Typography variant="caption" sx={{ color: palette.textMuted, fontSize: '0.65rem' }}>
              v{w.version}
            </Typography>
          </Box>

          {/* Name */}
          <Typography variant="h6" sx={{ color: palette.text, fontSize: '1rem', mb: 0.5, lineHeight: 1.3 }}>
            {displayName}
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: palette.textDim,
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flexGrow: 1,
              fontSize: '0.8rem',
              lineHeight: 1.5,
            }}
          >
            {w.description}
          </Typography>

          {/* Category + complexity */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip
              label={w.category}
              size="small"
              sx={{
                bgcolor: `${categoryColors[w.category] || palette.textMuted}22`,
                color: categoryColors[w.category] || palette.textMuted,
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 22,
                textTransform: 'capitalize',
              }}
            />
            <Typography variant="caption" sx={{ color: palette.textMuted }}>
              {w.stepsCount} steps · {w.layersCount} layers
            </Typography>
          </Box>

          {/* Tool chips */}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {w.tools.slice(0, maxTools).map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  bgcolor: `${toolColor(t)}18`,
                  color: toolColor(t),
                  border: `1px solid ${toolColor(t)}44`,
                }}
              />
            ))}
            {overflow > 0 && (
              <Chip
                label={`+${overflow}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  bgcolor: palette.bgSurface,
                  color: palette.textMuted,
                }}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>

      {/* Install hint */}
      <Box
        sx={{
          px: 2, py: 0.75,
          bgcolor: palette.bgSurface,
          borderTop: `1px solid ${palette.border}`,
          borderRadius: '0 0 12px 12px',
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: palette.textMuted, fontFamily: 'monospace', fontSize: '0.65rem' }}
        >
          vai workflow install {w.name.replace('@vaicli/', '')}
        </Typography>
      </Box>
    </Card>
  );
}
