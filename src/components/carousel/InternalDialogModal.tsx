'use client';

import React, { useEffect } from 'react';
import { AlertCircle, HelpCircle, Check, X } from 'lucide-react';

export interface InternalModalConfig {
  isOpen: boolean;
  type?: 'confirm' | 'alert' | 'seamless';
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function InternalDialogModal({ config }: { config: InternalModalConfig }) {
  // Fecha diálogo com tecla Escape
  useEffect(() => {
    if (!config.isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (config.onCancel) {
          config.onCancel();
        } else {
          config.onConfirm();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.isOpen, config.onCancel, config.onConfirm]);

  if (!config.isOpen) return null;

  const isAlert = config.type === 'alert';

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={config.title ? 'internal-dialog-title' : undefined}
      aria-describedby="internal-dialog-message"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 motion-reduce:animate-none select-none"
    >
      <div className="bg-[#10141E] border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-150 motion-reduce:animate-none">
        {/* Ícone */}
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-3.5 shrink-0">
          {config.type === 'alert' ? (
            <AlertCircle className="w-6 h-6 stroke-[2]" />
          ) : (
            <HelpCircle className="w-6 h-6 stroke-[2]" />
          )}
        </div>

        {/* Título (opcional) */}
        {config.title && (
          <h3 id="internal-dialog-title" className="font-bold text-base text-slate-100 mb-1">
            {config.title}
          </h3>
        )}

        {/* Mensagem */}
        <p id="internal-dialog-message" className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          {config.message}
        </p>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2.5 w-full">
          {!isAlert && (
            <button
              onClick={config.onCancel}
              className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
            >
              {config.cancelLabel || 'Cancelar'}
            </button>
          )}

          <button
            onClick={config.onConfirm}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
          >
            {config.confirmLabel || (isAlert ? 'OK' : 'Confirmar')}
          </button>
        </div>
      </div>
    </div>
  );
}

