'use client';

import React, { useState, useEffect } from 'react';
import {
  CarouselLogEntry,
  getCarouselLogs,
  clearCarouselLogs,
  formatLogsForExport
} from '@/lib/carousel/logger';
import { X, Copy, Check, Trash2, RefreshCw, AlertCircle, AlertTriangle, Info, Terminal } from 'lucide-react';

interface CarouselLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CarouselLogsModal: React.FC<CarouselLogsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<CarouselLogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const refreshLogs = () => {
    setLogs(getCarouselLogs());
  };

  useEffect(() => {
    if (isOpen) {
      refreshLogs();
    }
  }, [isOpen]);

  // Fecha modal com a tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((l) => {
    if (filter === 'all') return true;
    return l.level === filter;
  });

  const errorCount = logs.filter((l) => l.level === 'error').length;
  const warnCount = logs.filter((l) => l.level === 'warn').length;

  const handleCopy = async () => {
    const text = formatLogsForExport(logs);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Falha ao copiar logs:', e);
    }
  };

  const handleClear = () => {
    clearCarouselLogs();
    setLogs([]);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('pt-BR', { hour12: false });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logs-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 motion-reduce:animate-none select-none"
      style={{
        paddingTop: 'max(0.75rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))',
        paddingBottom: 'max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))'
      }}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0F1420] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-[#141A29] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 id="logs-modal-title" className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Logs do Estúdio
                {errorCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    {errorCount} {errorCount === 1 ? 'erro' : 'erros'}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">Rastreamento de renderização e ações no iPhone</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={refreshLogs}
              aria-label="Recarregar logs"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg active:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
              title="Recarregar logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Fechar janela de logs"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg active:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar de Ações e Filtros */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#101524] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Filtros */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Todos ({logs.length})
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                filter === 'error'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-800/70 text-red-300 hover:bg-slate-800'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>Erros ({errorCount})</span>
            </button>
            <button
              onClick={() => setFilter('warn')}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                filter === 'warn'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-800/70 text-amber-300 hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Avisos ({warnCount})</span>
            </button>
          </div>

          {/* Botões Copiar / Limpar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white text-xs font-medium border border-slate-700/60 transition-all"
              title="Copiar todos os logs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar Logs</span>
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 hover:text-red-200 text-xs font-medium border border-red-800/40 transition-all active:scale-95"
              title="Limpar todos os logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          </div>
        </div>

        {/* Lista de Logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs font-mono select-text">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <Info className="w-6 h-6 text-slate-500" />
              <span>Nenhum log registrado para este filtro.</span>
            </div>
          ) : (
            filteredLogs
              .slice()
              .reverse()
              .map((log) => {
                const isError = log.level === 'error';
                const isWarn = log.level === 'warn';
                const isExpanded = expandedLogId === log.id;
                const hasExtra = Boolean(log.details || log.stack);

                return (
                  <div
                    key={log.id}
                    onClick={() => hasExtra && setExpandedLogId(isExpanded ? null : log.id)}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isError
                        ? 'bg-red-950/20 border-red-800/50 text-red-200'
                        : isWarn
                        ? 'bg-amber-950/20 border-amber-800/50 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    } ${hasExtra ? 'cursor-pointer hover:border-slate-600' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] text-slate-400 shrink-0 font-sans pt-0.5">
                        {formatTime(log.timestamp)}
                      </span>

                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold shrink-0 ${
                          isError
                            ? 'bg-red-900/60 text-red-300'
                            : isWarn
                            ? 'bg-amber-900/60 text-amber-300'
                            : 'bg-blue-950 text-blue-300'
                        }`}
                      >
                        {log.level}
                      </span>

                      <div className="flex-1 break-words leading-relaxed font-sans text-xs">
                        {log.message}
                      </div>

                      {hasExtra && (
                        <span className="text-[10px] text-slate-400 shrink-0 underline">
                          {isExpanded ? 'recolher' : 'detalhes'}
                        </span>
                      )}
                    </div>

                    {isExpanded && hasExtra && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono space-y-1.5 bg-black/30 p-2 rounded">
                        {log.details && (
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 font-sans">
                              Detalhes:
                            </div>
                            <pre className="whitespace-pre-wrap break-all text-slate-300">
                              {log.details}
                            </pre>
                          </div>
                        )}
                        {log.stack && (
                          <div>
                            <div className="text-[10px] uppercase font-bold text-red-400 font-sans">
                              Stack Trace:
                            </div>
                            <pre className="whitespace-pre-wrap break-all text-red-300">
                              {log.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};
