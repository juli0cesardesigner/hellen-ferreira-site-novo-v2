"use client";

import React, { useState } from "react";
import { LayoutDashboard, Clock, Calendar, Plus, Settings, ShieldCheck, RefreshCw, Database, ChevronRight, LogOut, Loader2, BarChart } from "lucide-react";
import { MassBlockingSection } from "@/components/admin/MassBlocking";
import { StandardSlotsSection } from "@/components/admin/StandardSlots";
import { SessionConfigSection } from "@/components/admin/SessionConfig";

import { getBookingsList, getAdminStats, getAllBookingsList } from "@/lib/actions/admin-actions";
import { logout } from "@/lib/actions/auth-actions";
import { ManualBookingModal } from "@/components/admin/ManualBooking";
import { EditBookingModal } from "@/components/admin/EditBookingModal";
import { AnimatePresence, motion } from "framer-motion";
import { getSessionColor } from "@/lib/utils/colors";

type TabType = 'overview' | 'slots' | 'sessions' | 'blocks' | 'history';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState({ todaySessions: 0, weekSessions: 0, totalRevenue: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'past' | 'future'>('all');

  async function loadData() {
    setIsLoading(true);
    try {
      const [statsData, bookingsData] = await Promise.all([
        getAdminStats(),
        activeTab === 'history' ? getAllBookingsList(historyFilter) : getBookingsList()
      ]);
      setStats(statsData);
      setBookings(bookingsData.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, [activeTab, historyFilter]);

  return (
    <div className="min-h-screen bg-[var(--color-admin-bg)] flex flex-col lg:flex-row antialiased pb-20 lg:pb-0 admin-scope selection:bg-[var(--color-admin-accent)]/30 text-[var(--color-admin-text)] relative overflow-hidden">
      
      {/* ─── Clean Backdrop ─── */}
      <div className="absolute inset-0 pointer-events-none z-[0] bg-gradient-to-tr from-[var(--color-admin-bg)] via-white/5 to-[var(--color-admin-bg)]" />

      {/* ─── Sidebar ─── */}
      <aside className="w-72 bg-[var(--color-admin-surface)] border-r border-[var(--color-admin-border)] flex flex-col hidden lg:flex shrink-0 relative z-20 shadow-sm">
        <div className="p-8 border-b border-[var(--color-admin-border)] flex items-center gap-5 relative">
          <div className="w-12 h-12 bg-[var(--color-admin-text)] text-[var(--color-admin-bg)] rounded-2xl flex items-center justify-center font-black text-lg shadow-sm">
            HF
          </div>
          <div>
            <h2 className="font-bold text-[16px] text-[var(--color-admin-text)] tracking-tight leading-none">Hellen Ferreira</h2>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Principal</div>
          
          <SidebarNavItem 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
          />
          <SidebarNavItem 
            active={activeTab === 'slots'} 
            onClick={() => setActiveTab('slots')} 
            icon={<Calendar size={20} />} 
            label="Agenda" 
          />
          <SidebarNavItem 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<Clock size={20} />} 
            label="Histórico" 
          />
          
          <div className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-10 mb-2">Configurações</div>
          
          <SidebarNavItem 
            active={activeTab === 'sessions'} 
            onClick={() => setActiveTab('sessions')} 
            icon={<Settings size={20} />} 
            label="Serviços" 
          />
          <SidebarNavItem 
            active={activeTab === 'blocks'} 
            onClick={() => setActiveTab('blocks')} 
            icon={<ShieldCheck size={20} />} 
            label="Segurança" 
          />
        </nav>

        <div className="p-6 border-t border-[var(--color-admin-border)] bg-[var(--color-admin-bg)]/50">
          <button 
            onClick={() => logout()}
            className="flex items-center gap-4 w-full px-5 py-4 text-slate-400 transition-all rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] group border border-[var(--color-admin-border)]/50"
          >
            <LogOut size={18} /> 
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* ─── Bottom Nav Mobile ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-admin-surface)]/90 backdrop-blur-xl border-t border-[var(--color-admin-border)] px-4 pt-2 pb-safe-bottom flex items-center justify-between z-50 shadow-lg">
        <BottomNavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={22} />} />
        <BottomNavItem active={activeTab === 'slots'} onClick={() => setActiveTab('slots')} icon={<Calendar size={22} />} />
        <button 
          onClick={() => setIsManualBookingOpen(true)} 
          className="w-16 h-16 bg-[var(--color-admin-accent)] text-white rounded-[2rem] flex items-center justify-center -mt-12 shadow-lg active:scale-90 transition-all border-[6px] border-[var(--color-admin-bg)]"
          aria-label="Nova reserva"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
        <BottomNavItem active={activeTab === 'blocks'} onClick={() => setActiveTab('blocks')} icon={<ShieldCheck size={22} />} />
        <BottomNavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Clock size={22} />} />
      </div>

      {/* ─── Main Content Industrial ─── */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Header */}
        <header className="h-20 lg:h-24 bg-[var(--color-admin-surface)]/80 backdrop-blur-md border-b border-[var(--color-admin-border)] flex items-center justify-between px-5 lg:px-14 shrink-0 relative">
          <div className="flex items-center gap-6">
            <div className="lg:hidden w-10 h-10 bg-[var(--color-admin-text)] rounded-xl flex items-center justify-center text-[var(--color-admin-bg)] font-black">HF</div>
            <div>
              <h1 className="text-[18px] lg:text-[24px] font-black text-[var(--color-admin-text)] uppercase tracking-tighter flex items-center gap-4">
                <span className="w-3 h-3 bg-[var(--color-admin-accent)] rounded-full animate-pulse shadow-[0_0_15px_var(--color-admin-accent)]" />
                {activeTab === 'overview' && "Dashboard"}
                {activeTab === 'slots' && "Agenda de Horários"}
                {activeTab === 'history' && "Histórico de Reservas"}
                {activeTab === 'sessions' && "Serviços e Preços"}
                {activeTab === 'blocks' && "Bloqueios de Agenda"}
              </h1>
              <p className="hidden sm:block text-[11px] font-medium text-[var(--color-admin-text-muted)] mt-1">Gerenciamento administrativo do estúdio</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={loadData}
              className="w-12 h-12 flex items-center justify-center bg-[var(--color-admin-bg)] text-slate-400 rounded-2xl transition-all border border-[var(--color-admin-border)] active:scale-90 shadow-sm"
              title="Sincronizar"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin text-[var(--color-admin-accent)]" : ""} />
            </button>

            <button 
              onClick={() => setIsManualBookingOpen(true)}
              className="hidden lg:flex bg-[var(--color-admin-accent)] text-white text-[11px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl items-center gap-3 transition-all shadow-md active:scale-95 group"
            >
              <Plus size={18} strokeWidth={3} /> 
              Novo Agendamento
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-14 custom-scrollbar bg-[var(--color-admin-bg)]">
          
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
                onUpdated={loadData}
              />
            )}
          </AnimatePresence>

          {activeTab === 'overview' && (
            <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
              
              {/* Metrics Grid - Technical High Density */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8">
                <StatMetric label="Sessões Hoje" value={isLoading ? "---" : stats.todaySessions} icon={<BarChart size={24} />} trend="Hoje" />
                <StatMetric label="Sessões na Semana" value={isLoading ? "---" : stats.weekSessions} icon={<Calendar size={24} />} trend="7 dias" />
                <StatMetric 
                  label="Faturamento Mensal" 
                  value={isLoading ? "---" : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)} 
                  isPositive 
                  icon={<Database size={24} />}
                  trend="Mensal"
                />
              </div>

              {/* Bookings Data Grid */}
              <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] overflow-hidden shadow-sm relative">
                <div className="px-10 py-8 border-b border-[var(--color-admin-border)] bg-[var(--color-admin-bg)]/30 flex items-center justify-between relative z-10">
                  <div>
                     <h3 className="text-[15px] font-bold text-[var(--color-admin-text)] tracking-tight flex items-center gap-3">
                       <div className="w-1 h-5 bg-[var(--color-admin-accent)] rounded-full" /> 
                       Próximos Agendamentos
                    </h3>
                    <p className="text-[12px] font-medium text-[var(--color-admin-text-muted)] mt-1 ml-4">Gerenciando {bookings.length} registros ativos</p>
                  </div>
                   <button onClick={loadData} className="px-5 py-2.5 bg-[var(--color-admin-surface)] rounded-xl text-[12px] font-bold text-[var(--color-admin-text)] flex items-center gap-2 transition-all border border-[var(--color-admin-border)] shadow-sm">
                    <Clock size={16} /> Atualizar
                  </button>
                </div>
                <div className="p-4 relative z-10">
                   <BookingTable bookings={bookings} onEdit={setSelectedBooking} isLoading={isLoading} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
               <div className="flex items-center gap-8 bg-[var(--color-admin-surface)] p-12 rounded-[2.5rem] border border-[var(--color-admin-border)] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Clock size={120} />
                  </div>
                  <div className="w-20 h-20 bg-[var(--color-admin-bg)] text-[var(--color-admin-accent)] rounded-[1.5rem] flex items-center justify-center border border-[var(--color-admin-border)] shadow-inner">
                    <Clock size={40} strokeWidth={2.5} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-[28px] font-bold text-[var(--color-admin-text)] tracking-tight leading-none">Dados & Listagem</h3>
                    <div className="flex gap-2 mt-4">
                      {(['all', 'past', 'future'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setHistoryFilter(f)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border ${
                            historyFilter === f 
                              ? 'bg-[var(--color-admin-accent)] text-white border-[var(--color-admin-accent)]' 
                              : 'bg-[var(--color-admin-bg)] text-slate-500 border-[var(--color-admin-border)]'
                          }`}
                        >
                          {f === 'all' ? 'Tudo' : f === 'past' ? 'Passados' : 'Futuros'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={loadData} className="ml-auto bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] px-8 py-4 rounded-2xl text-[12px] font-bold text-[var(--color-admin-text)] transition-all shadow-sm active:scale-95 relative z-10">
                    Sincronizar
                  </button>
               </div>
               
               <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] overflow-hidden shadow-sm">
                 <div className="p-4">
                    <BookingTable bookings={bookings} onEdit={setSelectedBooking} isLoading={isLoading} />
                 </div>
               </div>
            </div>
          )}

          <div className="max-w-[1600px] mx-auto pb-20">
            {activeTab === 'slots' && <StandardSlotsSection />}
            {activeTab === 'sessions' && <SessionConfigSection />}
            {activeTab === 'blocks' && <MassBlockingSection />}
          </div>
        </div>
      </main>
    </div>
  );
}

function BookingTable({ bookings, onEdit, isLoading }: { bookings: any[], onEdit: (b: any) => void, isLoading: boolean }) {
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

  return (
    <>
      <div className="hidden lg:block overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-4 px-6">
          <thead>
            <tr className="text-[12px] font-bold text-slate-500 tracking-tight">
              <th className="px-8 py-5">Data/Hora</th>
              <th className="px-8 py-5">Cliente</th>
              <th className="px-8 py-5">Serviço</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Valor</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const colors = getSessionColor(booking.sessions?.name, booking.sessions?.theme_color);
              return (
                <tr 
                  key={booking.id} 
                  className="transition-all"
                >
                  <td className="px-8 py-7 bg-[var(--color-admin-bg)]/50 rounded-l-[1.5rem] border-y border-l border-[var(--color-admin-border)] transition-all duration-300">
                    <div className="text-[15px] font-bold text-[var(--color-admin-text)]">
                       {new Date(booking.booking_date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-[12px] text-[var(--color-admin-text-muted)] font-medium mt-1">
                       {booking.start_time.slice(0, 5)}h
                    </div>
                  </td>
                  <td className="px-8 py-7 bg-[var(--color-admin-bg)]/50 border-y border-[var(--color-admin-border)] transition-all duration-300">
                    <div className="text-[14px] font-bold text-[var(--color-admin-text)] tracking-tight">{booking.customer_name || booking.client_name}</div>
                    <div className="text-[11px] text-[var(--color-admin-text-muted)] mt-1 font-medium italic">ref: {booking.id.split('-')[0]}</div>
                  </td>
                  <td className="px-8 py-7 bg-[var(--color-admin-bg)]/50 border-y border-[var(--color-admin-border)] transition-all duration-300">
                    <span 
                      className="text-[11px] font-bold px-4 py-2 rounded-lg border bg-[var(--color-admin-surface)] inline-block"
                      style={{ 
                        color: colors.isCustom ? colors.styles?.color : undefined, 
                        borderColor: colors.isCustom ? colors.styles?.borderColor : undefined 
                      }}
                    >
                      {booking.sessions?.name}
                    </span>
                  </td>
                  <td className="px-8 py-7 bg-[var(--color-admin-bg)]/50 border-y border-[var(--color-admin-border)] transition-all duration-300">
                    <div className="flex items-center gap-4">
                       <div className={`w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] ${
                        (booking.status === 'confirmed' || booking.status === 'completed') ? 'text-emerald-500 bg-emerald-500' : 
                        booking.status === 'pending' ? 'text-amber-500 bg-amber-500' : 'text-red-500 bg-red-500'
                      }`} />
                      <span className={`text-[11px] font-bold ${
                        (booking.status === 'confirmed' || booking.status === 'completed') ? 'text-emerald-500' : 
                        booking.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                      }`}>
                         {(booking.status === 'confirmed' || booking.status === 'completed') ? (booking.status === 'completed' ? 'Concluído' : 'Confirmado') : booking.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-7 bg-[var(--color-admin-bg)]/50 border-y border-[var(--color-admin-border)] text-right transition-all duration-300">
                    <span className="text-[16px] font-bold text-[var(--color-admin-text)]">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.paid_amount)}
                    </span>
                  </td>
                  <td className="px-8 py-7 bg-[var(--color-admin-bg)]/50 rounded-r-[1.5rem] border-y border-r border-[var(--color-admin-border)] text-right transition-all duration-300">
                    <button 
                      onClick={() => onEdit(booking)}
                      className="w-12 h-12 rounded-2xl bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-slate-400 flex items-center justify-center transition-all ml-auto shadow-sm active:scale-90"
                    >
                      <Settings size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-6 px-4 pb-20">
        {bookings.map((booking) => {
          const colors = getSessionColor(booking.sessions?.name, booking.sessions?.theme_color);
          return (
            <div 
              key={booking.id} 
              onClick={() => onEdit(booking)}
              className="p-8 bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2rem] relative cursor-pointer active:scale-[0.98] transition-all shadow-sm overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-admin-accent)]/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 active:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[12px] font-bold text-[var(--color-admin-text-muted)]">{new Date(booking.booking_date).toLocaleDateString('pt-BR')}</span>
                  <span className="text-[18px] font-bold text-[var(--color-admin-text)] tracking-tight leading-tight">{booking.customer_name || booking.client_name}</span>
                </div>
                <div className="bg-[var(--color-admin-bg)] px-4 py-2 rounded-xl border border-[var(--color-admin-border)] text-[13px] font-bold text-[var(--color-admin-text)]">
                  {booking.start_time.slice(0, 5)}h
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--color-admin-border)]">
                   <span 
                  className="text-[11px] font-bold px-4 py-2 rounded-lg border bg-[var(--color-admin-surface)]"
                  style={{ 
                    color: colors.isCustom ? colors.styles?.color : undefined, 
                    borderColor: colors.isCustom ? colors.styles?.borderColor : undefined 
                  }}
                >
                  {booking.sessions?.name}
                </span>
                <div className="flex items-center gap-4">
                   <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ${
                      (booking.status === 'confirmed' || booking.status === 'completed') ? 'text-emerald-500 bg-emerald-500' : 
                      booking.status === 'pending' ? 'text-amber-500 bg-amber-500' : 'text-red-500 bg-red-500'
                    }`} />
                    <span className="text-[16px] font-bold text-[var(--color-admin-text)]">
                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.paid_amount)}
                   </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function SidebarNavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-[14px] font-bold relative overflow-hidden border-2 ${
        active 
          ? 'bg-[var(--color-admin-accent)] border-[var(--color-admin-accent)] text-white shadow-md scale-[1.02]' 
          : 'text-slate-500 bg-transparent border-transparent'
      }`}
    >
      <div className={`${active ? 'text-white' : 'text-slate-400'} transition-colors`}>
        {React.cloneElement(icon as React.ReactElement<any>, { strokeWidth: active ? 2.5 : 2 })}
      </div>
      <span className="relative z-10">{label}</span>
      {active && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />}
    </button>
  );
}

function BottomNavItem({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-2xl transition-all relative ${
        active ? 'text-[var(--color-admin-accent)]' : 'text-slate-400'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: active ? 3 : 2 })}
      {active && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--color-admin-accent)] rounded-full shadow-[0_0_10px_var(--color-admin-accent)]" />}
    </button>
  );
}

function StatMetric({ label, value, icon, isPositive, trend }: { label: string, value: string | number, icon: React.ReactNode, isPositive?: boolean, trend: string }) {
  return (
    <div className="bg-[var(--color-admin-surface)] p-6 lg:p-8 border border-[var(--color-admin-border)] rounded-3xl lg:rounded-[2.5rem] flex flex-col justify-between h-40 lg:h-48 transition-all shadow-sm relative overflow-hidden">
      <div className="absolute -right-8 -top-8 p-12 opacity-5 rotate-12 duration-1000">
         {React.cloneElement(icon as React.ReactElement<any>, { size: 100, strokeWidth: 1 })}
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
           <p className="text-[13px] font-bold text-[var(--color-admin-text-muted)] capitalize">{label}</p>
           <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[var(--color-admin-bg)] border ${isPositive ? 'text-emerald-500 border-emerald-500/20' : 'text-slate-500 border-[var(--color-admin-border)]'}`}>
                {trend}
              </span>
           </div>
        </div>
      </div>
      <h4 className="text-4xl font-bold tracking-tight text-[var(--color-admin-text)] relative z-10">
        {value}
      </h4>
    </div>
  );
}
