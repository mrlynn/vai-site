'use client';

import { Box, Card, Chip, Container, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { palette } from '@/theme/theme';
import type { ExampleQuery } from '@/data/use-cases';
import { useState } from 'react';

interface ExampleQueriesProps {
  queries: ExampleQuery[];
  accent: string;
}

export default function ExampleQueries({ queries, accent }: ExampleQueriesProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

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
          Example Queries
        </Typography>
        <Box sx={{ width: 48, height: 3, bgcolor: accent, borderRadius: 2, mb: 2 }} />
        <Typography sx={{ color: palette.textDim, fontSize: '1rem', lineHeight: 1.7, mb: 4 }}>
          See how semantic search handles real questions. Click a query to see the results.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {queries.map((q, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <Card
                key={i}
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                sx={{
                  bgcolor: palette.bgCard,
                  border: `1px solid ${isExpanded ? `${accent}50` : palette.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: `${accent}40`,
                  },
                }}
              >
                <Box sx={{ p: 2.5 }}>
                  {/* Query */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <SearchIcon sx={{ fontSize: 20, color: accent, mt: 0.3 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: palette.text,
                          fontSize: '0.95rem',
                          mb: 0.5,
                        }}
                      >
                        &ldquo;{q.query}&rdquo;
                      </Typography>
                      <Typography
                        sx={{
                          color: palette.textMuted,
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {q.explanation}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Expanded results */}
                  {isExpanded && q.sampleResults && (
                    <Box sx={{ mt: 2.5, ml: { xs: 0, md: 4.5 } }}>
                      {q.sampleResults.map((result, ri) => (
                        <Box
                          key={ri}
                          sx={{
                            p: 2,
                            mb: ri < q.sampleResults!.length - 1 ? 1.5 : 0,
                            bgcolor: palette.bgSurface,
                            borderRadius: 1.5,
                            border: `1px solid ${palette.border}`,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mb: 1,
                              flexWrap: 'wrap',
                              gap: 1,
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "'Source Code Pro', monospace",
                                fontSize: '0.8rem',
                                color: accent,
                                fontWeight: 600,
                              }}
                            >
                              {result.source}
                            </Typography>
                            <Chip
                              label={`${(result.relevance * 100).toFixed(0)}% match`}
                              size="small"
                              sx={{
                                height: 22,
                                bgcolor:
                                  result.relevance > 0.9
                                    ? 'rgba(0,212,170,0.12)'
                                    : result.relevance > 0.8
                                    ? 'rgba(64,224,255,0.12)'
                                    : 'rgba(255,192,16,0.12)',
                                color:
                                  result.relevance > 0.9
                                    ? '#00D4AA'
                                    : result.relevance > 0.8
                                    ? '#40E0FF'
                                    : '#FFC010',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                fontFamily: "'Source Code Pro', monospace",
                              }}
                            />
                          </Box>
                          <Typography
                            sx={{
                              color: palette.textDim,
                              fontSize: '0.85rem',
                              lineHeight: 1.6,
                              fontStyle: 'italic',
                            }}
                          >
                            &ldquo;{result.snippet}&rdquo;
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Card>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
