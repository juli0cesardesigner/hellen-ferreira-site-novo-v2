"use client";

import React, { useState } from "react";
import { X, Save, Trash2, Loader2, CalendarClock, Database, User, ShieldAlert, CreditCard, Activity, Check } from "lucide-react";
import { updateBooking, deleteBooking } from "@/lib/actions/admin-actions";
import { motion, AnimatePresence } from "framer-motion";

export function EditBookingModal({ booking, onClose, onUpdated }: { booking: any, onClose: () => void, onUpdated: () => void }) {
  const [formData, setFormData] = useState({
    customer_name: booking.customer_name || booking.client_name || "",
    customer_email: booking.customer_email || booking.client_email || "",
    customer_phone: booking.customer_phone || booking.client_phone || "",
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
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      booking_date: formData.booking_date,
      start_time: formData.start_time + (formData.start_time.length === 5 ? ":00" : ""),
      status: formData.status,
      total_amount: formData.total_amount,
      paid_amount: formData.paid_amount,
      updated_at: new Date().toISOString()
    });

    if (res.success) {
      onUpdated();
      onClose();
    } else {
      alert("Erro ao salvar: " + res.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta reserva permanentemente? Esta ação não pode ser desfeita.")) return;
    setIsDeleting(true);
    const res = await deleteBooking(booking.id);
    if (res.success) {
      onUpdated();
      onClose();
    } else {
      alert("Erro ao excluir: " + res.error);
    }
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center lg:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="relative bg-[#F8FAFC] w-full max-w-4xl h-full lg:max-h-[90vh] lg:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200">
        
        {/* Admin Header */}
        <div className="px-6 lg:px-8 py-5 lg:py-6 border-b border-zinc-200 flex items-center justify-between gap-4 bg-white shrink-0">
          <div className="flex items-center gap-3 lg:gap-5">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-zinc-900 text-white flex items-center justify-center rounded-xl shadow-lg shadow-zinc-200">
              <Database size={20} className="lg:size-[24px]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs lg:text-base font-bold text-zinc-900 uppercase tracking-tight truncate">Editar Reserva</h2>
              <p className="text-[8px] lg:text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-0.5 truncate">
                Reserva #{booking.id.split('-')[0]}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all outline-none">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-8 lg:space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Identity Scope */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
                 <User size={14} className="text-zinc-400" />
                 <h3 className="text-[10px] uppercase font-bold text-zinc-900 tracking-widest">Informações do Cliente</h3>
              </div>
              
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Nome Completo</label>
                  <input 
                    type="text" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} 
                    className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-900 shadow-sm transition-all" required 
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-zinc-500">E-mail</label>
                    <input 
                      type="email" value={formData.customer_email} onChange={(e) => setFormData({...formData, customer_email: e.target.value})} 
                      className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-900 shadow-sm transition-all" 
                    />
                  </div>
                   <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-zinc-500">WhatsApp / Telefone</label>
                    <input 
                      type="tel" value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} 
                      className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-900 shadow-sm transition-all" 
                    />
                  </div>
                </div>
            </div>

            {/* Persistence & Ledger */}
             <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
                 <CreditCard size={14} className="text-zinc-400" />
                 <h3 className="text-[10px] uppercase font-bold text-zinc-900 tracking-widest">Data e Pagamento</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Data Agendada</label>
                  <input 
                    type="date" value={formData.booking_date} onChange={(e) => setFormData({...formData, booking_date: e.target.value})} 
                    className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-900 shadow-sm transition-all" required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Horário de Início</label>
                  <input 
                    type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} 
                    className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:ring-1 focus:ring-zinc-900 shadow-sm transition-all" required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Valor Total</label>
                  <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-300">R$</span>
                     <input 
                       type="number" value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: parseFloat(e.target.value)})} 
                       className="w-full bg-white border border-zinc-200 pl-8 pr-3 py-3 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-zinc-900 shadow-sm transition-all" 
                     />
                  </div>
                </div>
                 <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-blue-600">Valor Pago</label>
                  <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-200">R$</span>
                     <input 
                       type="number" value={formData.paid_amount} onChange={(e) => setFormData({...formData, paid_amount: parseFloat(e.target.value)})} 
                       className="w-full bg-white border border-blue-100 pl-8 pr-3 py-3 rounded-xl text-xs font-bold text-blue-600 outline-none focus:border-blue-500 shadow-sm transition-all" 
                     />
                  </div>
                </div>
              </div>

               <div className="space-y-1.5 pt-2">
                <label className="text-[9px] uppercase font-bold text-zinc-500">Status da Reserva</label>
                <select 
                  value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} 
                  className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-zinc-900 appearance-none shadow-sm cursor-pointer"
                >
                   <option value="pending">Aguardando Pagamento</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>

            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-200 flex flex-col lg:flex-row items-center justify-between gap-6 pb-4">
              <button 
               type="button" onClick={handleDelete} disabled={isDeleting} 
               className="w-full lg:w-auto px-6 py-3.5 text-[9px] lg:text-[10px] uppercase font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-center gap-2 border border-transparent hover:border-rose-100"
             >
               {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} EXCLUIR RESERVA
             </button>
             
             <div className="flex gap-4 w-full lg:w-auto">
                <button type="button" onClick={onClose} className="hidden lg:flex px-10 py-4 bg-zinc-50 border border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition-all flex-1 lg:flex-none">Cancelar</button>
               <button 
                 type="submit" disabled={isSubmitting} 
                 className="px-12 py-4 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50 flex-1 lg:flex-none justify-center rounded-xl hover:-translate-y-0.5 active:translate-y-0"
               >
                 {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} SALVAR ALTERAÇÕES
               </button>
             </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
