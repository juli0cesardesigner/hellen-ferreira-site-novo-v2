"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, ShieldAlert } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  variant = "danger"
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-950 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden border border-zinc-900"
          >
            {/* Visual Indicator Top */}
            <div className={`h-1 w-full ${
              variant === "danger" ? "bg-red-500" :
              variant === "warning" ? "bg-amber-500" :
              "bg-white"
            }`} />

            <div className="p-10">
              <div className="flex items-center gap-6 mb-8">
                <div className={`p-4 rounded-2xl border ${
                  variant === "danger" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  variant === "warning" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                  "bg-zinc-900 text-white border-zinc-800"
                }`}>
                  <ShieldAlert size={28} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                   <h3 className="text-[16px] font-bold text-white tracking-tight leading-tight">{title}</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Ação necessária</p>
                </div>
                <button 
                  onClick={onCancel}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-black/40 border border-zinc-900 rounded-2xl p-6 mb-10">
                 <p className="text-[12px] text-slate-300 leading-relaxed font-medium">
                   {message}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                   <button
                  onClick={onCancel}
                  className="flex-1 py-5 text-[12px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all active:scale-95"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                   className={`flex-1 py-5 px-8 text-[12px] font-bold uppercase tracking-wider text-white rounded-2xl transition-all active:scale-[0.98] shadow-lg ${
                    variant === "danger" ? "bg-red-500 hover:bg-red-600" :
                    variant === "warning" ? "bg-amber-500 hover:bg-amber-600" :
                    "bg-white text-slate-950 hover:bg-slate-200"
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
            

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
