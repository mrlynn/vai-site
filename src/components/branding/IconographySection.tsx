'use client';

import { Box, Card, Typography } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import GavelIcon from '@mui/icons-material/Gavel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { palette } from '@/theme/theme';
import { SectionTitle, SectionSubtitle } from './shared';

const domainIcons = [
  { icon: <CodeIcon />, name: 'Code', usage: 'Developer docs' },
  { icon: <GavelIcon />, name: 'Gavel', usage: 'Legal' },
  { icon: <TrendingUpIcon />, name: 'TrendingUp', usage: 'Finance' },
  { icon: <LocalHospitalIcon />, name: 'LocalHospital', usage: 'Healthcare' },
];

const uiIcons = [
  { icon: <DownloadIcon />, name: 'Download' },
  { icon: <ContentCopyIcon />, name: 'ContentCopy' },
  { icon: <CloseIcon />, name: 'Close' },
  { icon: <SendIcon />, name: 'Send' },
  { icon: <ChatIcon />, name: 'Chat' },
  { icon: <AutoAwesomeIcon />, name: 'AutoAwesome' },
];

function IconCard({ icon, name, sub }: { icon: React.ReactNode; name: string; sub?: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 2, bgcolor: palette.bgCard, borderRadius: 2, border: `1px solid ${palette.border}` }}>
      <Box sx={{ color: palette.accent, fontSize: 28, display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontSize: '0.75rem', fontFamily: "'Source Code Pro', monospace", color: palette.text }}>{name}</Typography>
      {sub && <Typography sx={{ fontSize: '0.65rem', color: palette.textMuted }}>{sub}</Typography>}
    </Box>
  );
}

export default function IconographySection() {
  return (
    <Box sx={{ mb: 10 }} id="iconography">
      <SectionTitle id="iconography">Iconography</SectionTitle>
      <SectionSubtitle>MUI Icons (Material Symbols), outlined style preferred. No custom icon library.</SectionSubtitle>

      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Domain Icons</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 4, maxWidth: 480 }}>
        {domainIcons.map((d) => <IconCard key={d.name} icon={d.icon} name={d.name} sub={d.usage} />)}
      </Box>

      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Common UI Icons</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(6, 1fr)' }, gap: 2, mb: 4, maxWidth: 600 }}>
        {uiIcons.map((d) => <IconCard key={d.name} icon={d.icon} name={d.name} />)}
      </Box>

      <Card sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}`, p: 2.5, maxWidth: 480 }}>
        <Typography sx={{ fontWeight: 600, color: palette.text, fontSize: '0.9rem', mb: 0.5 }}>Usage</Typography>
        <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem', lineHeight: 1.6 }}>
          Use <Box component="code" sx={{ bgcolor: palette.bgSurface, px: 0.5, borderRadius: 0.5, fontSize: '0.8rem' }}>@mui/icons-material</Box> exclusively. Prefer the outlined variant for consistency. No custom SVGs or icon fonts.
        </Typography>
      </Card>
    </Box>
  );
}
