"use client";

import React, { useState } from "react";
import { X, Save, Trash2, Loader2, CalendarClock, Database, User, ShieldAlert, CreditCard, ChevronRight, Check } from "lucide-react";
import { updateBooking, deleteBooking } from "@/lib/actions/admin-actions";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { InternalDatePicker } from "@/components/ui/InternalDatePicker";

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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
    setIsDeleting(true);
    try {
      const res = await deleteBooking(booking.id);
      if (res.success) {
        onUpdated();
        onClose();
      } else {
        alert("Erro ao excluir: " + res.error);
      }
    } catch (error: any) {
      console.error("Critical error deleting booking:", error);
      alert("Erro crítico de conexão ou permissão: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center lg:p-6 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 30 }} 
        className="relative bg-[var(--color-admin-bg)] w-full max-w-5xl h-full lg:max-h-[85vh] lg:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden border border-[var(--color-admin-border)]"
      >
        
        {/* Admin Header Terminal */}
        <div className="px-8 lg:px-12 py-8 lg:py-10 border-b border-[var(--color-admin-border)] flex items-center justify-between gap-6 bg-[var(--color-admin-bg)] shrink-0 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-accent)] flex items-center justify-center rounded-2xl shadow-inner border border-[var(--color-admin-accent)]/20">
              <Database size={28} className="lg:size-[32px]" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[14px] lg:text-[20px] font-bold text-[var(--color-admin-text)] tracking-tight leading-none">Editar Agendamento</h2>
              <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium mt-2">
                Referência: {booking.id.split('-')[0].toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[var(--color-admin-surface)] text-[var(--color-admin-text-muted)] transition-all border border-[var(--color-admin-border)] active:scale-90">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-14 space-y-10 lg:space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Identity Scope Terminal */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-[var(--color-admin-border)] pb-5">
                 <User size={18} className="text-slate-300" />
                  <h3 className="text-[14px] font-bold text-[var(--color-admin-text)] tracking-tight">Dados do Cliente</h3>
              </div>
              
                <div className="space-y-3">
                   <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-1">Nome do Cliente</label>
                  <div className="relative group">
                     <input 
                      type="text" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} 
                      className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] px-6 py-5 rounded-2xl text-[14px] font-bold text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300 shadow-inner" required 
                    />
                    <User size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[var(--color-admin-accent)] transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                   <div className="space-y-3">
                     <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-1">E-mail</label>
                      <input 
                      type="email" value={formData.customer_email} onChange={(e) => setFormData({...formData, customer_email: e.target.value})} 
                      className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] px-6 py-5 rounded-2xl text-[13px] font-medium text-[var(--color-admin-text-secondary)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300 shadow-inner" 
                    />
                  </div>
                   <div className="space-y-3">
                     <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-1">Telefone</label>
                     <input 
                      type="tel" value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} 
                      className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] px-6 py-5 rounded-2xl text-[13px] font-medium text-[var(--color-admin-text-secondary)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300 shadow-inner" 
                    />
                  </div>
                </div>
            </div>

            {/* Persistence & Ledger Terminal */}
             <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-[var(--color-admin-border)] pb-5">
                 <CalendarClock size={18} className="text-slate-300" />
                  <h3 className="text-[14px] font-bold text-[var(--color-admin-text)] tracking-tight">Detalhes do Agendamento</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InternalDatePicker
                  label="Data"
                  value={formData.booking_date}
                  onChange={(date) => setFormData({ ...formData, booking_date: date })}
                />
                <div className="space-y-3">
                   <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-1">Horário</label>
                  <div className="relative group">
                     <input 
                      type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} 
                      className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] px-6 py-5 rounded-2xl text-[14px] font-bold text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all shadow-inner" required 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-admin-surface)] rounded-[2rem] p-8 border border-[var(--color-admin-border)] shadow-inner space-y-8 mt-4">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-1">Valor Total</label>
                    <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-300 group-focus-within:text-[var(--color-admin-text)] transition-colors">R$</span>
                          <input 
                          type="number" value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: parseFloat(e.target.value)})} 
                          className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] pl-12 pr-5 py-4 rounded-2xl text-[15px] font-bold text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] shadow-inner" 
                        />
                    </div>
                  </div>
                   <div className="space-y-2">
                     <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-1">Valor Pago</label>
                    <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-300 group-focus-within:text-emerald-600 transition-colors">R$</span>
                        <input 
                          type="number" value={formData.paid_amount} onChange={(e) => setFormData({...formData, paid_amount: parseFloat(e.target.value)})} 
                          className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] pl-12 pr-5 py-4 rounded-2xl text-[15px] font-bold text-emerald-600 outline-none focus:border-[var(--color-admin-accent)] shadow-inner" 
                        />
                    </div>
                  </div>
                </div>

                 <div className="space-y-3 pt-6 border-t border-[var(--color-admin-border)]">
                   <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-1">Status</label>
                  <div className="relative">
                     <select 
                       value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} 
                       className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] px-6 py-4 rounded-2xl text-[12px] font-bold text-[var(--color-admin-text)] tracking-wider outline-none focus:border-[var(--color-admin-accent)] appearance-none shadow-inner cursor-pointer"
                     >
                        <option value="pending">Pendente</option>
                       <option value="confirmed">Confirmado</option>
                       <option value="cancelled">Cancelado</option>
                       <option value="completed">Concluído</option>
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          <div className="pt-12 border-t border-[var(--color-admin-border)] flex flex-col lg:flex-row items-center justify-between gap-10 pb-6">
              <button 
               type="button" onClick={() => setShowConfirmDelete(true)} disabled={isDeleting} className="flex items-center gap-2 text-[12px] font-bold text-red-500 transition-all active:scale-95"
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />} Excluir registro
              </button>

             <ConfirmModal
                isOpen={showConfirmDelete}
                title="Excluir agendamento"
                message="Esta ação é permanente e não pode ser desfeita. O agendamento será removido definitivamente do banco de dados."
                confirmLabel="Confirmar exclusão"
                cancelLabel="Cancelar"
               onConfirm={handleDelete}
               onCancel={() => setShowConfirmDelete(false)}
             />
             
             <div className="flex gap-6 w-full lg:w-auto">
                  <button type="button" onClick={onClose} className="hidden lg:flex px-10 py-5 text-[12px] font-bold text-[var(--color-admin-text-muted)] transition-all active:scale-95">Cancelar</button>
               <button 
                 type="submit" disabled={isSubmitting} className="flex-1 lg:flex-none px-16 py-6 bg-[var(--color-admin-accent)] text-white text-[12px] font-bold tracking-wider rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-sm active:scale-95 group"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="transition-transform" />} Salvar alterações
               </button>
             </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
