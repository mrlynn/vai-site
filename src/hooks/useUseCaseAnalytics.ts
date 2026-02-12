'use client';

import { useEffect, useRef, useCallback } from 'react';

const TELEMETRY_URL = '/api/telemetry';
const VERSION = 'site-1.0';
const CONTEXT = 'use-cases';

function sendEvent(payload: Record<string, unknown>) {
  const body = JSON.stringify({
    version: VERSION,
    context: CONTEXT,
    platform: 'web',
    ...payload,
    timestamp: new Date().toISOString(),
  });

  // Fire-and-forget
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(TELEMETRY_URL, new Blob([body], { type: 'application/json' }));
  } else {
    fetch(TELEMETRY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

export function useUseCaseAnalytics(slug: string) {
  const firedPageView = useRef(false);

  // Page view on mount (debounced via ref)
  useEffect(() => {
    if (firedPageView.current) return;
    firedPageView.current = true;

    sendEvent({
      event: 'usecase_page_view',
      slug,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });
  }, [slug]);

  const trackChatbotOpen = useCallback(() => {
    sendEvent({ event: 'usecase_chatbot_open', slug });
  }, [slug]);

  const trackChatbotQuery = useCallback(
    (queryLength: number) => {
      sendEvent({ event: 'usecase_chatbot_query', slug, queryLength });
    },
    [slug]
  );

  const trackDownload = useCallback(
    (filename?: string) => {
      sendEvent({ event: 'usecase_sample_docs_download', slug, filename });
    },
    [slug]
  );

  const trackCtaClick = useCallback(
    (type: 'install' | 'github' | 'start_chatting' | 'desktop_app' | 'walkthrough') => {
      sendEvent({ event: 'usecase_cta_click', slug, ctaType: type });
    },
    [slug]
  );

  return {
    trackChatbotOpen,
    trackChatbotQuery,
    trackDownload,
    trackCtaClick,
  };
}
