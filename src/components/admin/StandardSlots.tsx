"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, CalendarDays, Loader2, Save, X } from "lucide-react";
import { listSchemaSlots, addSchemaSlot, deleteSchemaSlot } from "@/lib/actions/admin-actions";
import { motion } from "framer-motion";
import { SESSIONS_DATA } from "@/lib/data/sessions";

export function StandardSlotsSection() {
  const sessions = Object.values(SESSIONS_DATA);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newSlotTime, setNewSlotTime] = useState<string>("09:00");
  const [addingToDay, setAddingToDay] = useState<number | null>(null);

  // Carregar slots quando a sessão mudar (inclusive se for global/vazio)
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
      alert("Erro ao adicionar: " + res.error);
    }
    setIsSaving(false);
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm("Deseja remover este horário padrão?")) return;
    setIsSaving(true);
    const res = await deleteSchemaSlot(id);
    if (res.success) {
      await loadSlots();
    } else {
      alert("Erro ao remover: " + res.error);
    }
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
    <div className="space-y-16 animate-in fade-in duration-700">
      {/* Seletor de Serviço - Refinado */}
      <div className="flex flex-col items-center justify-center space-y-6 pb-12 border-b border-sand/10">
        <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-light">Selecione o Contexto de Horários</label>
        <div className="relative group w-full max-w-md">
          <select 
            value={selectedSession} 
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full text-center py-6 bg-white border-b-2 border-sand/30 font-serif text-2xl text-text-dark outline-none focus:border-blush transition-all appearance-none cursor-pointer group-hover:border-blush/40"
          >
            <option value="">✨ Horários Padrão (Global)</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>{s.name} (Específico)</option>
            ))}
          </select>
          <div className="absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none text-sand group-hover:text-blush">
             <Clock size={24} strokeWidth={1} />
          </div>
        </div>
        <p className="text-sm italic font-serif text-text-light opacity-60">
          Personalize a grade para cada serviço ou mantenha o brilho do padrão global.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blush" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {days.map(day => (
            <div key={day.value} className="flex flex-col animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${day.value * 100}ms` }}>
              <div className="py-4 border-b border-sand/20 mb-6 text-center">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-light group-hover:text-blush transition-colors">{day.label}</span>
              </div>
              
              <div className="space-y-3 min-h-[300px]">
                {slots.filter(s => s.day_of_week === day.value).map(slot => {
                  const isGlobal = slot.source === 'global';
                  const isDeactivated = !slot.is_active;

                  return (
                    <motion.div 
                      key={slot.id || `${slot.day_of_week}-${slot.start_time}`} 
                      whileHover={{ x: 4 }}
                      className={`flex items-center justify-between group p-3 transition-all border-l-2 ${
                        isDeactivated ? 'border-red-200 bg-red-50/20' : 'border-sand/10 hover:border-blush bg-white/50 hover:bg-white shadow-[0_2px_10px_rgba(44,42,41,0.02)]'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className={`font-serif text-lg ${isDeactivated ? 'text-red-300 line-through' : 'text-text-dark italic'}`}>
                          {slot.start_time.slice(0, 5)}
                        </span>
                        {isGlobal ? (
                          <span className="text-[7px] uppercase tracking-widest text-text-light font-bold">Global</span>
                        ) : (
                          <span className="text-[7px] uppercase tracking-widest text-blush font-bold">Reserva</span>
                        )}
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center">
                        <button 
                          onClick={async () => {
                            if (selectedSession && isGlobal) {
                                setIsSaving(true);
                                await addSchemaSlot(day.value, slot.start_time, selectedSession, false);
                                await loadSlots();
                                setIsSaving(false);
                            } else {
                                handleDeleteSlot(slot.id);
                            }
                          }}
                          className="text-sand hover:text-red-400 transition-colors p-1"
                          title="Remover"
                        >
                          <X size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}

                {addingToDay === day.value ? (
                  <div className="pt-4 space-y-2">
                    <input 
                      type="time" 
                      value={newSlotTime} 
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="w-full p-2 bg-white border border-blush/30 rounded-sm text-sm outline-none"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAddSlot(day.value)}
                        disabled={isSaving}
                        className="flex-1 p-2 bg-blush text-white rounded-sm text-[10px] font-bold uppercase transition-all hover:bg-blush/80 disabled:opacity-50"
                      >
                        Salvar
                      </button>
                      <button 
                        onClick={() => setAddingToDay(null)}
                        className="p-2 border border-sand/50 text-text-light rounded-sm text-[10px] uppercase"
                      >
                        X
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setAddingToDay(day.value)}
                    className="w-full mt-4 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-sand/30 text-text-light/50 hover:border-blush/30 hover:text-blush transition-all rounded-sm text-[10px] uppercase tracking-widest"
                  >
                    <Plus size={14} /> Novo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isSaving && (
        <div className="fixed bottom-10 right-10 bg-text-dark text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-bounce">
          <Loader2 className="animate-spin" size={16} />
          <span className="text-xs uppercase tracking-widest font-bold">Processando...</span>
        </div>
      )}
    </div>
  );
}
