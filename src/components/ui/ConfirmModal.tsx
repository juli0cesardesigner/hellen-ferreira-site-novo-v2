"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200"
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-2xl ${
                  variant === "danger" ? "bg-rose-50 text-rose-500" :
                  variant === "warning" ? "bg-amber-50 text-amber-500" :
                  "bg-blue-50 text-blue-500"
                }`}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">{title}</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Confirmação Necessária</p>
                </div>
                <button 
                  onClick={onCancel}
                  className="ml-auto p-2 text-zinc-300 hover:text-zinc-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                {message}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-10">
                <button
                  onClick={onCancel}
                  className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-2xl transition-all border border-transparent hover:border-zinc-100"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-white rounded-2xl transition-all shadow-lg shadow-zinc-200 active:scale-[0.98] ${
                    variant === "danger" ? "bg-rose-500 hover:bg-rose-600 shadow-rose-100" :
                    variant === "warning" ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100" :
                    "bg-zinc-900 hover:bg-black shadow-zinc-200"
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
