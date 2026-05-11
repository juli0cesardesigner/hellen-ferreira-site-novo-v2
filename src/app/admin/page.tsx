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
    <div className="min-h-screen bg-black flex flex-col lg:flex-row antialiased pb-20 lg:pb-0 font-sans selection:bg-[var(--color-admin-accent)]/30 text-white relative overflow-hidden">
      
      {/* ─── CRT/Scanline Overlay ─── */}
      <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
      <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* ─── Sidebar Industrial ─── */}
      <aside className="w-72 bg-zinc-950 border-r border-zinc-900 flex flex-col hidden lg:flex shrink-0 relative z-20">
        <div className="p-8 border-b border-zinc-900 flex items-center gap-5 relative group">
          <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-transform group-hover:scale-110 duration-500">
            HF
          </div>
          <div>
            <h2 className="font-black text-[15px] text-white uppercase tracking-tighter leading-none">NÚCLEO_DO_SISTEMA</h2>
            <p className="text-[9px] text-[var(--color-admin-accent)] font-mono font-black tracking-[0.3em] mt-2 animate-pulse">:: STATUS_ESTÁVEL ::</p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-2 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-4 font-mono">MÓDULOS_PRINCIPAIS</div>
          
          <SidebarNavItem 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            icon={<LayoutDashboard size={20} />} 
            label="DASHBOARD" 
          />
          <SidebarNavItem 
            active={activeTab === 'slots'} 
            onClick={() => setActiveTab('slots')} 
            icon={<Calendar size={20} />} 
            label="AGENDA_MESTRA" 
          />
          <SidebarNavItem 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<Clock size={20} />} 
            label="HISTÓRICO_LOGS" 
          />
          
          <div className="px-4 py-2 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mt-10 mb-4 font-mono">AJUSTES_DO_MOTOR</div>
          
          <SidebarNavItem 
            active={activeTab === 'sessions'} 
            onClick={() => setActiveTab('sessions')} 
            icon={<Settings size={20} />} 
            label="SERVIÇOS" 
          />
          <SidebarNavItem 
            active={activeTab === 'blocks'} 
            onClick={() => setActiveTab('blocks')} 
            icon={<ShieldCheck size={20} />} 
            label="SEGURANÇA" 
          />
        </nav>

        <div className="p-6 border-t border-zinc-900 bg-black/40">
          <button 
            onClick={() => logout()}
            className="flex items-center gap-4 w-full px-5 py-4 text-zinc-600 hover:text-white hover:bg-red-500/10 transition-all rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] group border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> 
            <span>ENCERRAR_SESSÃO</span>
          </button>
        </div>
      </aside>

      {/* ─── Bottom Nav Mobile Industrial ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-900 px-6 pt-3 pb-safe-bottom flex items-center justify-between z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <BottomNavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={22} />} />
        <BottomNavItem active={activeTab === 'slots'} onClick={() => setActiveTab('slots')} icon={<Calendar size={22} />} />
        <button 
          onClick={() => setIsManualBookingOpen(true)} 
          className="w-16 h-16 bg-white text-black rounded-[2rem] flex items-center justify-center -mt-12 shadow-[0_10px_40px_rgba(255,255,255,0.2)] active:scale-90 transition-all border-[6px] border-black"
          aria-label="Nova reserva"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
        <BottomNavItem active={activeTab === 'blocks'} onClick={() => setActiveTab('blocks')} icon={<ShieldCheck size={22} />} />
        <BottomNavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Clock size={22} />} />
      </div>

      {/* ─── Main Content Industrial ─── */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Header - Control Center Style */}
        <header className="h-24 bg-zinc-950/50 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-8 lg:px-14 shrink-0 relative">
          <div className="flex items-center gap-6">
            <div className="lg:hidden w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black border border-white/20">HF</div>
            <div>
              <h1 className="text-[18px] lg:text-[24px] font-black text-white uppercase tracking-tighter flex items-center gap-4">
                <span className="w-3 h-3 bg-[var(--color-admin-accent)] rounded-full animate-pulse shadow-[0_0_15px_var(--color-admin-accent)]" />
                {activeTab === 'overview' && "PAINEL_OPERACIONAL"}
                {activeTab === 'slots' && "MATRIZ_DE_AGENDA"}
                {activeTab === 'history' && "ARQUIVO_DE_LOGS"}
                {activeTab === 'sessions' && "LÓGICA_DE_SERVIÇOS"}
                {activeTab === 'blocks' && "PROTOCOLOS_DE_SEGURANÇA"}
              </h1>
              <p className="hidden sm:block text-[9px] font-mono font-black text-zinc-600 uppercase tracking-[0.5em] mt-1">UNIDADE_OPERACIONAL_01 // REGIÃO: SA-EAST-1</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 px-5 py-2.5 bg-black border border-zinc-900 rounded-2xl shadow-inner">
               <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse" />
               <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">Rede: ESTÁVEL</span>
            </div>
            
            <button 
              onClick={loadData}
              className="w-12 h-12 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-[var(--color-admin-accent)] rounded-2xl transition-all border border-zinc-800 active:scale-90"
              title="Sincronizar"
            >
              <Activity size={20} className={isLoading ? "animate-spin text-[var(--color-admin-accent)]" : ""} />
            </button>

            <button 
              onClick={() => setIsManualBookingOpen(true)}
              className="hidden lg:flex bg-white hover:bg-zinc-200 text-black text-[11px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl items-center gap-3 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95 group"
            >
              <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" /> 
              INJEÇÃO_MANUAL
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-14 custom-scrollbar bg-black/40">
          
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
            <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
              
              {/* Metrics Grid - Technical High Density */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatMetric label="SESSÕES_HOJE" value={isLoading ? "---" : stats.todaySessions} icon={<Activity size={24} />} trend="TEMPO_REAL" />
                <StatMetric label="DEMANDA_7D" value={isLoading ? "---" : stats.weekSessions} icon={<Calendar size={24} />} trend="PREDITIVO" />
                <StatMetric 
                  label="VOLUME_FINANCEIRO" 
                  value={isLoading ? "---" : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)} 
                  isPositive 
                  icon={<Database size={24} />}
                  trend="LIQUIDEZ"
                />
              </div>

              {/* Bookings Data Grid - Terminal Style */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-[0_20px_100px_rgba(0,0,0,0.8)] relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="px-10 py-8 border-b border-zinc-900 bg-black/40 flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-[14px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-4">
                       <div className="w-1.5 h-6 bg-[var(--color-admin-accent)] rounded-full shadow-[0_0_15px_var(--color-admin-accent)]" /> 
                       FLUXO_OPERACIONAL
                    </h3>
                    <p className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-[0.4em] mt-2 ml-6">Total_Registros: {bookings.length} Pontos_Entrada</p>
                  </div>
                  <button onClick={loadData} className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-[10px] font-black text-[var(--color-admin-accent)] hover:text-white flex items-center gap-3 transition-all border border-zinc-800 shadow-inner">
                    <Clock size={16} className="animate-pulse" /> SINCRONIZAR
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
               <div className="flex items-center gap-8 bg-zinc-950 p-12 rounded-[2.5rem] border border-zinc-900 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                    <Clock size={120} />
                  </div>
                  <div className="w-20 h-20 bg-zinc-900 text-[var(--color-admin-accent)] rounded-[1.5rem] flex items-center justify-center border border-zinc-800 shadow-inner">
                    <Clock size={40} strokeWidth={2.5} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-[28px] font-black text-white uppercase tracking-tighter leading-none">ARQUIVO_MESTRE</h3>
                    <p className="text-[11px] text-zinc-600 font-mono font-black uppercase tracking-[0.5em] mt-4">Snapshot Estático // Camada_Persistência_V2</p>
                  </div>
                  <button onClick={loadData} className="ml-auto bg-white hover:bg-zinc-200 px-10 py-5 rounded-2xl text-[11px] font-black text-black uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-95 relative z-10">
                    PUXAR_DADOS_HISTÓRICOS
                  </button>
               </div>
               
               <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
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
        <p className="text-[12px] font-mono font-black text-zinc-600 uppercase tracking-[0.6em] animate-pulse">Estabelecendo_Link_Seguro...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="py-48 text-center">
        <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] border border-dashed border-zinc-800 flex items-center justify-center mx-auto mb-8 shadow-inner">
           <Database size={32} className="text-zinc-700" />
        </div>
        <p className="text-[14px] font-black text-zinc-600 uppercase tracking-[0.4em]">DB_REGISTRO_NULO</p>
        <p className="text-[10px] font-mono font-black text-zinc-800 uppercase tracking-[0.2em] mt-3">Nenhum registro ativo encontrado no escopo atual</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-4 px-6">
          <thead>
            <tr className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.4em] font-mono">
              <th className="px-8 py-6">TIMESTAMP</th>
              <th className="px-8 py-6">IDENTIDADE</th>
              <th className="px-8 py-6">CATEGORIA</th>
              <th className="px-8 py-6">STATUS</th>
              <th className="px-8 py-6 text-right">VALOR</th>
              <th className="px-8 py-6 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const colors = getSessionColor(booking.sessions?.name, booking.sessions?.theme_color);
              return (
                <tr 
                  key={booking.id} 
                  className="group transition-all"
                >
                  <td className="px-8 py-7 bg-zinc-900/50 group-hover:bg-zinc-900 rounded-l-[1.5rem] border-y border-l border-zinc-900 transition-all duration-300">
                    <div className="text-[15px] font-black text-white font-mono tracking-tighter">
                       {new Date(booking.booking_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                    <div className="text-[12px] text-[var(--color-admin-accent)] mt-1.5 font-mono font-black tracking-[0.2em]">
                       T_OFFSET: {booking.start_time.slice(0, 5)}Z
                    </div>
                  </td>
                  <td className="px-8 py-7 bg-zinc-900/50 group-hover:bg-zinc-900 border-y border-zinc-900 transition-all duration-300">
                    <div className="text-[14px] font-black text-white uppercase tracking-tight">{booking.customer_name || booking.client_name}</div>
                    <div className="text-[10px] text-zinc-600 font-mono mt-1.5 font-black uppercase tracking-widest">HASH: {booking.id.split('-')[0].toUpperCase()}</div>
                  </td>
                  <td className="px-8 py-7 bg-zinc-900/50 group-hover:bg-zinc-900 border-y border-zinc-900 transition-all duration-300">
                    <span 
                      className="text-[10px] font-black px-4 py-2 rounded-xl border-2 uppercase tracking-[0.2em] bg-black inline-block shadow-inner"
                      style={{ 
                        color: colors.isCustom ? colors.styles?.color : undefined, 
                        borderColor: colors.isCustom ? colors.styles?.borderColor : undefined 
                      }}
                    >
                      {booking.sessions?.name}
                    </span>
                  </td>
                  <td className="px-8 py-7 bg-zinc-900/50 group-hover:bg-zinc-900 border-y border-zinc-900 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] ${
                        booking.status === 'confirmed' ? 'text-emerald-500 bg-emerald-500' : 
                        booking.status === 'pending' ? 'text-amber-500 bg-amber-500' : 'text-red-500 bg-red-500'
                      }`} />
                      <span className={`text-[11px] font-black uppercase tracking-[0.3em] font-mono ${
                        booking.status === 'confirmed' ? 'text-emerald-500' : 
                        booking.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                      }`}>
                         {booking.status === 'confirmed' ? 'VERIFICADO' : booking.status === 'pending' ? 'EM_FILA' : 'NULO'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-7 bg-zinc-900/50 group-hover:bg-zinc-900 border-y border-zinc-900 text-right transition-all duration-300">
                    <span className="text-[16px] font-mono font-black text-white tracking-tighter">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.paid_amount)}
                    </span>
                  </td>
                  <td className="px-8 py-7 bg-zinc-900/50 group-hover:bg-zinc-900 rounded-r-[1.5rem] border-y border-r border-zinc-900 text-right transition-all duration-300">
                    <button 
                      onClick={() => onEdit(booking)}
                      className="w-12 h-12 rounded-2xl bg-black border border-zinc-800 text-zinc-600 hover:text-white hover:border-white hover:bg-zinc-900 flex items-center justify-center transition-all ml-auto shadow-2xl active:scale-90 group"
                    >
                      <Settings size={20} className="group-hover:rotate-180 transition-transform duration-700" />
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
              className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2rem] relative cursor-pointer active:scale-[0.98] transition-all shadow-xl overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-admin-accent)]/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-active:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-mono font-black text-[var(--color-admin-accent)] uppercase tracking-[0.3em]">{new Date(booking.booking_date).toLocaleDateString('pt-BR')}</span>
                  <span className="text-[20px] font-black text-white uppercase tracking-tighter leading-tight">{booking.customer_name || booking.client_name}</span>
                </div>
                <div className="bg-black px-4 py-2.5 rounded-2xl border border-zinc-800 text-[12px] font-mono font-black text-white shadow-inner">
                  {booking.start_time.slice(0, 5)}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-900">
                <span 
                  className="text-[10px] font-black px-4 py-2 rounded-xl border-2 uppercase tracking-[0.1em] bg-black shadow-inner"
                  style={{ 
                    color: colors.isCustom ? colors.styles?.color : undefined, 
                    borderColor: colors.isCustom ? colors.styles?.borderColor : undefined 
                  }}
                >
                  {booking.sessions?.name}
                </span>
                <div className="flex items-center gap-4">
                   <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ${
                     booking.status === 'confirmed' ? 'text-emerald-500 bg-emerald-500' : 
                     booking.status === 'pending' ? 'text-amber-500 bg-amber-500' : 'text-red-500 bg-red-500'
                   }`} />
                   <span className="text-[16px] font-mono font-black text-white tracking-tighter">
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
      className={`w-full flex items-center gap-5 px-6 py-5 rounded-[1.25rem] transition-all text-[13px] font-black uppercase tracking-[0.3em] group relative overflow-hidden ${
        active 
          ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.15)] scale-[1.02]' 
          : 'text-zinc-600 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
      }`}
    >
      <div className={`${active ? 'text-black' : 'text-zinc-800 group-hover:text-white'} transition-colors`}>
        {React.cloneElement(icon as React.ReactElement<any>, { strokeWidth: active ? 3 : 2 })}
      </div>
      <span className="relative z-10">{label}</span>
      {active && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-black/10" />}
    </button>
  );
}

function BottomNavItem({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`p-5 rounded-2xl transition-all relative ${
        active ? 'text-white' : 'text-zinc-700'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: active ? 3 : 2 })}
      {active && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />}
    </button>
  );
}

function StatMetric({ label, value, icon, isPositive, trend }: { label: string, value: string | number, icon: React.ReactNode, isPositive?: boolean, trend: string }) {
  return (
    <div className="bg-zinc-950 p-8 border border-zinc-900 rounded-[2.5rem] flex flex-col justify-between h-48 hover:border-white transition-all group shadow-2xl relative overflow-hidden">
      <div className="absolute -right-8 -top-8 p-12 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-1000">
         {React.cloneElement(icon as React.ReactElement<any>, { size: 100, strokeWidth: 1 })}
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-3">
           <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.4em] font-mono">{label}</p>
           <div className="flex items-center gap-3">
              <span className={`text-[9px] font-mono font-black px-2.5 py-1 rounded-lg bg-black border-2 ${isPositive ? 'text-emerald-500 border-emerald-500/20' : 'text-zinc-700 border-zinc-900'}`}>
                {trend}
              </span>
           </div>
        </div>
      </div>
      <h4 className="text-4xl font-black tracking-tighter text-white font-mono relative z-10">
        {value}
      </h4>
    </div>
  );
}
