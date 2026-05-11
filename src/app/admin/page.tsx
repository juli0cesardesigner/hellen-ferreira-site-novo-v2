"use client";

import React, { useState } from "react";
import { LayoutDashboard, Clock, Calendar, Plus, Settings, ShieldCheck, Activity, Database, ChevronRight, LogOut, Loader2 } from "lucide-react";
import { MassBlockingSection } from "@/components/admin/MassBlocking";
import { StandardSlotsSection } from "@/components/admin/StandardSlots";
import { SessionConfigSection } from "@/components/admin/SessionConfig";

import { getBookingsList, getAdminStats, getPastBookingsList } from "@/lib/actions/admin-actions";
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

  async function loadData() {
    setIsLoading(true);
    try {
      const [statsData, bookingsData] = await Promise.all([
        getAdminStats(),
        activeTab === 'history' ? getPastBookingsList() : getBookingsList()
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
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[var(--color-admin-bg)] flex flex-col lg:flex-row antialiased pb-20 lg:pb-0" style={{ fontFamily: 'var(--font-admin)' }}>
      
      {/* ─── Sidebar ─── */}
      <aside className="w-60 bg-[var(--color-admin-accent)] flex flex-col hidden lg:flex shrink-0">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center text-white/90 text-[11px] font-semibold tracking-tight">
            HF
          </div>
          <div>
            <h2 className="font-semibold text-[13px] text-white/90 tracking-tight">Admin Panel</h2>
            <p className="text-[10px] text-white/40 font-medium mt-0.5">Hellen Ferreira</p>
          </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-0.5">
          <div className="px-3 py-2 text-[10px] font-medium text-white/30 uppercase tracking-widest mb-1">Painel</div>
          <SidebarNavItem 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            icon={<LayoutDashboard size={16} />} 
            label="Visão Geral" 
          />
          <SidebarNavItem 
            active={activeTab === 'slots'} 
            onClick={() => setActiveTab('slots')} 
            icon={<Calendar size={16} />} 
            label="Agenda" 
          />
          <SidebarNavItem 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<Clock size={16} />} 
            label="Histórico" 
          />
          
          <div className="px-3 py-2 text-[10px] font-medium text-white/30 uppercase tracking-widest mt-5 mb-1">Sistema</div>
          <SidebarNavItem 
            active={activeTab === 'sessions'} 
            onClick={() => setActiveTab('sessions')} 
            icon={<Settings size={16} />} 
            label="Serviços" 
          />
          <SidebarNavItem 
            active={activeTab === 'blocks'} 
            onClick={() => setActiveTab('blocks')} 
            icon={<ShieldCheck size={16} />} 
            label="Bloqueios" 
          />
        </nav>

        <div className="p-3 border-t border-white/10">
          <button 
            onClick={() => logout()}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-white/40 hover:text-red-400 hover:bg-white/5 transition-all rounded-md text-[11px] font-medium"
          >
            <LogOut size={14} /> <span>Encerrar sessão</span>
          </button>
        </div>
      </aside>

      {/* ─── Bottom Nav Mobile ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-admin-accent)] px-4 pt-2 pb-safe-bottom flex items-center justify-between z-50">
        <BottomNavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={20} />} />
        <BottomNavItem active={activeTab === 'slots'} onClick={() => setActiveTab('slots')} icon={<Calendar size={20} />} />
        <button 
          onClick={() => setIsManualBookingOpen(true)} 
          className="w-12 h-12 bg-white text-[var(--color-admin-accent)] rounded-lg flex items-center justify-center -mt-8 shadow-lg active:scale-95 transition-all"
          aria-label="Nova reserva"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
        <BottomNavItem active={activeTab === 'blocks'} onClick={() => setActiveTab('blocks')} icon={<ShieldCheck size={20} />} />
        <BottomNavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Clock size={20} />} />
      </div>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-14 lg:h-16 bg-[var(--color-admin-surface)] border-b border-[var(--color-admin-border)] flex items-center justify-between px-4 lg:px-6 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-7 h-7 bg-[var(--color-admin-accent)] rounded-md flex items-center justify-center text-white text-[10px] font-semibold">HF</div>
            <h1 className="text-[13px] font-semibold text-[var(--color-admin-text)] tracking-tight">
              {activeTab === 'overview' && "Visão Geral"}
              {activeTab === 'slots' && "Agenda"}
              {activeTab === 'history' && "Histórico"}
              {activeTab === 'sessions' && "Serviços"}
              {activeTab === 'blocks' && "Bloqueios"}
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded-md border border-emerald-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Operacional
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={loadData}
              className="p-2 text-[var(--color-admin-text-muted)] hover:text-[var(--color-admin-text)] hover:bg-slate-100 rounded-md transition-colors"
              title="Atualizar dados"
              aria-label="Atualizar dados"
            >
              <Activity size={16} />
            </button>
            <button 
              onClick={() => setIsManualBookingOpen(true)}
              className="hidden lg:flex bg-[var(--color-admin-accent)] hover:bg-[var(--color-admin-accent-hover)] text-white text-[11px] font-medium px-4 py-2 rounded-md items-center gap-2 transition-colors"
            >
              <Plus size={14} /> Nova Reserva
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          
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
            <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatMetric label="Hoje" value={isLoading ? "..." : stats.todaySessions} icon={<Activity size={16} />} />
                <StatMetric label="Próximos 7 dias" value={isLoading ? "..." : stats.weekSessions} icon={<Calendar size={16} />} />
                <StatMetric 
                  label="Receita confirmada" 
                  value={isLoading ? "..." : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)} 
                  isPositive 
                  icon={<Database size={16} />}
                />
              </div>

              {/* Bookings Table */}
              <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-lg overflow-hidden">
                <div className="px-4 lg:px-5 py-3 border-b border-[var(--color-admin-border)] flex items-center justify-between">
                  <h3 className="text-[12px] font-semibold text-[var(--color-admin-text)] flex items-center gap-2">
                     <Database size={13} className="text-[var(--color-admin-text-muted)]" /> Agendamentos
                  </h3>
                  <button onClick={loadData} className="text-[11px] font-medium text-[var(--color-admin-info)] hover:text-blue-700 flex items-center gap-1.5 transition-colors">
                    <Clock size={12} /> Atualizar
                  </button>
                </div>
                <BookingTable bookings={bookings} onEdit={setSelectedBooking} isLoading={isLoading} />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="flex items-center gap-3 bg-[var(--color-admin-surface)] p-4 rounded-lg border border-[var(--color-admin-border)]">
                  <div className="w-10 h-10 bg-[var(--color-admin-accent)] text-white rounded-md flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-[var(--color-admin-text)]">Histórico de Sessões</h3>
                    <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium mt-0.5">Todos os atendimentos passados</p>
                  </div>
                  <button onClick={loadData} className="ml-auto text-[11px] font-medium text-[var(--color-admin-text-muted)] hover:text-[var(--color-admin-text)] flex items-center gap-1.5 transition-colors">
                    <Activity size={12} /> Atualizar
                  </button>
               </div>
               
               <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-lg overflow-hidden">
                 <BookingTable bookings={bookings} onEdit={setSelectedBooking} isLoading={isLoading} />
               </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto pb-10">
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
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-slate-300" size={28} />
        <p className="text-[11px] font-medium text-[var(--color-admin-text-muted)]">Carregando dados...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[11px] font-medium text-[var(--color-admin-text-muted)]">Nenhum registro encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-medium text-[var(--color-admin-text-muted)] border-b border-[var(--color-admin-border)] bg-slate-50/50">
              <th className="px-5 py-3 font-medium">Data / Hora</th>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Sessão</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Valor</th>
              <th className="px-5 py-3 text-right font-medium">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => {
              const colors = getSessionColor(booking.sessions?.name, booking.sessions?.theme_color);
              return (
                <tr 
                  key={booking.id} 
                  style={colors.isCustom ? { backgroundColor: colors.styles?.backgroundColor } : {}}
                  className={`transition-colors hover:bg-slate-50 group ${!colors.isCustom ? colors.bg : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="text-[12px] font-semibold text-[var(--color-admin-text)]">{new Date(booking.booking_date).toLocaleDateString('pt-BR')}</div>
                    <div className="text-[11px] text-[var(--color-admin-text-muted)] mt-0.5 font-mono">{booking.start_time.slice(0, 5)}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-[12px] font-medium text-[var(--color-admin-text-secondary)]">{booking.customer_name || booking.client_name}</div>
                    <div className="text-[11px] text-[var(--color-admin-text-muted)] font-mono mt-0.5">{booking.customer_phone || booking.client_phone}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span 
                      style={colors.isCustom ? { color: colors.styles?.color, borderColor: colors.styles?.borderColor } : {}}
                      className={`text-[10px] font-medium px-2 py-1 rounded-md border bg-white ${!colors.isCustom ? `${colors.text} ${colors.border}` : ''}`}
                    >
                      {booking.sessions?.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-emerald-500' : 
                        booking.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className={`text-[11px] font-medium ${
                        booking.status === 'confirmed' ? 'text-emerald-700' : 
                        booking.status === 'pending' ? 'text-amber-700' : 'text-red-700'
                      }`}>
                         {booking.status === 'confirmed' ? 'Confirmado' : booking.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-[12px] font-mono font-semibold text-[var(--color-admin-text)]">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.paid_amount)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button 
                      onClick={() => onEdit(booking)}
                      className="w-7 h-7 rounded-md bg-transparent text-[var(--color-admin-text-muted)] hover:bg-[var(--color-admin-accent)] hover:text-white flex items-center justify-center transition-all ml-auto"
                      aria-label={`Editar reserva de ${booking.customer_name || booking.client_name}`}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden divide-y divide-slate-100">
        {bookings.map((booking) => {
          const colors = getSessionColor(booking.sessions?.name, booking.sessions?.theme_color);
          return (
            <div 
              key={booking.id} 
              onClick={() => onEdit(booking)}
              style={colors.isCustom ? { backgroundColor: colors.styles?.backgroundColor } : {}}
              className={`p-4 active:bg-slate-50 transition-all flex flex-col gap-2.5 relative cursor-pointer ${!colors.isCustom ? colors.bg : ''}`}
            >
              <div 
                style={colors.isCustom ? { backgroundColor: colors.styles?.accentColor } : {}}
                className={`absolute left-0 top-0 bottom-0 w-0.5 ${!colors.isCustom ? colors.accent : ''}`} 
              />
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-[var(--color-admin-text-muted)]">{new Date(booking.booking_date).toLocaleDateString('pt-BR')}</span>
                  <span className="text-[12px] font-semibold text-[var(--color-admin-text)]">{booking.customer_name || booking.client_name}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md text-[10px] font-medium text-[var(--color-admin-text-secondary)] border border-slate-200">
                  <Clock size={10} /> {booking.start_time.slice(0, 5)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span 
                  style={colors.isCustom ? { color: colors.styles?.color, borderColor: colors.styles?.borderColor } : {}}
                  className={`text-[9px] font-medium px-2 py-0.5 rounded-md border bg-white ${!colors.isCustom ? `${colors.text} ${colors.border}` : ''}`}
                >
                  {booking.sessions?.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-emerald-500' : 
                    booking.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <span className="text-[10px] font-medium text-[var(--color-admin-text-secondary)]">
                    {booking.status === 'confirmed' ? 'Confirmado' : booking.status === 'pending' ? 'Pendente' : 'Cancelado'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                 <span className="text-[11px] font-mono font-semibold text-[var(--color-admin-text)]">
                   {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.paid_amount)}
                 </span>
                 <ChevronRight size={14} className="text-slate-300" />
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
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md transition-all text-[12px] font-medium group ${
        active 
          ? 'bg-white/10 text-white' 
          : 'text-white/50 hover:bg-white/5 hover:text-white/80'
      }`}
    >
      <div className={`${active ? 'text-white' : 'text-white/40 group-hover:text-white/80'} transition-colors`}>
        {icon}
      </div>
      <span>{label}</span>
    </button>
  );
}

function BottomNavItem({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-md transition-all ${
        active ? 'bg-white/15 text-white' : 'text-white/40'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { size: 22 })}
    </button>
  );
}

function StatMetric({ label, value, icon, isPositive }: { label: string, value: string | number, icon: React.ReactNode, isPositive?: boolean }) {
  return (
    <div className="bg-[var(--color-admin-surface)] p-4 lg:p-5 border border-[var(--color-admin-border)] rounded-lg flex flex-col justify-between h-28 lg:h-32 hover:border-[var(--color-admin-border-hover)] transition-all group">
      <div className="flex justify-between items-start">
        <p className="text-[11px] font-medium text-[var(--color-admin-text-muted)] leading-none">{label}</p>
        <div className={`p-1.5 rounded-md bg-slate-50 text-[var(--color-admin-text-muted)] border border-slate-100 group-hover:bg-[var(--color-admin-accent)] group-hover:text-white group-hover:border-[var(--color-admin-accent)] transition-all ${isPositive ? 'text-[var(--color-admin-info)]' : ''}`}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 14 })}
        </div>
      </div>
      <h4 className="text-xl lg:text-2xl font-semibold tracking-tight text-[var(--color-admin-text)]">
        {value}
      </h4>
    </div>
  );
}
