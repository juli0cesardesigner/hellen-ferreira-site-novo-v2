"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, CalendarDays, Loader2, Save, X, Lock, Calendar, CalendarX, AlertCircle, ShieldOff, Info, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBlockedDates, addBlockedDate, removeBlockedDate } from "@/lib/actions/admin-actions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { InternalDatePicker } from "@/components/ui/InternalDatePicker";

export function MassBlockingSection() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
      alert("Erro de Sistema: " + result.error);
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
        alert("Erro de Sistema: " + result.error);
      }
    } catch (e) {
      console.error(e);
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:flex items-end gap-6 flex-1 max-w-4xl">
            <InternalDatePicker
              label="Data Inicial"
              value={startDate}
              onChange={setStartDate}
              className="flex-1"
            />
            
            <InternalDatePicker
              label="Data Final"
              value={endDate}
              onChange={setEndDate}
              className="flex-1"
            />

            <div className="space-y-3 flex-1 lg:flex-[1.5]">
               <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-2">Motivo do Bloqueio</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Férias, Manutenção..."
                  className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-2xl px-6 py-4 text-[13px] font-bold text-[var(--color-admin-text)] outline-none focus:border-red-500 transition-all shadow-inner placeholder:text-slate-300"
                />
              </div>
            </div>

            <button 
               onClick={handleCreateBlock}
               disabled={isSaving || !startDate || !endDate}
               className="bg-[var(--color-admin-accent)] text-white px-10 py-5 rounded-2xl text-[12px] font-bold tracking-tight flex items-center justify-center gap-3 transition-all active:scale-90 disabled:opacity-20 shadow-sm h-[60px]"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
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
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[var(--color-admin-surface)] p-8 border border-[var(--color-admin-border)] rounded-[2rem] flex justify-between items-center transition-all shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    
                    <div className="flex items-center gap-8 relative z-10">
                      <div className="w-16 h-16 bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] flex items-center justify-center text-slate-300 rounded-2xl shadow-inner transition-all">
                        <CalendarX size={28} />
                      </div>
                      <div>
                        <h5 className="text-[18px] font-bold text-[var(--color-admin-text)] tracking-tight leading-none">
                          {new Date(block.start_date).toLocaleDateString('pt-BR')} 
                          <span className="mx-4 text-slate-300">→</span>
                          {new Date(block.end_date).toLocaleDateString('pt-BR')}
                        </h5>
                        <div className="flex items-center gap-3 mt-4">
                           <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444] animate-pulse" />
                           <p className="text-[12px] text-[var(--color-admin-text-muted)] font-bold tracking-tight truncate max-w-[250px]">{block.reason}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                       onClick={() => setConfirmDeleteId(block.id)}
                       className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-slate-300 transition-all shadow-sm active:scale-90 relative z-10"
                     >
                       <Trash2 size={22} />
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
      />
    </div>
  );
}
