"use client";

import React, { useState, useMemo } from "react";
import { 
  Clock, Calendar, Plus, Settings, ShieldCheck, RefreshCw, Database, 
  ChevronRight, ChevronLeft, LogOut, Loader2, BarChart, Receipt, TrendingDown, 
  ThumbsUp, TrendingUp, CheckCircle2, AlertCircle, User
} from "lucide-react";
import { MassBlockingSection } from "@/components/admin/MassBlocking";
import { StandardSlotsSection } from "@/components/admin/StandardSlots";
import { SessionConfigSection } from "@/components/admin/SessionConfig";
import ExpensesConfig from "@/components/admin/ExpensesConfig";
import { CRMSection } from "@/components/admin/CRMSection";
import PushNotificationManager from "@/components/admin/PushNotificationManager";
import NotificationCenter from "@/components/admin/NotificationCenter";
import { ThumbnailManager } from "@/components/admin/ThumbnailManager";
import { ChecklistManager } from "@/components/admin/ChecklistManager";
import { LinksManager } from "@/components/admin/LinksManager";

import { getDashboardData, getFinanceDetailedStats, getFinanceSummary } from "@/lib/actions/admin-actions";
import { logout } from "@/lib/actions/auth-actions";
import { ManualBookingModal } from "@/components/admin/ManualBooking";
import { BlockSlotModal } from "@/components/admin/BlockSlotModal";
import { DeleteBlockedSlotModal } from "@/components/admin/DeleteBlockedSlotModal";
import { EditBookingModal } from "@/components/admin/EditBookingModal";
import { AnimatePresence, motion } from "framer-motion";
import { Booking, SlotDefinition, BlockedDate } from "@/types/database";
import { getSessionColor } from "@/lib/utils/colors";
import { Ban, Camera, CheckSquare, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminBottomNav } from "@/components/layout/BottomNav";


type TabType = 'calendar' | 'blocks' | 'slots' | 'finance' | 'sessions' | 'expenses' | 'clients' | 'thumbnails' | 'checklist' | 'links';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');

  const handleTabChange = (tab: TabType) => {
    if (tab === 'calendar') {
      setSelectedDate(new Date());
      setViewDate(new Date());
    }
    setActiveTab(tab);
  };

  // Use a stable date for initial render to avoid hydration mismatch
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [viewDate, setViewDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Update to exact current time only after mounting if necessary
    // But for a calendar, start of day is usually fine
  }, []);

  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
  const [isYearSelectorOpen, setIsYearSelectorOpen] = useState(false);
  const [stats, setStats] = useState({ totalRevenue: 0 }); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBlockedSlot, setSelectedBlockedSlot] = useState<Booking | SlotDefinition | null>(null);
  const [isSectionEditing, setIsSectionEditing] = useState(false);
  const [isMonthListExpanded, setIsMonthListExpanded] = useState(true);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [allSlots, setAllSlots] = useState<SlotDefinition[]>([]);
  const daySlots = useMemo(() => {
    return allSlots.filter(s => s.day_of_week === selectedDate.getDay());
  }, [allSlots, selectedDate]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [crmRefreshTrigger, setCrmRefreshTrigger] = useState(0);
  const [isBlockSlotOpen, setIsBlockSlotOpen] = useState(false);
  const [selectedTimeForAction, setSelectedTimeForAction] = useState<string | null>(null);

  // ─── Daily booking counts for calendar dots ───
  const dayBookingCounts = useMemo(() => {
    const counts: Record<string, { regular: number; blocked: number }> = {};
    for (const b of bookings) {
      const dateKey = b.booking_date; // YYYY-MM-DD
      if (!dateKey) continue;
      if (!counts[dateKey]) {
        counts[dateKey] = { regular: 0, blocked: 0 };
      }
      if (b.customer_name?.startsWith('BLOQUEIO:')) {
        counts[dateKey].blocked++;
      } else {
        counts[dateKey].regular++;
      }
    }
    return counts;
  }, [bookings]);

  // ─── Set of fully blocked dates (mass blocking) ───
  const fullyBlockedDates = useMemo(() => {
    const set = new Set<string>();
    for (const b of blockedDates) {
      const start = new Date(b.start_date);
      const end = new Date(b.end_date);
      const curr = new Date(start);
      while (curr <= end) {
        set.add(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
    }
    return set;
  }, [blockedDates]);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };
  const greeting = getGreeting();
  
  // Finance states
  const [financeDate, setFinanceDate] = useState(new Date());
  const [financeData, setFinanceData] = useState<{ 
    totalGross: number, 
    totalReceived: number, 
    byCategory: Record<string, { totalGross: number, totalReceived: number, count: number, color?: string }>, 
    bookings: Booking[] 
  }>({ 
    totalGross: 0, 
    totalReceived: 0, 
    byCategory: {}, 
    bookings: [] 
  });
  const [isFinanceLoading, setIsFinanceLoading] = useState(false);
  const [financeSummary, setFinanceSummary] = useState({ totalGross: 0, totalReceived: 0, totalExpenses: 0, netProfit: 0 });
  const [meiReport, setMeiReport] = useState<{ totalYear: number, monthByMonth: { month: number, received: number }[] }>({ totalYear: 0, monthByMonth: [] });

  // Consider as editing if any modal is open or if the section reports editing
  const isEditing = isManualBookingOpen || !!selectedBooking || !!selectedBlockedSlot || isSectionEditing;

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  async function loadData(isBackground?: boolean) {
    const background = isBackground === true;
    if (background) setIsSyncing(true);
    else setIsLoading(true);
    try {
      const data = await getDashboardData(viewDate.getFullYear(), viewDate.getMonth());
      setStats(data.stats);
      setBookings(data.bookings.bookings || []);
      setAllSlots(data.grid.slots || []);
      setBlockedDates(data.blocks.blocks || []);
    } catch (e) {
      console.error(e);
      const background = isBackground === true;
      if (!background) showNotification("Erro ao carregar dados", "error");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }

  // Reload grid when selectedDate or viewDate changes
  // Uses refs to avoid stale closures while keeping stable effect dependencies
  React.useEffect(() => {
    if (activeTab === 'calendar') {
      loadDataRef.current(false);
    }
  }, [selectedDate, viewDate, activeTab]);

  async function loadFinanceData(isBackground?: boolean) {
    const background = isBackground === true;
    if (background) setIsSyncing(true);
    else setIsFinanceLoading(true);
    try {
      const [data, summary] = await Promise.all([
        getFinanceDetailedStats(financeDate.getMonth(), financeDate.getFullYear()),
        getFinanceSummary(financeDate.getMonth(), financeDate.getFullYear())
      ]);
      setFinanceData(data);
      setFinanceSummary(summary);
      
      // Load MEI report (current year) in parallel — months are 0-indexed
      const monthPromises = Array.from({ length: 12 }, (_, i) => getFinanceSummary(i, financeDate.getFullYear()));
      const summaries = await Promise.all(monthPromises);
      
      const yearTotal = summaries.reduce((acc: number, s) => acc + (s.totalReceived || 0), 0);
      const monthByMonth = summaries.map((s, i) => ({ 
        month: i + 1, 
        received: s.totalReceived || 0 
      }));
      
      setMeiReport({ totalYear: yearTotal, monthByMonth });

    } catch (e) {
      console.error(e);
      const background = isBackground === true;
      if (!background) showNotification("Erro ao carregar dados financeiros", "error");
    } finally {
      setIsFinanceLoading(false);
      setIsSyncing(false);
    }
  }

  React.useEffect(() => {
    if (activeTab === 'finance') {
      loadFinanceDataRef.current(false);
    } else {
      loadDataRef.current(false);
    }
  }, [activeTab, financeDate]);

  const loadDataRef = React.useRef(loadData);
  loadDataRef.current = loadData; // Update during render so effects see latest
  const loadFinanceDataRef = React.useRef(loadFinanceData);
  loadFinanceDataRef.current = loadFinanceData;

  React.useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadDataRef.current(true);
        loadFinanceDataRef.current(true);
        setCrmRefreshTrigger(prev => prev + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_dates' }, () => {
        loadDataRef.current(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schema_slots' }, () => {
        loadDataRef.current(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        loadFinanceDataRef.current(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-admin-bg)] flex flex-col lg:flex-row antialiased pb-20 lg:pb-0 admin-scope selection:bg-[var(--color-admin-accent)]/30 text-[var(--color-admin-text)] relative overflow-hidden">
      
      {/* ─── Clean Backdrop ─── */}
      <div className="absolute inset-0 pointer-events-none z-[0] bg-gradient-to-tr from-[var(--color-admin-bg)] via-white/5 to-[var(--color-admin-bg)]" />

      {/* ─── Sidebar ─── */}
      <aside className="w-72 bg-[var(--color-admin-surface)] border-r border-[var(--color-admin-border)] flex flex-col hidden lg:flex shrink-0 relative z-20 shadow-sm">
        <div className="p-6 border-b border-[var(--color-admin-border)] flex items-center gap-4 relative">
          <div className="w-10 h-10 bg-[var(--color-admin-text)] text-[var(--color-admin-bg)] rounded-xl flex items-center justify-center shadow-sm overflow-hidden p-2 shrink-0">
            <img src="/brand/favicon.svg" alt="Hellen Ferreira" className="w-full h-full object-contain brightness-0 invert" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-[14px] text-[var(--color-admin-text)] tracking-tight leading-none truncate">Hellen Ferreira</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">
              {greeting}
            </p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Principal</div>
          
          <SidebarNavItem 
            active={activeTab === 'calendar'} 
            disabled={isEditing}
            onClick={() => handleTabChange('calendar')} 
            icon={<Calendar size={20} />} 
            label="Agenda" 
          />
          <SidebarNavItem 
            active={activeTab === 'clients'} 
            disabled={isEditing}
            onClick={() => handleTabChange('clients')} 
            icon={<User size={20} />} 
            label="Clientes" 
          />
          <SidebarNavItem 
            active={activeTab === 'blocks'} 
            disabled={isEditing}
            onClick={() => handleTabChange('blocks')} 
            icon={<ShieldCheck size={20} />} 
            label="Bloqueios" 
          />
          <SidebarNavItem 
            active={activeTab === 'slots'} 
            disabled={isEditing}
            onClick={() => handleTabChange('slots')} 
            icon={<Clock size={20} />} 
            label="Horários" 
          />
          
          <div className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-10 mb-2">Financeiro</div>
          
          <SidebarNavItem 
            active={activeTab === 'finance'} 
            disabled={isEditing}
            onClick={() => handleTabChange('finance')} 
            icon={<BarChart size={20} />} 
            label="Faturamento" 
          />
          <SidebarNavItem 
            active={activeTab === 'expenses'} 
            disabled={isEditing}
            onClick={() => handleTabChange('expenses')} 
            icon={<Receipt size={20} />} 
            label="Saídas" 
          />

          <div className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-10 mb-2">Configurações</div>
          
          <SidebarNavItem 
            active={activeTab === 'sessions'} 
            disabled={isEditing}
            onClick={() => handleTabChange('sessions')} 
            icon={<Settings size={20} />} 
            label="Serviços" 
          />
          <SidebarNavItem 
            active={activeTab === 'thumbnails'} 
            disabled={isEditing}
            onClick={() => handleTabChange('thumbnails')} 
            icon={<Camera size={20} />} 
            label="Capas e Thumbs" 
          />

          <div className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-10 mb-2">Melhorias & Tarefas</div>
          
          <SidebarNavItem 
            active={activeTab === 'checklist'} 
            disabled={isEditing}
            onClick={() => handleTabChange('checklist')} 
            icon={<CheckSquare size={20} />} 
            label="Checklist" 
          />
          <SidebarNavItem 
            active={activeTab === 'links'} 
            disabled={isEditing}
            onClick={() => handleTabChange('links')} 
            icon={<Link2 size={20} />} 
            label="Links Rápidos" 
          />
        </nav>

        <div className="p-6 border-t border-[var(--color-admin-border)] bg-[var(--color-admin-bg)]/50">
          <button 
            onClick={() => !isEditing && logout()}
            disabled={isEditing}
            className={`flex items-center gap-4 w-full px-5 py-4 text-slate-400 transition-all rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] group border border-[var(--color-admin-border)]/50 ${isEditing ? 'opacity-20 pointer-events-none' : ''}`}
          >
            <LogOut size={18} /> 
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* ─── Magic Bottom Nav Mobile ─── */}
      <AdminBottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        disabled={isEditing} 
      />


      {/* ─── Main Content Industrial ─── */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Header */}
        <header className="h-20 lg:h-24 bg-[var(--color-admin-surface)]/80 backdrop-blur-md border-b border-[var(--color-admin-border)] flex items-center justify-between px-5 lg:px-14 shrink-0 relative z-30">
          <div className="flex items-center gap-6">
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-admin-text)] rounded-xl flex items-center justify-center p-1.5 shadow-sm">
                <img src="/brand/favicon.svg" alt="HF" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-[13px] text-[var(--color-admin-text)] tracking-tight leading-none truncate">Hellen Ferreira</h2>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1 opacity-70">
                  {greeting}
                </p>
              </div>
            </div>
            <div>
              {/* Removido títulos superiores para layout limpo */}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {isSyncing && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200">
                <Loader2 className="animate-spin text-[var(--color-admin-accent)]" size={14} />
                <span>Sync</span>
              </div>
            )}
            <button 
              onClick={() => loadData(false)}
              disabled={isEditing}
              className={`w-12 h-12 flex items-center justify-center bg-[var(--color-admin-bg)] text-slate-400 rounded-2xl transition-all border border-[var(--color-admin-border)] active:scale-90 shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--color-admin-accent)] outline-none ${isEditing ? 'opacity-20 pointer-events-none' : ''}`}
              title="Sincronizar"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin text-[var(--color-admin-accent)]" : ""} />
            </button>

            <NotificationCenter 
              onEditBooking={(booking) => {
                const isBlock = booking.customer_name?.startsWith('BLOQUEIO:');
                if (isBlock) {
                  setSelectedBlockedSlot(booking);
                } else {
                  setSelectedBooking(booking);
                }
              }} 
              refreshTrigger={crmRefreshTrigger} 
            />

            <button 
              onClick={() => setIsManualBookingOpen(true)}
              disabled={isEditing}
              className="bg-[var(--color-admin-accent)] text-white text-[11px] font-bold uppercase tracking-[0.2em] px-6 lg:px-8 py-3 lg:py-4 rounded-2xl flex items-center gap-3 transition-all shadow-md active:scale-95 group focus-visible:ring-2 focus-visible:ring-[var(--color-admin-accent)] outline-none disabled:opacity-20 disabled:scale-100"
            >
              <Plus size={18} strokeWidth={3} /> 
              <span className="hidden sm:inline">Novo Agendamento</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-14 custom-scrollbar bg-[var(--color-admin-bg)]">
          
          <AnimatePresence>
            {isManualBookingOpen && (
              <ManualBookingModal 
                initialDate={selectedDate}
                initialTime={selectedTimeForAction}
                onClose={() => {
                  setIsManualBookingOpen(false);
                  setSelectedTimeForAction(null);
                }} 
                onCreated={() => {
                  loadData(true);
                  setNotification({ message: "Agendamento realizado com sucesso", type: 'success' });
                  setTimeout(() => setNotification(null), 3000);
                }} 
              />
            )}
            
            {isBlockSlotOpen && selectedTimeForAction && (
              <BlockSlotModal
                date={selectedDate}
                time={selectedTimeForAction}
                onClose={() => {
                  setIsBlockSlotOpen(false);
                  setSelectedTimeForAction(null);
                }}
                onCreated={() => {
                  loadData(true);
                  setNotification({ message: "Horário bloqueado com sucesso", type: 'success' });
                  setTimeout(() => setNotification(null), 3000);
                }}
              />
            )}

                        {selectedBlockedSlot && (
              <DeleteBlockedSlotModal
                booking={selectedBlockedSlot as Booking}
                onClose={() => setSelectedBlockedSlot(null)}
                onUpdated={() => {
                  loadData(true);
                  setNotification({ message: "Bloqueio removido com sucesso", type: 'success' });
                  setTimeout(() => setNotification(null), 3000);
                }}
              />
            )}

            {selectedBooking && (
              <EditBookingModal 
                booking={selectedBooking} 
                onClose={() => setSelectedBooking(null)} 
                onUpdated={() => {
                  loadData(true);
                  setCrmRefreshTrigger(prev => prev + 1);
                  setNotification({ message: "Agendamento atualizado", type: 'success' });
                  setTimeout(() => setNotification(null), 3000);
                }}
              />
            )}
          </AnimatePresence>

          {/* Month/Year Selectors Overlay */}
          <AnimatePresence>
            {(isMonthSelectorOpen || isYearSelectorOpen) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setIsMonthSelectorOpen(false); setIsYearSelectorOpen(false); }}
                className="fixed inset-0 bg-[var(--color-admin-bg)]/80 backdrop-blur-md z-[150] flex items-center justify-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-8 shadow-2xl max-w-md w-full"
                >
                  <h4 className="text-[18px] font-bold text-[var(--color-admin-text)] mb-6 text-center uppercase tracking-widest">
                    {isMonthSelectorOpen ? 'Selecionar Mês' : 'Selecionar Ano'}
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                    {isMonthSelectorOpen ? (
                      ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m, idx) => (
                        <button
                          key={m}
                          onClick={() => {
                            if (activeTab === 'finance') {
                              const d = new Date(financeDate);
                              d.setMonth(idx);
                              setFinanceDate(d);
                            } else {
                              const d = new Date(viewDate);
                              d.setMonth(idx);
                              setViewDate(d);
                            }
                            setIsMonthSelectorOpen(false);
                          }}
                          className={`py-4 rounded-2xl text-[14px] font-bold transition-all border ${
                            (activeTab === 'finance' ? financeDate.getMonth() : viewDate.getMonth()) === idx 
                              ? 'bg-[var(--color-admin-accent)] border-[var(--color-admin-accent)] text-white shadow-lg' 
                              : 'bg-[var(--color-admin-bg)] border-[var(--color-admin-border)] text-slate-500 hover:border-slate-400'
                          }`}
                        >
                          {m}
                        </button>
                      ))
                    ) : (
                      Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                        <button
                          key={y}
                          onClick={() => {
                            if (activeTab === 'finance') {
                              const d = new Date(financeDate);
                              d.setFullYear(y);
                              setFinanceDate(d);
                            } else {
                              const d = new Date(viewDate);
                              d.setFullYear(y);
                              setViewDate(d);
                            }
                            setIsYearSelectorOpen(false);
                          }}
                          className={`py-4 rounded-2xl text-[14px] font-bold transition-all border ${
                            (activeTab === 'finance' ? financeDate.getFullYear() : viewDate.getFullYear()) === y 
                              ? 'bg-[var(--color-admin-accent)] border-[var(--color-admin-accent)] text-white shadow-lg' 
                              : 'bg-[var(--color-admin-bg)] border-[var(--color-admin-border)] text-slate-500 hover:border-slate-400'
                          }`}
                        >
                          {y}
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast Notification */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className={`fixed top-28 left-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 min-w-[200px] justify-center backdrop-blur-md ${
                  notification.type === 'success' 
                    ? 'bg-emerald-500/90 text-white border-emerald-400' 
                    : 'bg-red-500/90 text-white border-red-400'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-[12px] font-bold uppercase tracking-wider">{notification.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'calendar' && (
            <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
              
              {/* Calendário Visual Mini (Top) */}
              <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-center gap-6 mb-10">
                  <button 
                    onClick={() => {
                      const d = new Date(viewDate);
                      d.setMonth(d.getMonth() - 1);
                      setViewDate(d);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-slate-400 hover:text-[var(--color-admin-accent)] transition-all active:scale-90"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex flex-col items-center min-w-[180px]">
                    <button 
                      onClick={() => setIsMonthSelectorOpen(true)}
                      className="text-[24px] font-black text-[var(--color-admin-text)] uppercase tracking-tight leading-none hover:text-[var(--color-admin-accent)] transition-colors"
                    >
                      {viewDate.toLocaleDateString('pt-BR', { month: 'long' })}
                    </button>
                    <button 
                      onClick={() => setIsYearSelectorOpen(true)}
                      className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1 hover:text-[var(--color-admin-accent)] transition-colors ml-1"
                    >
                      {viewDate.getFullYear()}
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                      const d = new Date(viewDate);
                      d.setMonth(d.getMonth() + 1);
                      setViewDate(d);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-slate-400 hover:text-[var(--color-admin-accent)] transition-all active:scale-90"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase py-4">{d}</div>
                  ))}
                  {(() => {
                    const year = viewDate.getFullYear();
                    const month = viewDate.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    
                    const cells = [];
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} className="aspect-square" />);
                    }
                    
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day);
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      const isToday = new Date().toDateString() === date.toDateString();
                      const dateKey = date.toISOString().split('T')[0];
                      
                      // Check if day is fully blocked (mass blocking)
                      const isFullyBlocked = fullyBlockedDates.has(dateKey);
                      
                      // Day-level booking counts
                      const dayCounts = dayBookingCounts[dateKey] || { regular: 0, blocked: 0 };
                      const hasRegularBookings = dayCounts.regular > 0;
                      const hasBlockedBookings = dayCounts.blocked > 0;
                      const isBlocked = isFullyBlocked || (hasBlockedBookings && !hasRegularBookings);
                      const hasBookings = hasRegularBookings;
                      const dayOfWeek = date.getDay();
                      const hasSlotsConfigured = allSlots.some(s => s.day_of_week === dayOfWeek);

                      // Determine day styling classes
                      let cellStyle = '';
                      if (isSelected) {
                        cellStyle = 'bg-[var(--color-admin-accent)] border-[var(--color-admin-accent)] text-white shadow-md z-10 scale-105';
                      } else if (isBlocked) {
                        cellStyle = `bg-red-50 border-red-200 text-red-600 hover:bg-red-100/50 ${isToday ? 'border-2 border-[var(--color-admin-accent)]/70' : ''}`;
                      } else if (hasBookings) {
                        cellStyle = `bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50 ${isToday ? 'border-2 border-[var(--color-admin-accent)]/70' : ''}`;
                      } else if (!hasSlotsConfigured) {
                        cellStyle = `bg-slate-100 border-slate-200 text-slate-400 opacity-60 hover:bg-slate-200/50 ${isToday ? 'border-2 border-[var(--color-admin-accent)]/70' : ''}`;
                      } else {
                        // Default neutral (has slots configured but 0 bookings)
                        cellStyle = `bg-[var(--color-admin-bg)] hover:bg-slate-50 ${
                          isToday 
                            ? 'border-2 border-[var(--color-admin-accent)] text-[var(--color-admin-accent)]' 
                            : 'border-[var(--color-admin-border)] text-slate-600 hover:border-slate-400'
                        }`;
                      }

                      cells.push(
                        <button 
                          key={day}
                          onClick={() => setSelectedDate(date)}
                          className={`aspect-square rounded-xl lg:rounded-2xl flex flex-col items-center justify-center transition-all border relative ${cellStyle}`}
                        >
                          <span className="text-[14px] font-bold">{day}</span>
                          {/* Dots: only for non-fully-blocked days */}
                          {!isFullyBlocked && !isSelected && (dayCounts.regular > 0 || dayCounts.blocked > 0) && (
                            <div className="flex gap-[1px] mt-1 justify-center flex-nowrap px-1">
                              {Array.from({ length: dayCounts.regular }, (_, i) => (
                                <div key={`b-${i}`} className="w-[3px] h-[3px] lg:w-[4px] lg:h-[4px] bg-blue-500 rounded-full shrink-0" />
                              ))}
                              {Array.from({ length: dayCounts.blocked }, (_, i) => (
                                <div key={`r-${i}`} className="w-[3px] h-[3px] lg:w-[4px] lg:h-[4px] bg-red-400 rounded-full shrink-0" />
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    }
                    return cells;
                  })()}
                </div>
              </div>

              {/* Lista de Agendamentos Filtrada */}
              <div className="bg-transparent lg:bg-[var(--color-admin-surface)] border-none lg:border border-[var(--color-admin-border)] rounded-none lg:rounded-[2.5rem] overflow-hidden lg:shadow-sm">
                <div className="px-0 lg:px-12 py-8 border-none lg:border-b border-[var(--color-admin-border)] flex items-center justify-center bg-transparent">
                  <h3 className="text-[18px] font-bold text-[var(--color-admin-text)] tracking-tight">
                    Ensaios em {selectedDate.toLocaleDateString('pt-BR')}
                  </h3>
                </div>
                
                <div className="px-0 lg:p-12">
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-[var(--color-admin-accent)]" size={40} />
                        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Sincronizando grade...</p>
                      </div>
                    ) : (() => {
                        const isFullyBlocked = fullyBlockedDates.has(selectedDate.toISOString().split('T')[0]);
                        const block = isFullyBlocked ? blockedDates.find(b => {
                          const startParts = b.start_date.split('T')[0].split('-').map(Number);
                          const endParts = b.end_date.split('T')[0].split('-').map(Number);
                          const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
                          const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
                          const check = new Date(selectedDate);
                          check.setHours(0,0,0,0);
                          return check >= start && check <= end;
                        }) : undefined;

                        if (block) {
                          return (
                            <div className="py-24 text-center bg-red-50 border-2 border-dashed border-red-200 rounded-[3rem] px-8">
                               <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                                  <ShieldCheck size={40} />
                               </div>
                               <h4 className="text-[22px] font-black text-red-900 uppercase tracking-tight">Dia Bloqueado</h4>
                               <p className="text-[14px] font-bold text-red-600/70 mt-3 uppercase tracking-widest">{block.reason || 'Nenhum atendimento neste dia'}</p>
                               <div className="mt-8 flex items-center justify-center gap-2">
                                  <div className="h-[1px] w-8 bg-red-200" />
                                  <span className="text-[10px] font-black text-red-300 uppercase tracking-[0.3em]">Agenda Indisponível</span>
                                  <div className="h-[1px] w-8 bg-red-200" />
                               </div>
                            </div>
                          );
                        }

                        if (daySlots.length === 0) {
                          return (
                            <div className="py-20 text-center border-2 border-dashed border-[var(--color-admin-border)] rounded-[2rem]">
                              <Clock className="mx-auto text-slate-300 mb-4" size={32} />
                              <p className="text-[14px] font-bold text-slate-500 tracking-tight">Nenhum horário configurado para este dia da semana.</p>
                              <p className="text-[12px] text-slate-400 mt-2">Acesse a aba &quot;Horários&quot; para definir a grade master.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid gap-3">
                            {daySlots.map(slot => {
                              const bookingAtSlot = bookings.find(b => {
                                const bDate = new Date(b.booking_date);
                                const isSameDate = bDate.getUTCDate() === selectedDate.getDate() &&
                                                   bDate.getUTCMonth() === selectedDate.getMonth() &&
                                                   bDate.getUTCFullYear() === selectedDate.getFullYear();
                                return isSameDate && b.start_time.slice(0, 5) === slot.start_time.slice(0, 5);
                              });

                              if (bookingAtSlot) {
                                  const isBlock = bookingAtSlot.customer_name?.startsWith('BLOQUEIO:');
                                  const blockReason = isBlock ? bookingAtSlot.customer_name.replace('BLOQUEIO: ', '') : '';
                                  const isPending = bookingAtSlot.status === 'pending';
                                    
                                  const colors = isBlock 
                                    ? { isCustom: true, styles: { color: '#ef4444' } }
                                    : isPending
                                      ? { isCustom: true, styles: { color: '#f59e0b' } }
                                      : getSessionColor(bookingAtSlot.sessions?.name || 'Outros', bookingAtSlot.sessions?.theme_color);
                                    
                                  return (
                                    <div 
                                      key={slot.id} 
                                      onClick={() => isBlock ? setSelectedBlockedSlot(bookingAtSlot) : setSelectedBooking(bookingAtSlot)}
                                      className={`group flex items-stretch gap-6 p-2 rounded-[1.5rem] transition-all hover:translate-x-2 cursor-pointer bg-white border shadow-sm ${
                                        isBlock 
                                          ? 'border-red-200 bg-red-50/30' 
                                          : isPending 
                                            ? 'border-amber-200 bg-amber-50/10 hover:border-amber-300' 
                                            : 'border-[var(--color-admin-border)]'
                                      }`}
                                    >
                                      <div className={`w-24 flex flex-col items-center justify-center border-r pr-2 ${isBlock ? 'border-red-100' : isPending ? 'border-amber-100' : 'border-[var(--color-admin-border)]'}`}>
                                        <span className={`text-[16px] font-black ${isBlock ? 'text-red-600' : isPending ? 'text-amber-600' : 'text-[var(--color-admin-text)]'}`}>{slot.start_time.slice(0, 5)}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{isBlock ? 'Bloqueio' : 'Início'}</span>
                                      </div>
                                    
                                      <div 
                                        className="flex-1 p-4 rounded-2xl flex items-center justify-between"
                                        style={{ 
                                          backgroundColor: isBlock 
                                            ? '#fee2e2' 
                                            : isPending 
                                              ? '#fffbeb' 
                                              : (colors.isCustom ? `${colors.styles?.color}15` : 'var(--color-admin-bg)') 
                                        }}
                                      >
                                        <div className="flex items-center gap-4">
                                          <div 
                                            className={`w-1.5 h-10 rounded-full ${isBlock ? 'bg-red-500' : isPending ? 'bg-amber-500 animate-pulse' : ''}`}
                                            style={(!isBlock && !isPending) ? { backgroundColor: colors.isCustom ? colors.styles?.color : 'var(--color-admin-accent)' } : {}}
                                          />
                                          <div>
                                            <h4 className={`text-[15px] font-bold tracking-tight ${isBlock ? 'text-red-900' : isPending ? 'text-amber-900' : 'text-[var(--color-admin-text)]'}`}>
                                              {isBlock ? 'HORÁRIO BLOQUEADO' : bookingAtSlot.customer_name}
                                            </h4>
                                            <p className={`text-[11px] font-bold uppercase tracking-wider ${isBlock ? 'text-red-500' : isPending ? 'text-amber-600' : 'text-slate-500'}`}>
                                              {isBlock ? blockReason : bookingAtSlot.sessions?.name}
                                            </p>
                                          </div>
                                        </div>
 
                                        <div className="text-right hidden sm:block">
                                          <div className={`text-[12px] font-bold flex items-center justify-end gap-1.5 ${isBlock ? 'text-red-600' : isPending ? 'text-amber-600' : 'text-[var(--color-admin-text)]'}`}>
                                            {isBlock ? (
                                              'Indisponível'
                                            ) : isPending ? (
                                              <>
                                                <Clock size={12} className="animate-pulse" />
                                                <span>Aguardando Pix</span>
                                              </>
                                            ) : bookingAtSlot.status === 'confirmed' ? (
                                              'Confirmado'
                                            ) : bookingAtSlot.status === 'completed' ? (
                                              'Concluído'
                                            ) : (
                                              'Pendente'
                                            )}
                                          </div>
                                          <div className="text-[10px] font-medium text-slate-400 italic">ref: {bookingAtSlot.id.split('-')[0]}</div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                              }

                              return (
                                <div 
                                  key={slot.id} 
                                  className="flex items-center gap-6 p-4 rounded-[1.5rem] border border-dashed border-[var(--color-admin-border)] opacity-60 hover:opacity-100 transition-all bg-white/50"
                                >
                                   <div className="w-24 flex flex-col items-center justify-center border-r border-[var(--color-admin-border)] pr-2 border-dashed">
                                      <span className="text-[14px] font-bold text-slate-400">{slot.start_time.slice(0, 5)}</span>
                                    </div>
                                    <div className="flex-1 flex items-center justify-between">
                                      <span className="text-[12px] font-bold text-slate-300 uppercase tracking-[0.2em]">Horário Livre</span>
                                      <div className="flex items-center gap-2">
                                        <button 
                                          onClick={() => {
                                            setSelectedTimeForAction(slot.start_time.slice(0, 5));
                                            setIsBlockSlotOpen(true);
                                          }}
                                          title="Bloquear Horário"
                                          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        >
                                          <Ban size={16} />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            setSelectedTimeForAction(slot.start_time.slice(0, 5));
                                            setIsManualBookingOpen(true);
                                          }}
                                          title="Novo Agendamento"
                                          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-[var(--color-admin-accent)] hover:text-white transition-all shadow-sm"
                                        >
                                          <Plus size={16} />
                                        </button>
                                      </div>
                                    </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
              
              {/* Navegação de Mês no Financeiro - Destaque Máximo */}
              <div className="flex flex-col items-center justify-center bg-[var(--color-admin-surface)] p-12 rounded-[3rem] border border-[var(--color-admin-border)] shadow-sm relative overflow-hidden">
                {/* Efeito de brilho sutil no fundo */}
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-admin-accent)]/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center gap-12 relative z-10">
                  <button 
                    onClick={() => {
                      const d = new Date(financeDate);
                      d.setMonth(d.getMonth() - 1);
                      setFinanceDate(d);
                    }}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-slate-400 hover:text-[var(--color-admin-accent)] hover:border-[var(--color-admin-accent)]/30 transition-all active:scale-90 shadow-sm"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  
                  <div className="text-center">
                    <button 
                      onClick={() => setIsMonthSelectorOpen(true)}
                      className="text-[28px] lg:text-[32px] font-black text-[var(--color-admin-text)] uppercase tracking-tight leading-none hover:text-[var(--color-admin-accent)] transition-all"
                    >
                      {financeDate.toLocaleDateString('pt-BR', { month: 'long' })}
                    </button>
                    <div className="flex items-center justify-center gap-3 mt-3">
                      <div className="h-[1px] w-8 bg-[var(--color-admin-border)]" />
                      <button 
                        onClick={() => setIsYearSelectorOpen(true)}
                        className="text-[14px] font-black text-slate-400 uppercase tracking-[0.5em] hover:text-[var(--color-admin-accent)] transition-colors"
                      >
                        {financeDate.getFullYear()}
                      </button>
                      <div className="h-[1px] w-8 bg-[var(--color-admin-border)]" />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      const d = new Date(financeDate);
                      d.setMonth(d.getMonth() + 1);
                      setFinanceDate(d);
                    }}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-slate-400 hover:text-[var(--color-admin-accent)] hover:border-[var(--color-admin-accent)]/30 transition-all active:scale-90 shadow-sm"
                  >
                    <ChevronRight size={28} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatMetric 
                  label="Faturamento Bruto" 
                  value={isFinanceLoading ? "---" : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeSummary.totalGross)} 
                  isPositive 
                  icon={<BarChart size={24} />}
                  trend="Contratos Totais"
                />
                <StatMetric 
                  label="Entradas (Caixa)" 
                  value={isFinanceLoading ? "---" : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeSummary.totalReceived)} 
                  isPositive 
                  icon={<TrendingUp size={24} />}
                  trend="Valor Recebido"
                />
                <div className="w-full bg-slate-900 p-6 lg:p-8 rounded-2xl lg:rounded-[2.5rem] border border-slate-800 flex flex-col justify-between h-40 lg:h-48 transition-all shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-8 -top-8 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-1000 text-rose-500">
                     <TrendingDown size={100} strokeWidth={1} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 opacity-70">Saídas (Despesas)</p>
                    <h4 className={`text-[24px] lg:text-[32px] font-black tracking-tight text-rose-400`}>
                      {isFinanceLoading ? "---" : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeSummary.totalExpenses)}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 relative z-10">
                     <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-rose-500/10 border-rose-500/20 text-rose-400 uppercase tracking-tighter`}>
                        {financeSummary.netProfit >= 0 ? 'Lucro Preservado' : 'Atenção ao Caixa'}
                     </span>
                  </div>
                </div>
              </div>

              {/* Controle MEI Discreto */}
              <div className="bg-white/80 backdrop-blur-sm px-8 py-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8 overflow-hidden">
                <div className="flex items-center gap-4 shrink-0 self-start sm:self-center">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 text-left">Faturamento MEI {financeDate.getFullYear()}</p>
                    <p className="text-[15px] font-black text-slate-900 leading-none text-left">
                      R$ {meiReport.totalYear.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
                      <span className="text-slate-300 font-bold ml-2">/ 81k</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 w-full flex items-center gap-4">
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30 relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((meiReport.totalYear / 81000) * 100, 100)}%` }}
                      className={`h-full rounded-full transition-colors duration-1000 ${
                        (meiReport.totalYear / 81000) > 0.8 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 
                        (meiReport.totalYear / 81000) > 0.6 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 
                        'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]'
                      }`}
                    />
                  </div>
                  <div className="shrink-0 flex flex-col items-end">
                    <p className="text-[13px] font-black text-slate-900 leading-none">{Math.round((meiReport.totalYear / 81000) * 100)}%</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">do limite</p>
                  </div>
                </div>

                <div className="hidden xl:block shrink-0 pl-8 border-l border-slate-100">
                  <p className="text-[11px] font-medium text-slate-500 leading-tight">
                    Disponível: <span className="font-bold text-emerald-600">R$ {(81000 - meiReport.totalYear).toLocaleString('pt-BR')}</span>
                  </p>
                </div>
              </div>

              {/* Grid de Categorias */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(financeData.byCategory).map(([name, data]: [string, { totalGross: number, totalReceived: number, count: number, color?: string }]) => {
                       const colors = getSessionColor(name, data.color);
                       return (
                        <div 
                          key={name}
                          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between h-40 lg:h-48 transition-all hover:scale-[1.02] relative overflow-hidden group shadow-sm"
                        >
                          <div 
                            className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity rounded-full -mr-12 -mt-12"
                            style={{ backgroundColor: colors.isCustom ? colors.styles?.color : 'var(--color-admin-accent)' }}
                          />
                          
                          <div className="flex justify-between items-start relative z-10">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{name}</span>
                            <span className="text-[10px] font-bold px-3 py-1.5 bg-slate-50 rounded-lg text-slate-500 border border-slate-100">
                              {data.count} sessões
                            </span>
                          </div>
                          
                          <div className="mt-auto relative z-10">
                            <h5 className="text-[20px] font-black text-slate-900 tracking-tight">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalGross)}
                            </h5>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                              Recebido: <span className="text-emerald-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalReceived)}</span>
                            </p>
                          </div>
                        </div>
                       );
                    })}
                  </div>

              {/* Lista Detalhada do Mês (Bloco Sanfona) */}
              <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] overflow-hidden shadow-sm">
                <button 
                  onClick={() => setIsMonthListExpanded(!isMonthListExpanded)}
                  className="w-full px-10 py-8 border-b border-[var(--color-admin-border)] flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-[18px] font-bold text-[var(--color-admin-text)] tracking-tight">Listagem de Ensaios - {financeDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
                    <span className="text-[12px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{financeData.bookings.length} registros</span>
                  </div>
                  <ChevronRight 
                    size={24} 
                    className={`text-slate-300 transition-transform duration-500 ${isMonthListExpanded ? 'rotate-90' : ''}`} 
                  />
                </button>
                
                <AnimatePresence>
                  {isMonthListExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="p-4 lg:p-10">
                                                <BookingList 
                          bookings={financeData.bookings} 
                          onEdit={(booking) => {
                            const isBlock = booking.customer_name?.startsWith('BLOQUEIO:');
                            if (isBlock) {
                              setSelectedBlockedSlot(booking);
                            } else {
                              setSelectedBooking(booking);
                            }
                          }}
                          isLoading={isFinanceLoading} 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          <div className="max-w-[1600px] mx-auto pb-20">
            {activeTab === 'clients' && (
              <CRMSection 
                onEditingChange={setIsSectionEditing} 
                onEditBooking={setSelectedBooking} 
                refreshTrigger={crmRefreshTrigger}
              />
            )}
            {activeTab === 'slots' && <StandardSlotsSection onEditingChange={setIsSectionEditing} />}
            {activeTab === 'sessions' && (
              <div className="space-y-8">
                <PushNotificationManager />
                <SessionConfigSection onEditingChange={setIsSectionEditing} />
              </div>
            )}
            {activeTab === 'expenses' && <ExpensesConfig />}
            {activeTab === 'blocks' && <MassBlockingSection onEditingChange={setIsSectionEditing} />}
            {activeTab === 'thumbnails' && <ThumbnailManager />}
            {activeTab === 'checklist' && <ChecklistManager />}
            {activeTab === 'links' && <LinksManager />}
          </div>
        </div>
      </main>
    </div>
  );
}

function BookingList({ bookings, onEdit, isLoading }: { bookings: Booking[], onEdit: (b: Booking) => void, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="py-48 flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <Loader2 className="animate-spin text-[var(--color-admin-accent)]" size={60} strokeWidth={2.5} />
          <div className="absolute inset-0 blur-2xl bg-[var(--color-admin-accent)] opacity-30 animate-pulse" />
        </div>
        <p className="text-[13px] font-bold text-slate-500 tracking-wider">Carregando informações...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="py-48 text-center">
        <div className="w-24 h-24 bg-[var(--color-admin-bg)] rounded-[2rem] border border-dashed border-[var(--color-admin-border)] flex items-center justify-center mx-auto mb-8 shadow-inner">
           <Database size={32} className="text-slate-300" />
        </div>
        <p className="text-[15px] font-bold text-[var(--color-admin-text)] tracking-tight">Nenhum registro encontrado</p>
        <p className="text-[12px] font-medium text-[var(--color-admin-text-muted)] mt-2">Os dados solicitados não estão disponíveis no momento.</p>
      </div>
    );
  }

  // Agrupar por data
  const grouped = bookings.reduce((acc: Record<string, Booking[]>, b) => {
    const date = b.booking_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(b);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="space-y-12 px-2 lg:px-6">
      {sortedDates.map((date) => {
        const dateObj = new Date(date);
        const dayBookings = grouped[date];

        return (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-4 px-4">
              <div className="w-1.5 h-6 bg-[var(--color-admin-accent)] rounded-full" />
              <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </h4>
              <div className="flex-1 h-[1px] bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                {dayBookings.length} registro{dayBookings.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3">
              {dayBookings.map((booking) => {
                const total = Number(booking.total_amount) || 0;
                const paid = Number(booking.paid_amount) || 0;
                const isFullyPaid = paid >= total && total > 0;
                const hasPaidSomething = paid > 0 && !isFullyPaid;

                return (
                                    <div 
                                      key={booking.id}
                                      onClick={() => onEdit(booking)}
                    className="group bg-white rounded-[1.5rem] border border-[var(--color-admin-border)] p-5 lg:p-6 flex items-center justify-between gap-4 transition-all hover:border-[var(--color-admin-accent)]/30 hover:shadow-xl hover:translate-x-1 cursor-pointer active:scale-[0.99] shadow-sm"
                  >
                    <div className="flex items-center gap-6 lg:gap-10 flex-1 min-w-0">
                      <div className="flex flex-col flex-1 min-w-0">
                        <h4 className="text-[14px] lg:text-[16px] font-bold text-[var(--color-admin-text)] tracking-tight truncate group-hover:text-[var(--color-admin-accent)] transition-colors">
                          {booking.customer_name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                            {booking.sessions?.name}
                          </span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                            booking.location_type === 'externo'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {booking.location_type === 'externo' ? '🌳 Externo' : '🏠 Estúdio'}
                            {booking.location_details && booking.location_type === 'externo' ? ` (${booking.location_details})` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col text-right min-w-[140px]">
                        <span className="text-[15px] lg:text-[18px] font-black text-[var(--color-admin-text)]">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                        </span>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">PAGO</span>
                          <span className={`text-[10px] font-black ${isFullyPaid ? 'text-emerald-600' : hasPaidSomething ? 'text-amber-600' : 'text-slate-300'}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(paid)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
                      <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2 ${
                        isFullyPaid 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                          : hasPaidSomething
                          ? 'bg-amber-50 border-amber-100 text-amber-600'
                          : 'bg-slate-50 border-slate-100 text-slate-200'
                      }`}>
                        {isFullyPaid ? (
                          <CheckCircle2 size={20} strokeWidth={3} />
                        ) : hasPaidSomething ? (
                          <ThumbsUp size={18} strokeWidth={2.5} />
                        ) : (
                          <AlertCircle size={18} strokeWidth={2.5} />
                        )}
                        <span className="text-[7px] font-black uppercase tracking-tighter">
                          {isFullyPaid ? 'QUIT' : hasPaidSomething ? 'SINAL' : 'PEND'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SidebarNavItem({ active, onClick, icon, label, disabled }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, disabled?: boolean }) {
  return (
    <button 
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-[14px] font-bold relative overflow-hidden border-2 ${
        active 
          ? 'bg-[var(--color-admin-accent)] border-[var(--color-admin-accent)] text-white shadow-md scale-[1.02]' 
          : 'text-slate-500 bg-transparent border-transparent'
      } ${disabled ? 'opacity-30 pointer-events-none' : ''}`}
    >
      <div className={`${active ? 'text-white' : 'text-slate-400'} transition-colors`}>
        {React.cloneElement(icon as React.ReactElement<{ strokeWidth?: number }>, { strokeWidth: active ? 2.5 : 2 })}
      </div>
      <span className="relative z-10">{label}</span>
      {active && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />}
    </button>
  );
}



function StatMetric({ label, value, icon, isPositive, trend }: { label: string, value: string | number, icon: React.ReactNode, isPositive?: boolean, trend: string }) {
  return (
    <div className="w-full bg-[var(--color-admin-surface)] p-6 lg:p-8 border border-[var(--color-admin-border)] rounded-2xl lg:rounded-[2.5rem] flex flex-col justify-between h-40 lg:h-48 transition-all shadow-sm relative overflow-hidden group">
      <div className="absolute -right-8 -top-8 p-12 opacity-5 rotate-12 group-hover:opacity-10 group-hover:rotate-0 transition-all duration-1000">
         {React.cloneElement(icon as React.ReactElement<{ size?: number, strokeWidth?: number }>, { size: 100, strokeWidth: 1 })}
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1.5">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">{label}</p>
           <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[var(--color-admin-bg)] border uppercase tracking-tighter ${isPositive ? 'text-emerald-500 border-emerald-500/20' : 'text-slate-500 border-[var(--color-admin-border)]'}`}>
                {trend}
              </span>
           </div>
        </div>
      </div>
      <h4 className="text-[24px] lg:text-[32px] font-black tracking-tight text-[var(--color-admin-text)] relative z-10">
        {value}
      </h4>
    </div>
  );
}
