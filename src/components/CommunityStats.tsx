'use client';

import { Box, Container, Typography, Skeleton } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import TerminalIcon from '@mui/icons-material/Terminal';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import WebIcon from '@mui/icons-material/Web';
import { palette } from '@/theme/theme';
import { useState, useEffect, useRef } from 'react';

interface Stats {
  totalEvents: number;
  countries: number;
  cities: number;
  locations: number;
  contexts: {
    cli?: number;
    playground?: number;
    desktop?: number;
  };
}

// Animated counter hook
function useAnimatedCount(target: number, duration = 2000): number {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const animationFrame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (target === 0) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [target, duration]);

  return count;
}

function StatBox({ 
  icon, 
  value, 
  label, 
  color,
  loading 
}: { 
  icon: React.ReactNode; 
  value: number; 
  label: string; 
  color: string;
  loading: boolean;
}) {
  const animatedValue = useAnimatedCount(value);

  return (
    <Box
      sx={{
        textAlign: 'center',
        p: 3,
        bgcolor: palette.bgCard,
        border: `1px solid ${palette.border}`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: color,
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${color}20`,
        },
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
          color: color,
        }}
      >
        {icon}
      </Box>
      {loading ? (
        <Skeleton 
          variant="text" 
          width={80} 
          height={48} 
          sx={{ mx: 'auto', bgcolor: palette.bgSurface }} 
        />
      ) : (
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: palette.text,
            fontSize: { xs: '2rem', md: '2.5rem' },
            lineHeight: 1,
          }}
        >
          {animatedValue.toLocaleString()}
        </Typography>
      )}
      <Typography
        sx={{
          color: palette.textMuted,
          fontSize: '0.95rem',
          mt: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function CommunityStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public-stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const countries = stats?.countries || 0;
  const cities = stats?.cities || 0;
  const cliEvents = stats?.contexts?.cli || 0;
  const playgroundEvents = stats?.contexts?.playground || 0;
  const desktopEvents = stats?.contexts?.desktop || 0;

  return (
    <Box
      component="section"
      id="community"
      sx={{
        py: { xs: 8, md: 10 },
        bgcolor: palette.bgSurface,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(${palette.border} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        {/* Headline stat */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            sx={{
              fontSize: { xs: '1rem', md: '1.1rem' },
              color: palette.textMuted,
              mb: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            Community-Built. Globally Used.
          </Typography>
          
          {loading ? (
            <Skeleton 
              variant="text" 
              width={400} 
              height={80} 
              sx={{ mx: 'auto', bgcolor: palette.bgCard }} 
            />
          ) : (
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                fontWeight: 800,
                lineHeight: 1.1,
                color: palette.text,
              }}
            >
              Developers in{' '}
              <Box
                component="span"
                sx={{
                  color: palette.accent,
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                {countries}
                <Box
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    left: 0,
                    right: 0,
                    height: 4,
                    bgcolor: palette.accent,
                    borderRadius: 2,
                    opacity: 0.3,
                  }}
                />
              </Box>{' '}
              countries
            </Typography>
          )}
          
          <Typography
            sx={{
              color: palette.textMuted,
              fontSize: '1.1rem',
              mt: 2,
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            Exploring Voyage AI embeddings from the terminal, browser, and desktop.
          </Typography>
        </Box>

        {/* Stats grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { 
              xs: 'repeat(2, 1fr)', 
              md: 'repeat(4, 1fr)' 
            },
            gap: 3,
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          <StatBox
            icon={<PublicIcon sx={{ fontSize: 28 }} />}
            value={countries}
            label="Countries"
            color={palette.accent}
            loading={loading}
          />
          <StatBox
            icon={<GroupsIcon sx={{ fontSize: 28 }} />}
            value={cities}
            label="Cities"
            color={palette.blue}
            loading={loading}
          />
          <StatBox
            icon={<TerminalIcon sx={{ fontSize: 28 }} />}
            value={cliEvents}
            label="CLI Commands"
            color={palette.purple}
            loading={loading}
          />
          <StatBox
            icon={<WebIcon sx={{ fontSize: 28 }} />}
            value={playgroundEvents + desktopEvents}
            label="Playground Sessions"
            color="#FF6B6B"
            loading={loading}
          />
        </Box>

        {/* Shareable callout */}
        <Box
          sx={{
            mt: 6,
            p: 3,
            bgcolor: palette.bgCard,
            border: `1px solid ${palette.border}`,
            borderRadius: 2,
            textAlign: 'center',
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          <Typography
            sx={{
              color: palette.textDim,
              fontSize: '0.9rem',
              fontStyle: 'italic',
            }}
          >
            &ldquo;vai is now used by developers in {countries} countries worldwide&rdquo;
          </Typography>
          <Typography
            sx={{
              color: palette.textMuted,
              fontSize: '0.8rem',
              mt: 1,
            }}
          >
            Real usage data from anonymous telemetry • Updated live
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
