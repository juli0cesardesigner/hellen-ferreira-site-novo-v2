"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, Clock, Calendar, Plus, Settings, ShieldCheck, RefreshCw, Database, 
  ChevronRight, ChevronLeft, LogOut, Loader2, BarChart, Receipt, TrendingDown, 
  ThumbsUp, TrendingUp, Info, Trash2, Save, CalendarClock, User, Phone, CheckCircle2, AlertCircle
} from "lucide-react";
import { MassBlockingSection } from "@/components/admin/MassBlocking";
import { StandardSlotsSection } from "@/components/admin/StandardSlots";
import { SessionConfigSection } from "@/components/admin/SessionConfig";
import ExpensesConfig from "@/components/admin/ExpensesConfig";

import { getBookingsList, getAdminStats, getAllBookingsList, getFinanceDetailedStats, getDayMasterGrid, getBlockedDates, getExpenses, getFinanceSummary } from "@/lib/actions/admin-actions";
import { logout } from "@/lib/actions/auth-actions";
import { ManualBookingModal } from "@/components/admin/ManualBooking";
import { EditBookingModal } from "@/components/admin/EditBookingModal";
import { AnimatePresence, motion } from "framer-motion";
import { getSessionColor } from "@/lib/utils/colors";
import { createClient } from "@/lib/supabase/client";

type TabType = 'calendar' | 'blocks' | 'slots' | 'finance' | 'sessions' | 'expenses';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
  const [isYearSelectorOpen, setIsYearSelectorOpen] = useState(false);
  const [stats, setStats] = useState({ totalRevenue: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isSectionEditing, setIsSectionEditing] = useState(false);
  const [isMonthListExpanded, setIsMonthListExpanded] = useState(true);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [daySlots, setDaySlots] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };
  const greeting = getGreeting();
  
  // Finance states
  const [financeDate, setFinanceDate] = useState(new Date());
  const [financeData, setFinanceData] = useState<{ totalGross: number, totalReceived: number, byCategory: any, bookings: any[] }>({ 
    totalGross: 0, 
    totalReceived: 0, 
    byCategory: {}, 
    bookings: [] 
  });
  const [isFinanceLoading, setIsFinanceLoading] = useState(false);
  const [financeSummary, setFinanceSummary] = useState({ totalGross: 0, totalReceived: 0, totalExpenses: 0, netProfit: 0 });
  const [meiReport, setMeiReport] = useState<{ totalYear: number, monthByMonth: any[] }>({ totalYear: 0, monthByMonth: [] });

  // Consider as editing if any modal is open or if the section reports editing
  const isEditing = isManualBookingOpen || !!selectedBooking || isSectionEditing;

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  async function loadData() {
    setIsLoading(true);
    try {
      const [statsData, bookingsData, gridData, blocksData] = await Promise.all([
        getAdminStats(),
        getBookingsList(),
        getDayMasterGrid(selectedDate.getDay()),
        getBlockedDates()
      ]);
      setStats(statsData);
      setBookings(bookingsData.bookings || []);
      setDaySlots(gridData.slots || []);
      setBlockedDates(blocksData.blocks || []);
    } catch (e) {
      console.error(e);
      showNotification("Erro ao carregar dados", "error");
    } finally {
      setIsLoading(false);
    }
  }

  // Reload grid when selectedDate changes
  React.useEffect(() => {
    if (activeTab === 'calendar') {
      loadData();
    }
  }, [selectedDate]);

  async function loadFinanceData() {
    setIsFinanceLoading(true);
    try {
      const [data, summary] = await Promise.all([
        getFinanceDetailedStats(financeDate.getMonth(), financeDate.getFullYear()),
        getFinanceSummary(financeDate.getMonth() + 1, financeDate.getFullYear())
      ]);
      setFinanceData(data);
      setFinanceSummary(summary);
      
      // Load MEI report (current year) in parallel
      const monthPromises = Array.from({ length: 12 }, (_, i) => getFinanceSummary(i + 1, financeDate.getFullYear()));
      const summaries = await Promise.all(monthPromises);
      
      const yearTotal = summaries.reduce((acc: number, s: any) => acc + (s.totalReceived || 0), 0);
      const monthByMonth = summaries.map((s, i) => ({ month: i + 1, income: s.totalReceived || 0 }));
      
      setMeiReport({ totalYear: yearTotal, monthByMonth });

    } catch (e) {
      console.error(e);
      showNotification("Erro ao carregar dados financeiros", "error");
    } finally {
      setIsFinanceLoading(false);
    }
  }

  React.useEffect(() => {
    if (activeTab === 'finance') {
      loadFinanceData();
    } else {
      loadData();
    }
  }, [activeTab, financeDate]);

  const loadDataRef = React.useRef(loadData);
  const loadFinanceDataRef = React.useRef(loadFinanceData);

  React.useEffect(() => {
    loadDataRef.current = loadData;
    loadFinanceDataRef.current = loadFinanceData;
  }, [loadData, loadFinanceData]);

  React.useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadDataRef.current();
        loadFinanceDataRef.current();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_dates' }, () => {
        loadDataRef.current();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schema_slots' }, () => {
        loadDataRef.current();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        loadFinanceDataRef.current();
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
              {greeting} mamãe
            </p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Principal</div>
          
          <SidebarNavItem 
            active={activeTab === 'calendar'} 
            disabled={isEditing}
            onClick={() => {
              setActiveTab('calendar');
              setSelectedDate(new Date());
              setViewDate(new Date());
            }} 
            icon={<Calendar size={20} />} 
            label="Agenda" 
          />
          <SidebarNavItem 
            active={activeTab === 'blocks'} 
            disabled={isEditing}
            onClick={() => setActiveTab('blocks')} 
            icon={<ShieldCheck size={20} />} 
            label="Bloqueios" 
          />
          <SidebarNavItem 
            active={activeTab === 'slots'} 
            disabled={isEditing}
            onClick={() => setActiveTab('slots')} 
            icon={<Clock size={20} />} 
            label="Horários" 
          />
          
          <div className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-10 mb-2">Financeiro</div>
          
          <SidebarNavItem 
            active={activeTab === 'finance'} 
            disabled={isEditing}
            onClick={() => setActiveTab('finance')} 
            icon={<BarChart size={20} />} 
            label="Faturamento" 
          />
          <SidebarNavItem 
            active={activeTab === 'expenses'} 
            disabled={isEditing}
            onClick={() => setActiveTab('expenses')} 
            icon={<Receipt size={20} />} 
            label="Saídas" 
          />

          <div className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-10 mb-2">Configurações</div>
          
          <SidebarNavItem 
            active={activeTab === 'sessions'} 
            disabled={isEditing}
            onClick={() => setActiveTab('sessions')} 
            icon={<Settings size={20} />} 
            label="Serviços" 
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

      {/* ─── Bottom Nav Mobile ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-admin-surface)]/90 backdrop-blur-xl border-t border-[var(--color-admin-border)] px-4 pt-2 pb-safe-bottom flex items-center justify-between z-50 shadow-lg">
        <BottomNavItem 
          active={activeTab === 'calendar'} 
          disabled={isEditing}
          onClick={() => {
            setActiveTab('calendar');
            setSelectedDate(new Date());
            setViewDate(new Date());
          }} 
          icon={<Calendar />} 
        />
        <BottomNavItem active={activeTab === 'blocks'} disabled={isEditing} onClick={() => setActiveTab('blocks')} icon={<ShieldCheck />} />
        <BottomNavItem active={activeTab === 'slots'} disabled={isEditing} onClick={() => setActiveTab('slots')} icon={<Clock />} />
        <BottomNavItem active={activeTab === 'finance'} disabled={isEditing} onClick={() => setActiveTab('finance')} icon={<BarChart />} />
        <BottomNavItem active={activeTab === 'expenses'} disabled={isEditing} onClick={() => setActiveTab('expenses')} icon={<Receipt />} />
        <BottomNavItem active={activeTab === 'sessions'} disabled={isEditing} onClick={() => setActiveTab('sessions')} icon={<Settings />} />
      </div>

      {/* ─── Main Content Industrial ─── */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Header */}
        <header className="h-20 lg:h-24 bg-[var(--color-admin-surface)]/80 backdrop-blur-md border-b border-[var(--color-admin-border)] flex items-center justify-between px-5 lg:px-14 shrink-0 relative">
          <div className="flex items-center gap-6">
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-admin-text)] rounded-xl flex items-center justify-center p-1.5 shadow-sm">
                <img src="/brand/favicon.svg" alt="HF" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-[13px] text-[var(--color-admin-text)] tracking-tight leading-none truncate">Hellen Ferreira</h2>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1 opacity-70">
                  {greeting} mamãe
                </p>
              </div>
            </div>
            <div>
              {/* Removido títulos superiores para layout limpo */}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={loadData}
              disabled={isEditing}
              className={`w-12 h-12 flex items-center justify-center bg-[var(--color-admin-bg)] text-slate-400 rounded-2xl transition-all border border-[var(--color-admin-border)] active:scale-90 shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--color-admin-accent)] outline-none ${isEditing ? 'opacity-20 pointer-events-none' : ''}`}
              title="Sincronizar"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin text-[var(--color-admin-accent)]" : ""} />
            </button>

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
                onClose={() => setIsManualBookingOpen(false)} 
                onCreated={loadData}
              />
            )}
            {selectedBooking && (
              <EditBookingModal 
                booking={selectedBooking}
                onClose={() => setSelectedBooking(null)}
                onUpdated={() => {
                  loadData();
                  showNotification("Reserva atualizada");
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
                      cells.push(<div key={`empty-${i}`} className="h-12 lg:h-16" />);
                    }
                    
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day);
                      const isSelected = selectedDate.toDateString() === date.toDateString();
                      const isToday = new Date().toDateString() === date.toDateString();
                      
                      // Check if day is blocked
                      const block = blockedDates.find(b => {
                        const startParts = b.start_date.split('T')[0].split('-').map(Number);
                        const endParts = b.end_date.split('T')[0].split('-').map(Number);
                        const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
                        const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
                        
                        const check = new Date(date);
                        check.setHours(0,0,0,0);
                        return check >= start && check <= end;
                      });

                      const hasBooking = bookings.some(b => {
                        const bDate = new Date(b.booking_date);
                        return bDate.getUTCDate() === day && bDate.getUTCMonth() === month && bDate.getUTCFullYear() === year;
                      });

                      cells.push(
                        <button 
                          key={day}
                          onClick={() => setSelectedDate(date)}
                          className={`h-12 lg:h-16 rounded-2xl flex flex-col items-center justify-center transition-all border relative ${
                            isSelected 
                              ? 'bg-[var(--color-admin-accent)] border-[var(--color-admin-accent)] text-white shadow-md z-10 scale-105' 
                              : block
                                ? 'bg-red-50 border-red-200 text-red-600'
                                : isToday
                                  ? 'bg-[var(--color-admin-bg)] border-[var(--color-admin-accent)]/30 text-[var(--color-admin-accent)]'
                                  : 'bg-[var(--color-admin-bg)] border-[var(--color-admin-border)] text-slate-600 hover:border-slate-400'
                          }`}
                        >
                          <span className="text-[14px] font-bold">{day}</span>
                          {block && !isSelected && (
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1" />
                          )}
                          {hasBooking && !isSelected && !block && (
                            <div className="w-1.5 h-1.5 bg-[var(--color-admin-accent)] rounded-full mt-1 shadow-[0_0_8px_var(--color-admin-accent)]" />
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
                        const block = blockedDates.find(b => {
                          const startParts = b.start_date.split('T')[0].split('-').map(Number);
                          const endParts = b.end_date.split('T')[0].split('-').map(Number);
                          const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
                          const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
                          
                          const check = new Date(selectedDate);
                          check.setHours(0,0,0,0);
                          return check >= start && check <= end;
                        });

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
                              <p className="text-[12px] text-slate-400 mt-2">Acesse a aba "Horários" para definir a grade master.</p>
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
                                // ... (rest of booking logic stays same)
                                const colors = getSessionColor(bookingAtSlot.sessions?.name, bookingAtSlot.sessions?.theme_color);
                                return (
                                  <div 
                                    key={slot.id} 
                                    onClick={() => setSelectedBooking(bookingAtSlot)}
                                    className="group flex items-stretch gap-6 p-2 rounded-[1.5rem] transition-all hover:translate-x-2 cursor-pointer bg-white border border-[var(--color-admin-border)] shadow-sm"
                                  >
                                    <div className="w-24 flex flex-col items-center justify-center border-r border-[var(--color-admin-border)] pr-2">
                                      <span className="text-[16px] font-black text-[var(--color-admin-text)]">{slot.start_time.slice(0, 5)}</span>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Início</span>
                                    </div>
                                    
                                    <div 
                                      className="flex-1 p-4 rounded-2xl flex items-center justify-between"
                                      style={{ backgroundColor: colors.isCustom ? `${colors.styles?.color}15` : 'var(--color-admin-bg)' }}
                                    >
                                      <div className="flex items-center gap-4">
                                        <div 
                                          className="w-1.5 h-10 rounded-full" 
                                          style={{ backgroundColor: colors.isCustom ? colors.styles?.color : 'var(--color-admin-accent)' }}
                                        />
                                        <div>
                                          <h4 className="text-[15px] font-bold text-[var(--color-admin-text)] tracking-tight">
                                            {bookingAtSlot.customer_name || bookingAtSlot.client_name}
                                          </h4>
                                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            {bookingAtSlot.sessions?.name}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="text-right hidden sm:block">
                                        <div className="text-[12px] font-bold text-[var(--color-admin-text)]">
                                          {bookingAtSlot.status === 'confirmed' ? 'Confirmado' : bookingAtSlot.status === 'completed' ? 'Concluído' : 'Pendente'}
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
                                  className="flex items-center gap-6 p-4 rounded-[1.5rem] border border-dashed border-[var(--color-admin-border)] opacity-60 hover:opacity-100 transition-all"
                                >
                                   <div className="w-24 flex flex-col items-center justify-center border-r border-[var(--color-admin-border)] pr-2 border-dashed">
                                      <span className="text-[14px] font-bold text-slate-400">{slot.start_time.slice(0, 5)}</span>
                                    </div>
                                    <div className="flex-1 flex items-center justify-between">
                                      <span className="text-[12px] font-bold text-slate-300 uppercase tracking-[0.2em]">Horário Livre</span>
                                      <button 
                                        onClick={() => setIsManualBookingOpen(true)}
                                        className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-[var(--color-admin-accent)] hover:text-white transition-all shadow-sm"
                                      >
                                        <Plus size={16} />
                                      </button>
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
                    {Object.entries(financeData.byCategory).map(([name, data]: [string, any]) => {
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
                          onEdit={setSelectedBooking} 
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
            {activeTab === 'slots' && <StandardSlotsSection onEditingChange={setIsSectionEditing} />}
            {activeTab === 'sessions' && <SessionConfigSection onEditingChange={setIsSectionEditing} />}
            {activeTab === 'expenses' && <ExpensesConfig />}
            {activeTab === 'blocks' && <MassBlockingSection onEditingChange={setIsSectionEditing} />}
          </div>
        </div>
      </main>
    </div>
  );
}

function BookingList({ bookings, onEdit, isLoading }: { bookings: any[], onEdit: (b: any) => void, isLoading: boolean }) {
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
  const grouped = bookings.reduce((acc: Record<string, any[]>, b) => {
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
                          {booking.customer_name || booking.client_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                            {booking.sessions?.name}
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
        {React.cloneElement(icon as React.ReactElement<any>, { strokeWidth: active ? 2.5 : 2 })}
      </div>
      <span className="relative z-10">{label}</span>
      {active && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />}
    </button>
  );
}

function BottomNavItem({ active, onClick, icon, disabled }: { active: boolean, onClick: () => void, icon: React.ReactNode, disabled?: boolean }) {
  return (
    <button 
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all relative ${
        active ? 'text-[var(--color-admin-accent)]' : 'text-slate-400'
      } ${disabled ? 'opacity-20 pointer-events-none' : ''}`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: active ? 2.5 : 2 })}
      {active && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--color-admin-accent)] rounded-full shadow-[0_0_10px_var(--color-admin-accent)]" />}
    </button>
  );
}

function StatMetric({ label, value, icon, isPositive, trend }: { label: string, value: string | number, icon: React.ReactNode, isPositive?: boolean, trend: string }) {
  return (
    <div className="w-full bg-[var(--color-admin-surface)] p-6 lg:p-8 border border-[var(--color-admin-border)] rounded-2xl lg:rounded-[2.5rem] flex flex-col justify-between h-40 lg:h-48 transition-all shadow-sm relative overflow-hidden group">
      <div className="absolute -right-8 -top-8 p-12 opacity-5 rotate-12 group-hover:opacity-10 group-hover:rotate-0 transition-all duration-1000">
         {React.cloneElement(icon as React.ReactElement<any>, { size: 100, strokeWidth: 1 })}
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
