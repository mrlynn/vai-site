'use client';

import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GavelIcon from '@mui/icons-material/Gavel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeIcon from '@mui/icons-material/Code';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { palette } from '@/theme/theme';
import type { UseCaseData } from '@/data/use-cases';

const iconMap: Record<string, React.ElementType> = {
  LocalHospital: LocalHospitalIcon,
  Gavel: GavelIcon,
  TrendingUp: TrendingUpIcon,
  Code: CodeIcon,
};

interface UseCaseCardProps {
  useCase: UseCaseData;
}

export default function UseCaseCard({ useCase }: UseCaseCardProps) {
  const Icon = iconMap[useCase.icon] || CodeIcon;

  return (
    <Card
      component="a"
      href={`/use-cases/${useCase.slug}`}
      sx={{
        bgcolor: palette.bgCard,
        border: `1px solid ${palette.border}`,
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        cursor: 'pointer',
        '&:hover': {
          borderColor: `${useCase.accentColor}60`,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px rgba(0,0,0,0.2)`,
        },
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Icon and model badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              bgcolor: `${useCase.accentColor}12`,
              border: `1px solid ${useCase.accentColor}25`,
              display: 'inline-flex',
            }}
          >
            <Icon sx={{ fontSize: 24, color: useCase.accentColor }} />
          </Box>
          <Chip
            label={useCase.voyageModel}
            size="small"
            sx={{
              height: 22,
              bgcolor: `${useCase.accentColor}12`,
              color: useCase.accentColor,
              fontWeight: 600,
              fontFamily: "'Source Code Pro', monospace",
              fontSize: '0.7rem',
            }}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: palette.text,
            mb: 1,
            fontSize: '1.05rem',
            lineHeight: 1.3,
          }}
        >
          {useCase.title}
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            color: palette.textDim,
            fontSize: '0.85rem',
            lineHeight: 1.6,
            mb: 2,
            flex: 1,
          }}
        >
          {useCase.subheadline}
        </Typography>

        {/* Explore link */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: useCase.accentColor,
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          Explore
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Box>
      </CardContent>
    </Card>
  );
}
