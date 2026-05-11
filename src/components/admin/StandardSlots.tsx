"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, CalendarDays, Loader2, Save, X, Search, Filter, ShieldCheck, Globe, Lock, Database } from "lucide-react";
import { listSchemaSlots, addSchemaSlot, deleteSchemaSlot } from "@/lib/actions/admin-actions";
import { motion, AnimatePresence } from "framer-motion";
import { SESSIONS_DATA } from "@/lib/data/sessions";

export function StandardSlotsSection() {
  const sessions = Object.values(SESSIONS_DATA);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newSlotTime, setNewSlotTime] = useState<string>("09:00");
  const [addingToDay, setAddingToDay] = useState<number | null>(null);

  useEffect(() => {
    loadSlots();
  }, [selectedSession]);

  async function loadSlots() {
    setIsLoading(true);
    const res = await listSchemaSlots(selectedSession || null);
    setSlots(res.slots || []);
    setIsLoading(false);
  }

  const handleAddSlot = async (dayOfWeek: number) => {
    if (!newSlotTime) return;
    setIsSaving(true);
    const res = await addSchemaSlot(dayOfWeek, newSlotTime + ":00", selectedSession || null);
    if (res.success) {
      await loadSlots();
      setAddingToDay(null);
    } else {
      alert("Erro ao salvar: " + res.error);
    }
    setIsSaving(false);
  };

  const handleDeleteSlot = async (id: string | null, dayOfWeek: number, startTime: string) => {
    if (!confirm("Deseja remover este horário da agenda?")) return;
    setIsSaving(true);
    
    const slot = slots.find(s => s.id === id || (s.day_of_week === dayOfWeek && s.start_time === startTime));
    if (selectedSession && slot?.source === 'global') {
        await addSchemaSlot(dayOfWeek, startTime, selectedSession, false);
    } else if (id) {
        await deleteSchemaSlot(id);
    }
    
    await loadSlots();
    setIsSaving(false);
  };

  const days = [
    { label: "DOM", value: 0 },
    { label: "SEG", value: 1 },
    { label: "TER", value: 2 },
    { label: "QUA", value: 3 },
    { label: "QUI", value: 4 },
    { label: "SEX", value: 5 },
    { label: "SAB", value: 6 }
  ];

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      
      {/* ─── Matrix Config Header ─── */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-admin-accent)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center border border-zinc-800 shadow-inner">
                <Globe size={28} />
              </div>
              <div>
                <h4 className="text-[20px] font-bold text-white tracking-tight leading-none">Horários de Atendimento</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-2">Gerencie a grade de horários padrão do estúdio</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-2xl">
            <div className="relative flex-1 w-full group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors duration-300">
                <Database size={18} />
              </div>
              <select 
                value={selectedSession} 
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full bg-black border-2 border-zinc-900 rounded-2xl pl-14 pr-12 py-5 text-[12px] font-black uppercase tracking-[0.2em] text-white focus:border-white transition-all duration-500 appearance-none cursor-pointer shadow-inner"
              >
                <option value="">Configuração Geral</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-hover:text-white transition-colors">
                 <Filter size={16} />
              </div>
            </div>
            
            <button 
              onClick={loadSlots} 
              className="w-16 h-16 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-white rounded-2xl flex items-center justify-center text-zinc-600 hover:text-white transition-all active:scale-90"
            >
              <Loader2 size={24} className={isLoading ? "animate-spin text-white" : ""} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-64 bg-zinc-950/20 border-2 border-dashed border-zinc-900 rounded-[3rem] gap-8">
          <div className="relative">
             <Loader2 className="animate-spin text-[var(--color-admin-accent)]" size={60} strokeWidth={2.5} />
             <div className="absolute inset-0 blur-3xl bg-[var(--color-admin-accent)] opacity-20 animate-pulse" />
          </div>
          <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider animate-pulse">Atualizando horários...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
          {days.map(day => (
            <div key={day.value} className="bg-zinc-950 border border-zinc-900 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl transition-all hover:border-white group/card">
              <div className="bg-black px-6 py-5 border-b border-zinc-900 flex items-center justify-center">
                <span className="text-[11px] font-bold text-slate-500 tracking-wide group-hover/card:text-white transition-colors">{day.label}</span>
              </div>
              
              <div className="p-4 space-y-4 flex-1 min-h-[450px] custom-scrollbar">
                <AnimatePresence initial={false}>
                  {slots.filter(s => s.day_of_week === day.value).map(slot => {
                    const isGlobal = slot.source === 'global';
                    const isDeactivated = !slot.is_active;

                    return (
                      <motion.div 
                        key={slot.id || `${slot.day_of_week}-${slot.start_time}`} 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${
                          isDeactivated 
                            ? 'bg-red-500/5 border-red-500/10 grayscale opacity-40' 
                            : 'bg-black border-zinc-900 hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]'
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                           <span className={`text-[18px] font-bold tracking-tight ${isDeactivated ? 'text-red-900/50 line-through' : 'text-white group-hover:text-white transition-colors'}`}>
                            {slot.start_time.slice(0, 5)}
                          </span>
                          <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${isGlobal ? 'bg-zinc-800' : 'bg-[var(--color-admin-accent)] shadow-[0_0_10px_var(--color-admin-accent)]'}`} />
                             <span className={`text-[9px] font-black uppercase tracking-widest ${isGlobal ? 'text-zinc-700' : 'text-[var(--color-admin-accent)]'}`}>
                               {isGlobal ? 'PADRÃO' : 'ESPECÍFICO'}
                             </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteSlot(slot.id, day.value, slot.start_time)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-700 hover:text-red-500 hover:border-red-500 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {addingToDay === day.value ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-zinc-900 border-2 border-white rounded-[1.5rem] space-y-5 mt-6 shadow-2xl relative z-20">
                    <input 
                      type="time" 
                      value={newSlotTime} 
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="w-full bg-black border-2 border-zinc-800 rounded-xl px-4 py-4 text-[16px] font-bold text-white outline-none focus:border-white transition-all"
                    />
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleAddSlot(day.value)}
                        disabled={isSaving}
                        className="flex-1 bg-white text-black text-[11px] font-black py-4 rounded-xl hover:bg-zinc-200 disabled:opacity-30 uppercase tracking-[0.2em] transition-all shadow-xl"
                      >
                        Adicionar
                      </button>
                      <button 
                        onClick={() => setAddingToDay(null)}
                        className="p-4 bg-black border-2 border-zinc-800 text-zinc-600 rounded-xl hover:text-white hover:border-white transition-all"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => setAddingToDay(day.value)}
                    className="w-full mt-8 flex items-center justify-center gap-3 p-6 border-2 border-dashed border-zinc-900 bg-black text-zinc-800 hover:text-white hover:border-white transition-all rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.4em]"
                  >
                    <Plus size={20} strokeWidth={2.5} /> Novo Horário
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 right-12 bg-white text-black px-10 py-6 rounded-2xl flex items-center gap-5 shadow-[0_0_100px_rgba(255,255,255,0.1)] z-[200] border-2 border-black"
          >
            <div className="relative">
              <Loader2 className="animate-spin" size={24} strokeWidth={3} />
            </div>
            <div className="flex flex-col">
               <span className="text-[13px] font-bold uppercase tracking-wider">Sincronizando</span>
               <span className="text-[11px] text-slate-500 font-medium">Salvando alterações...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
