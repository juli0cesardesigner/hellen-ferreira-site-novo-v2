"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, CalendarDays, Loader2, Save, X, Lock, Calendar, CalendarX, AlertCircle, ShieldOff, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBlockedDates, addBlockedDate, removeBlockedDate } from "@/lib/actions/admin-actions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

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
        setBlocks(blocks.filter(b => b.id !== id));
      } else {
        alert("Erro de Sistema: " + result.error);
      }
    } catch (error: any) {
      console.error("Critical error removing block:", error);
      alert("Erro crítico ao remover bloqueio: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      
      {/* Configuration Form */
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[var(--color-admin-accent)] rounded-md text-white">
              <ShieldOff size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-[13px] text-[var(--color-admin-text)]">Bloqueio de Agenda</h4>
              <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium mt-0.5">Indisponibilidade de datas</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-[var(--color-admin-text-muted)] ml-0.5">Data Inicial</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border border-[var(--color-admin-border)] rounded-md px-3 py-2.5 text-[12px] font-medium text-[var(--color-admin-text-secondary)] focus:border-[var(--color-admin-accent)] transition-all outline-none"
                  value={startDate} onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-[var(--color-admin-text-muted)] ml-0.5">Data Final</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border border-[var(--color-admin-border)] rounded-md px-3 py-2.5 text-[12px] font-medium text-[var(--color-admin-text-secondary)] focus:border-[var(--color-admin-accent)] transition-all outline-none"
                  value={endDate} onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-[var(--color-admin-text-muted)] ml-0.5">Motivo do Bloqueio</label>
              <textarea 
                placeholder="Ex: Feriado, Manutenção, Férias..."
                className="w-full bg-slate-50 border border-[var(--color-admin-border)] rounded-md px-3 py-3 text-[12px] font-medium text-[var(--color-admin-text-secondary)] focus:border-[var(--color-admin-accent)] transition-all outline-none h-24 resize-none"
                value={reason} onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button 
              onClick={handleCreateBlock}
              disabled={!startDate || !endDate || isSaving}
              className="w-full py-3 bg-[var(--color-admin-accent)] text-white text-[12px] font-medium rounded-md hover:bg-[var(--color-admin-accent-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-3 active:scale-[0.99]"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              CRIAR BLOQUEIO
            </button>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-md flex gap-3">
          <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
            Intervalos bloqueados são removidos automaticamente do calendário público.
          </p>
        </div>
      </div>

      {/* Active Restrictions List */}
      <div className="lg:col-span-7 space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-medium text-[11px] text-[var(--color-admin-text-muted)]">Bloqueios Ativos</h4>
          <span className="text-[10px] font-medium bg-slate-100 px-2 py-0.5 rounded-md text-[var(--color-admin-text-muted)] border border-slate-200">{blocks.length}</span>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 border-2 border-dashed border-zinc-100 rounded-2xl">
               <Loader2 className="animate-spin text-zinc-200" size={32} />
               <p className="text-[10px] font-bold uppercase text-zinc-300">Sincronizando...</p>
            </div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {blocks.map((block) => (
                  <motion.div 
                    key={block.id} 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[var(--color-admin-surface)] p-4 border border-[var(--color-admin-border)] rounded-lg flex justify-between items-center group hover:border-[var(--color-admin-border-hover)] transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 rounded-xl shadow-inner group-hover:bg-zinc-900 group-hover:text-white transition-all">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                          {new Date(block.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} 
                          <span className="mx-2 text-zinc-300">→</span>
                          {new Date(block.end_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </h5>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1 tracking-tight truncate max-w-[250px]">{block.reason}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setConfirmDeleteId(block.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {blocks.length === 0 && (
                <div className="py-16 border border-dashed border-[var(--color-admin-border)] rounded-lg flex flex-col items-center justify-center text-slate-300 gap-3">
                    <ShieldOff size={36} strokeWidth={1} />
                    <p className="text-[11px] font-medium text-[var(--color-admin-text-muted)]">Nenhum bloqueio ativo</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Remover Bloqueio"
        message="Deseja remover este bloqueio de agenda? Os horários correspondentes voltarão a ficar disponíveis para o público."
        confirmLabel="Remover"
        cancelLabel="Manter"
        onConfirm={() => confirmDeleteId && handleRemoveBlock(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
