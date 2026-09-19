"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Calendar, Sparkles, DollarSign, ExternalLink } from "lucide-react";
import { Booking } from "@/types/database";

interface NotificationDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
  onOpenFullEdit: (booking: Booking) => void;
}

export function NotificationDetailModal({
  booking,
  onClose,
  onOpenFullEdit,
}: NotificationDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !booking) return null;

  // Formata Data DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return "";
      const [y, m, d] = dateStr.split("-");
      return `${d}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  // Formata Horário HH:mm
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    return timeStr.slice(0, 5) + "h";
  };

  // Determina o valor pago (paid_amount com fallback para total_amount)
  const paidVal = booking.paid_amount && booking.paid_amount > 0
    ? booking.paid_amount
    : (booking.total_amount && booking.total_amount > 0 ? booking.total_amount : 0);

  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(paidVal);

  const sessionName = (booking.sessions as any)?.name || booking.package_type || "Ensaio Fotográfico";

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] w-full max-w-md max-h-[85vh] sm:max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
        >
          {/* Header (Fixo no topo do modal) */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[var(--color-admin-border)] flex items-center justify-between bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-2 text-[var(--color-admin-accent)] font-bold text-xs uppercase tracking-widest">
              <Sparkles size={16} />
              <span>Detalhes da Notificação</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              title="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body (Rolável se a tela for pequena) */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar flex-1">
            {/* Nome da Cliente */}
            <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-100 flex items-start gap-3.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[var(--color-admin-accent)] shrink-0 shadow-sm">
                <User size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Nome da Cliente
                </span>
                <p className="text-sm sm:text-base font-black text-[var(--color-admin-text)] truncate mt-0.5">
                  {booking.customer_name}
                </p>
              </div>
            </div>

            {/* Data do Ensaio */}
            <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-100 flex items-start gap-3.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
                <Calendar size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Data do Ensaio
                </span>
                <p className="text-xs sm:text-sm font-bold text-[var(--color-admin-text)] mt-0.5">
                  {formatDate(booking.booking_date)} às {formatTime(booking.start_time)}
                </p>
              </div>
            </div>

            {/* Tipo do Ensaio */}
            <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-100 flex items-start gap-3.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-purple-500 shrink-0 shadow-sm">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Tipo do Ensaio
                </span>
                <p className="text-xs sm:text-sm font-bold text-[var(--color-admin-text)] mt-0.5">
                  {sessionName} • {booking.location_type === 'externo' ? `🌳 Externo${booking.location_details ? ` (${booking.location_details})` : ''}` : '🏠 Estúdio'}
                </p>
              </div>
            </div>

            {/* Valor Pago */}
            <div className="bg-emerald-50/80 p-3.5 sm:p-4 rounded-2xl border border-emerald-100 flex items-start gap-3.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                <DollarSign size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Valor Pago
                </span>
                <p className="text-base sm:text-lg font-black text-emerald-700 mt-0.5">
                  {formattedAmount}
                </p>
              </div>
            </div>
          </div>

          {/* Footer (Fixo na parte inferior do modal) */}
          <div className="p-4 sm:p-6 sm:pt-2 bg-slate-50/30 border-t border-[var(--color-admin-border)] flex flex-col gap-2 shrink-0">
            <button
              onClick={() => {
                onClose();
                onOpenFullEdit(booking);
              }}
              className="w-full py-3 sm:py-3.5 px-4 bg-[var(--color-admin-accent)] hover:bg-[var(--color-admin-accent)]/90 text-white font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <ExternalLink size={16} />
              <span>Abrir Edição Completa</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
