"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, CalendarDays, Loader2, Save, X, Lock, Calendar, CalendarX, AlertCircle, ShieldOff, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBlockedDates, addBlockedDate, removeBlockedDate } from "@/lib/actions/admin-actions";

export function MassBlockingSection() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    if (!confirm("Deseja remover este bloqueio de agenda?")) return;
    setIsSaving(true);
    const result = await removeBlockedDate(id);
    if (result.success) {
      setBlocks(blocks.filter(b => b.id !== id));
    } else {
      alert("Erro de Sistema: " + result.error);
    }
    setIsSaving(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-500">
      
      {/* Configuration Form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-zinc-900 rounded-xl text-white shadow-lg shadow-zinc-200">
              <ShieldOff size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900 uppercase tracking-tight">Bloqueio de Agenda</h4>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Indisponibilidade de Datas</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] pl-1">Data Inicial</label>
                <input 
                  type="date" 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-zinc-700 focus:border-zinc-900 transition-all outline-none shadow-inner"
                  value={startDate} onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] pl-1">Data Final</label>
                <input 
                  type="date" 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-zinc-700 focus:border-zinc-900 transition-all outline-none shadow-inner"
                  value={endDate} onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] pl-1">Motivo do Bloqueio</label>
              <textarea 
                placeholder="Ex: Feriado, Manutenção, Férias..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-xs font-bold text-zinc-700 focus:border-zinc-900 transition-all outline-none h-28 shadow-inner resize-none"
                value={reason} onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button 
              onClick={handleCreateBlock}
              disabled={!startDate || !endDate || isSaving}
              className="w-full py-4 bg-zinc-900 text-white text-[10px] font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4 shadow-lg uppercase tracking-widest active:scale-[0.98]"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              CRIAR BLOQUEIO
            </button>
          </div>
        </div>

        <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
          <Info size={20} className="text-blue-400 shrink-0" />
          <p className="text-[10px] text-blue-800 font-medium leading-relaxed uppercase tracking-tight">
            Nota: Todos os intervalos bloqueados removerão automaticamente os horários do seu calendário público de agendamento.
          </p>
        </div>
      </div>

      {/* Active Restrictions List */}
      <div className="lg:col-span-7 space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between px-2">
          <h4 className="font-bold text-[10px] text-zinc-400 uppercase tracking-[0.2em]">Bloqueios Ativos</h4>
          <span className="text-[10px] font-bold bg-zinc-200/50 px-2 py-0.5 rounded text-zinc-500 uppercase">{blocks.length} itens</span>
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
                    className="bg-white p-5 border border-zinc-200 rounded-2xl flex justify-between items-center group hover:border-zinc-300 transition-all shadow-sm"
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
                      onClick={() => handleRemoveBlock(block.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {blocks.length === 0 && (
                <div className="py-24 border-2 border-dashed border-zinc-100 rounded-2xl flex flex-col items-center justify-center text-zinc-200 gap-4">
                    <ShieldOff size={48} strokeWidth={1} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Nenhum bloqueio de agenda ativo</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
