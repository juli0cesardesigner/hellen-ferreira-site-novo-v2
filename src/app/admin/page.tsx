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
    <div className="min-h-screen bg-zinc-50 flex flex-col lg:flex-row font-sans text-zinc-900 antialiased pb-20 lg:pb-0">
      
      {/* Sidebar Industrial & Objetiva (Desktop) */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col hidden lg:flex shrink-0">
        <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm ring-4 ring-zinc-50">
            HF
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight text-zinc-900">Portal de Gestão</h2>
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mt-0.5">Sistema Online</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Painel Principal</div>
          <SidebarNavItem 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            icon={<LayoutDashboard size={18} />} 
            label="Visão Geral" 
          />
          <SidebarNavItem 
            active={activeTab === 'slots'} 
            onClick={() => setActiveTab('slots')} 
            icon={<Calendar size={18} />} 
            label="Agenda" 
          />
          <SidebarNavItem 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<Clock size={18} />} 
            label="Histórico" 
          />
          
          <div className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-6 mb-2">Configurações</div>
          <SidebarNavItem 
            active={activeTab === 'sessions'} 
            onClick={() => setActiveTab('sessions')} 
            icon={<Settings size={18} />} 
            label="Serviços" 
          />
          <SidebarNavItem 
            active={activeTab === 'blocks'} 
            onClick={() => setActiveTab('blocks')} 
            icon={<ShieldCheck size={18} />} 
            label="Bloqueios" 
          />
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-lg text-[11px] font-bold uppercase tracking-wider"
          >
            <LogOut size={16} /> <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Bottom Nav - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-3 flex items-center justify-between z-50">
        <BottomNavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={22} />} />
        <BottomNavItem active={activeTab === 'slots'} onClick={() => setActiveTab('slots')} icon={<Calendar size={22} />} />
        <button 
          onClick={() => setIsManualBookingOpen(true)} 
          className="w-14 h-14 bg-zinc-900 text-white rounded-full flex items-center justify-center -mt-10 shadow-2xl border-4 border-zinc-50 active:scale-90 transition-all"
        >
          <Plus size={28} />
        </button>
        <BottomNavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Clock size={22} />} />
        <BottomNavItem active={activeTab === 'sessions'} onClick={() => setActiveTab('sessions')} icon={<Settings size={22} />} />
      </div>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header - Industrial Clean */}
        <header className="h-16 lg:h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-6 lg:px-8 shrink-0 relative z-10">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="lg:hidden w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">HF</div>
            <h1 className="text-[11px] lg:text-sm font-bold text-zinc-900 uppercase tracking-tight truncate max-w-[140px] lg:max-w-none">
              {activeTab === 'overview' && "Visão Geral"}
              {activeTab === 'slots' && "Agenda"}
              {activeTab === 'history' && "Histórico de Reservas"}
              {activeTab === 'sessions' && "Serviços"}
              {activeTab === 'blocks' && "Bloqueios"}
            </h1>
            <div className="h-4 w-[1px] bg-zinc-200 mx-1 hidden lg:block"></div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[9px] font-bold rounded uppercase tracking-wider border border-green-100 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={loadData}
              className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
              title="Atualizar Dados"
            >
              <Activity size={18} />
            </button>
            <button 
              onClick={() => setIsManualBookingOpen(true)}
              className="hidden lg:flex bg-zinc-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl items-center gap-2 transition-all shadow-md active:translate-y-0.5"
            >
              <Plus size={14} /> Nova Reserva
            </button>
          </div>
        </header>

        {/* Explorador de Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-zinc-50/50">
          
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
            <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* Grid de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <StatMetric label="Agendamentos (Hoje)" value={isLoading ? "..." : stats.todaySessions} icon={<Activity size={20} />} />
                <StatMetric label="Próximos 7 Dias" value={isLoading ? "..." : stats.weekSessions} icon={<Calendar size={20} />} />
                <StatMetric 
                  label="Total Confirmado" 
                  value={isLoading ? "..." : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)} 
                  isPositive 
                  icon={<Database size={20} />}
                />
              </div>

              {/* Tabela / Mobile Feed */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 lg:px-6 py-4 lg:py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
                  <h3 className="text-[10px] lg:text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                     <Database size={14} className="text-zinc-400" /> Fluxo de Agendamentos
                  </h3>
                  <button onClick={loadData} className="text-[9px] lg:text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all">
                    <Clock size={12} /> <span className="hidden sm:inline">Atualizar</span>
                  </button>
                </div>
                <BookingTable bookings={bookings} onEdit={setSelectedBooking} isLoading={isLoading} />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-zinc-200">
                  <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 uppercase">Histórico de Sessões</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Listagem de todos os atendimentos passados</p>
                  </div>
                  <button onClick={loadData} className="ml-auto text-[10px] font-bold text-zinc-400 hover:text-zinc-900 flex items-center gap-2">
                    <Activity size={12} /> Atualizar
                  </button>
               </div>
               
               <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
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
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-zinc-200" size={32} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Carregando...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Nenhum dado encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-100">
              <th className="px-6 py-4">Data/Hora</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Sessão</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {bookings.map((booking) => {
              const colors = getSessionColor(booking.sessions?.name, booking.sessions?.theme_color);
              return (
                <tr 
                  key={booking.id} 
                  style={colors.isCustom ? { backgroundColor: colors.styles?.backgroundColor } : {}}
                  className={`transition-colors group border-b border-zinc-100/50 ${!colors.isCustom ? colors.bg : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-zinc-900">{new Date(booking.booking_date).toLocaleDateString('pt-BR')}</div>
                    <div className="text-[10px] font-bold text-zinc-400 mt-0.5 font-mono">{booking.start_time.slice(0, 5)} HRS</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-zinc-700">{booking.customer_name || booking.client_name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono tracking-tight mt-0.5">{booking.customer_phone || booking.client_phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      style={colors.isCustom ? { color: colors.styles?.color, borderColor: colors.styles?.borderColor } : {}}
                      className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border shadow-sm bg-white ${!colors.isCustom ? `${colors.text} ${colors.border}` : ''}`}
                    >
                      {booking.sessions?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-500' : 
                        booking.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === 'confirmed' ? 'text-green-700' : 
                        booking.status === 'pending' ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                         {booking.status === 'confirmed' ? 'Confirmado' : booking.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-mono font-bold text-zinc-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.paid_amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onEdit(booking)}
                      className={`w-8 h-8 rounded-lg bg-white/50 text-zinc-400 hover:bg-zinc-900 hover:text-white flex items-center justify-center transition-all ml-auto shadow-sm border border-black/5`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden divide-y divide-zinc-100">
        {bookings.map((booking) => {
          const colors = getSessionColor(booking.sessions?.name, booking.sessions?.theme_color);
          return (
            <div 
              key={booking.id} 
              onClick={() => onEdit(booking)}
              style={colors.isCustom ? { backgroundColor: colors.styles?.backgroundColor } : {}}
              className={`p-5 active:opacity-80 transition-all flex flex-col gap-3 relative border-b border-zinc-100 ${!colors.isCustom ? colors.bg : ''}`}
            >
              <div 
                style={colors.isCustom ? { backgroundColor: colors.styles?.accentColor } : {}}
                className={`absolute left-0 top-0 bottom-0 w-1 ${!colors.isCustom ? colors.accent : ''}`} 
              />
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{new Date(booking.booking_date).toLocaleDateString('pt-BR')}</span>
                  <span className="text-xs font-bold text-zinc-900 uppercase">{booking.customer_name || booking.client_name}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 rounded text-[9px] font-bold text-zinc-600 border border-zinc-200">
                  <Clock size={10} /> {booking.start_time.slice(0, 5)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span 
                  style={colors.isCustom ? { color: colors.styles?.color, borderColor: colors.styles?.borderColor } : {}}
                  className={`text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest bg-white ${!colors.isCustom ? `${colors.text} ${colors.border}` : ''}`}
                >
                  {booking.sessions?.name}
                </span>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-500' : 
                    booking.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">
                    {booking.status === 'confirmed' ? 'Confirmado' : booking.status === 'pending' ? 'Pendente' : 'Cancelado'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1 pt-3 border-t border-zinc-50">
                 <span className="text-[11px] font-mono font-bold text-zinc-900">
                   {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.paid_amount)}
                 </span>
                 <ChevronRight size={14} className="text-zinc-300" />
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
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider group ${
        active 
          ? 'bg-zinc-900 text-white shadow-lg' 
          : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900'
      }`}
    >
      <div className={`${active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'} transition-colors`}>
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
      className={`p-3.5 rounded-2xl transition-all ${
        active ? 'bg-zinc-900 text-white shadow-xl scale-110' : 'text-zinc-400'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
    </button>
  );
}

function StatMetric({ label, value, icon, isPositive }: { label: string, value: string | number, icon: React.ReactNode, isPositive?: boolean }) {
  return (
    <div className="bg-white p-5 lg:p-6 border border-zinc-200 rounded-2xl shadow-sm flex flex-col justify-between h-32 lg:h-36 hover:border-zinc-300 transition-all group">
      <div className="flex justify-between items-start">
        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] leading-none group-hover:text-zinc-600 transition-colors">{label}</p>
        <div className={`p-2 lg:p-2.5 rounded-xl bg-zinc-50 text-zinc-400 border border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-all ${isPositive ? 'text-blue-500' : ''}`}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
        </div>
      </div>
      <h4 className={`text-xl lg:text-2xl font-bold tracking-tighter text-zinc-900`}>
        {value}
      </h4>
    </div>
  );
}
