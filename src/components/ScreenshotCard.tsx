'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import Image from 'next/image';
import { palette } from '@/theme/theme';
import { useState } from 'react';

interface ScreenshotCardProps {
  image?: string | null; // Path to image (relative to /public) or null for placeholder
  title: string;
  description: string;
  aspectRatio?: number; // Default 16:9
  showWindowChrome?: boolean; // Show macOS-style window buttons
  enableZoom?: boolean; // Enable hover zoom effect
}

export default function ScreenshotCard({
  image,
  title,
  description,
  aspectRatio = 16 / 9,
  showWindowChrome = true,
  enableZoom = true,
}: ScreenshotCardProps) {
  const [imageError, setImageError] = useState(false);
  const showPlaceholder = !image || imageError;

  return (
    <Card
      sx={{
        bgcolor: palette.bgCard,
        border: `1px solid ${palette.border}`,
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s',
        height: '100%',
        '&:hover': {
          borderColor: palette.accent,
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px rgba(0, 212, 170, 0.15)`,
        },
      }}
    >
      {/* Screenshot or Placeholder */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: palette.bg,
          borderBottom: `1px solid ${palette.border}`,
          overflow: 'hidden',
          aspectRatio: `${aspectRatio}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: showPlaceholder ? 0 : 2,
        }}
      >
        {/* Window chrome (macOS style buttons) */}
        {showWindowChrome && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              gap: 0.8,
              zIndex: 2,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#FF5F56',
              }}
            />
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#FFBD2E',
              }}
            />
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#27C93F',
              }}
            />
          </Box>
        )}

        {showPlaceholder ? (
          // Placeholder view
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                border: `2px dashed ${palette.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: palette.textDim,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </Box>
            <Typography
              sx={{
                color: palette.textDim,
                fontSize: '0.85rem',
                fontStyle: 'italic',
              }}
            >
              Screenshot placeholder
            </Typography>
          </Box>
        ) : (
          // Real image view
          <Image
            src={image}
            alt={title}
            fill
            style={{
              objectFit: 'contain',
              padding: '8px',
            }}
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </Box>

      {/* Card content */}
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ color: palette.text, mb: 1, fontWeight: 600 }}
        >
          {title}
        </Typography>
        <Typography sx={{ color: palette.textMuted, fontSize: '0.95rem' }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
