'use client';

import {
  Box,
  Chip,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { palette } from '@/theme/theme';
import type { ModelComparison as ModelComparisonType } from '@/data/use-cases';

interface ModelComparisonProps {
  comparison: ModelComparisonType;
  accent: string;
}

export default function ModelComparison({ comparison, accent }: ModelComparisonProps) {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: palette.bgSurface,
      }}
    >
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
          Why This Model?
        </Typography>
        <Box sx={{ width: 48, height: 3, bgcolor: accent, borderRadius: 2, mb: 4 }} />

        <TableContainer
          sx={{
            bgcolor: palette.bgCard,
            borderRadius: 2,
            border: `1px solid ${palette.border}`,
            mb: 4,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: palette.textMuted, fontWeight: 600, borderColor: palette.border }}>
                  Model
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ color: palette.textMuted, fontWeight: 600, borderColor: palette.border }}
                >
                  Relevance
                </TableCell>
                <TableCell sx={{ color: palette.textMuted, fontWeight: 600, borderColor: palette.border }}>
                  Notes
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparison.alternatives.map((alt) => {
                const isRecommended = alt.model === comparison.recommended;
                return (
                  <TableRow
                    key={alt.model}
                    sx={{
                      bgcolor: isRecommended ? `${accent}08` : 'transparent',
                    }}
                  >
                    <TableCell sx={{ borderColor: palette.border }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            fontFamily: "'Source Code Pro', monospace",
                            fontSize: '0.85rem',
                            color: isRecommended ? accent : palette.text,
                            fontWeight: isRecommended ? 700 : 400,
                          }}
                        >
                          {alt.model}
                        </Typography>
                        {isRecommended && (
                          <Chip
                            icon={<StarIcon sx={{ fontSize: 12 }} />}
                            label="Recommended"
                            size="small"
                            sx={{
                              height: 22,
                              bgcolor: `${accent}18`,
                              color: accent,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ borderColor: palette.border }}>
                      {alt.score && (
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 60,
                              height: 6,
                              bgcolor: palette.bgSurface,
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${alt.score * 100}%`,
                                height: '100%',
                                bgcolor: isRecommended ? accent : palette.textMuted,
                                borderRadius: 3,
                              }}
                            />
                          </Box>
                          <Typography
                            sx={{
                              fontFamily: "'Source Code Pro', monospace",
                              fontSize: '0.8rem',
                              color: isRecommended ? accent : palette.textDim,
                              fontWeight: 600,
                            }}
                          >
                            {(alt.score * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ borderColor: palette.border }}>
                      <Typography sx={{ color: palette.textDim, fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {alt.notes}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography
          sx={{
            color: palette.textDim,
            fontSize: '1rem',
            lineHeight: 1.7,
          }}
        >
          {comparison.comparisonNarrative}
        </Typography>
      </Container>
    </Box>
  );
}
