"use client";

import React, { useState } from "react";
import { LayoutDashboard, Clock, Image as ImageIcon, CalendarX, LogOut, ChevronRight, User, Mail, Phone, ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";
import { MassBlockingSection } from "@/components/admin/MassBlocking";
import { StandardSlotsSection } from "@/components/admin/StandardSlots";
import { SessionConfigSection } from "@/components/admin/SessionConfig";

import { getAdminStats, getBookingsList } from "@/lib/actions/admin-actions";
import { ManualBookingModal } from "@/components/admin/ManualBooking";
import { EditBookingModal } from "@/components/admin/EditBookingModal";
import { AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'slots' | 'sessions' | 'blocks'>('overview');
  const [stats, setStats] = useState({ todaySessions: 0, weekSessions: 0, totalRevenue: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  async function loadData() {
    setIsLoading(true);
    const [statsData, bookingsData] = await Promise.all([
      getAdminStats(),
      getBookingsList()
    ]);
    setStats(statsData);
    setBookings(bookingsData.bookings || []);
    setIsLoading(false);
  }

  React.useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-pearl flex font-sans">
      
      {/* Sidebar Fixo - Refinado */}
      <aside className="w-72 bg-linen/50 border-r border-sand/30 p-8 flex flex-col justify-between hidden md:flex">
        <div className="space-y-12">
          <div className="flex flex-col gap-6 px-2">
            <div className="w-16 h-16 bg-blush/10 rounded-full flex items-center justify-center text-blush font-serif italic text-3xl border border-blush/20">H</div>
            <div>
              <p className="text-xl font-serif text-text-dark italic">Hellen Ferreira</p>
              <p className="text-[10px] text-text-light uppercase tracking-widest mt-1">Painel Curadoria</p>
            </div>
          </div>
          
          <nav className="space-y-4 font-medium">
            <SidebarButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')} 
              icon={<LayoutDashboard size={18} />} 
              label="Visão Geral" 
            />
            <SidebarButton 
              active={activeTab === 'slots'} 
              onClick={() => setActiveTab('slots')} 
              icon={<Calendar size={18} />} 
              label="Grade Semanal" 
            />
            <SidebarButton 
              active={activeTab === 'sessions'} 
              onClick={() => setActiveTab('sessions')} 
              icon={<ImageIcon size={18} />} 
              label="Serviços & Preços" 
            />
            <SidebarButton 
              active={activeTab === 'blocks'} 
              onClick={() => setActiveTab('blocks')} 
              icon={<CalendarX size={18} />} 
              label="Bloqueios e Férias" 
            />
          </nav>
        </div>

        <button className="flex items-center gap-4 px-4 py-3 text-text-light hover:text-text-dark transition-colors text-[10px] uppercase font-bold tracking-widest">
          <LogOut size={16} /> <span>Sair do Sistema</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 md:p-16 overflow-y-auto">
        
        {/* Header Superior */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h1 className="text-4xl font-serif text-text-dark italic leading-tight">Bom dia, Hellen Ferreira</h1>
            <p className="text-sm text-text-light mt-2 italic font-serif opacity-80">Sua agenda de hoje está pronta para ser capturada.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsManualBookingOpen(true)}
              className="px-8 py-4 bg-blush text-white text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-[#C29088] transition-all rounded-none shadow-sm flex items-center gap-2"
            >
              Criar Agendamento Manual
            </button>
            <Link href="/" className="px-8 py-4 bg-transparent text-[10px] uppercase tracking-[0.2em] text-text-dark border-b border-sand hover:border-blush transition-all rounded-none flex items-center gap-3">
              Ver Site <ExternalLink size={12} />
            </Link>
          </div>
        </header>

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

        {/* Estatísticas Rápidas - Mais Minimalistas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20 animate-in fade-in slide-in-from-bottom duration-1000">
          <StatCard label="Sessões Hoje" value={isLoading ? "..." : String(stats.todaySessions).padStart(2, '0')} />
          <StatCard label="Próximos 7 dias" value={isLoading ? "..." : String(stats.weekSessions).padStart(2, '0')} />
          <StatCard label="Faturamento Confirmado" value={isLoading ? "..." : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)} isSuccess />
        </div>

        {/* Conteúdo Principal */}
        <div className="space-y-12 animate-in fade-in duration-1000 delay-300">
          <div className="flex items-center justify-between border-b border-sand/30 pb-6">
            <h3 className="font-serif italic text-3xl text-text-dark">
              {activeTab === 'overview' && "Próximos Agendamentos"}
              {activeTab === 'slots' && "Gestão de Grade Semanal"}
              {activeTab === 'sessions' && "Configuração de Serviços"}
              {activeTab === 'blocks' && "Bloqueio de Períodos Especiais"}
            </h3>
          </div>

          <div className="min-h-[500px]">
            {activeTab === 'overview' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.2em] text-text-light border-b border-sand/30">
                      <th className="py-6 font-bold">Data/Hora</th>
                      <th className="py-6 font-bold">Cliente</th>
                      <th className="py-6 font-bold">Serviço</th>
                      <th className="py-6 font-bold">Status</th>
                      <th className="py-6 font-bold text-right">Valor</th>
                      <th className="py-6 font-bold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {bookings.length > 0 ? bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-sand/10 hover:bg-linen/20 transition-colors group">
                        <td className="py-6">
                          <p className="font-serif italic text-lg text-text-dark">{new Date(booking.booking_date).toLocaleDateString('pt-BR')}</p>
                          <p className="text-[10px] text-text-light uppercase tracking-widest mt-1">{booking.start_time.slice(0, 5)}</p>
                        </td>
                        <td className="py-6">
                          <p className="font-medium text-text-dark">{booking.client_name}</p>
                          <p className="text-[10px] text-text-light mt-1">{booking.client_phone}</p>
                        </td>
                        <td className="py-6">
                          <span className="text-[10px] uppercase tracking-widest text-blush border-b border-blush/20 pb-0.5">{booking.sessions?.name}</span>
                        </td>
                        <td className="py-6">
                          <span className={`text-[10px] uppercase tracking-widest font-bold ${
                            booking.status === 'confirmed' ? 'text-sage' : 'text-warm-gold'
                          }`}>
                             {booking.status === 'confirmed' ? 'Confirmado' : booking.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="py-6 text-right font-serif text-lg text-text-medium">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.paid_amount)}
                        </td>
                        <td className="py-6 text-right">
                          <button onClick={() => setSelectedBooking(booking)} className="p-2 transition-all text-text-light hover:text-blush hover:bg-blush/5 rounded-full">
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-32 text-center text-text-light italic font-serif text-lg opacity-40">Nenhum registro de afeto encontrado ainda.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'slots' && <StandardSlotsSection />}
            {activeTab === 'sessions' && <SessionConfigSection />}
            {activeTab === 'blocks' && <MassBlockingSection />}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-2 py-2 rounded-none transition-all group ${
        active 
          ? 'text-text-dark border-r-2 border-blush' 
          : 'text-text-light hover:text-text-dark'
      }`}
    >
      <div className={`transition-colors ${active ? 'text-blush' : 'text-text-light group-hover:text-blush'}`}>
        {icon}
      </div>
      <span className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
        {label}
      </span>
    </button>
  );
}

function StatCard({ label, value, isSuccess }: { label: string, value: string, isSuccess?: boolean }) {
  return (
    <div className="bg-white p-10 border border-sand/20 shadow-[0_4px_20px_rgba(44,42,41,0.03)] flex flex-col gap-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-text-light font-bold">{label}</p>
      <h4 className={`text-4xl font-serif italic ${isSuccess ? 'text-sage' : 'text-text-dark'}`}>
        {value}
      </h4>
    </div>
  );
}
