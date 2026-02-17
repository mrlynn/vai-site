'use client';

import { Box, Chip } from '@mui/material';
import { palette } from '@/theme/theme';

const CATEGORIES = [
  'all', 'retrieval', 'analysis', 'domain-specific', 'ingestion', 'utility', 'integration',
];

interface CategoryPillsProps {
  active: string;
  counts: Record<string, number>;
  onChange: (cat: string) => void;
}

export default function CategoryPills({ active, counts, onChange }: CategoryPillsProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {CATEGORIES.map((c) => {
        const isActive = active === c;
        const count = c === 'all' ? Object.values(counts).reduce((a, b) => a + b, 0) : (counts[c] || 0);
        return (
          <Chip
            key={c}
            label={`${c === 'all' ? 'All' : c} (${count})`}
            onClick={() => onChange(c)}
            sx={{
              textTransform: 'capitalize',
              fontWeight: 600,
              cursor: 'pointer',
              bgcolor: isActive ? palette.accent : palette.bgCard,
              color: isActive ? palette.bg : palette.textDim,
              border: `1px solid ${isActive ? palette.accent : palette.border}`,
              '&:hover': {
                bgcolor: isActive ? palette.accentDim : palette.bgSurface,
              },
            }}
          />
        );
      })}
    </Box>
  );
}
