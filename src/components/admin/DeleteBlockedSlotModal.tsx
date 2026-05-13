"use client";

import React, { useState } from "react";
import { X, Ban, Loader2, Trash2, ShieldAlert, CalendarClock } from "lucide-react";
import { motion } from "framer-motion";
import { deleteBooking } from "@/lib/actions/admin-actions";

export function DeleteBlockedSlotModal({
  booking,
  onClose,
  onUpdated
}: {
  booking: any,
  onClose: () => void,
  onUpdated: () => void
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBlock = booking.customer_name?.startsWith('BLOQUEIO:');
  const blockReason = isBlock ? booking.customer_name.replace('BLOQUEIO: ', '') : '';
  const dateStr = booking.booking_date
    ? new Date(booking.booking_date + 'T12:00:00').toLocaleDateString('pt-BR')
    : '';
  const timeStr = booking.start_time?.slice(0, 5) || '';

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await deleteBooking(booking.id);
      if (res.success) {
        onUpdated();
        onClose();
      } else {
        setError(res.error || "Erro ao remover bloqueio.");
      }
    } catch (e: any) {
      setError(e.message || "Erro interno ao processar exclusão.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[10vh] sm:pt-[15vh] overflow-y-auto overscroll-contain">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[var(--color-admin-bg)] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--color-admin-border)]"
      >
        <div className="p-8 lg:p-10 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20">
                <Ban size={24} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[var(--color-admin-text)] tracking-tight">
                  Horário Bloqueado
                </h2>
                <p className="text-[12px] font-medium text-slate-400">
                  {dateStr} às {timeStr}h
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldAlert size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-red-700">Motivo do Bloqueio</p>
                  <p className="text-[14px] font-medium text-red-600 mt-1">
                    {blockReason || "Sem motivo informado"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-red-500/10">
                <CalendarClock size={18} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-slate-600">Detalhes</p>
                  <p className="text-[12px] font-medium text-slate-500 mt-1">
                    Ref: {booking.id?.split('-')[0]} | Criado em: {new Date(booking.created_at || booking.createdAt || '').toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-[12px] text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-[2] py-4 bg-red-600 text-white text-[13px] font-bold rounded-2xl transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-lg shadow-red-900/20 active:scale-95 hover:bg-red-700"
              >
                {isDeleting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                Remover Bloqueio
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
