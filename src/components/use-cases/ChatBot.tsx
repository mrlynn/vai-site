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

          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5 }}>
            {messages.length === 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ color: palette.textMuted, mb: 1.5 }}>
                  Ask anything about the developer documentation:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {suggestedQueries.map((q, i) => (
                    <Chip
                      key={i}
                      label={q}
                      size="small"
                      onClick={() => sendMessage(q)}
                      sx={{
                        bgcolor: palette.bgCard,
                        color: palette.textDim,
                        border: `1px solid ${palette.border}`,
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        '&:hover': { bgcolor: palette.bgSurface, borderColor: accentColor },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '85%',
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: msg.role === 'user' ? accentColor + '22' : palette.bgCard,
                    border: `1px solid ${msg.role === 'user' ? accentColor + '44' : palette.border}`,
                  }}
                >
                  {msg.role === 'user' ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color: palette.text,
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {msg.content}
                    </Typography>
                  ) : (
                    <Box sx={{ '& > *:first-of-type': { mt: 0 }, '& > *:last-child': { mb: 0 } }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                        {msg.content}
                      </ReactMarkdown>
                      {loading && i === messages.length - 1 && (
                        <Box component="span" sx={{ ml: 0.5, opacity: 0.5 }}>
                          ▊
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              gap: 1,
              borderTop: `1px solid ${palette.border}`,
              bgcolor: palette.bgSurface,
            }}
          >
            <TextField
              inputRef={inputRef}
              fullWidth
              size="small"
              placeholder="Type a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: palette.bgCard,
                  fontSize: '0.85rem',
                  '& fieldset': { borderColor: palette.border },
                  '&:hover fieldset': { borderColor: accentColor },
                  '&.Mui-focused fieldset': { borderColor: accentColor },
                },
              }}
            />
            <IconButton
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              sx={{ color: accentColor }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: accentColor }} /> : <SendIcon />}
            </IconButton>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}
