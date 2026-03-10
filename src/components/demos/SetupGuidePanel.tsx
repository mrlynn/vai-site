'use client';

import { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DockerIcon from '@mui/icons-material/ViewInAr';
import CloudIcon from '@mui/icons-material/Cloud';
import CodeIcon from '@mui/icons-material/Code';
import { palette } from '@/theme/theme';
import type { DemoSetupGuide } from '@/data/demos';

interface SetupGuidePanelProps {
  guide: DemoSetupGuide;
}

const codeFont = "'Source Code Pro', 'SF Mono', 'Fira Code', monospace";

const tabIcons: Record<string, React.ReactElement> = {
  'docker-local': <DockerIcon sx={{ fontSize: 18 }} />,
  'atlas-cloud': <CloudIcon sx={{ fontSize: 18 }} />,
  codespaces: <CodeIcon sx={{ fontSize: 18 }} />,
};

function getTabIcon(id: string): React.ReactElement | undefined {
  return tabIcons[id];
}

export default function SetupGuidePanel({ guide }: SetupGuidePanelProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);

  const currentTab = guide.tabs[activeTab];

  function handleCopy(commands: string[], stepIndex: number) {
    const text = commands.filter((c) => !c.startsWith('#')).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedIndex(stepIndex);
    setSnackOpen(true);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function handleCopyAll() {
    const allCommands = currentTab.steps
      .flatMap((step) => step.commands)
      .filter((c) => !c.startsWith('#'))
      .join('\n');
    navigator.clipboard.writeText(allCommands);
    setSnackOpen(true);
  }

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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h5" sx={{ color: palette.text, fontWeight: 700 }}>
          {guide.title}
        </Typography>
        <Tooltip title="Copy all setup commands">
          <Chip
            label="Copy all"
            size="small"
            onClick={handleCopyAll}
            icon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
            sx={{
              color: palette.textMuted,
              borderColor: palette.border,
              '&:hover': { borderColor: palette.accent, color: palette.accent },
              cursor: 'pointer',
            }}
            variant="outlined"
          />
        </Tooltip>
      </Stack>

      <Typography sx={{ color: palette.textMuted, lineHeight: 1.65, mb: 2.5 }}>
        {guide.description}
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          minHeight: 40,
          '& .MuiTabs-indicator': { bgcolor: palette.accent, height: 2 },
          '& .MuiTab-root': {
            color: palette.textMuted,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            minHeight: 40,
            px: 2,
            '&.Mui-selected': { color: palette.accent },
          },
        }}
      >
        {guide.tabs.map((tab) => (
          <Tab
            key={tab.id}
            label={tab.label}
            icon={getTabIcon(tab.id)}
            iconPosition="start"
            sx={{ gap: 0.75 }}
          />
        ))}
      </Tabs>

      <Stack spacing={2.5}>
        {currentTab.steps.map((step, stepIndex) => (
          <Box key={`${currentTab.id}-${stepIndex}`}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.75 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: `${palette.accent}20`,
                  color: palette.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {stepIndex + 1}
              </Box>
              <Typography sx={{ color: palette.text, fontWeight: 700, fontSize: '0.95rem' }}>
                {step.title}
              </Typography>
            </Stack>

            <Typography
              sx={{
                color: palette.textMuted,
                fontSize: '0.875rem',
                lineHeight: 1.6,
                mb: 1.25,
                ml: 4.75,
              }}
            >
              {step.description}
            </Typography>

            <Box
              sx={{
                ml: 4.75,
                bgcolor: '#07101A',
                borderRadius: 2,
                border: `1px solid ${palette.border}`,
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderBottom: `1px solid ${palette.border}`,
                  bgcolor: 'rgba(255,255,255,0.02)',
                }}
              >
                <Stack direction="row" spacing={0.75}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FF5F57' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FEBC2E' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#28C840' }} />
                </Stack>
                <Tooltip title={copiedIndex === stepIndex ? 'Copied!' : 'Copy commands'}>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(step.commands, stepIndex)}
                    sx={{ color: palette.textMuted, '&:hover': { color: palette.accent } }}
                  >
                    {copiedIndex === stepIndex ? (
                      <CheckIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <ContentCopyIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Stack>

              <Box sx={{ p: 1.5, overflowX: 'auto' }}>
                {step.commands.map((cmd, cmdIndex) => (
                  <Box
                    key={cmdIndex}
                    sx={{
                      fontFamily: codeFont,
                      fontSize: '0.8rem',
                      lineHeight: 1.7,
                      whiteSpace: 'pre',
                      color: cmd.startsWith('#') ? palette.textMuted : palette.text,
                    }}
                  >
                    {!cmd.startsWith('#') && (
                      <Box component="span" sx={{ color: palette.accent, mr: 1, userSelect: 'none' }}>
                        $
                      </Box>
                    )}
                    {cmd}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        ))}
      </Stack>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
        message="Commands copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
