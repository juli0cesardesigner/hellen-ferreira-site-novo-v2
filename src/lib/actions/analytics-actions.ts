'use server';

import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseKey);
};

export type AnalyticsTimeRange = 'today' | '7d' | '30d' | 'month' | 'year';

export interface PageStat {
  path: string;
  visits: number;
  buttonClicks: number;
  avgDuration: number; // em segundos
  bounceRate: number; // porcentagem (0-100)
}

export interface FlowStepItem {
  path: string;
  count: number;
  percentage: number;
}

export interface FlowStep {
  stepIndex: number;
  totalVisitors: number;
  droppedCount: number;
  dropPercentage: number;
  items: FlowStepItem[];
}

export interface TrafficSourceItem {
  name: string;
  count: number;
  percentage: number;
}

export interface DeviceItem {
  name: string;
  count: number;
  percentage: number;
}

export interface AnalyticsDashboardStats {
  totalSessions: number;
  totalPageviews: number;
  totalBookings: number;
  totalRevenue: number;
  conversionRate: number;
  averageTicket: number;
  sources: TrafficSourceItem[];
  devices: DeviceItem[];
  pages: PageStat[];
  flowSteps: FlowStep[];
}

function calculateDateRange(
  range: AnalyticsTimeRange,
  selectedMonth?: number,
  selectedYear?: number
): { startIso: string; endIso?: string } {
  const now = new Date();
  switch (range) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      return { startIso: start.toISOString() };
    }
    case '7d': {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { startIso: start.toISOString() };
    }
    case '30d': {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { startIso: start.toISOString() };
    }
    case 'month': {
      const m = typeof selectedMonth === 'number' ? selectedMonth : now.getMonth();
      const y = typeof selectedYear === 'number' ? selectedYear : now.getFullYear();
      const start = new Date(y, m, 1, 0, 0, 0);
      const end = new Date(y, m + 1, 1, 0, 0, 0);
      return { startIso: start.toISOString(), endIso: end.toISOString() };
    }
    case 'year': {
      const y = typeof selectedYear === 'number' ? selectedYear : now.getFullYear();
      const start = new Date(y, 0, 1, 0, 0, 0);
      const end = new Date(y + 1, 0, 1, 0, 0, 0);
      return { startIso: start.toISOString(), endIso: end.toISOString() };
    }
    default: {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { startIso: start.toISOString() };
    }
  }
}

export async function getAnalyticsDashboardData(
  range: AnalyticsTimeRange = '30d',
  selectedMonth?: number,
  selectedYear?: number
): Promise<AnalyticsDashboardStats> {
  const supabase = getSupabaseAdmin();
  const { startIso, endIso } = calculateDateRange(range, selectedMonth, selectedYear);

  try {
    // 1. Buscar Pageviews do período
    let pvQuery = supabase
      .from('analytics_pageviews')
      .select('id, session_id, step_index, path, source, device_type, duration_seconds, created_at')
      .gte('created_at', startIso);
    if (endIso) {
      pvQuery = pvQuery.lt('created_at', endIso);
    }
    const { data: pageviews, error: pvError } = await pvQuery;

    if (pvError) {
      console.error('Erro ao buscar pageviews no analytics:', pvError);
    }

    const pvs = pageviews || [];

    // 2. Buscar Eventos de Cliques do período
    let evQuery = supabase
      .from('analytics_events')
      .select('id, session_id, event_name, event_target, path, created_at')
      .gte('created_at', startIso);
    if (endIso) {
      evQuery = evQuery.lt('created_at', endIso);
    }
    const { data: events, error: evError } = await evQuery;

    if (evError) {
      console.error('Erro ao buscar eventos no analytics:', evError);
    }

    const evs = events || [];

    // 3. Buscar Bookings do período para cruzar com Vendas reais
    let bkQuery = supabase
      .from('bookings')
      .select('id, total_amount, paid_amount, status, created_at')
      .gte('created_at', startIso)
      .neq('status', 'cancelled');
    if (endIso) {
      bkQuery = bkQuery.lt('created_at', endIso);
    }
    const { data: bookings, error: bkError } = await bkQuery;

    if (bkError) {
      console.error('Erro ao buscar reservas no analytics:', bkError);
    }

    const bks = bookings || [];

    // Agrupamento por Sessão
    const sessionMap = new Map<string, typeof pvs>();
    pvs.forEach((pv) => {
      const list = sessionMap.get(pv.session_id) || [];
      list.push(pv);
      sessionMap.set(pv.session_id, list);
    });

    const totalSessions = sessionMap.size;
    const totalPageviews = pvs.length;

    // Métricas Financeiras
    const totalBookings = bks.length;
    const totalRevenue = bks.reduce((acc, b) => acc + (Number(b.paid_amount) || Number(b.total_amount) || 0), 0);
    const conversionRate = totalSessions > 0 ? Number(((totalBookings / totalSessions) * 100).toFixed(1)) : 0;
    const averageTicket = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

    // 4. Fontes de Tráfego
    const sourceCounts: Record<string, number> = {};
    // Atribuição da fonte pela primeira visualização de cada sessão
    sessionMap.forEach((sessionPvs) => {
      const first = sessionPvs.sort((a, b) => a.step_index - b.step_index)[0];
      const src = first?.source || 'Direto';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    const sources: TrafficSourceItem[] = Object.entries(sourceCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // 5. Dispositivos
    const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
    sessionMap.forEach((sessionPvs) => {
      const dev = (sessionPvs[0]?.device_type || 'mobile').toLowerCase();
      if (deviceCounts[dev] !== undefined) {
        deviceCounts[dev]++;
      } else {
        deviceCounts.mobile++;
      }
    });

    const devices: DeviceItem[] = [
      { name: 'Mobile (Celulares)', count: deviceCounts.mobile, percentage: totalSessions > 0 ? Math.round((deviceCounts.mobile / totalSessions) * 100) : 0 },
      { name: 'Desktop (Computador)', count: deviceCounts.desktop, percentage: totalSessions > 0 ? Math.round((deviceCounts.desktop / totalSessions) * 100) : 0 },
      { name: 'Tablet', count: deviceCounts.tablet, percentage: totalSessions > 0 ? Math.round((deviceCounts.tablet / totalSessions) * 100) : 0 },
    ].sort((a, b) => b.count - a.count);

    // 6. Principais Páginas (Visitas, Cliques em Botões, Duração Média, Taxa de Abandono)
    const pageMetricsMap = new Map<string, {
      visits: number;
      totalDuration: number;
      durationSamples: number;
      sessions: Set<string>;
    }>();

    pvs.forEach((pv) => {
      const path = pv.path || '/';
      const existing = pageMetricsMap.get(path) || {
        visits: 0,
        totalDuration: 0,
        durationSamples: 0,
        sessions: new Set<string>()
      };
      existing.visits++;
      existing.sessions.add(pv.session_id);
      if (pv.duration_seconds && pv.duration_seconds > 0) {
        existing.totalDuration += pv.duration_seconds;
        existing.durationSamples++;
      }
      pageMetricsMap.set(path, existing);
    });

    // Cliques em botões agrupados por página
    const pageClicksMap: Record<string, number> = {};
    evs.forEach((ev) => {
      const p = ev.path || '/';
      pageClicksMap[p] = (pageClicksMap[p] || 0) + 1;
    });

    // Calcular taxa de abandono (sessões que entraram nessa página e tiveram apenas 1 pageview total)
    const singlePageSessions = new Set<string>();
    sessionMap.forEach((pvsInSession, sId) => {
      if (pvsInSession.length === 1) {
        singlePageSessions.add(sId);
      }
    });

    const pages: PageStat[] = Array.from(pageMetricsMap.entries())
      .map(([path, data]) => {
        let singlePageEntries = 0;
        data.sessions.forEach((sId) => {
          if (singlePageSessions.has(sId)) {
            singlePageEntries++;
          }
        });
        const bounceRate = data.sessions.size > 0 
          ? Math.round((singlePageEntries / data.sessions.size) * 100) 
          : 0;

        const avgDuration = data.durationSamples > 0 
          ? Math.round(data.totalDuration / data.durationSamples) 
          : 0;

        return {
          path,
          visits: data.visits,
          buttonClicks: pageClicksMap[path] || 0,
          avgDuration,
          bounceRate
        };
      })
      .sort((a, b) => b.visits - a.visits);

    // 7. Principais Fluxos de Navegação (4 Etapas)
    const flowSteps: FlowStep[] = [];
    const stepVisitors = [
      new Map<string, number>(), // step 1
      new Map<string, number>(), // step 2
      new Map<string, number>(), // step 3
      new Map<string, number>(), // step 4
    ];

    sessionMap.forEach((sessionPvs) => {
      // Ordenar por step_index
      const sorted = sessionPvs.sort((a, b) => a.step_index - b.step_index);
      for (let s = 0; s < 4; s++) {
        if (sorted[s]) {
          const path = sorted[s].path;
          const currentCount = stepVisitors[s].get(path) || 0;
          stepVisitors[s].set(path, currentCount + 1);
        }
      }
    });

    for (let s = 0; s < 4; s++) {
      const map = stepVisitors[s];
      const totalInThisStep = Array.from(map.values()).reduce((a, b) => a + b, 0);
      const totalInNextStep = s < 3 ? Array.from(stepVisitors[s + 1].values()).reduce((a, b) => a + b, 0) : 0;
      
      const droppedCount = s < 3 ? Math.max(0, totalInThisStep - totalInNextStep) : 0;
      const dropPercentage = totalInThisStep > 0 && s < 3 ? Math.round((droppedCount / totalInThisStep) * 100) : 0;

      const items: FlowStepItem[] = Array.from(map.entries())
        .map(([path, count]) => ({
          path,
          count,
          percentage: totalInThisStep > 0 ? Math.round((count / totalInThisStep) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // top 5 por etapa

      flowSteps.push({
        stepIndex: s + 1,
        totalVisitors: totalInThisStep,
        droppedCount,
        dropPercentage,
        items
      });
    }

    return {
      totalSessions,
      totalPageviews,
      totalBookings,
      totalRevenue,
      conversionRate,
      averageTicket,
      sources,
      devices,
      pages,
      flowSteps
    };
  } catch (err) {
    console.error('Erro geral ao processar getAnalyticsDashboardData:', err);
    return {
      totalSessions: 0,
      totalPageviews: 0,
      totalBookings: 0,
      totalRevenue: 0,
      conversionRate: 0,
      averageTicket: 0,
      sources: [],
      devices: [],
      pages: [],
      flowSteps: []
    };
  }
}
