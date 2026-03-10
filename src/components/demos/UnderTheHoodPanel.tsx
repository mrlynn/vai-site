'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import TerminalIcon from '@mui/icons-material/Terminal';
import ApiIcon from '@mui/icons-material/Api';
import StorageIcon from '@mui/icons-material/Storage';
import { palette } from '@/theme/theme';
import type {
  DemoCodeLanguage,
  DemoCodeBlock,
  DemoData,
  DemoMongoCodeBlock,
} from '@/data/demos';

interface UnderTheHoodPanelProps {
  underTheHood: DemoData['underTheHood'];
  showHeader?: boolean;
}

type MainTab = 'vai' | 'voyage' | 'mongo';

const codeFont = "'Source Code Pro', 'SF Mono', 'Fira Code', monospace";

interface HighlightToken {
  text: string;
  color?: string;
}

interface TokenMatcher {
  regex: RegExp;
  color: string;
}

function mergeHighlightTokens(tokens: HighlightToken[]): HighlightToken[] {
  return tokens.reduce<HighlightToken[]>((accumulator, token) => {
    const previous = accumulator[accumulator.length - 1];

    if (previous && previous.color === token.color) {
      previous.text += token.text;
      return accumulator;
    }

    accumulator.push({ ...token });
    return accumulator;
  }, []);
}

function getTokenMatchers(language: 'bash' | 'js' | 'python' | 'curl'): TokenMatcher[] {
  if (language === 'bash') {
    return [
      { regex: /^#[^\n]*/, color: palette.textMuted },
      { regex: /^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/, color: '#68D391' },
      { regex: /^--[\w-]+/, color: '#F6AD55' },
      { regex: /^\$[A-Z_][A-Z0-9_]*/, color: '#F6AD55' },
      { regex: /^(vai|ollama|export)\b/, color: palette.blue },
      { regex: /^\d+(?:\.\d+)?/, color: '#F6AD55' },
    ];
  }

  if (language === 'curl') {
    return [
      { regex: /^#[^\n]*/, color: palette.textMuted },
      { regex: /^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/, color: '#68D391' },
      { regex: /^-[A-Z]|^--[\w-]+/, color: '#F6AD55' },
      { regex: /^(curl)\b/, color: palette.blue },
      { regex: /^\$[A-Z_][A-Z0-9_]*/, color: '#F6AD55' },
      { regex: /^\d+(?:\.\d+)?/, color: '#F6AD55' },
    ];
  }

  if (language === 'python') {
    return [
      { regex: /^#[^\n]*/, color: palette.textMuted },
      { regex: /^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/, color: '#68D391' },
      { regex: /^(import|from|def|class|return|if|else|for|in|with|as|await|async|None|True|False)\b/, color: palette.purple },
      { regex: /^[A-Za-z_]\w*(?=\()/, color: palette.blue },
      { regex: /^\d+(?:\.\d+)?/, color: '#F6AD55' },
    ];
  }

  return [
    { regex: /^\/\/[^\n]*/, color: palette.textMuted },
    { regex: /^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'|^`(?:[^`\\]|\\.)*`/, color: '#68D391' },
    { regex: /^(const|let|var|function|return|import|from|new|await|async|if|else|for|of|null|true|false)\b/, color: palette.purple },
    { regex: /^[A-Za-z_]\w*(?=\()/, color: palette.blue },
    { regex: /^\d+(?:\.\d+)?/, color: '#F6AD55' },
  ];
}

function highlightCode(code: string, language: 'bash' | 'js' | 'python' | 'curl'): HighlightToken[] {
  const matchers = getTokenMatchers(language);
  const tokens: HighlightToken[] = [];

  let index = 0;
  while (index < code.length) {
    const slice = code.slice(index);
    let matched = false;

    for (const matcher of matchers) {
      const result = slice.match(matcher.regex);
      if (!result) continue;

      tokens.push({ text: result[0], color: matcher.color });
      index += result[0].length;
      matched = true;
      break;
    }

    if (!matched) {
      tokens.push({ text: slice[0] });
      index += 1;
    }
  }

  return mergeHighlightTokens(tokens);
}

function CopyableCodeBlock({
  code,
  language,
}: {
  code: string;
  language: 'bash' | 'js' | 'python' | 'curl';
}) {
  const [copied, setCopied] = useState(false);
  const tokens = useMemo(() => highlightCode(code, language), [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: '#07101A',
        border: `1px solid ${palette.border}`,
        borderRadius: 2,
        p: '16px 48px 16px 16px',
        overflowX: 'auto',
      }}
    >
      <Box
        component="pre"
        sx={{
          m: 0,
          whiteSpace: 'pre',
          fontFamily: codeFont,
          fontSize: '0.8rem',
          lineHeight: 1.75,
          color: palette.text,
        }}
      >
        {tokens.map((token, index) => (
          <Box
            key={`${index}-${token.text.slice(0, 12)}`}
            component="span"
            sx={token.color ? { color: token.color } : undefined}
          >
            {token.text}
          </Box>
        ))}
      </Box>
      <Tooltip title={copied ? 'Copied!' : 'Copy'}>
        <IconButton
          size="small"
          onClick={handleCopy}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: palette.textMuted,
            '&:hover': {
              color: palette.accent,
              bgcolor: 'rgba(0, 212, 170, 0.08)',
            },
          }}
        >
          {copied ? <CheckIcon sx={{ fontSize: 15, color: palette.accent }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function resolveLanguageLabel(language: DemoCodeLanguage): string {
  switch (language) {
    case 'node':
      return 'Node.js';
    case 'python':
      return 'Python';
    case 'curl':
      return 'curl';
    default:
      return language;
  }
}

function getCodeForLanguage(code: DemoCodeBlock, language: DemoCodeLanguage): string {
  return code[language] || code.node || code.python || code.curl || '';
}

function getMongoCodeForLanguage(code: DemoMongoCodeBlock, language: DemoCodeLanguage): string {
  return language === 'python' ? code.python : code.node;
}

export default function UnderTheHoodPanel({
  underTheHood,
  showHeader = true,
}: UnderTheHoodPanelProps) {
  const [mainTab, setMainTab] = useState<MainTab>('vai');
  const [language, setLanguage] = useState<DemoCodeLanguage>('node');

  const languageOptions = useMemo(() => {
    if (mainTab === 'voyage') return ['node', 'python', 'curl'] as DemoCodeLanguage[];
    if (mainTab === 'mongo') return ['node', 'python'] as DemoCodeLanguage[];
    return [] as DemoCodeLanguage[];
  }, [mainTab]);

  useEffect(() => {
    if (languageOptions.length === 0) return;
    if (!languageOptions.includes(language)) {
      setLanguage(languageOptions[0]);
    }
  }, [languageOptions, language]);

  const explanation = useMemo(() => {
    if (mainTab === 'vai') return underTheHood.explanations.vaiCommand;
    if (mainTab === 'voyage') return underTheHood.explanations.voyageApi;
    return underTheHood.explanations.mongoQuery;
  }, [mainTab, underTheHood.explanations]);

  const singleCodeBlock = useMemo(() => {
    if (mainTab === 'vai') {
      return {
        code: underTheHood.vaiCommand,
        language: 'bash' as const,
      };
    }

    if (mainTab === 'voyage') {
      return {
        code: getCodeForLanguage(underTheHood.voyageApi, language),
        language: (language === 'node' ? 'js' : language) as 'js' | 'python' | 'curl',
      };
    }

    return {
      code: getMongoCodeForLanguage(underTheHood.mongoQuery, language),
      language: (language === 'python' ? 'python' : 'js') as 'js' | 'python',
    };
  }, [language, mainTab, underTheHood]);

  const showStepBlocks = mainTab === 'voyage' && Boolean(underTheHood.voyageApiSteps?.length);

  return (
    <Box
      sx={{
        mt: 2,
        border: `1px solid ${palette.border}`,
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: palette.bgSurface,
      }}
    >
      {showHeader && (
        <Box
          sx={{
            px: 2,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${palette.border}`,
            bgcolor: palette.bgCard,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: palette.textMuted,
            }}
          >
            Under the Hood
          </Typography>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${palette.accent}, ${palette.blue})`,
              boxShadow: `0 0 12px ${palette.accent}`,
            }}
          />
        </Box>
      )}

      <Tabs
        value={mainTab}
        onChange={(_, value: MainTab) => setMainTab(value)}
        sx={{
          minHeight: 40,
          px: 1,
          bgcolor: palette.bgCard,
          borderBottom: `1px solid ${palette.border}`,
          '& .MuiTabs-indicator': {
            background: `linear-gradient(135deg, ${palette.accent}, ${palette.blue})`,
            height: 2,
          },
        }}
      >
        <Tab
          icon={<TerminalIcon sx={{ fontSize: 15 }} />}
          iconPosition="start"
          label="VAI Command"
          value="vai"
          sx={{
            minHeight: 40,
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            letterSpacing: '0.06em',
            fontWeight: 700,
            color: palette.textMuted,
            '&.Mui-selected': { color: palette.accent },
          }}
        />
        <Tab
          icon={<ApiIcon sx={{ fontSize: 15 }} />}
          iconPosition="start"
          label="Voyage AI API"
          value="voyage"
          sx={{
            minHeight: 40,
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            letterSpacing: '0.06em',
            fontWeight: 700,
            color: palette.textMuted,
            '&.Mui-selected': { color: palette.accent },
          }}
        />
        <Tab
          icon={<StorageIcon sx={{ fontSize: 15 }} />}
          iconPosition="start"
          label="MongoDB Query"
          value="mongo"
          sx={{
            minHeight: 40,
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            letterSpacing: '0.06em',
            fontWeight: 700,
            color: palette.textMuted,
            '&.Mui-selected': { color: palette.accent },
          }}
        />
      </Tabs>

      {languageOptions.length > 0 && (
        <Stack direction="row" spacing={0.75} sx={{ px: 2, pt: 1.5, pb: 0 }}>
          <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted, pt: 0.6 }}>
            Language:
          </Typography>
          {languageOptions.map((option) => {
            const active = option === language;
            return (
              <Chip
                key={option}
                label={resolveLanguageLabel(option)}
                size="small"
                clickable
                onClick={() => setLanguage(option)}
                sx={{
                  height: 26,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: `1px solid ${active ? palette.accent : palette.border}`,
                  bgcolor: active ? 'rgba(0, 212, 170, 0.12)' : 'transparent',
                  color: active ? palette.accent : palette.textMuted,
                }}
              />
            );
          })}
        </Stack>
      )}

      <Box sx={{ p: 2 }}>
        {showStepBlocks ? (
          <Stack spacing={1.5}>
            {underTheHood.voyageApiSteps!.map((step, index) => (
              <Box key={`${step.label}-${index}`}>
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    color: palette.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    mb: 0.75,
                  }}
                >
                  Step {index + 1} - {step.label}
                </Typography>
                <CopyableCodeBlock
                  code={getCodeForLanguage(step.code, language)}
                  language={(language === 'node' ? 'js' : language) as 'js' | 'python' | 'curl'}
                />
              </Box>
            ))}
          </Stack>
        ) : (
          <CopyableCodeBlock code={singleCodeBlock.code} language={singleCodeBlock.language} />
        )}

        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(0, 212, 170, 0.05)',
            border: `1px solid rgba(0, 212, 170, 0.1)`,
          }}
        >
          <Typography sx={{ fontSize: '0.86rem', color: palette.textDim, lineHeight: 1.7 }}>
            {explanation}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
