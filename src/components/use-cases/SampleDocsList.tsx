'use client';

import {
  Box,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import { palette } from '@/theme/theme';
import type { SampleDocument } from '@/data/use-cases';

interface SampleDocsListProps {
  docs: SampleDocument[];
  totalSizeKb: number;
  zipUrl: string;
  accent: string;
  onDownload?: (filename?: string) => void;
}

export default function SampleDocsList({ docs, totalSizeKb, zipUrl, accent, onDownload }: SampleDocsListProps) {
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
          Sample Document Set
        </Typography>
        <Box sx={{ width: 48, height: 3, bgcolor: accent, borderRadius: 2, mb: 2 }} />

        <Typography sx={{ color: palette.textDim, fontSize: '1rem', lineHeight: 1.7, mb: 1 }}>
          {docs.length} synthetic but realistic documents, ~{totalSizeKb}KB total. Small enough to
          process in minutes, rich enough to produce meaningful search results.
        </Typography>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          href={zipUrl}
          onClick={() => onDownload?.('all')}
          sx={{
            mb: 3,
            borderColor: accent,
            color: accent,
            fontWeight: 600,
            '&:hover': { bgcolor: `${accent}10`, borderColor: accent },
          }}
        >
          Download All ({docs.length} files, ~{totalSizeKb}KB)
        </Button>

        <TableContainer
          sx={{
            bgcolor: palette.bgCard,
            borderRadius: 2,
            border: `1px solid ${palette.border}`,
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: palette.textMuted, fontWeight: 600, borderColor: palette.border, fontSize: '0.8rem' }}>
                  File
                </TableCell>
                <TableCell sx={{ color: palette.textMuted, fontWeight: 600, borderColor: palette.border, fontSize: '0.8rem' }}>
                  Topic
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: palette.textMuted, fontWeight: 600, borderColor: palette.border, fontSize: '0.8rem' }}
                >
                  Size
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {docs.map((doc) => (
                <TableRow
                  key={doc.filename}
                  sx={{ '&:hover': { bgcolor: `${accent}06` } }}
                >
                  <TableCell
                    sx={{
                      borderColor: palette.border,
                      py: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon sx={{ fontSize: 16, color: accent }} />
                      <Typography
                        sx={{
                          fontFamily: "'Source Code Pro', monospace",
                          fontSize: '0.8rem',
                          color: palette.text,
                        }}
                      >
                        {doc.filename}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: palette.textDim, borderColor: palette.border, fontSize: '0.85rem' }}>
                    {doc.topic}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: palette.textMuted,
                      borderColor: palette.border,
                      fontFamily: "'Source Code Pro', monospace",
                      fontSize: '0.8rem',
                    }}
                  >
                    ~{doc.sizeKb}KB
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
