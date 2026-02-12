'use client';

import { Box, Button, Chip, Container, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GavelIcon from '@mui/icons-material/Gavel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeIcon from '@mui/icons-material/Code';
import { palette } from '@/theme/theme';
import type { UseCaseData } from '@/data/use-cases';

const iconMap: Record<string, React.ElementType> = {
  LocalHospital: LocalHospitalIcon,
  Gavel: GavelIcon,
  TrendingUp: TrendingUpIcon,
  Code: CodeIcon,
};

interface UseCaseHeroProps {
  useCase: UseCaseData;
  onDownload?: () => void;
  onWalkthroughClick?: () => void;
}

export default function UseCaseHero({ useCase, onDownload, onWalkthroughClick }: UseCaseHeroProps) {
  const Icon = iconMap[useCase.icon] || CodeIcon;

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 10 },
      }}
    >
      {/* Background glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '-30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${useCase.accentColor}08 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
        {/* Icon */}
        <Box
          sx={{
            display: 'inline-flex',
            p: 2,
            borderRadius: 3,
            bgcolor: `${useCase.accentColor}12`,
            border: `1px solid ${useCase.accentColor}30`,
            mb: 3,
          }}
        >
          <Icon sx={{ fontSize: 40, color: useCase.accentColor }} />
        </Box>

        {/* Model badge */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label={useCase.voyageModel}
            size="small"
            sx={{
              bgcolor: `${useCase.accentColor}15`,
              color: useCase.accentColor,
              border: `1px solid ${useCase.accentColor}33`,
              fontWeight: 600,
              fontFamily: "'Source Code Pro', monospace",
              fontSize: '0.8rem',
            }}
          />
        </Box>

        {/* Headline */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2rem', sm: '2.8rem', md: '3.4rem' },
            fontWeight: 800,
            lineHeight: 1.15,
            mb: 2,
            color: palette.text,
          }}
        >
          {useCase.headline}
        </Typography>

        {/* Subheadline */}
        <Typography
          variant="h5"
          sx={{
            color: palette.textDim,
            fontWeight: 400,
            mb: 4,
            fontSize: { xs: '1.05rem', md: '1.25rem' },
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.5,
          }}
        >
          {useCase.subheadline}
        </Typography>

        {/* CTAs */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<ArrowDownwardIcon />}
            href="#walkthrough"
            onClick={() => onWalkthroughClick?.()}
            sx={{
              bgcolor: useCase.accentColor,
              color: palette.bg,
              fontWeight: 700,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              '&:hover': { bgcolor: useCase.accentColor, filter: 'brightness(0.85)' },
            }}
          >
            Start the Walkthrough
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<DownloadIcon />}
            href={useCase.sampleDocsZipUrl}
            onClick={() => onDownload?.()}
            sx={{
              borderColor: palette.border,
              color: palette.text,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              '&:hover': {
                borderColor: useCase.accentColor,
                bgcolor: `${useCase.accentColor}08`,
              },
            }}
          >
            Download Sample Docs
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
