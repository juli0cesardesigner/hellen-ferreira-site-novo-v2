'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, RefreshCw, Eye, MousePointerClick, Clock, 
  DoorOpen, Smartphone, Monitor, Tablet, TrendingUp, 
  DollarSign, Calendar, Search, ArrowRight, Activity,
  Globe, Compass, CheckCircle2, ChevronRight, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAnalyticsDashboardData, 
  AnalyticsTimeRange, 
  AnalyticsDashboardStats,
  PageStat
} from '@/lib/actions/analytics-actions';

interface AnalyticsDashboardProps {
  onRefreshTrigger?: number;
}

export function AnalyticsDashboard({ onRefreshTrigger }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('30d');
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(() => new Date());
  const [data, setData] = useState<AnalyticsDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageSubTab, setPageSubTab] = useState<'visits' | 'clicks' | 'duration' | 'bounce'>('visits');
  const [pageSearch, setPageSearch] = useState('');

  const loadData = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const stats = await getAnalyticsDashboardData(
        timeRange,
        selectedMonthDate.getMonth(),
        selectedMonthDate.getFullYear()
      );
      setData(stats);
    } catch (err) {
      console.error('Erro ao carregar dados de analytics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, [timeRange, selectedMonthDate, onRefreshTrigger]);

  const handlePrevMonth = () => {
    const d = new Date(selectedMonthDate);
    d.setMonth(d.getMonth() - 1);
    setSelectedMonthDate(d);
  };

  const handleNextMonth = () => {
    const d = new Date(selectedMonthDate);
    d.setMonth(d.getMonth() + 1);
    setSelectedMonthDate(d);
  };

  const monthLabel = useMemo(() => {
    const mName = selectedMonthDate.toLocaleDateString('pt-BR', { month: 'long' });
    const yName = selectedMonthDate.getFullYear();
    return `${mName.charAt(0).toUpperCase() + mName.slice(1)} de ${yName}`;
  }, [selectedMonthDate]);

  // Formatação de Moeda
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  // Formatação de Tempo (segundos -> m s)
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  // Filtro de Páginas por Busca
  const filteredPages = useMemo(() => {
    if (!data?.pages) return [];
    if (!pageSearch.trim()) return data.pages;
    const q = pageSearch.toLowerCase().trim();
    return data.pages.filter(p => p.path.toLowerCase().includes(q));
  }, [data?.pages, pageSearch]);

  // Valor máximo para barras proporcionais da lista de páginas
  const maxPageMetric = useMemo(() => {
    if (!filteredPages.length) return 1;
    if (pageSubTab === 'visits') {
      return Math.max(...filteredPages.map(p => p.visits), 1);
    }
    if (pageSubTab === 'clicks') {
      return Math.max(...filteredPages.map(p => p.buttonClicks), 1);
    }
    if (pageSubTab === 'duration') {
      return Math.max(...filteredPages.map(p => p.avgDuration), 1);
    }
    return 100; // bounce rate
  }, [filteredPages, pageSubTab]);

  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-[1400px] mx-auto">
      
      {/* ─── Topo: Cabeçalho e Controles ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Activity size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Métricas & Tráfego do Site</h1>
              <p className="text-xs text-slate-400 mt-0.5">Visitas, comportamento e fluxos de agendamento em tempo real.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Período */}
          <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            {(
              [
                { id: 'today', label: 'Hoje' },
                { id: '7d', label: '7 Dias' },
                { id: '30d', label: '30 Dias' },
                { id: 'month', label: 'Mês' },
                { id: 'year', label: 'Ano' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Navegador de Mês Específico quando a aba 'month' estiver ativa */}
          {timeRange === 'month' && (
            <div className="bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800 flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                title="Mês anterior"
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
              <span className="text-xs font-bold text-white min-w-[130px] text-center">
                {monthLabel}
              </span>
              <button
                onClick={handleNextMonth}
                title="Próximo mês"
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Botão de Atualizar */}
          <button
            onClick={() => loadData(false)}
            disabled={isRefreshing}
            title="Atualizar dados agora"
            className="p-2.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
          </button>
        </div>
      </div>

      {/* ─── Linha 1: Cards de Indicadores Chave (KPIs) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Sessões */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sessões Únicas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Eye size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              {isLoading ? '...' : (data?.totalSessions.toLocaleString('pt-BR') || '0')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isLoading ? '...' : `${data?.totalPageviews.toLocaleString('pt-BR') || 0} visualizações`}
            </div>
          </div>
        </div>

        {/* Agendamentos */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Agendamentos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Calendar size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              {isLoading ? '...' : (data?.totalBookings.toLocaleString('pt-BR') || '0')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Reservas no período</div>
          </div>
        </div>

        {/* Total em Vendas */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Faturamento</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              {isLoading ? '...' : formatCurrency(data?.totalRevenue || 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isLoading ? '...' : data?.totalReceived ? `${formatCurrency(data.totalReceived)} em sinal` : 'Total contratado'}
            </div>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Taxa de Conversão</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-purple-300 tracking-tight">
              {isLoading ? '...' : `${data?.conversionRate || 0}%`}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Visitas ➔ Agendamento</div>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ticket Médio</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <BarChart3 size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white tracking-tight">
              {isLoading ? '...' : formatCurrency(data?.averageTicket || 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Média por contrato</div>
          </div>
        </div>
      </div>

      {/* ─── Linha 2: Widget 1 - Principais Páginas (Inspirado no Wix Print 1) ─── */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        {/* Cabeçalho do Widget */}
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Principais páginas</h2>
            <p className="text-xs text-slate-400">Volume de acessos, interação e retenção das clientes.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar página..."
              value={pageSearch}
              onChange={(e) => setPageSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Corpo do Widget: Menu Lateral + Lista */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[360px]">
          {/* Menu Lateral de Métricas */}
          <div className="md:col-span-4 lg:col-span-3 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-3 space-y-1.5">
            <button
              onClick={() => setPageSubTab('visits')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-semibold transition-all text-left ${
                pageSubTab === 'visits'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Eye size={18} />
              <span>Visitas</span>
            </button>

            <button
              onClick={() => setPageSubTab('clicks')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-semibold transition-all text-left ${
                pageSubTab === 'clicks'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <MousePointerClick size={18} />
              <span>Cliques em botões</span>
            </button>

            <button
              onClick={() => setPageSubTab('duration')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-semibold transition-all text-left ${
                pageSubTab === 'duration'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Clock size={18} />
              <span>Duração média da sessão</span>
            </button>

            <button
              onClick={() => setPageSubTab('bounce')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-semibold transition-all text-left ${
                pageSubTab === 'bounce'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <DoorOpen size={18} />
              <span>Taxa de abandono</span>
            </button>
          </div>

          {/* Lista de Páginas */}
          <div className="md:col-span-8 lg:col-span-9 p-6">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                Carregando dados de páginas...
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
                <Compass size={28} className="opacity-40 text-slate-400" />
                <p>Nenhuma visualização registrada ainda para este período.</p>
                <p className="text-[11px] text-slate-600">Navegue pelas páginas do site para ver as estatísticas em tempo real.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPages.slice(0, 10).map((page, idx) => {
                  let metricValue = '';
                  let percentageWidth = 0;

                  if (pageSubTab === 'visits') {
                    metricValue = page.visits.toLocaleString('pt-BR');
                    percentageWidth = Math.max(8, Math.round((page.visits / maxPageMetric) * 100));
                  } else if (pageSubTab === 'clicks') {
                    metricValue = page.buttonClicks.toLocaleString('pt-BR');
                    percentageWidth = Math.max(8, Math.round((page.buttonClicks / maxPageMetric) * 100));
                  } else if (pageSubTab === 'duration') {
                    metricValue = formatDuration(page.avgDuration);
                    percentageWidth = Math.max(8, Math.round((page.avgDuration / maxPageMetric) * 100));
                  } else {
                    metricValue = `${page.bounceRate}%`;
                    percentageWidth = Math.max(8, page.bounceRate);
                  }

                  return (
                    <div key={page.path || idx} className="group flex flex-col space-y-1.5 pb-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-200 group-hover:text-blue-400 transition-colors font-medium">
                          {page.path}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white tracking-tight text-[13px]">
                            {metricValue}
                          </span>
                          <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                      </div>

                      {/* Barra de Progresso Proporcional (Estilo Wix) */}
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentageWidth}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            pageSubTab === 'bounce'
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : 'bg-gradient-to-r from-blue-500 to-blue-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Linha 3: Widget 2 - Principais Fluxos de Navegação (Inspirado no Wix Print 2) ─── */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-white">
            <Layers size={20} className="text-blue-400" />
            <h2 className="text-lg font-bold tracking-tight">Principais fluxos de navegação</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore as 4 primeiras etapas que os visitantes realizam no seu site.
          </p>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
            Calculando jornadas de navegação...
          </div>
        ) : !data?.flowSteps || data.flowSteps[0]?.items.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2 bg-slate-950/40 rounded-xl border border-slate-800">
            <Compass size={24} className="opacity-40 text-slate-400" />
            <p>Nenhum fluxo de múltiplos passos registrado no período.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {data.flowSteps.map((step, sIdx) => (
              <div key={step.stepIndex} className="flex flex-col space-y-3 relative">
                {/* Header da Etapa */}
                <div className="flex items-center justify-between bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-300">
                    {step.stepIndex}ª página
                  </span>
                  <span className="text-[11px] font-semibold text-blue-400">
                    {step.totalVisitors} visitas
                  </span>
                </div>

                {/* Lista de páginas da etapa */}
                <div className="space-y-2 flex-1">
                  {step.items.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-600 bg-slate-950/20 rounded-xl border border-slate-800/40">
                      Navegação encerrou antes desta etapa
                    </div>
                  ) : (
                    step.items.map((item, iIdx) => (
                      <div
                        key={item.path || iIdx}
                        className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-300 font-medium truncate max-w-[150px]" title={item.path}>
                            {item.path}
                          </span>
                          <span className="font-bold text-blue-400 text-[11px] shrink-0">
                            {item.percentage}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> {item.count}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Taxa de Abandono entre etapas */}
                {sIdx < 3 && step.totalVisitors > 0 && (
                  <div className="bg-rose-950/20 border border-rose-900/30 px-3 py-1.5 rounded-lg text-center">
                    <span className="text-[10px] font-medium text-rose-400">
                      {step.dropPercentage}% ({step.droppedCount}) saíram
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Linha 4: Fontes de Tráfego & Dispositivos ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fontes de Tráfego */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Globe size={18} className="text-blue-400" />
            <h3 className="font-bold text-sm">Principais Fontes de Tráfego</h3>
          </div>

          {isLoading ? (
            <div className="h-36 flex items-center justify-center text-slate-500 text-xs">Carregando fontes...</div>
          ) : !data?.sources.length ? (
            <div className="h-36 flex items-center justify-center text-slate-500 text-xs">Nenhum dado de origem registrado.</div>
          ) : (
            <div className="space-y-3">
              {data.sources.slice(0, 5).map((src) => (
                <div key={src.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{src.name}</span>
                    <span className="text-slate-400 font-semibold">{src.count} ({src.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${Math.max(5, src.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dispositivos */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Smartphone size={18} className="text-emerald-400" />
            <h3 className="font-bold text-sm">Sessões por Dispositivo</h3>
          </div>

          {isLoading ? (
            <div className="h-36 flex items-center justify-center text-slate-500 text-xs">Carregando dispositivos...</div>
          ) : !data?.devices.length ? (
            <div className="h-36 flex items-center justify-center text-slate-500 text-xs">Nenhum dado de dispositivo registrado.</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {data.devices.map((dev) => (
                  <div key={dev.name} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center space-y-1">
                    <div className="flex justify-center text-slate-400">
                      {dev.name.includes('Mobile') ? <Smartphone size={18} className="text-emerald-400" /> : 
                       dev.name.includes('Desktop') ? <Monitor size={18} className="text-blue-400" /> : 
                       <Tablet size={18} className="text-purple-400" />}
                    </div>
                    <div className="text-base font-bold text-white">{dev.percentage}%</div>
                    <div className="text-[10px] text-slate-400 truncate">{dev.name.split(' ')[0]}</div>
                  </div>
                ))}
              </div>

              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex">
                {data.devices.map((dev, i) => (
                  <div
                    key={dev.name}
                    className={`h-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'}`}
                    style={{ width: `${dev.percentage}%` }}
                    title={`${dev.name}: ${dev.percentage}%`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
