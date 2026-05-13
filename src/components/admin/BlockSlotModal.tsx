"use client";

import React, { useState } from "react";
import { X, ShieldAlert, Loader2, Save, Ban } from "lucide-react";
import { motion } from "framer-motion";
import { blockSlot } from "@/lib/actions/admin-actions";

export function BlockSlotModal({ 
  onClose, 
  onCreated, 
  date, 
  time 
}: { 
  onClose: () => void, 
  onCreated: () => void, 
  date: Date, 
  time: string 
}) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Por favor, informe o motivo do bloqueio.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await blockSlot(dateStr, time, reason);
      if (res.success) {
        onCreated();
        onClose();
      } else {
        setError(res.error || "Erro ao bloquear horário.");
      }
    } catch (e) {
      setError("Erro interno ao processar bloqueio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20">
                <Ban size={24} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[var(--color-admin-text)] tracking-tight">Bloquear Horário</h2>
                <p className="text-[12px] font-medium text-slate-400">{date.toLocaleDateString('pt-BR')} às {time}h</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <ShieldAlert size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-[12px] text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Motivo do Bloqueio</label>
              <textarea
                autoFocus
                className="w-full bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] p-5 rounded-2xl text-[14px] font-medium text-[var(--color-admin-text)] outline-none focus:border-red-500/50 transition-all placeholder:text-slate-300 shadow-inner min-h-[120px] resize-none"
                placeholder="Ex: Consultoria Externa, Manutenção, Particular..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason.trim()}
                className="flex-[2] py-4 bg-red-600 text-white text-[13px] font-bold rounded-2xl transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-lg shadow-red-900/20 active:scale-95"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Confirmar Bloqueio
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
