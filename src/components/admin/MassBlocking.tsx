"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, CalendarDays, Loader2, Save, X, Lock, Calendar, CalendarX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBlockedDates, addBlockedDate, removeBlockedDate } from "@/lib/actions/admin-actions";

/**
 * Componente que será embutido na Tab 'blocks' do Admin
 */
export function MassBlockingSection() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregamento de bloqueios existentes do banco
  useEffect(() => {
    async function loadBlocks() {
      const data = await getBlockedDates();
      setBlocks(data.blocks || []);
    }
    loadBlocks();
  }, []);

  const handleCreateBlock = async () => {
    if (!startDate || !endDate) return;
    setIsLoading(true);
    
    const result = await addBlockedDate(startDate, endDate, reason || "Bloqueio Manual");
    
    if (result.success) {
      // Recarregar a lista
      const data = await getBlockedDates();
      setBlocks(data.blocks || []);
      setStartDate("");
      setEndDate("");
      setReason("");
    } else {
      alert("Erro ao salvar bloqueio: " + result.error);
    }
    
    setIsLoading(false);
  };

  const handleRemoveBlock = async (id: string) => {
    const result = await removeBlockedDate(id);
    if (result.success) {
      setBlocks(blocks.filter(b => b.id !== id));
    } else {
      alert("Erro ao remover bloqueio: " + result.error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 animate-in fade-in duration-700">
      
      {/* Coluna 1: Novo Bloqueio - Minimalista */}
      <div className="space-y-12 bg-linen/10 p-12 border-l-2 border-blush/30 shadow-sm">
        <div>
          <h4 className="font-serif italic text-2xl text-text-dark flex items-center gap-4">
             <Lock size={24} strokeWidth={1} className="text-blush" /> Bloquear Datas
          </h4>
          <p className="text-[10px] uppercase tracking-[0.3em] text-text-light mt-4 font-bold">Os horários nestes dias serão ocultados da grade.</p>
        </div>

        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-light">Início</label>
            <input 
              type="date" 
              className="w-full bg-transparent border-b border-sand pb-4 font-serif text-lg text-text-dark outline-none focus:border-blush transition-all"
              value={startDate} onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-light">Término</label>
            <input 
              type="date" 
              className="w-full bg-transparent border-b border-sand pb-4 font-serif text-lg text-text-dark outline-none focus:border-blush transition-all"
              value={endDate} onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-light">Motivo Curto</label>
          <input 
            type="text" placeholder="Ex: Viagem, Férias..."
            className="w-full bg-transparent border-b border-sand pb-4 font-serif text-xl text-text-dark outline-none focus:border-blush transition-all italic"
            value={reason} onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <button 
          onClick={handleCreateBlock}
          disabled={!startDate || !endDate || isLoading}
          className="w-full py-5 bg-text-dark text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-black transition-all disabled:opacity-30 flex items-center justify-center gap-4"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CalendarX size={16} />} Bloquear Agora
        </button>
      </div>

      {/* Coluna 2: Lista de Bloqueios Reais */}
      <div className="space-y-10">
        <div>
          <h4 className="font-serif italic text-2xl text-text-dark">Bloqueios Ativos</h4>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-light mt-4">{blocks.length} Períodos Controlados</p>
        </div>

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {blocks.map((block) => (
              <motion.div 
                key={block.id} 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ x: 6 }}
                className="bg-white p-8 border-b border-sand/10 flex justify-between items-center group transition-all"
              >
                <div className="flex items-center gap-8">
                  <div className="w-12 h-12 bg-linen/40 flex items-center justify-center text-blush rounded-full">
                    <Calendar size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h5 className="text-lg font-serif italic text-text-dark">
                      {new Date(block.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} 
                      <span className="mx-4 text-text-light opacity-30">—</span>
                      {new Date(block.end_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </h5>
                    <p className="text-[10px] text-text-light mt-1 uppercase tracking-widest font-bold italic">"{block.reason}"</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveBlock(block.id)}
                  className="p-2 text-sand/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} strokeWidth={1} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {blocks.length === 0 && (
            <div className="py-24 text-center border-l border-sand/10 italic font-serif text-text-light opacity-40">
                Nenhum bloqueio ativo no sistema.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
