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
                  <h3 className="text-[14px] font-black text-white uppercase tracking-tighter leading-tight">{title}</h3>
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-1.5 font-mono">Status: Confirmação Requerida</p>
                </div>
                <button 
                  onClick={onCancel}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-600 hover:text-white transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-black/40 border border-zinc-900 rounded-2xl p-6 mb-10">
                <p className="text-[11px] text-zinc-400 leading-relaxed font-mono font-black uppercase tracking-tight">
                   {message}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onCancel}
                  className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 hover:text-white transition-all active:scale-95"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={`flex-1 py-5 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-white rounded-2xl transition-all active:scale-[0.98] shadow-2xl ${
                    variant === "danger" ? "bg-red-500 hover:bg-red-600 shadow-red-500/10" :
                    variant === "warning" ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10" :
                    "bg-white text-zinc-950 hover:bg-zinc-200 shadow-white/5"
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
            
            {/* Terminal Aesthetic Detail */}
            <div className="px-10 py-3 bg-black border-t border-zinc-900/50 flex justify-between items-center">
               <span className="text-[7px] text-zinc-800 font-mono font-black uppercase tracking-[0.5em]">Auth_Validated_Protocol</span>
               <div className="flex gap-1">
                  <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                  <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                  <div className="w-1 h-1 bg-zinc-800 rounded-full" />
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
