"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, Loader2, Check, X, AlertCircle, 
  Plus, Trash2, Clock, Layout, 
  ChevronRight, Power, CalendarClock, Sliders, Activity, Database, Zap
} from "lucide-react";
import { 
  listSchemaSlots, addSchemaSlot, deleteSchemaSlot, getAllSessionSettings, updateSessionDuration, updateSessionColor
} from "@/lib/actions/admin-actions";
import { motion, AnimatePresence } from "framer-motion";
import { SESSIONS_DATA } from "@/lib/data/sessions";
import { getSessionColor } from "@/lib/utils/colors";

export function SessionConfigSection() {
  const sessions = Object.values(SESSIONS_DATA);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [dbDurations, setDbDurations] = useState<Record<string, { duration: number, color: string }>>({});
  useEffect(() => {
    async function load() {
      const res = await getAllSessionSettings();
      setDbDurations(res as any);
    }
    load();
  }, []);

  const refreshDurations = async () => {
    const res = await getAllSessionSettings();
    setDbDurations(res as any);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
            <Sliders size={20} className="text-zinc-400" /> Gestão de Serviços
          </h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Configuração de horários e regras de cada ensaio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => {
          const colors = getSessionColor(session.name, (dbDurations[session.id] as any)?.color);
          return (
            <motion.div
              key={session.id}
              whileHover={{ y: -4 }}
              style={colors.isCustom && session.is_active ? { borderColor: colors.styles?.borderColor } : {}}
              className={`bg-white border ${session.is_active && !colors.isCustom ? colors.border : !session.is_active ? 'border-rose-100 bg-rose-50/20' : ''} p-6 rounded-xl shadow-sm flex flex-col transition-all duration-200 group cursor-pointer relative overflow-hidden`}
              onClick={() => setSelectedSession(session)}
            >
              <div 
                style={colors.isCustom ? { backgroundColor: colors.styles?.backgroundColor } : {}}
                className={`absolute top-0 right-0 w-32 h-32 ${!colors.isCustom ? colors.bg : ''} opacity-20 -mr-16 -mt-16 rounded-full blur-3xl`} 
              />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-col">
                  <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight leading-none mb-1">{session.name}</h3>
                   {!session.is_active && (
                     <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase w-fit mt-1">Inativo</span>
                   )}
                </div>
              </div>

              <div className="flex-1">
                <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                  Configurações de horários específicos e duração personalizada.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Editar</span>
                <ChevronRight className="text-zinc-300 group-hover:text-zinc-900 transition-colors" size={16} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedSession && (
          <SessionSlotEditorModal 
            session={selectedSession} 
            dbDuration={(dbDurations[selectedSession.id] as any)?.duration || selectedSession.duration_slots}
            dbColor={(dbDurations[selectedSession.id] as any)?.color || 'zinc'}
            onClose={() => setSelectedSession(null)} 
            onSettingsChanged={refreshDurations}
          />
        )}
      </AnimatePresence>

      <div className="flex gap-4 bg-zinc-900 text-white p-6 rounded-2xl border border-zinc-800 shadow-xl">
        <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/20 shrink-0">
           <Zap size={20} className="fill-blue-400/20" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-xs uppercase tracking-widest text-white">Regras de Agendamento</h4>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
            Configurações definidas aqui têm prioridade sobre os padrões globais do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}

function SessionSlotEditorModal({ session, dbDuration, dbColor, onClose, onSettingsChanged }: { session: any, dbDuration: number, dbColor: string, onClose: () => void, onSettingsChanged: () => void }) {
  const [slots, setSlots] = useState<any[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [duration, setDuration] = useState(dbDuration);
  const [isDurationSaving, setIsDurationSaving] = useState(false);
  const [color, setColor] = useState(dbColor);
  const [isColorSaving, setIsColorSaving] = useState(false);

  const handleSaveDuration = async () => {
    if (duration === dbDuration) return;
    setIsDurationSaving(true);
    const res = await updateSessionDuration(session.id, duration);
    if (res.success) {
      onSettingsChanged();
    } else {
      alert("Erro ao salvar duração: " + res.error);
    }
    setIsDurationSaving(false);
  };

  const handleSaveColor = async (newColor: string) => {
    setColor(newColor);
    setIsColorSaving(true);
    const res = await updateSessionColor(session.id, newColor);
    if (res.success) {
      onSettingsChanged();
    }
    setIsColorSaving(false);
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
      const res = await addSchemaSlot(slot.day_of_week, slot.start_time, session.id, false);
      if (res.success) loadSlots();
      return;
    }
    const res = await deleteSchemaSlot(slot.id);
    if (res.success) loadSlots();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="relative bg-[#F8FAFC] w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-zinc-200 rounded-2xl">
        
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-zinc-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-900 text-white flex items-center justify-center rounded-xl shadow-sm">
              <CalendarClock size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 uppercase">Serviço: {session.name}</h2>
                <span className="text-[8px] font-bold text-zinc-300 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100 uppercase">ID: {session.id.substring(0,8)}</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Ajustes de Horários e Agenda</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all outline-none">
            <X size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
             
             {/* Left Column: Config Panel */}
             <div className="lg:col-span-5 space-y-8">
                
                {/* DURATION CONFIG */}
                 <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-50 pb-3">
                     <Clock size={14} className="text-zinc-400" />
                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Duração do Ensaio</h4>
                  </div>
                  <div className="flex gap-2">
                    <select 
                      value={duration} 
                      onChange={(e) => setDuration(Number(e.target.value))} 
                      className="flex-1 bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-700 py-3 px-4 rounded-lg outline-none focus:border-zinc-900 transition-all appearance-none cursor-pointer shadow-inner"
                    >
                      <option value={1}>1 Bloco (aprox. 1h30)</option>
                      <option value={2}>2 Blocos (aprox. 3h00)</option>
                      <option value={3}>3 Blocos (aprox. 4h30)</option>
                      <option value={4}>4 Blocos (Dia Inteiro)</option>
                    </select>
                    {duration !== dbDuration && (
                      <button 
                        onClick={handleSaveDuration} 
                        disabled={isDurationSaving} 
                        className="px-6 py-3 bg-zinc-900 text-white text-[10px] font-bold rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-md active:translate-y-0.5"
                      >
                        {isDurationSaving ? <Loader2 size={14} className="animate-spin" /> : "APLICAR"}
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-zinc-400 font-medium mt-4 leading-relaxed italic">
                    Define quantos blocos de tempo este serviço reserva automaticamente na sua agenda.
                  </p>
                </div>

                {/* COLOR CONFIG */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-50 pb-3">
                     <Sliders size={14} className="text-zinc-400" />
                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Identidade Visual</h4>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: 'blue', label: 'Newborn' },
                      { id: 'teal', label: 'Gestante' },
                      { id: 'emerald', label: 'Família' },
                      { id: 'rose', label: 'Feminino' },
                      { id: 'orange', label: 'Cake' },
                      { id: 'amber', label: 'Mensal' },
                      { id: 'indigo', label: 'Casal' },
                      { id: 'slate', label: 'Corp' },
                      { id: 'sky', label: 'Civil' },
                      { id: 'violet', label: 'Revelação' }
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSaveColor(c.id)}
                        disabled={isColorSaving}
                        title={c.label}
                        className={`w-full aspect-square rounded-lg border transition-all relative group flex items-center justify-center ${
                          color === c.id ? `ring-2 ring-zinc-900 ring-offset-2 ${getSessionColor(c.id).bg}` : `hover:border-zinc-400 ${getSessionColor(c.id).bg}`
                        } ${getSessionColor(c.id).border}`}
                      >
                        <div className={`w-3 h-3 rounded-full ${getSessionColor(c.id).accent} ${color === c.id ? 'scale-125' : 'scale-100 group-hover:scale-110'} transition-transform shadow-sm`} />
                        {color === c.id && <Check size={10} className="absolute top-0.5 right-0.5 text-zinc-900" />}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-50">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Cor Customizada (HEX)</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          placeholder="#000000"
                          value={color.startsWith('#') ? color : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.length <= 7) setColor(val);
                          }}
                          className="w-full bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-700 py-3 pl-10 pr-4 rounded-lg outline-none focus:border-zinc-900 transition-all shadow-inner uppercase"
                        />
                        <div 
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-md border border-black/10 shadow-sm"
                          style={{ backgroundColor: color.startsWith('#') && color.length >= 4 ? color : '#f4f4f5' }}
                        />
                      </div>
                      {color.startsWith('#') && color.length >= 4 && color !== dbColor && (
                         <button 
                            onClick={() => handleSaveColor(color)}
                            disabled={isColorSaving}
                            className="px-4 py-3 bg-zinc-900 text-white text-[9px] font-bold rounded-lg hover:bg-zinc-800 transition-all shadow-md active:translate-y-0.5"
                         >
                            {isColorSaving ? <Loader2 size={12} className="animate-spin" /> : "SALVAR"}
                         </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[9px] text-zinc-400 font-medium mt-4 leading-relaxed italic">
                    Sincroniza a cor da agenda com o perfil cromático do serviço. Aceita nomes de temas ou códigos HEX.
                  </p>
                </div>

                {/* ADD SLOT FORM AREA */}
                <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                      <Plus size={80} className="text-zinc-100" />
                   </div>
                   <AddSlotForm onAdd={handleAddSlot} />
                </div>
             </div>

             {/* Right Column: Schema Grid */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-4 px-1">
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Grade de Horários Ativa</h4>
                   <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Sincronizado</span>
                   </div>
                </div>
                
                {isSlotsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white border border-zinc-100 rounded-2xl border-dashed">
                    <Loader2 className="animate-spin text-zinc-200" size={32} />
                    <p className="mt-4 text-[10px] font-bold uppercase text-zinc-300 tracking-widest">Atualizando...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                    {slots.length === 0 ? (
                      <div className="col-span-full py-24 bg-zinc-50 border border-zinc-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-zinc-300 gap-3">
                         <CalendarClock size={32} />
                         <p className="text-[10px] font-bold uppercase tracking-widest">Nenhum horário exclusivo cadastrado</p>
                      </div>
                    ) : (
                      ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((dayName, dayIndex) => {
                        const daySlots = slots.filter(s => s.day_of_week === dayIndex);
                        if (daySlots.length === 0) return null;
                        
                        return (
                          <div key={dayIndex} className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm h-fit">
                            <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                               <h5 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{dayName}</h5>
                               <span className="text-[8px] font-bold text-zinc-400">{daySlots.length} horários</span>
                            </div>
                            <div className="p-2 space-y-1.5">
                              {daySlots.map(slot => {
                                const isGlobal = slot.source === 'global';
                                const isDeactivated = !slot.is_active;

                                return (
                                  <div key={`${slot.day_of_week}-${slot.start_time}-${slot.id}`} className={`flex justify-between items-center p-3 rounded-lg border transition-all ${
                                    isDeactivated ? 'bg-rose-50 border-rose-100' : 'bg-white border-zinc-100 hover:border-zinc-300'
                                  }`}>
                                    <div className="flex flex-col">
                                      <span className={`text-xs font-bold ${isDeactivated ? 'text-rose-900 line-through' : 'text-zinc-900'}`}>
                                        {slot.start_time.substring(0,5)}
                                      </span>
                                      <div className="flex items-center gap-1 mt-0.5">
                                         <div className={`w-1 h-1 rounded-full ${isDeactivated ? 'bg-rose-400' : isGlobal ? 'bg-zinc-300' : 'bg-blue-500'}`} />
                                           <span className={`text-[7px] font-bold uppercase tracking-tight ${
                                             isDeactivated ? 'text-rose-500' : isGlobal ? 'text-zinc-400' : 'text-blue-600'
                                           }`}>
                                             {isDeactivated ? 'Bloqueado' : isGlobal ? 'Horário Padrão' : 'Personalizado'}
                                           </span>
                                      </div>
                                    </div>
                                    
                                    <button 
                                      role="switch"
                                      aria-checked={!isDeactivated}
                                      onClick={() => handleToggleSlot(slot)} 
                                      className={`w-8 h-5 rounded-full p-0.5 transition-colors duration-200 relative ${
                                        !isDeactivated ? 'bg-zinc-900' : 'bg-zinc-300'
                                      }`}
                                    >
                                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                                        !isDeactivated ? 'translate-x-3' : 'translate-x-0'
                                      }`} />
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
    <div className="space-y-8 relative z-10">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <Activity size={14} className="text-blue-400" />
           <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Dia da Semana</label>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['D','S','T','Q','Q','S','S'].map((d, i) => (
            <button 
              key={i} 
              type="button" 
              onClick={() => setDay(i)} 
              className={`h-9 rounded-lg text-[10px] font-bold transition-all border ${
                day === i 
                  ? 'bg-white text-zinc-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                  : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
            <div className="space-y-4">
        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Horário de Início</label>
        <input 
          type="time" 
          value={time} 
          onChange={(e) => setTime(e.target.value)} 
          className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl text-white text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-inner" 
        />
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={isSubmitting} 
        className="w-full py-4 bg-white text-zinc-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] shadow-lg"
      >
        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
        ADICIONAR HORÁRIO
      </button>
    </div>
  );
}
