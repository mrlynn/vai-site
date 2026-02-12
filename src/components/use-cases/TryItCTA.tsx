'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { palette } from '@/theme/theme';

interface TryItCTAProps {
  accent: string;
  description?: string;
  docCount?: number;
  onStartChatting?: () => void;
}

export default function TryItCTA({ accent, description, docCount = 16, onStartChatting }: TryItCTAProps) {
  const handleClick = () => {
    onStartChatting?.();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opener = (window as any).__openChatBot;
    if (typeof opener === 'function') opener();
  };

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="md">
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            border: `1px solid ${accent}44`,
            bgcolor: accent + '0A',
            px: { xs: 3, md: 6 },
            py: { xs: 4, md: 5 },
            textAlign: 'center',
          }}
        >
          {/* Glow effect */}
          <Box
            sx={{
              position: 'absolute',
              top: -60,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 300,
              height: 120,
              background: `radial-gradient(ellipse, ${accent}30 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          <AutoAwesomeIcon sx={{ fontSize: 40, color: accent, mb: 2 }} />

          <Typography variant="h4" sx={{ fontWeight: 700, color: palette.text, mb: 1.5 }}>
            Try the Knowledge Base Live
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: palette.textDim, mb: 3, maxWidth: 520, mx: 'auto' }}
          >
            {description || `This is a real chatbot powered by the ${docCount} sample docs you just explored. Ask it anything about the topics covered in the documentation above.`}
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<ChatIcon />}
            onClick={handleClick}
            sx={{
              bgcolor: accent,
              color: palette.bg,
              fontWeight: 700,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              '&:hover': { bgcolor: accent, filter: 'brightness(0.85)' },
            }}
          >
            Start Chatting
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
