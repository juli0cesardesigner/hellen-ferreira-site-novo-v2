"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, CalendarDays, Loader2, Save, X, AlertCircle, Copy, Check, User, Mail, Phone, CreditCard, Gift, ShieldAlert, Zap, Activity } from "lucide-react";
import { createManualBooking } from "@/lib/actions/admin-actions";
import { getAvailableSlots } from "@/lib/actions/booking-actions";
import { motion, AnimatePresence } from "framer-motion";
import { SESSIONS_DATA } from "@/lib/data/sessions";

export function ManualBookingModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  const sessions = Object.values(SESSIONS_DATA);
  const [packages, setPackages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdResult, setCreatedResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    session_id: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    date: new Date().toISOString().split('T')[0],
    start_time: "",
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
    if (formData.session_id && formData.date) {
      async function loadSlots() {
        setIsSlotsLoading(true);
        setAvailableSlots([]);
        const res = await getAvailableSlots(formData.date, formData.session_id);
        if (Array.isArray(res.slots)) {
          setAvailableSlots(res.slots.filter(s => s.available).map((s: any) => s.time.substring(0, 5)));
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center lg:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="relative bg-[#F8FAFC] w-full max-w-5xl h-full lg:h-[90vh] lg:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200"
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-8 lg:space-y-10">
          
          {/* Engine Header */}
          <div className="flex justify-between items-center bg-white -mx-6 lg:-mx-10 -mt-6 lg:-mt-10 px-6 lg:px-10 py-5 lg:py-6 border-b border-zinc-200 sticky top-0 z-10">
            <div className="flex items-center gap-3 lg:gap-4">
               <div className="w-8 h-8 lg:w-10 lg:h-10 bg-zinc-900 text-white rounded-lg flex items-center justify-center shadow-sm">
                  <Plus size={18} className="lg:size-[20px]" />
               </div>
               <div>
                  <h2 className="text-xs lg:text-base font-bold text-zinc-900 uppercase tracking-tight">Novo Agendamento</h2>
                  <p className="text-[8px] lg:text-[10px] uppercase font-bold text-zinc-400 tracking-widest mt-0.5">Cadastro Manual de Reserva</p>
               </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 lg:space-y-10 pt-2 lg:pt-4">
            
            {/* Validation Alerts */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3"
                >
                  <ShieldAlert size={18} className="text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Atenção</h4>
                    <p className="text-[11px] text-rose-700 font-medium mt-0.5">{errorMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {createdResult && createdResult.paymentUrl && (
              <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl space-y-4 shadow-sm animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 text-blue-700">
                  <Zap size={18} className="fill-blue-500 text-blue-500" />
                  <h4 className="text-xs font-bold uppercase tracking-widest">Link de Transação Gerado</h4>
                </div>
                <div className="flex gap-2">
                  <input readOnly value={createdResult.paymentUrl} className="flex-1 bg-white border border-blue-200 p-2.5 rounded-xl text-[9px] font-mono text-blue-900 outline-none" />
                  <button type="button" onClick={() => copyToClipboard(createdResult.paymentUrl)} className="px-4 py-3 bg-zinc-900 text-white rounded-xl hover:bg-black flex items-center gap-2 transition-all shadow-lg active:scale-95">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">COPIAR LINK</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              
              {/* Profile & Finance Context */}
              <div className="md:col-span-7 space-y-8">
                <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
                   <User size={14} className="text-zinc-400" />
                   <h3 className="text-[10px] uppercase font-bold text-zinc-900 tracking-widest">Dados do Cliente</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-zinc-500">Nome Completo</label>
                    <div className="relative">
                       <input
                        type="text" className="w-full bg-white border border-zinc-200 px-4 py-3.5 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300 shadow-sm"
                        value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                        placeholder="Nome Principal no Registro" required
                       />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-zinc-500">Endereço de E-mail</label>
                        <input
                        type="email" className="w-full bg-white border border-zinc-200 px-4 py-3.5 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300 shadow-sm"
                        value={formData.client_email} onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                        placeholder="contato@sistema.com.br"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-zinc-500">WhatsApp / Telefone</label>
                        <input
                        type="tel" className="w-full bg-white border border-zinc-200 px-4 py-3.5 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300 shadow-sm"
                        value={formData.client_phone} onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                        placeholder="+55 00 00000-0000"
                        />
                    </div>
                  </div>

                  {/* Financial Scope */}
                  <div className="bg-zinc-50/50 rounded-2xl p-6 border border-zinc-200 shadow-inner space-y-6 mt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-zinc-600">
                           <CreditCard size={14} />
                           <h4 className="text-[10px] uppercase font-bold tracking-widest">Valores de Pagamento</h4>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" checked={formData.isGift} 
                                onChange={(e) => setFormData({...formData, isGift: e.target.checked})}
                                className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                            />
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-zinc-200 rounded-md text-[9px] font-bold text-zinc-600 uppercase group-hover:bg-zinc-100 transition-all">
                               <Gift size={10} className={formData.isGift ? "text-blue-500" : ""} /> 
                               <span>Conta Cortesia?</span>
                            </div>
                        </label>
                    </div>
                    
                    {!formData.isGift && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[8px] uppercase font-bold text-zinc-400">Total Bruto (BRL)</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">R$</span>
                                  <input 
                                      type="number" className="w-full bg-white border border-zinc-200 pl-8 pr-3 py-3 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-zinc-900 shadow-sm"
                                      value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: parseFloat(e.target.value)})}
                                  />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[8px] uppercase font-bold text-zinc-400">Valor Pago (BRL)</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">R$</span>
                                  <input 
                                      type="number" className="w-full bg-white border border-zinc-200 pl-8 pr-3 py-3 rounded-xl text-xs font-bold text-blue-600 outline-none focus:border-zinc-900 shadow-sm"
                                      value={formData.paid_amount} onChange={(e) => setFormData({...formData, paid_amount: parseFloat(e.target.value)})}
                                  />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5 pt-2 border-t border-zinc-200/50">
                        <label className="text-[8px] uppercase font-bold text-zinc-400">Status do Agendamento</label>
                        <select 
                            className="w-full bg-white border border-zinc-200 px-3 py-3 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-zinc-900 appearance-none shadow-sm cursor-pointer"
                            value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        >
                            <option value="confirmed">Confirmado (Bloquear na Agenda)</option>
                            <option value="pending">Pendente (Aguardar Pagamento)</option>
                        </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Allocation View */}
              <div className="md:col-span-5 space-y-8">
                <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
                   <Clock size={14} className="text-zinc-400" />
                   <h3 className="text-[10px] uppercase font-bold text-zinc-900 tracking-widest">Data e Horário</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-zinc-500">Template de Serviço</label>
                    <select
                      className="w-full bg-white border border-zinc-200 px-4 py-3.5 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-900 transition-all appearance-none shadow-sm cursor-pointer"
                      value={formData.session_id}
                      onChange={(e) => {
                        const id = e.target.value;
                        const session = sessions.find(s => s.id === id);
                        const firstPkg = session?.session_packages?.[0];
                        setFormData({
                          ...formData,
                          session_id: id,
                          package_id: firstPkg?.id || "",
                          total_amount: firstPkg?.price_digital || 0,
                          date: "" 
                        });
                      }}
                      required
                    >
                      <option value="">ESCOLHA O TIPO DE ENSAIO...</option>
                      {sessions.map(s => (
                        <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                      <label className="text-[9px] uppercase font-bold text-zinc-500">Coordenadas Temporais</label>
                      <input
                        type="date"
                        className="w-full bg-white border border-zinc-200 px-4 py-3.5 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-900 transition-all shadow-sm"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                  </div>

                  <div className="space-y-2">
                      <label className="text-[9px] uppercase font-bold text-zinc-500">Slot Operacional</label>
                      <div className="relative">
                        <select
                          className="w-full bg-white border border-zinc-200 px-4 py-3.5 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-900 transition-all appearance-none disabled:opacity-50 shadow-sm cursor-pointer"
                          value={formData.start_time}
                          disabled={!formData.date || !formData.session_id || isSlotsLoading}
                          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                          required
                        >
                           <option value="">{isSlotsLoading ? "BUSCANDO HORÁRIOS..." : "ESCOLHER HORÁRIO..."}</option>
                          {availableSlots.map(slot => <option key={slot} value={slot}>{slot} HRS</option>)}
                        </select>
                        {isSlotsLoading && (
                          <div className="absolute right-10 top-1/2 -translate-y-1/2">
                             <Loader2 size={12} className="animate-spin text-zinc-400" />
                          </div>
                        )}
                      </div>
                  </div>
                  
                  <div className="p-6 bg-zinc-100 rounded-2xl border border-zinc-200 mt-4">
                     <div className="flex items-center gap-2 mb-2">
                        <Activity size={12} className="text-zinc-500" />
                        <h5 className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Nota de Sistema</h5>
                     </div>
                     <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                       Agendamentos manuais não passam pelo gateway de pagamento automaticamente. Verifique os dados antes de salvar.
                     </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Persistence Controls */}
            <div className="pt-8 lg:pt-10 border-t border-zinc-200 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="hidden lg:flex items-center gap-3 text-zinc-400 bg-zinc-100/50 px-5 py-3 rounded-xl border border-zinc-200">
                <Check size={14} className="text-blue-500" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Sincronização Ativa</span>
              </div>
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <button type="button" onClick={onClose} className="flex-1 lg:flex-none px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors" disabled={isSubmitting}>Abortar</button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.session_id || !formData.start_time || !formData.client_name || !formData.date}
                  className="flex-1 lg:flex-none px-12 py-4 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                   {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  CRIAR AGENDAMENTO
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
