'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
  Fade,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { palette } from '@/theme/theme';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  slug: string;
  accentColor: string;
  suggestedQueries?: string[];
  onOpen?: () => void;
  onQuery?: (queryLength: number) => void;
}

export default function ChatBot({ slug, accentColor, suggestedQueries = [], onOpen, onQuery }: ChatBotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Markdown component overrides for assistant messages
  const mdComponents: Components = useMemo(() => ({
    p: ({ children }) => (
      <Typography
        variant="body2"
        sx={{ color: palette.text, fontSize: '0.85rem', lineHeight: 1.6, mb: 0.75, '&:last-child': { mb: 0 } }}
      >
        {children}
      </Typography>
    ),
    a: ({ href, children }) => (
      <Box
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          color: accentColor,
          textDecoration: 'none',
          fontWeight: 500,
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {children}
      </Box>
    ),
    strong: ({ children }) => (
      <Box component="strong" sx={{ fontWeight: 600, color: palette.text }}>
        {children}
      </Box>
    ),
    code: ({ children, className }) => {
      const isBlock = className?.startsWith('language-');
      if (isBlock) {
        return (
          <Box
            component="pre"
            sx={{
              bgcolor: palette.bgSurface,
              border: `1px solid ${palette.border}`,
              borderRadius: 1,
              p: 1.5,
              my: 1,
              overflowX: 'auto',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              lineHeight: 1.5,
              color: palette.text,
            }}
          >
            <code>{children}</code>
          </Box>
        );
      }
      return (
        <Box
          component="code"
          sx={{
            bgcolor: palette.bgSurface,
            px: 0.5,
            py: 0.125,
            borderRadius: 0.5,
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            color: accentColor,
          }}
        >
          {children}
        </Box>
      );
    },
    ul: ({ children }) => (
      <Box component="ul" sx={{ pl: 2.5, my: 0.5, color: palette.text, fontSize: '0.85rem', lineHeight: 1.6 }}>
        {children}
      </Box>
    ),
    ol: ({ children }) => (
      <Box component="ol" sx={{ pl: 2.5, my: 0.5, color: palette.text, fontSize: '0.85rem', lineHeight: 1.6 }}>
        {children}
      </Box>
    ),
    li: ({ children }) => (
      <Box component="li" sx={{ mb: 0.25 }}>
        {children}
      </Box>
    ),
    h1: ({ children }) => (
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: palette.text, mt: 1, mb: 0.5 }}>
        {children}
      </Typography>
    ),
    h2: ({ children }) => (
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: palette.text, mt: 1, mb: 0.5 }}>
        {children}
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: palette.text, mt: 0.75, mb: 0.25 }}>
        {children}
      </Typography>
    ),
    hr: () => (
      <Box sx={{ borderTop: `1px solid ${palette.border}`, my: 1 }} />
    ),
    blockquote: ({ children }) => (
      <Box
        sx={{
          borderLeft: `3px solid ${accentColor}`,
          pl: 1.5,
          my: 0.75,
          color: palette.textDim,
          fontStyle: 'italic',
        }}
      >
        {children}
      </Box>
    ),
  }), [accentColor]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const trimmed = text.trim();
    const userMsg: Message = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    onQuery?.(trimmed.length);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          slug,
          history: messages.slice(-10), // last 10 messages for context
        }),
      });

      if (!res.ok) throw new Error('Chat request failed');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { role: 'assistant', content: assistantContent }]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Expose open method via a global callback so TryItCTA can trigger it
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__openChatBot = () => { setOpen(true); onOpen?.(); };
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__openChatBot;
    };
  }, []);

  return (
    <>
      {/* FAB */}
      <Fade in={!open}>
        <Fab
          onClick={() => { setOpen(true); onOpen?.(); }}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: accentColor,
            color: palette.bg,
            '&:hover': { bgcolor: accentColor, filter: 'brightness(0.85)' },
            zIndex: 1300,
          }}
        >
          <ChatIcon />
        </Fab>
      </Fade>

      {/* Chat Panel */}
      <Fade in={open}>
        <Paper
          elevation={16}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 400,
            height: 520,
            display: open ? 'flex' : 'none',
            flexDirection: 'column',
            bgcolor: palette.bg,
            border: `1px solid ${palette.border}`,
            borderRadius: 3,
            overflow: 'hidden',
            zIndex: 1300,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: palette.bgSurface,
              borderBottom: `1px solid ${palette.border}`,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: accentColor }}>
              💬 Ask about {{ legal: 'Legal Docs', finance: 'Finance Docs', healthcare: 'Clinical Docs', devdocs: 'Developer Docs' }[slug] || 'Docs'}
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: palette.textMuted }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Maintenance notice */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              px: 3,
              py: 4,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '2rem', mb: 2 }}>🔧</Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: palette.text, mb: 1 }}
            >
              Demo Temporarily Unavailable
            </Typography>
            <Typography variant="body2" sx={{ color: palette.textMuted, lineHeight: 1.7 }}>
              The live chatbot is currently disabled as this site is no longer actively maintained.
              The demo remains available to showcase the interface and architecture.
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: palette.textDim, fontSize: '0.78rem', mt: 2 }}
            >
              Interested in building something like this? Check out{' '}
              <Box
                component="a"
                href="https://github.com/mrlynn/voyageai-cli"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: accentColor, textDecoration: 'none' }}
              >
                voyageai-cli
              </Box>{' '}
              on GitHub.
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}
