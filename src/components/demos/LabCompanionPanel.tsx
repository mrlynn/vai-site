'use client';

import { Box, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { palette } from '@/theme/theme';
import type { LabCompanion } from '@/data/demos';

interface LabCompanionPanelProps {
  lab: LabCompanion;
}

export default function LabCompanionPanel({ lab }: LabCompanionPanelProps) {
  return (
    <Box
      sx={{
        bgcolor: palette.bgCard,
        border: `1px solid ${palette.border}`,
        borderRadius: 1.5,
        p: { xs: 2.5, md: 3 },
        mb: 4,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <MenuBookIcon sx={{ color: palette.accent, fontSize: 24 }} />
        <Typography variant="h5" sx={{ color: palette.text, fontWeight: 700 }}>
          Lab companion
        </Typography>
      </Stack>

      <Typography sx={{ color: palette.textMuted, lineHeight: 1.65, mb: 2 }}>
        {lab.intro}
      </Typography>

      <Button
        variant="outlined"
        href={lab.labUrl}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<OpenInNewIcon />}
        sx={{
          alignSelf: 'flex-start',
          mb: 2.5,
          borderColor: palette.border,
          color: palette.text,
          '&:hover': { borderColor: palette.accent, bgcolor: `${palette.accent}10` },
        }}
      >
        Open {lab.labTitle}
      </Button>

      <Typography variant="subtitle1" sx={{ color: palette.text, fontWeight: 600, mb: 1.5 }}>
        Lab step → VAI equivalent
      </Typography>

      <TableContainer
        sx={{
          border: `1px solid ${palette.border}`,
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Table size="small" sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
              <TableCell sx={{ color: palette.textMuted, fontWeight: 600, fontSize: '0.8rem', py: 1.25 }}>
                Lab section
              </TableCell>
              <TableCell sx={{ color: palette.textMuted, fontWeight: 600, fontSize: '0.8rem', py: 1.25 }}>
                VAI command
              </TableCell>
              <TableCell sx={{ color: palette.textMuted, fontWeight: 600, fontSize: '0.8rem', py: 1.25 }}>
                Note
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lab.mappings.map((m, i) => (
              <TableRow key={i} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                <TableCell sx={{ color: palette.text, fontSize: '0.85rem', py: 1.25, verticalAlign: 'top' }}>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {m.labSection}
                  </Box>
                  {m.labStep && (
                    <Box component="span" sx={{ display: 'block', color: palette.textMuted, fontSize: '0.8rem', mt: 0.25 }}>
                      {m.labStep}
                    </Box>
                  )}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "'Source Code Pro', 'SF Mono', monospace",
                    fontSize: '0.75rem',
                    color: palette.accent,
                    py: 1.25,
                    verticalAlign: 'top',
                    wordBreak: 'break-all',
                  }}
                >
                  {m.vaiCommand}
                </TableCell>
                <TableCell sx={{ color: palette.textMuted, fontSize: '0.8rem', py: 1.25, verticalAlign: 'top', maxWidth: 220 }}>
                  {m.note}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {lab.takeaway && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 1,
            bgcolor: `${palette.accent}0A`,
            border: `1px solid ${palette.accent}33`,
          }}
        >
          <Typography sx={{ color: palette.text, fontSize: '0.9rem', lineHeight: 1.6 }}>
            {lab.takeaway}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
