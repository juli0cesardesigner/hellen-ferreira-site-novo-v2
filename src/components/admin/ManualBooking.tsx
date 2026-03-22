"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, CalendarDays, Loader2, Save, X, AlertCircle, Copy, Check } from "lucide-react";
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

    if (!formData.session_id) return setErrorMessage("Selecione um Serviço.");
    if (!formData.start_time) return setErrorMessage("Selecione um Horário Disponível.");
    if (!formData.client_name) return setErrorMessage("Informe o nome do cliente.");
    if (!formData.date) return setErrorMessage("Selecione uma data.");

    setIsSubmitting(true);
    const res = await createManualBooking({
      sessionId: formData.session_id,
      customer_name: formData.client_name,
      customer_email: formData.client_email,
      customer_phone: formData.client_phone,
      booking_date: formData.date,
      start_time: formData.start_time + ":00", 
      package_type: packages.find(p => p.id === formData.package_id)?.name || 'Personalizado',
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
      setErrorMessage(res.error || "Erro desconhecido ao criar agendamento.");
    }
    setIsSubmitting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-text-dark/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 space-y-12">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-serif text-text-dark italic">Nova Reserva Manual</h2>
              <p className="text-[10px] uppercase tracking-[0.3em] text-text-light mt-2 font-bold">Registro Direto no Sistema</p>
            </div>
            <button onClick={onClose} className="p-2 hover:text-blush transition-colors outline-none">
              <X size={32} strokeWidth={1} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Box de Erro (Prominente) */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="p-6 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-4 shadow-sm"
                >
                  <div className="p-2 bg-red-100 text-red-600 rounded-full"><X size={20} /></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-1">Erro de Preenchimento</h4>
                    <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {createdResult && createdResult.paymentUrl && (
              <div className="p-6 bg-blush/10 border border-blush/20 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-blush">
                  <Check size={24} />
                  <h4 className="font-serif text-lg">Agendamento Manual Criado!</h4>
                </div>
                <div className="flex gap-2">
                  <input readOnly value={createdResult.paymentUrl} className="flex-1 bg-white border border-sand/20 p-3 rounded-lg text-[10px] font-mono" />
                  <button type="button" onClick={() => copyToClipboard(createdResult.paymentUrl)} className="p-3 bg-blush text-white rounded-lg hover:opacity-90 flex items-center gap-2">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span className="text-[10px] font-bold uppercase">Copiar Link</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Esquerda: Cliente & Financeiro */}
              <div className="space-y-10">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-text-dark border-b border-sand/20 pb-4">Informações do Cliente</h3>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-text-light">Nome Completo</label>
                    <input
                      type="text" className="w-full bg-transparent border-b border-sand pb-3 font-serif text-xl outline-none focus:border-blush transition-all"
                      value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      placeholder="Ex: Maria Oliveira" required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-text-light">E-mail</label>
                        <input
                        type="email" className="w-full bg-transparent border-b border-sand pb-3 font-serif text-lg outline-none focus:border-blush transition-all"
                        value={formData.client_email} onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                        placeholder="maria@exemplo.com"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-text-light">WhatsApp</label>
                        <input
                        type="tel" className="w-full bg-transparent border-b border-sand pb-3 font-serif text-lg outline-none focus:border-blush transition-all"
                        value={formData.client_phone} onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                        placeholder="(00) 00000-00"
                        />
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 bg-linen/10 p-6 border-l-2 border-blush/30">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-text-dark">Controle Financeiro</h4>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" checked={formData.isGift} 
                                onChange={(e) => setFormData({...formData, isGift: e.target.checked})}
                                className="accent-blush"
                            />
                            <span className="text-[9px] uppercase font-bold text-text-light group-hover:text-blush transition-colors">🎁 Cortesia?</span>
                        </label>
                    </div>
                    
                    {!formData.isGift && (
                        <div className="grid grid-cols-2 gap-6 scale-95 origin-left">
                            <div className="space-y-2">
                                <label className="text-[8px] uppercase font-bold text-text-light">Valor Total (R$)</label>
                                <input 
                                    type="number" className="w-full bg-transparent border-b border-sand pb-2 font-serif text-lg outline-none"
                                    value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] uppercase font-bold text-text-light">Valor Pago (R$)</label>
                                <input 
                                    type="number" className="w-full bg-transparent border-b border-sand pb-2 font-serif text-lg outline-none text-blush"
                                    value={formData.paid_amount} onChange={(e) => setFormData({...formData, paid_amount: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[8px] uppercase font-bold text-text-light">Status do Agendamento</label>
                        <select 
                            className="w-full bg-transparent border-b border-sand pb-2 font-serif text-sm outline-none"
                            value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        >
                            <option value="confirmed">🌟 Confirmado (Grade Bloqueada)</option>
                            <option value="pending">⏳ Pendente (Aguardando Pagamento)</option>
                        </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direita: Sessão & Horário */}
              <div className="space-y-10">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-text-dark border-b border-sand/20 pb-4">Detalhes do Agendamento</h3>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-text-light">Tipo de Sessão</label>
                    <select
                      className="w-full bg-transparent border-b border-sand pb-3 font-serif text-lg outline-none focus:border-blush transition-all appearance-none"
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
                      <option value="">Selecione um serviço...</option>
                      {sessions.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-text-light">Data</label>
                      <input
                        type="date"
                        className="w-full bg-transparent border-b border-sand pb-3 font-serif text-lg outline-none focus:border-blush transition-all"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-text-light">Horário</label>
                      <select
                        className="w-full bg-transparent border-b border-sand pb-3 font-serif text-lg outline-none focus:border-blush transition-all appearance-none disabled:opacity-30"
                        value={formData.start_time}
                        disabled={!formData.date || !formData.session_id || isSlotsLoading}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        required
                      >
                        <option value="">{isSlotsLoading ? "Carregando..." : "Selecione..."}</option>
                        {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Ações */}
            <div className="pt-12 border-t border-sand/10 flex items-center justify-between">
              <div className="flex items-center gap-4 text-text-light bg-linen/20 px-6 py-3 border-l-2 border-blush/30 italic">
                <AlertCircle size={16} className="text-blush" />
                <span className="text-xs">O cliente receberá uma confirmação automática por e-mail.</span>
              </div>
              <div className="flex items-center gap-6">
                <button type="button" onClick={onClose} className="text-[10px] uppercase tracking-widest font-bold text-text-light hover:text-text-dark" disabled={isSubmitting}>Cancelar</button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.session_id || !formData.start_time || !formData.client_name || !formData.date}
                  className="px-12 py-5 bg-blush text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#C29088] transition-all disabled:opacity-30 flex items-center gap-3 shadow-xl"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Confirmar Reserva
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
