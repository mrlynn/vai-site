'use client';

import { Box, Card, Container, Typography } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import RefreshIcon from '@mui/icons-material/Refresh';
import PaymentsIcon from '@mui/icons-material/Payments';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatIcon from '@mui/icons-material/Chat';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SecurityIcon from '@mui/icons-material/Security';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { palette } from '@/theme/theme';
import type { ScalingNote } from '@/data/use-cases';

const iconMap: Record<string, React.ElementType> = {
  FolderOpen: FolderOpenIcon,
  Refresh: RefreshIcon,
  Payments: PaymentsIcon,
  SmartToy: SmartToyIcon,
  Chat: ChatIcon,
  RocketLaunch: RocketLaunchIcon,
  Security: SecurityIcon,
  FilterAlt: FilterAltIcon,
};

interface ScalingSectionProps {
  notes: ScalingNote[];
  accent: string;
}

export default function ScalingSection({ notes, accent }: ScalingSectionProps) {
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 8 } }}>
      <Container maxWidth="md">
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: palette.text,
            mb: 1,
            fontSize: { xs: '1.5rem', md: '1.8rem' },
          }}
        >
          Scaling to Production
        </Typography>
        <Box sx={{ width: 48, height: 3, bgcolor: accent, borderRadius: 2, mb: 2 }} />
        <Typography sx={{ color: palette.textDim, fontSize: '1rem', lineHeight: 1.7, mb: 4 }}>
          You just built a working knowledge base from 16 sample docs. Here is what changes when you
          scale to thousands of real documents.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2.5,
          }}
        >
          {notes.map((note, i) => {
            const Icon = (note.icon && iconMap[note.icon]) || RocketLaunchIcon;
            return (
              <Card
                key={i}
                sx={{
                  bgcolor: palette.bgCard,
                  border: `1px solid ${palette.border}`,
                  p: 2.5,
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: `${accent}40` },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      flexShrink: 0,
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: `${accent}10`,
                    }}
                  >
                    <Icon sx={{ fontSize: 20, color: accent }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: palette.text,
                        fontSize: '0.95rem',
                        mb: 0.5,
                      }}
                    >
                      {note.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: palette.textDim,
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {note.content}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
