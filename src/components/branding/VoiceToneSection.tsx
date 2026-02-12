'use client';

import { Box, Card, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { palette } from '@/theme/theme';
import { SectionTitle, SectionSubtitle } from './shared';

const voiceTraits = [
  { trait: 'Technical but approachable', desc: 'We know the stack. We explain it clearly.' },
  { trait: 'Confident but not arrogant', desc: 'Show, don\'t boast. Let results speak.' },
  { trait: 'Concise — every word earns its place', desc: 'Cut the filler. Be direct.' },
  { trait: 'Developer-first', desc: 'Speak the audience\'s language. They build software.' },
];

const toneExamples = [
  { context: 'Marketing page', example: 'Ship semantic search in minutes.', tone: 'Bold, concise, aspirational' },
  { context: 'Error message', example: 'Embedding failed: invalid API key. Check your .env file.', tone: 'Direct, helpful, no blame' },
  { context: 'Documentation', example: 'Pass the text array to vai.embed(). Returns a list of float vectors.', tone: 'Precise, neutral, scannable' },
  { context: 'Changelog', example: 'Added: batch embed command. Fixed: timeout on large docs.', tone: 'Terse, factual, scannable' },
];

const writingDos = [
  { good: 'Ship semantic search in minutes', bad: 'Our revolutionary AI-powered solution enables enterprises to leverage...' },
  { good: 'vai pipeline chunks, embeds, and indexes your docs', bad: 'The vai pipeline functionality provides document processing capabilities' },
  { good: 'Embed 100k docs in under a minute', bad: 'Experience unprecedented throughput for your embedding workflows' },
];

const terminology = [
  { prefer: 'knowledge base', avoid: 'vector store' },
  { prefer: 'embed', avoid: 'vectorize' },
  { prefer: 'search', avoid: 'query your embeddings' },
  { prefer: 'pipeline', avoid: 'workflow' },
  { prefer: 'vai', avoid: 'Vai / VAI / V.A.I.' },
];

export default function VoiceToneSection() {
  return (
    <Box sx={{ mb: 10 }} id="voice-tone">
      <SectionTitle id="voice-tone">Voice &amp; Tone</SectionTitle>
      <SectionSubtitle>How vai sounds. Consistent voice, adaptive tone.</SectionSubtitle>

      {/* Voice characteristics */}
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Voice Characteristics</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 5 }}>
        {voiceTraits.map((v) => (
          <Card key={v.trait} sx={{ bgcolor: palette.bgCard, border: `1px solid ${palette.border}`, p: 2.5 }}>
            <Typography sx={{ fontWeight: 600, color: palette.accent, fontSize: '0.9rem', mb: 0.5 }}>{v.trait}</Typography>
            <Typography sx={{ color: palette.textMuted, fontSize: '0.85rem' }}>{v.desc}</Typography>
          </Card>
        ))}
      </Box>

      {/* Tone by context */}
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Tone by Context</Typography>
      <Box sx={{ mb: 5, border: `1px solid ${palette.border}`, borderRadius: 2, overflow: 'hidden' }}>
        {toneExamples.map((t, i) => (
          <Box
            key={t.context}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '140px 1fr 200px' },
              gap: 2,
              p: 2,
              bgcolor: i % 2 === 0 ? palette.bgCard : palette.bgSurface,
              borderBottom: i < toneExamples.length - 1 ? `1px solid ${palette.border}` : 'none',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: palette.text }}>{t.context}</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: palette.textDim, fontStyle: 'italic' }}>&quot;{t.example}&quot;</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted }}>{t.tone}</Typography>
          </Box>
        ))}
      </Box>

      {/* Writing Do / Don't */}
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Writing Do / Don&apos;t</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 5 }}>
        {writingDos.map((w, i) => (
          <Box key={i} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, p: 2, bgcolor: 'rgba(0,212,170,0.05)', borderRadius: 2, border: '1px solid rgba(0,212,170,0.2)' }}>
              <CheckIcon sx={{ color: palette.accent, fontSize: 18, mt: 0.2 }} />
              <Typography sx={{ fontSize: '0.85rem', color: palette.text }}>{w.good}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, p: 2, bgcolor: 'rgba(255,105,96,0.05)', borderRadius: 2, border: '1px solid rgba(255,105,96,0.2)' }}>
              <CloseIcon sx={{ color: '#FF6960', fontSize: 18, mt: 0.2 }} />
              <Typography sx={{ fontSize: '0.85rem', color: palette.textDim }}>{w.bad}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Terminology */}
      <Typography sx={{ fontWeight: 600, color: palette.text, mb: 2, fontSize: '1rem' }}>Preferred Terminology</Typography>
      <Box sx={{ border: `1px solid ${palette.border}`, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', p: 1.5, bgcolor: palette.bgSurface }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Use</Typography>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avoid</Typography>
        </Box>
        {terminology.map((t, i) => (
          <Box key={t.prefer} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', p: 1.5, bgcolor: i % 2 === 0 ? palette.bgCard : palette.bgSurface, borderTop: `1px solid ${palette.border}` }}>
            <Typography sx={{ fontSize: '0.85rem', color: palette.accent, fontWeight: 600 }}>{t.prefer}</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, textDecoration: 'line-through' }}>{t.avoid}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
