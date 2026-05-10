"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} strokeWidth={1.5} />,
  error: <AlertCircle size={18} strokeWidth={1.5} />,
  info: <Info size={18} strokeWidth={1.5} />,
};

const styles: Record<ToastType, string> = {
  success: "bg-white border-sage/40 text-text-dark",
  error: "bg-white border-blush/40 text-text-dark",
  info: "bg-white border-sand/40 text-text-dark",
};

const iconStyles: Record<ToastType, string> = {
  success: "text-sage",
  error: "text-blush",
  info: "text-warm-gold",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 right-8 z-[200] flex flex-col-reverse gap-3 pointer-events-none max-w-[380px] w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto flex items-start gap-4 px-6 py-5 rounded-sm border shadow-2xl backdrop-blur-sm ${styles[toast.type]}`}
            >
              <span className={`mt-0.5 shrink-0 ${iconStyles[toast.type]}`}>
                {icons[toast.type]}
              </span>
              <p className="text-sm font-light leading-relaxed flex-1">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 text-text-light hover:text-text-dark transition-colors mt-0.5"
                aria-label="Fechar notificação"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
