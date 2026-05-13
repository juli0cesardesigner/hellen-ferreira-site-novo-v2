"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash2, Clock, CalendarDays, Loader2, Save, X, AlertCircle, Copy, Check, User, Mail, Phone, CreditCard, Gift, ShieldAlert, Zap, ChevronRight, Database, Info } from "lucide-react";
import { InternalDatePicker } from "@/components/ui/InternalDatePicker";
import { createManualBooking } from "@/lib/actions/admin-actions";
import { getAvailableSlots, getMonthAvailability } from "@/lib/actions/booking-actions";
import { motion, AnimatePresence } from "framer-motion";
import { SESSIONS_DATA } from "@/lib/data/sessions";

const formatCurrencyBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const parseCurrencyBRL = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return Number(digits) / 100;
};

export function ManualBookingModal({ onClose, onCreated, initialDate, initialTime }: { onClose: () => void, onCreated: () => void, initialDate?: Date | null, initialTime?: string | null }) {
  const sessions = Object.values(SESSIONS_DATA);
  const [packages, setPackages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [monthAvailability, setMonthAvailability] = useState<Record<string, boolean>>({});
  const [currentMonthDate, setCurrentMonthDate] = useState(initialDate || new Date());
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isMonthLoading, setIsMonthLoading] = useState(false);
  const slotsRequestIdRef = useRef(0);
  const monthRequestIdRef = useRef(0);
  const [copied, setCopied] = useState(false);
  const [createdResult, setCreatedResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    session_id: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    date: initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    start_time: initialTime || "",
    package_id: "",
    total_amount: 0,
    paid_amount: 0,
    status: 'confirmed' as 'confirmed' | 'pending',
    isGift: false
  });

  useEffect(() => {
    if (formData.session_id) {
      const session = SESSIONS_DATA[formData.session_id];
      const pkgs = session?.session_packages || [];
      setPackages(pkgs);
      if (pkgs.length > 0 && !formData.package_id) {
        setFormData(prev => ({
          ...prev,
          package_id: pkgs[0].id,
          total_amount: pkgs[0].price_digital || 0
        }));
      }
    }
  }, [formData.session_id, formData.package_id]);
  
  useEffect(() => {
    if (formData.session_id) {
      async function loadMonthData() {
        const reqId = ++monthRequestIdRef.current;
        setIsMonthLoading(true);
        const res = await getMonthAvailability(
          currentMonthDate.getFullYear(),
          currentMonthDate.getMonth(),
          formData.session_id,
          true
        );
        // Only apply if this is still the latest request
        if (reqId !== monthRequestIdRef.current) return;
        setMonthAvailability(res);
        setIsMonthLoading(false);
      }
      loadMonthData();
    }
  }, [formData.session_id, currentMonthDate]);

  useEffect(() => {
    if (formData.session_id && formData.date) {
      async function loadSlots() {
        const reqId = ++slotsRequestIdRef.current;
        setIsSlotsLoading(true);
        setAvailableSlots([]);
        const res = await getAvailableSlots(formData.date, formData.session_id, true);
        // Only apply if this is still the latest request
        if (reqId !== slotsRequestIdRef.current) return;
        if (Array.isArray(res.slots)) {
          // Admin vê todos os slots do dia, disponíveis ou não
          setAvailableSlots(res.slots.map((s: any) => s.time.substring(0, 5)));
        }
        setIsSlotsLoading(false);
      }
      loadSlots();
    }
  }, [formData.session_id, formData.date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.session_id) return setErrorMessage("Seleção Obrigatória: ID do Serviço.");
    if (!formData.start_time) return setErrorMessage("Seleção Obrigatória: Slot de Destino.");
    if (!formData.client_name) return setErrorMessage("Parâmetro de Identidade Ausente: Nome do Cliente.");
    if (!formData.date) return setErrorMessage("Parâmetro Temporal Ausente: Data.");

    setIsSubmitting(true);
    const res = await createManualBooking({
      sessionId: formData.session_id,
      customer_name: formData.client_name,
      customer_email: formData.client_email,
      customer_phone: formData.client_phone,
      booking_date: formData.date,
      start_time: formData.start_time + ":00", 
      package_type: packages.find(p => p.id === formData.package_id)?.name || 'Schema Customizado',
      total_amount: formData.isGift ? 0 : formData.total_amount,
      paid_amount: formData.isGift ? 0 : formData.paid_amount,
      status: formData.status
    });

    if (res.success) {
      setCreatedResult(res);
      if (res.status === 'confirmed') {
        onCreated();
        onClose();
      }
    } else {
      setErrorMessage(res.error || "Erro de Execução: Rejeição do Backend.");
    }
    setIsSubmitting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center lg:p-6 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative bg-[var(--color-admin-bg)] w-full max-w-6xl h-full lg:h-[90vh] lg:rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-y-auto custom-scrollbar border border-[var(--color-admin-border)]"
      >
        <div className="p-8 lg:p-14 space-y-10 lg:space-y-12">
          
          {/* Engine Header Terminal */}
          <div className="flex justify-between items-center bg-[var(--color-admin-bg)] -mx-8 lg:-mx-14 -mt-8 lg:-mt-14 px-8 lg:px-12 py-6 lg:py-8 border-b border-[var(--color-admin-border)] z-20">
            <div className="flex items-center gap-4 lg:gap-5">
               <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-accent)] rounded-xl flex items-center justify-center shadow-inner border border-[var(--color-admin-accent)]/20">
                  <Plus size={24} strokeWidth={3} />
               </div>
               <div>
                   <h2 className="text-[13px] lg:text-[18px] font-bold text-[var(--color-admin-text)] tracking-tight leading-none uppercase">Novo agendamento</h2>
                  <p className="text-[10px] font-medium text-[var(--color-admin-text-muted)] mt-1.5 opacity-80">Parâmetros de entrada para novo registro no ledger</p>
               </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-admin-surface)] text-[var(--color-admin-text-muted)] transition-all border border-[var(--color-admin-border)] active:scale-90 hover:text-red-500">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 lg:space-y-12 pt-4">
            
            {/* Validation Alerts Terminal */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4 shadow-2xl shadow-red-900/10"
                >
                  <ShieldAlert size={24} className="text-red-500 shrink-0 mt-1" />
                  <div className="flex-1">
                     <h4 className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Erro de validação</h4>
                    <p className="text-[12px] text-red-200/80 font-medium mt-1">{errorMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {createdResult && createdResult.paymentUrl && (
              <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-3xl space-y-6 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                   <Zap size={80} className="text-blue-500" />
                </div>
                <div className="flex items-center gap-4 text-blue-400">
                  <Zap size={20} className="fill-blue-500" />
                   <h4 className="text-[12px] font-bold tracking-tight">Link de pagamento gerado</h4>
                </div>
                <div className="flex flex-col sm:row gap-3">
                   <input readOnly value={createdResult.paymentUrl} className="flex-1 bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] p-4 rounded-xl text-[11px] text-blue-400 outline-none shadow-inner" />
                  <button type="button" onClick={() => copyToClipboard(createdResult.paymentUrl)} className="px-8 py-4 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/30 active:scale-95 group">
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                     <span className="text-[11px] font-bold tracking-tight">Copiar link</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              
              {/* Profile & Finance Context Terminal */}
              <div className="md:col-span-7 space-y-10">
                <div className="flex items-center gap-3 border-b border-[var(--color-admin-border)] pb-5">
                     <h3 className="text-[14px] font-bold text-[var(--color-admin-text)] tracking-tight">Dados do Cliente</h3>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] tracking-widest uppercase ml-1 opacity-70">Identidade do Cliente</label>
                    <div className="relative group">
                       <input
                        type="text" className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] px-5 py-4 rounded-xl text-[13px] font-bold text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300 shadow-inner"
                        value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                        placeholder="Nome completo..." required
                       />
                       <User size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[var(--color-admin-accent)] transition-colors" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] tracking-widest uppercase ml-1 opacity-70">E-mail</label>
                         <input
                        type="email" className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] px-5 py-4 rounded-xl text-[12px] font-medium text-[var(--color-admin-text-secondary)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300 shadow-inner"
                        value={formData.client_email} onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                        placeholder="cliente@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] tracking-widest uppercase ml-1 opacity-70">WhatsApp</label>
                        <input
                        type="tel" className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] px-5 py-4 rounded-xl text-[12px] font-medium text-[var(--color-admin-text-secondary)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300 shadow-inner"
                        value={formData.client_phone} onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                        placeholder="+55 00 00000 0000"
                        />
                    </div>
                  </div>

                  <div className="bg-[var(--color-admin-surface)] rounded-[1.5rem] p-6 border border-[var(--color-admin-border)] shadow-inner space-y-6 mt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-[var(--color-admin-text-muted)]">
                           <CreditCard size={14} />
                            <h4 className="text-[11px] font-bold text-[var(--color-admin-text-secondary)] tracking-widest uppercase">Fluxo Financeiro</h4>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer group">
                             <div className="flex items-center gap-2 px-3 py-1 bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-lg text-[9px] font-bold text-[var(--color-admin-text-muted)] uppercase transition-all hover:border-[var(--color-admin-accent)]/30">
                               <input 
                                  type="checkbox" checked={formData.isGift} 
                                  onChange={(e) => setFormData({...formData, isGift: e.target.checked})}
                                  className="w-3.5 h-3.5 rounded bg-[var(--color-admin-bg)] border-[var(--color-admin-border)] text-indigo-600 focus:ring-indigo-500/20 transition-all cursor-pointer"
                               />
                               <Gift size={10} className={formData.isGift ? "text-emerald-500" : ""} /> 
                               <span>Cortesia</span>
                            </div>
                        </label>
                    </div>
                    
                    {!formData.isGift && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] tracking-widest uppercase ml-1 opacity-70">Valor Bruto</label>
                                <div className="relative group">
                                  <input 
                                      type="text" className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] px-4 py-3.5 rounded-xl text-[13px] font-bold text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] shadow-inner"
                                      value={formatCurrencyBRL(formData.total_amount)} 
                                      onChange={(e) => {
                                        const val = parseCurrencyBRL(e.target.value);
                                        setFormData({...formData, total_amount: val});
                                      }}
                                  />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] tracking-widest uppercase ml-1 opacity-70">Entrada (Recebido)</label>
                                <div className="relative group">
                                  <input 
                                      type="text" className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] px-4 py-3.5 rounded-xl text-[13px] font-bold text-emerald-600 outline-none focus:border-[var(--color-admin-accent)] shadow-inner"
                                      value={formatCurrencyBRL(formData.paid_amount)} 
                                      onChange={(e) => {
                                        const val = parseCurrencyBRL(e.target.value);
                                        setFormData({...formData, paid_amount: val});
                                      }}
                                  />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-2 pt-5 border-t border-[var(--color-admin-border)]">
                        <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] tracking-widest uppercase ml-1 opacity-70">Estado do Registro</label>
                        <div className="relative">
                           <select 
                               className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] px-5 py-3.5 rounded-xl text-[12px] font-bold text-[var(--color-admin-text)] tracking-tight outline-none focus:border-[var(--color-admin-accent)] appearance-none shadow-inner cursor-pointer"
                               value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                           >
                               <option value="confirmed">Confirmado</option>
                               <option value="pending">Pendente</option>
                           </select>
                           <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-10">
                <div className="flex items-center gap-3 border-b border-[var(--color-admin-border)] pb-5">
                   <Clock size={18} className="text-slate-300" />
                    <h3 className="text-[14px] font-bold text-[var(--color-admin-text)] tracking-tight">Detalhes do Agendamento</h3>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] tracking-widest uppercase ml-1 opacity-70">Serviço de Origem</label>
                    <div className="relative">
                      <select
                        className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] px-5 py-4 rounded-xl text-[12px] font-bold text-[var(--color-admin-text)] tracking-tight outline-none focus:border-[var(--color-admin-accent)] appearance-none shadow-inner cursor-pointer"
                        value={formData.session_id}
                        onChange={(e) => {
                          const id = e.target.value;
                          const session = sessions.find(s => s.id === id);
                          const firstPkg = session?.session_packages?.[0];
                          setFormData({
                            ...formData,
                            session_id: id,
                            package_id: firstPkg?.id || "",
                            total_amount: firstPkg?.price_digital || 0
                          });
                        }}
                        required
                      >
                        <option value="">Selecionar...</option>
                        {sessions.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <Database size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] tracking-widest uppercase ml-1 opacity-70 flex items-center justify-between">
                      <span>Data da Sessão</span>
                      {isMonthLoading && <Loader2 size={12} className="animate-spin text-[var(--color-admin-accent)]" />}
                    </label>
                    <InternalDatePicker
                      value={formData.date}
                      onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                      onMonthChange={(date) => setCurrentMonthDate(date)}
                      availableDates={monthAvailability}
                      placeholder={!formData.session_id ? "Selecione primeiro o serviço" : "Selecione o dia"}
                    />
                  </div>

                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] tracking-widest uppercase ml-1 opacity-70">Slot Temporal</label>
                      <div className="relative">
                        <select
                          className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] px-5 py-4 rounded-xl text-[12px] font-bold text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] appearance-none disabled:opacity-20 shadow-inner cursor-pointer"
                          value={formData.start_time}
                          disabled={!formData.date || !formData.session_id || isSlotsLoading}
                          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                          required
                        >
                           <option value="">{isSlotsLoading ? "Carregando..." : "Escolher horário..."}</option>
                          {availableSlots.map(slot => <option key={slot} value={slot}>{slot}h</option>)}
                        </select>
                        {isSlotsLoading ? (
                          <div className="absolute right-12 top-1/2 -translate-y-1/2">
                             <Loader2 size={16} className="animate-spin text-[var(--color-admin-accent)]" />
                          </div>
                        ) : (
                           <Clock size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                        )}
                      </div>
                  </div>
                  
                  <div className="p-8 bg-[var(--color-admin-surface)] rounded-3xl border border-[var(--color-admin-border)] mt-6 relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-admin-accent)]/20 transition-colors" />
                     <div className="flex items-center gap-3 mb-3">
                        <Info size={14} className="text-[var(--color-admin-text-muted)]" />
                        <h5 className="text-[11px] font-bold text-[var(--color-admin-text-secondary)] tracking-wide">Observação</h5>
                     </div>
                     <p className="text-[12px] text-[var(--color-admin-text-muted)] font-medium leading-relaxed">
                       Agendamentos manuais não exigem pagamento imediato. A reserva será confirmada instantaneamente no sistema.
                     </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-12 lg:pt-14 border-t border-[var(--color-admin-border)] flex flex-col lg:flex-row items-center justify-between gap-10">

              <div className="flex items-center gap-6 w-full lg:w-auto">
                <button type="button" onClick={onClose} className="flex-1 lg:flex-none px-10 py-5 text-[12px] font-bold text-[var(--color-admin-text-muted)] transition-all active:scale-95" disabled={isSubmitting}>Cancelar</button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.session_id || !formData.start_time || !formData.client_name || !formData.date}
                  className="flex-1 lg:flex-none px-16 py-6 bg-[var(--color-admin-accent)] text-white text-[12px] font-bold tracking-tight rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-sm active:scale-95 group"
                >
                   {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="transition-transform" />}
                  Salvar Agendamento
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
