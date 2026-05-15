"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Loader2, Lock, CalendarX, ShieldOff, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBlockedDates, addBlockedDate, removeBlockedDate } from "@/lib/actions/admin-actions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { InternalDatePicker } from "@/components/ui/InternalDatePicker";
import { BlockedDate } from "@/types/database";

export function MassBlockingSection({ onEditingChange }: { onEditingChange?: (editing: boolean) => void }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [blocks, setBlocks] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // System Modal State for Errors
  const [errorConfig, setErrorConfig] = useState<{
    isOpen: boolean,
    title: string,
    message: string,
    onConfirm: () => void
  } | null>(null);

  const showError = (title: string, message: string) => {
    setErrorConfig({ isOpen: true, title, message, onConfirm: () => setErrorConfig(null) });
  };

  // Notify parent if we are filling the form or delete modal is open
  useEffect(() => {
    if (onEditingChange) {
      const isFillingForm = !!(startDate || endDate || reason);
      onEditingChange(isFillingForm || !!confirmDeleteId || !!errorConfig);
    }
  }, [startDate, endDate, reason, confirmDeleteId, errorConfig, onEditingChange]);

  async function loadBlocks() {
    setIsLoading(true);
    const data = await getBlockedDates();
    setBlocks(data.blocks || []);
    setIsLoading(false);
  }

  useEffect(() => {
    loadBlocks();
  }, []);

  const handleCreateBlock = async () => {
    if (!startDate || !endDate) return;
    setIsSaving(true);
    
    const result = await addBlockedDate(startDate, endDate, reason || "Bloqueio Manual do Sistema");
    
    if (result.success) {
      await loadBlocks();
      setStartDate("");
      setEndDate("");
      setReason("");
    } else {
      showError("Erro de Sistema", "Não foi possível criar o bloqueio: " + result.error);
    }
    
    setIsSaving(false);
  };

  const handleRemoveBlock = async (id: string) => {
    setIsSaving(true);
    try {
      const result = await removeBlockedDate(id);
      if (result.success) {
        await loadBlocks();
        setConfirmDeleteId(null);
      } else {
        showError("Erro de Sistema", "Não foi possível remover o bloqueio: " + result.error);
      }
    } catch (e) {
      console.error(e);
      showError("Erro Crítico", "Ocorreu um erro inesperado ao tentar remover o bloqueio.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-14 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      
      {/* ─── Security Protocol Header ─── */}
      <div className="bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-10 lg:p-14 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0" />
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-red-500 opacity-[0.02] blur-[100px] rounded-full" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-inner">
                <Lock size={28} />
              </div>
              <div>
                <h4 className="text-[20px] font-bold text-[var(--color-admin-text)] tracking-tight leading-none">Bloqueio de Agenda</h4>
                <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium mt-2">Bloqueie períodos específicos para novos agendamentos</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row items-stretch xl:items-end gap-6 flex-1 w-full max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-[2]">
              <InternalDatePicker
                label="Data Inicial"
                value={startDate}
                onChange={setStartDate}
                className="w-full"
              />
              
              <InternalDatePicker
                label="Data Final"
                value={endDate}
                onChange={setEndDate}
                className="w-full"
              />
            </div>

            <div className="flex-[2] space-y-3">
               <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-2">Motivo do Bloqueio</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Férias, Manutenção..."
                  className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-2xl px-6 py-4 text-[13px] font-bold text-[var(--color-admin-text)] outline-none focus:border-red-500 transition-all shadow-inner placeholder:text-slate-300 h-[60px]"
                />
              </div>
            </div>

            <button 
               onClick={handleCreateBlock}
               disabled={isSaving || !startDate || !endDate}
               className="bg-[var(--color-admin-accent)] text-white px-8 py-5 rounded-2xl text-[12px] font-bold tracking-tight flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-20 shadow-sm h-[60px] whitespace-nowrap min-w-[200px]"
             >
               {isSaving ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} strokeWidth={2.5} />}
               Confirmar bloqueio
             </button>
          </div>
        </div>
      </div>

      {/* ─── Active Blocks Inventory ─── */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
             <div className="w-1.5 h-6 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
             <h4 className="text-[14px] font-bold text-[var(--color-admin-text)] tracking-tight">Bloqueios ativos</h4>
          </div>
           <span className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide">Total: {blocks.length}</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-20">
          {isLoading ? (
            <div className="col-span-full py-48 flex flex-col items-center justify-center gap-6">
               <div className="relative">
                  <Loader2 className="animate-spin text-red-500" size={60} strokeWidth={2.5} />
                  <div className="absolute inset-0 blur-3xl bg-red-500 opacity-20 animate-pulse" />
               </div>
               <p className="text-[13px] font-bold text-[var(--color-admin-text-muted)] tracking-tight animate-pulse">Carregando bloqueios...</p>
            </div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {blocks.map((block) => (
                  <motion.div 
                    key={block.id} 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-4 lg:px-6 lg:py-4 border border-slate-100 rounded-2xl flex items-center justify-between gap-4 transition-all hover:border-red-100 shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-12 -mt-12 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-4 lg:gap-5 relative z-10 min-w-0">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 rounded-xl shadow-inner shrink-0 group-hover:text-red-400 group-hover:bg-red-50 group-hover:border-red-100 transition-all">
                        <CalendarX size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-[14px] lg:text-[15px] font-bold text-slate-800 tracking-tight leading-none flex items-center gap-2">
                            {(() => {
                              const [, m, d] = block.start_date.split('T')[0].split('-').map(Number);
                              return `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}`;
                            })()} 
                            <span className="text-slate-300 font-medium">→</span>
                            {(() => {
                              const [, m, d] = block.end_date.split('T')[0].split('-').map(Number);
                              return `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}`;
                            })()}
                          </h5>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">Ativo</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444] animate-pulse shrink-0" />
                           <p className="text-[11px] text-slate-400 font-bold tracking-tight truncate max-w-[150px] sm:max-w-[300px]">{block.reason}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                       onClick={() => setConfirmDeleteId(block.id)}
                       className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-300 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-90 relative z-10 shrink-0"
                     >
                       <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {blocks.length === 0 && (
                <div className="col-span-full py-48 border-2 border-dashed border-[var(--color-admin-border)] rounded-[3rem] flex flex-col items-center justify-center text-slate-300 gap-8 bg-[var(--color-admin-surface)]/50">
                    <div className="w-24 h-24 bg-[var(--color-admin-surface)] rounded-[2rem] flex items-center justify-center border border-[var(--color-admin-border)] shadow-inner">
                       <ShieldOff size={48} strokeWidth={1} />
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-[16px] font-bold text-[var(--color-admin-text-muted)]">Nenhum bloqueio</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-2">A agenda está livre para todos os dias</p>
                    </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Remover Bloqueio"
        message="Esta ação irá liberar o período selecionado para novos agendamentos no site. Deseja continuar?"
        confirmLabel="Remover Bloqueio"
        cancelLabel="Cancelar"
        onConfirm={() => confirmDeleteId && handleRemoveBlock(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        variant="danger"
      />

      <AnimatePresence>
        {errorConfig && (
          <ConfirmModal
            isOpen={errorConfig.isOpen}
            title={errorConfig.title}
            message={errorConfig.message}
            confirmLabel="Entendido"
            cancelLabel=""
            onConfirm={errorConfig.onConfirm}
            onCancel={errorConfig.onConfirm}
            variant="warning"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
