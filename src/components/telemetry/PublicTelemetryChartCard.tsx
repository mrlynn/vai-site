'use client';

import type { ReactNode } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { palette } from '@/theme/theme';

type PublicTelemetryChartCardProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: ReactNode;
  emptyMessage?: string;
  footer?: ReactNode;
  minHeight?: number;
  children?: ReactNode;
};

export default function PublicTelemetryChartCard({
  title,
  description,
  eyebrow,
  icon,
  emptyMessage,
  footer,
  minHeight = 320,
  children,
}: PublicTelemetryChartCardProps) {
  const hasContent = Boolean(children);

  return (
    <Card
      sx={{
        height: '100%',
        minHeight,
        bgcolor: palette.bgSurface,
        border: `1px solid ${palette.border}`,
        boxShadow: '0 24px 70px rgba(0, 0, 0, 0.18)',
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2.5, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          height: '100%',
        }}
      >
        <Stack spacing={1}>
          {eyebrow && (
            <Typography
              variant="caption"
              sx={{
                color: palette.accent,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {eyebrow}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
            {icon && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 0.25,
                  color: palette.accent,
                }}
              >
                {icon}
              </Box>
            )}

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: palette.text }}>
                {title}
              </Typography>
              {description && (
                <Typography
                  variant="body2"
                  sx={{ mt: 0.75, color: palette.textMuted, lineHeight: 1.7 }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          </Box>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {hasContent ? (
            children
          ) : (
            <Box
              sx={{
                height: '100%',
                minHeight: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
                border: `1px dashed rgba(255,255,255,0.12)`,
                bgcolor: 'rgba(255,255,255,0.02)',
                px: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{ maxWidth: 420, textAlign: 'center', color: palette.textMuted, lineHeight: 1.7 }}
              >
                {emptyMessage || 'This public section is unavailable for the current delayed snapshot.'}
              </Typography>
            </Box>
          )}
        </Box>

        {footer && (
          <Box
            sx={{
              pt: 1.5,
              borderTop: `1px solid rgba(255,255,255,0.06)`,
            }}
          >
            {footer}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
