'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const SESSION_KEY = 'hf_site_sid';
const STEP_KEY = 'hf_site_step';
const UTM_SOURCE_KEY = 'hf_utm_src';
const UTM_MEDIUM_KEY = 'hf_utm_med';
const UTM_CAMPAIGN_KEY = 'hf_utm_cam';

/**
 * Função utilitária para disparar eventos e cliques de conversão personalizados
 */
export function trackSiteEvent(eventName: string, eventTarget?: string) {
  if (typeof window === 'undefined') return;
  const pathname = window.location.pathname;
  if (pathname.startsWith('/admin')) return;

  const sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) return;

  const payload = {
    type: 'event',
    sessionId,
    eventName,
    eventTarget: eventTarget || undefined,
    path: pathname
  };

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  } catch {
    // Ignora erros de rede silenciosamente
  }
}

function detectDevice(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'mobile';
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle/i.test(ua) || window.innerWidth < 768) {
    return 'mobile';
  }
  return 'desktop';
}

function detectTrafficSource(urlSearchParams: URLSearchParams): {
  source: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  const qSource = urlSearchParams.get('utm_source');
  const qMedium = urlSearchParams.get('utm_medium');
  const qCampaign = urlSearchParams.get('utm_campaign');
  const fbclid = urlSearchParams.get('fbclid');
  const gclid = urlSearchParams.get('gclid');

  // Persiste em sessionStorage para manter atribuição no fluxo
  if (qSource) sessionStorage.setItem(UTM_SOURCE_KEY, qSource);
  if (qMedium) sessionStorage.setItem(UTM_MEDIUM_KEY, qMedium);
  if (qCampaign) sessionStorage.setItem(UTM_CAMPAIGN_KEY, qCampaign);

  const utmSource = qSource || sessionStorage.getItem(UTM_SOURCE_KEY) || undefined;
  const utmMedium = qMedium || sessionStorage.getItem(UTM_MEDIUM_KEY) || undefined;
  const utmCampaign = qCampaign || sessionStorage.getItem(UTM_CAMPAIGN_KEY) || undefined;

  if (utmSource) {
    return { source: utmSource, utmSource, utmMedium, utmCampaign };
  }
  if (fbclid) {
    return { source: 'Meta Ads', utmSource: 'meta', utmMedium: 'cpc', utmCampaign };
  }
  if (gclid) {
    return { source: 'Google Ads', utmSource: 'google', utmMedium: 'cpc', utmCampaign };
  }

  const ref = typeof document !== 'undefined' ? document.referrer : '';
  if (ref) {
    if (ref.includes('instagram.com') || ref.includes('l.instagram.com')) return { source: 'Instagram' };
    if (ref.includes('facebook.com') || ref.includes('fb.com')) return { source: 'Facebook' };
    if (ref.includes('google.com') || ref.includes('google.com.br')) return { source: 'Google Orgânico' };
    if (ref.includes('whatsapp.com') || ref.includes('wa.me')) return { source: 'WhatsApp' };
    if (ref.includes('hellenferreira.com')) return { source: 'Direto' };
    try {
      const url = new URL(ref);
      return { source: url.hostname.replace('www.', '') };
    } catch {
      return { source: 'Referência' };
    }
  }

  return { source: 'Direto' };
}

export default function SiteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPageviewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);

  // Enviar duração da página anterior ao desmontar ou trocar de rota
  const sendDuration = () => {
    const pageviewId = currentPageviewIdRef.current;
    if (!pageviewId || !startTimeRef.current) return;

    const durationSeconds = Math.round((performance.now() - startTimeRef.current) / 1000);
    if (durationSeconds >= 1) {
      const payload = {
        type: 'duration',
        pageviewId,
        durationSeconds
      };

      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          navigator.sendBeacon('/api/analytics/track', blob);
        } else {
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
          }).catch(() => {});
        }
      } catch {
        // Ignora silenciosamente
      }
    }
  };

  useEffect(() => {
    // Não rastrear rotas administrativas
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // Enviar duração da página que está sendo deixada
    sendDuration();

    // 1. Obter ou gerar session_id
    let sid = sessionStorage.getItem(SESSION_KEY);
    let stepIndex = 1;

    if (!sid) {
      sid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : `s_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
      sessionStorage.setItem(STEP_KEY, '1');
      stepIndex = 1;
    } else {
      const currentStep = parseInt(sessionStorage.getItem(STEP_KEY) || '1', 10);
      stepIndex = currentStep + 1;
      sessionStorage.setItem(STEP_KEY, String(stepIndex));
    }

    const { source, utmSource, utmMedium, utmCampaign } = detectTrafficSource(searchParams);
    const deviceType = detectDevice();

    startTimeRef.current = performance.now();
    currentPageviewIdRef.current = null;

    // 2. Disparar registro do pageview
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'pageview',
        sessionId: sid,
        stepIndex,
        path: pathname || '/',
        title: typeof document !== 'undefined' ? document.title : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        source,
        utmSource,
        utmMedium,
        utmCampaign,
        deviceType
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data?.pageviewId) {
          currentPageviewIdRef.current = data.pageviewId;
        }
      })
      .catch(() => {});

    // Ouvinte para saída da janela/aba
    const handleBeforeUnload = () => {
      sendDuration();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      sendDuration();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [pathname, searchParams]);

  return null;
}
