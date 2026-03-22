"use client";

import React, { useState } from "react";
import { X, Save, Trash2, Loader2, CalendarClock } from "lucide-react";
import { updateBooking, deleteBooking } from "@/lib/actions/admin-actions";
import { motion } from "framer-motion";

export function EditBookingModal({ booking, onClose, onUpdated }: { booking: any, onClose: () => void, onUpdated: () => void }) {
  const [formData, setFormData] = useState({
    client_name: booking.client_name || "",
    client_email: booking.client_email || "",
    client_phone: booking.client_phone || "",
    booking_date: booking.booking_date || "",
    start_time: booking.start_time?.slice(0, 5) || "",
    status: booking.status || "pending",
    total_amount: booking.total_amount || 0,
    paid_amount: booking.paid_amount || 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await updateBooking(booking.id, {
      client_name: formData.client_name,
      client_email: formData.client_email,
      client_phone: formData.client_phone,
      booking_date: formData.booking_date,
      start_time: formData.start_time + ":00",
      status: formData.status,
      total_amount: formData.total_amount,
      paid_amount: formData.paid_amount,
      updated_at: new Date().toISOString()
    });

    if (res.success) {
      onUpdated();
      onClose();
    } else {
      alert("Erro ao atualizar: " + res.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja apagar permanentemente este agendamento? Esta ação não pode ser desfeita.")) return;
    setIsDeleting(true);
    const res = await deleteBooking(booking.id);
    if (res.success) {
      onUpdated();
      onClose();
    } else {
      alert("Erro ao remover: " + res.error);
    }
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-text-dark/80 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-8 border-b border-sand/20 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-pearl/30">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blush/10 text-blush flex items-center justify-center border border-blush/20 rounded-full">
              <CalendarClock size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-serif text-text-dark italic">Editar Agendamento</h2>
              <p className="text-[10px] text-text-light uppercase tracking-[0.3em] font-bold mt-1">
                Ref: {booking.id.split('-')[0]} • {booking.sessions?.name || "Desconhecido"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:text-blush transition-colors outline-none"><X size={32} strokeWidth={1} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-text-dark border-b border-sand/30 pb-3">Dados Cadastrais</h3>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-text-light">Nome do Cliente</label>
                <input type="text" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} className="w-full bg-transparent border-b border-sand pb-3 font-serif text-xl outline-none focus:border-blush" required />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-text-light">E-mail</label>
                  <input type="email" value={formData.client_email} onChange={(e) => setFormData({...formData, client_email: e.target.value})} className="w-full bg-transparent border-b border-sand pb-3 font-serif text-base outline-none focus:border-blush" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-text-light">Telefone</label>
                  <input type="tel" value={formData.client_phone} onChange={(e) => setFormData({...formData, client_phone: e.target.value})} className="w-full bg-transparent border-b border-sand pb-3 font-serif text-base outline-none focus:border-blush" />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-text-dark border-b border-sand/30 pb-3">Reserva & Financeiro</h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-text-light">Data</label>
                  <input type="date" value={formData.booking_date} onChange={(e) => setFormData({...formData, booking_date: e.target.value})} className="w-full bg-transparent border-b border-sand pb-3 font-serif text-lg outline-none focus:border-blush" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-text-light">Hora (Início)</label>
                  <input type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="w-full bg-transparent border-b border-sand pb-3 font-serif text-lg outline-none focus:border-blush" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-text-light">Valor Total (R$)</label>
                  <input type="number" value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: parseFloat(e.target.value)})} className="w-full bg-transparent border-b border-sand pb-3 font-serif text-lg outline-none focus:border-blush" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-text-light text-blush">Valor Pago (R$)</label>
                  <input type="number" value={formData.paid_amount} onChange={(e) => setFormData({...formData, paid_amount: parseFloat(e.target.value)})} className="w-full bg-transparent border-b border-sand pb-3 font-serif text-lg outline-none focus:border-blush text-blush" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-text-light">Status da Reserva</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-transparent border-b border-sand pb-3 font-serif text-base outline-none focus:border-blush">
                  <option value="pending">⏳ Pendente (Aguardando Pgto)</option>
                  <option value="confirmed">🌟 Confirmado</option>
                  <option value="cancelled">❌ Cancelado</option>
                  <option value="completed">📸 Concluído</option>
                </select>
              </div>

            </div>
          </div>
          
          <div className="pt-8 border-t border-sand/20 flex flex-col md:flex-row items-center justify-between gap-6">
             <button type="button" onClick={handleDelete} disabled={isDeleting} className="text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-600 transition-colors flex items-center gap-2">
               {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Apagar Reserva
             </button>
             
             <div className="flex gap-4 w-full md:w-auto">
               <button type="button" onClick={onClose} className="px-8 py-4 border border-sand/50 text-text-dark text-[10px] uppercase font-bold hover:bg-sand/10 transition-colors flex-1 md:flex-none text-center">Cancelar</button>
               <button type="submit" disabled={isSubmitting} className="px-10 py-4 bg-text-dark text-white text-[10px] uppercase font-bold tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50 flex-1 md:flex-none justify-center">
                 {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar Alterações
               </button>
             </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
