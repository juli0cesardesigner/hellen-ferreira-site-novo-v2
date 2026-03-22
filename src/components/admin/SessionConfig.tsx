"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, Loader2, Check, X, AlertCircle, 
  Plus, Trash2, Clock, Layout, 
  ChevronRight, Power, CalendarClock
} from "lucide-react";
import { 
  listSchemaSlots, addSchemaSlot, deleteSchemaSlot, getAllSessionDurations, updateSessionDuration
} from "@/lib/actions/admin-actions";
import { motion, AnimatePresence } from "framer-motion";
import { SESSIONS_DATA } from "@/lib/data/sessions";

export function SessionConfigSection() {
  const sessions = Object.values(SESSIONS_DATA);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [dbDurations, setDbDurations] = useState<Record<string, number>>({});

  useEffect(() => {
    async function load() {
      const res = await getAllSessionDurations();
      setDbDurations(res);
    }
    load();
  }, []);

  const refreshDurations = async () => {
    const res = await getAllSessionDurations();
    setDbDurations(res);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-serif italic text-3xl text-text-dark">Grade Horária & Disponibilidade</h2>
          <p className="text-sm text-text-light mt-2 font-serif">Gerencie os horários disponíveis para cada tipo de sessão.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            whileHover={{ y: -4 }}
            className={`bg-white border-b-2 ${session.is_active ? 'border-sand/40' : 'border-red-200'} p-8 shadow-[0_4px_20px_rgba(44,42,41,0.02)] flex flex-col transition-all duration-300 group cursor-pointer`}
            onClick={() => setSelectedSession(session)}
          >
            <div className="flex justify-between items-start mb-8">
              <div className={`p-4 ${session.is_active ? 'bg-linen/40 text-blush' : 'bg-red-50 text-red-300'} transition-colors group-hover:bg-blush group-hover:text-white`}>
                <Clock size={24} />
              </div>
              {!session.is_active && (
                <span className="text-[9px] uppercase tracking-widest font-bold text-red-500 bg-red-50 px-2 py-1">Inativo no Código</span>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="text-2xl font-serif text-text-dark italic">{session.name}</h3>
              <p className="text-[10px] text-text-light uppercase tracking-[0.2em] font-bold">
                {dbDurations[session.id] || session.duration_slots} Slot(s) • Duração Editável
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-sand/10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-text-light font-bold">Configurar</span>
                <span className="font-serif text-lg text-text-dark italic">Horários Padrão</span>
              </div>
              <ChevronRight className="text-sand group-hover:text-blush transition-colors" size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedSession && (
          <SessionSlotEditorModal 
            session={selectedSession} 
            dbDuration={dbDurations[selectedSession.id] || selectedSession.duration_slots}
            onClose={() => setSelectedSession(null)} 
            onDurationChanged={refreshDurations}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 bg-pearl/30 p-8 border-l-4 border-blush/30 font-sans">
        <div className="flex items-center gap-4 text-text-medium">
          <AlertCircle size={24} className="shrink-0 text-blush" />
          <h4 className="font-bold uppercase tracking-widest text-xs">Gestão de Disponibilidade</h4>
        </div>
        <p className="text-sm text-text-light leading-relaxed font-serif italic">
          Os horários configurados aqui determinam a grade disponível no formulário de agendamento. 
          As informações de preço e pacotes agora são imutáveis via painel e devem ser alteradas no código fonte.
        </p>
      </div>
    </div>
  );
}

function SessionSlotEditorModal({ session, dbDuration, onClose, onDurationChanged }: { session: any, dbDuration: number, onClose: () => void, onDurationChanged: () => void }) {
  const [slots, setSlots] = useState<any[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [duration, setDuration] = useState(dbDuration);
  const [isDurationSaving, setIsDurationSaving] = useState(false);

  const handleSaveDuration = async () => {
    if (duration === dbDuration) return;
    setIsDurationSaving(true);
    const res = await updateSessionDuration(session.id, duration);
    if (res.success) {
      onDurationChanged();
    } else {
      alert("Erro: " + res.error);
    }
    setIsDurationSaving(false);
  };

  useEffect(() => {
    loadSlots();
  }, [session.id]);

  async function loadSlots() {
    setIsSlotsLoading(true);
    const res = await listSchemaSlots(session.id);
    setSlots(res.slots || []);
    setIsSlotsLoading(false);
  }

  const handleAddSlot = async (day: number, time: string) => {
    const res = await addSchemaSlot(day, time, session.id);
    if (res.success) loadSlots();
  };

  const handleToggleSlot = async (slot: any) => {
    if (slot.source === 'global') {
      // Para slots globais, desligar significa criar um override inativo
      const res = await addSchemaSlot(slot.day_of_week, slot.start_time, session.id, false);
      if (res.success) loadSlots();
      return;
    }
    // Desligar um override inativo o remove (o global reaparece)
    // Desligar um slot especifico o apaga de fato.
    const res = await deleteSchemaSlot(slot.id);
    if (res.success) loadSlots();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-text-dark/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="relative bg-white w-full max-w-4xl h-[80vh] shadow-2xl flex flex-col overflow-hidden border border-sand/20 rounded-xl">
        <div className="p-10 border-b border-sand/20 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-pearl/30">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blush/10 text-blush flex items-center justify-center border border-blush/20"><CalendarClock size={28} /></div>
            <div>
              <h2 className="text-3xl font-serif text-text-dark italic">{session.name}</h2>
              <p className="text-[10px] text-text-light uppercase tracking-[0.3em] font-bold mt-1">Grade Horária Disponível</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:text-blush transition-colors outline-none"><X size={32} strokeWidth={1} /></button>
        </div>

        <div className="flex-grow overflow-y-auto p-16 bg-white custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
             <div className="space-y-8">
                
                {/* CONFIGURAÇÃO DE DURAÇÃO */}
                <div className="p-8 bg-linen/30 rounded-xl border border-sand/30 space-y-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-bold text-text-dark mb-1">Duração do Ensaio</h4>
                    <p className="text-[10px] text-text-light font-serif">Quantos blocos seguidos na Grade de Horários este ensaio consumirá.</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="bg-white border text-xs border-sand/30 p-3 rounded outline-none font-bold text-text-dark uppercase tracking-widest flex-1">
                      <option value={1}>Ocupa 1 Horário</option>
                      <option value={2}>Ocupa 2 Horários Seguidos</option>
                      <option value={3}>Ocupa 3 Horários Seguidos</option>
                      <option value={4}>Ocupa 4 Horários Seguidos</option>
                    </select>
                    {duration !== dbDuration && (
                      <button onClick={handleSaveDuration} disabled={isDurationSaving} className="px-5 py-3 bg-text-dark text-white text-[10px] uppercase font-bold tracking-widest disabled:opacity-50">
                        {isDurationSaving ? <Loader2 size={16} className="animate-spin" /> : "Salvar"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="pb-6 border-b border-sand/10 pt-4">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-text-dark mb-2">Adicionar Novo Horário</h4>
                  <p className="text-xs text-text-light font-serif">Defina um horário recorrente para este serviço.</p>
                </div>
                <AddSlotForm onAdd={handleAddSlot} />
             </div>

             <div className="space-y-8">
                <div className="pb-6 border-b border-sand/10">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-text-dark mb-2">Horários na Grade</h4>
                  <p className="text-xs text-text-light font-serif">Horários que aparecerão no site para este serviço.</p>
                </div>
                
                {isSlotsLoading ? (
                  <div className="flex items-center justify-center py-10 opacity-30 animate-pulse">
                    <Loader2 className="animate-spin text-blush" size={24} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {slots.length === 0 ? (
                      <div className="p-8 border border-dashed border-sand/30 rounded-lg text-center">
                        <p className="text-xs italic text-text-light">Nenhum horário configurado.</p>
                      </div>
                    ) : (
                      ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((dayName, dayIndex) => {
                        const daySlots = slots.filter(s => s.day_of_week === dayIndex);
                        if (daySlots.length === 0) return null;
                        
                        return (
                          <div key={dayIndex} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${dayIndex * 50}ms` }}>
                            <h5 className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-light border-b border-sand/20 pb-2">{dayName}</h5>
                            <div className="grid grid-cols-1 gap-2">
                              {daySlots.map(slot => {
                                const isGlobal = slot.source === 'global';
                                const isDeactivated = !slot.is_active;

                                return (
                                  <div key={`${slot.day_of_week}-${slot.start_time}-${slot.id}`} className={`flex justify-between items-center p-4 rounded-lg border transition-colors group ${
                                    isDeactivated ? 'border-red-200 bg-red-50/40 opacity-70' : 'border-sand/10 bg-linen/5 hover:bg-linen/10'
                                  }`}>
                                    <div className="flex items-center gap-4">
                                      <div className={`w-1.5 h-1.5 rounded-full ${isDeactivated ? 'bg-red-400' : 'bg-blush/40'}`} />
                                      <div className="flex flex-col">
                                        <span className={`font-serif text-base ${isDeactivated ? 'text-red-400 line-through' : 'text-text-dark italic'}`}>
                                          {slot.start_time.substring(0,5)}
                                        </span>
                                        <span className={`text-[7px] uppercase tracking-widest font-bold ${
                                          isDeactivated ? 'text-red-500' : isGlobal ? 'text-text-light' : 'text-blush'
                                        }`}>
                                          {isDeactivated ? 'Oculto' : isGlobal ? 'Global' : 'Apenas Local'}
                                        </span>
                                      </div>
                                    </div>
                                    <button 
                                      role="switch"
                                      aria-checked={!isDeactivated}
                                      onClick={() => handleToggleSlot(slot)} 
                                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        !isDeactivated ? 'bg-blush' : 'bg-sand/30'
                                      }`}
                                      title={isDeactivated ? "Reativar Horário" : "Desativar Horário"}
                                    >
                                      <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                          !isDeactivated ? 'translate-x-3' : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AddSlotForm({ onAdd }: { onAdd: (day: number, time: string) => void }) {
  const [day, setDay] = useState(1);
  const [time, setTime] = useState("09:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onAdd(day, time);
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 bg-pearl/30 rounded-xl border border-sand/20 space-y-8">
      <div className="space-y-4">
        <label className="text-[10px] uppercase font-bold tracking-widest text-text-light">Dia da Semana</label>
        <div className="grid grid-cols-7 gap-1">
          {['D','S','T','Q','Q','S','S'].map((d, i) => (
            <button key={i} type="button" onClick={() => setDay(i)} className={`p-4 rounded text-xs font-bold transition-all ${day === i ? 'bg-text-dark text-white ring-2 ring-text-dark/20' : 'bg-white border border-sand/10 hover:border-blush/30'}`}>{d}</button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <label className="text-[10px] uppercase font-bold tracking-widest text-text-light">Hora de Início</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-white border border-sand/20 p-5 rounded-lg font-serif text-2xl outline-none focus:border-blush transition-all" />
      </div>

      <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-5 bg-text-dark text-white rounded-lg text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Adicionar Horário
      </button>
    </div>
  );
}
