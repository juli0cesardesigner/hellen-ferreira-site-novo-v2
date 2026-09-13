"use client";

import { useState, useEffect } from "react";
import { SESSIONS_DATA } from "@/lib/data/sessions";

interface SessionPackage {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tier_order: number;
  price_digital: number;
  price_print: number;
  upgrade_label: string;
  features: string[] | null;
  is_active: boolean;
}

interface Session {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  duration_slots: number;
  deposit_price: number;
  theme_color: string;
  session_packages: SessionPackage[];
  is_perpetual?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  min_notice_hours?: number | null;
}

/**
 * Hook que busca os dados de uma sessão (com pacotes) da API (Supabase),
 * com fallback para os dados estáticos SESSIONS_DATA.
 * Isso garante que pacotes criados/editados no admin sejam refletidos.
 */
export function useSessionData(slug: string, staticId?: string): {
  session: Session | null;
  loading: boolean;
} {
  const [session, setSession] = useState<Session | null>(() => {
    // Initialize with static data for instant render
    if (staticId && SESSIONS_DATA[staticId]) {
      return SESSIONS_DATA[staticId] as Session;
    }
    const found = Object.values(SESSIONS_DATA).find((s) => s.slug === slug);
    return (found as Session) || null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSession() {
      try {
        const res = await fetch(`/api/sessions/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        if (!cancelled && data.session) {
          setSession(data.session);
        }
      } catch (err) {
        console.error(`Erro ao buscar sessão "${slug}":`, err);
        // Keep static fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSession();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { session, loading };
}
