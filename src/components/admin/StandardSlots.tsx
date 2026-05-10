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
    
    // logic based on source
    const slot = slots.find(s => s.id === id || (s.day_of_week === dayOfWeek && s.start_time === startTime));
    if (selectedSession && slot?.source === 'global') {
        // block global slot for this session
        await addSchemaSlot(dayOfWeek, startTime, selectedSession, false);
    } else if (id) {
        await deleteSchemaSlot(id);
    }
    
    await loadSlots();
    setIsSaving(false);
  };

  const days = [
    { label: "Domingo", value: 0 },
    { label: "Segunda", value: 1 },
    { label: "Terça", value: 2 },
    { label: "Quarta", value: 3 },
    { label: "Quinta", value: 4 },
    { label: "Sexta", value: 5 },
    { label: "Sábado", value: 6 }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Configuration Header */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <h4 className="text-base font-bold text-zinc-900 uppercase tracking-tight">Disponibilidade Global</h4>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Configure os horários de atendimento padrão do sistema</p>
        </div>
        
        <div className="flex items-center gap-4 w-full max-w-md">
          <div className="relative flex-1 group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none">
              <Filter size={14} />
            </div>
            <select 
              value={selectedSession} 
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-zinc-700 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all outline-none appearance-none cursor-pointer shadow-inner"
            >
              <option value="">Agenda Padrão (Sistema)</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>Personalizar: {s.name}</option>
              ))}
            </select>
          </div>
          <button onClick={loadSlots} className="p-3 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-500 transition-all shadow-sm">
            <Loader2 size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/50 border border-zinc-100 border-dashed rounded-2xl">
          <Loader2 className="animate-spin text-zinc-300" size={32} />
          <p className="mt-4 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Buscando horários...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {days.map(day => (
            <div key={day.value} className="bg-white border border-zinc-200 rounded-xl flex flex-col overflow-hidden shadow-sm group/card">
              <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">{day.label}</span>
              </div>
              
              <div className="p-3 space-y-2 flex-1 min-h-[350px] bg-zinc-50/20">
                <AnimatePresence initial={false}>
                  {slots.filter(s => s.day_of_week === day.value).map(slot => {
                    const isGlobal = slot.source === 'global';
                    const isDeactivated = !slot.is_active;

                    return (
                      <motion.div 
                        key={slot.id || `${slot.day_of_week}-${slot.start_time}`} 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
                          isDeactivated 
                            ? 'bg-rose-50 border-rose-100 grayscale opacity-50' 
                            : 'bg-white border-zinc-100 hover:border-zinc-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-sm font-bold tracking-tight ${isDeactivated ? 'text-rose-900 line-through' : 'text-zinc-900 group-hover:text-blue-600'}`}>
                            {slot.start_time.slice(0, 5)}
                          </span>
                          <div className="flex items-center gap-1">
                             {isGlobal ? <Globe size={8} className="text-zinc-400" /> : <ShieldCheck size={8} className="text-blue-500" />}
                             <span className={`text-[7px] font-bold uppercase tracking-tight ${isGlobal ? 'text-zinc-400' : 'text-blue-600/70'}`}>
                               {isGlobal ? 'Padrão' : 'Prioridade'}
                             </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteSlot(slot.id, day.value, slot.start_time)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {addingToDay === day.value ? (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white border border-zinc-200 rounded-xl space-y-3 mt-4 shadow-xl">
                    <input 
                      type="time" 
                      value={newSlotTime} 
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleAddSlot(day.value)}
                        disabled={isSaving}
                        className="flex-1 bg-zinc-900 text-white text-[9px] font-bold py-2 rounded-lg hover:bg-zinc-800 disabled:opacity-50 uppercase tracking-widest"
                      >
                        Salvar
                      </button>
                      <button 
                        onClick={() => setAddingToDay(null)}
                        className="p-2 border border-zinc-200 text-zinc-400 rounded-lg hover:bg-zinc-50 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => setAddingToDay(day.value)}
                    className="w-full mt-4 flex items-center justify-center gap-2 p-4 border border-zinc-200 bg-zinc-50/30 text-zinc-400 hover:text-zinc-900 hover:bg-white hover:border-zinc-300 transition-all rounded-xl text-[9px] font-bold uppercase tracking-[0.2em]"
                  >
                    <Plus size={14} /> ADICIONAR
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isSaving && (
        <div className="fixed bottom-10 right-10 bg-zinc-900 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-2xl z-50 animate-in slide-in-from-bottom-5">
          <Loader2 className="animate-spin text-blue-400" size={16} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Salvando alterações...</span>
        </div>
      )}
    </div>
  );
}
