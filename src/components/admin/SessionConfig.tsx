"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Clock, CalendarDays, Loader2, Save, X, Edit2, 
  Palette, Settings, ShieldCheck, Activity, Info, Database, 
  Briefcase, CalendarClock, Globe, ArrowRight 
} from "lucide-react";
import { 
  listSessions, createSession, updateSession, deleteSession,
  listSchemaSlots, addSchemaSlot, deleteSchemaSlot
} from "@/lib/actions/admin-actions";
import { motion, AnimatePresence } from "framer-motion";

export function SessionConfigSection() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [viewingMatrix, setViewingMatrix] = useState<any>(null);
  const [matrixSlots, setMatrixSlots] = useState<any[]>([]);
  const [isMatrixLoading, setIsMatrixLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setIsLoading(true);
    const data = await listSessions();
    setSessions(data.sessions || []);
    setIsLoading(false);
  }

  async function loadMatrix(sessionId: string) {
    setIsMatrixLoading(true);
    const res = await listSchemaSlots(sessionId);
    setMatrixSlots(res.slots || []);
    setIsMatrixLoading(false);
  }

  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    const data = {
      name: formData.get("name") as string,
      duration_minutes: parseInt(formData.get("duration") as string),
      price: parseFloat(formData.get("price") as string),
      theme_color: formData.get("color") as string,
      description: formData.get("description") as string,
    };

    let res;
    if (editingSession) {
      res = await updateSession(editingSession.id, data);
    } else {
      res = await createSession(data);
    }

    if (res.success) {
      await loadSessions();
      setIsModalOpen(false);
      setEditingSession(null);
    } else {
      alert("Erro do Sistema: " + res.error);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("SEQUÊNCIA DE PURGA ACIONADA. Isso removerá todos os templates associados a este ID. Continuar?")) return;
    setIsSaving(true);
    const res = await deleteSession(id);
    if (res.success) {
      await loadSessions();
    } else {
      alert("Erro do Sistema: " + res.error);
    }
    setIsSaving(false);
  };

  const handleToggleSlot = async (slot: any) => {
    if (!viewingMatrix) return;
    setIsSaving(true);
    
    // logic based on source
    await addSchemaSlot(slot.day_of_week, slot.start_time, viewingMatrix.id, !slot.is_active);
    
    await loadMatrix(viewingMatrix.id);
    setIsSaving(false);
  };

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      
      {/* ─── Engine Header ─── */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-admin-accent)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[var(--color-admin-accent)] opacity-[0.02] blur-[100px] rounded-full" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center border border-zinc-800 shadow-inner">
                <Briefcase size={28} />
              </div>
              <div>
                <h2 className="text-[14px] lg:text-[20px] font-black text-white uppercase tracking-tighter leading-none">Gestão de Protocolos de Serviço</h2>
                <p className="text-[8px] lg:text-[10px] uppercase font-black text-zinc-600 tracking-[0.4em] mt-2 font-mono">Status: Sistema Operando</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => { setEditingSession(null); setIsModalOpen(true); }}
            className="bg-white hover:bg-zinc-200 text-black px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-4 transition-all shadow-2xl active:scale-95 group"
          >
            <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" /> 
            NOVA_SESSAO
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-64 bg-zinc-950/20 border-2 border-dashed border-zinc-900 rounded-[3rem] gap-8">
           <div className="relative">
              <Loader2 className="animate-spin text-[var(--color-admin-accent)]" size={60} strokeWidth={2.5} />
              <div className="absolute inset-0 blur-3xl bg-[var(--color-admin-accent)] opacity-20 animate-pulse" />
           </div>
           <p className="text-[12px] font-mono font-black text-zinc-700 uppercase tracking-[0.6em] animate-pulse">Compilando Unidades de Lógica...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {sessions.map((session) => (
            <motion.div 
              key={session.id} 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-10 flex flex-col justify-between hover:border-white transition-all shadow-2xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-admin-accent)]/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div 
                    className="w-14 h-14 rounded-2xl border-2 shadow-inner flex items-center justify-center bg-black"
                    style={{ borderColor: session.theme_color || '#333' }}
                  >
                    <Activity size={24} style={{ color: session.theme_color || '#fff' }} />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setViewingMatrix(session); loadMatrix(session.id); }}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-black border border-zinc-900 text-zinc-700 hover:text-white hover:border-white transition-all active:scale-90"
                      title="Ver Matriz de Horários"
                    >
                      <Settings size={18} />
                    </button>
                    <button 
                      onClick={() => { setEditingSession(session); setIsModalOpen(true); }}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-black border border-zinc-900 text-zinc-700 hover:text-white hover:border-white transition-all active:scale-90"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(session.id)}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-black border border-zinc-900 text-zinc-700 hover:text-red-500 hover:border-red-500 transition-all active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h5 className="text-[22px] font-black text-white uppercase tracking-tighter leading-none mb-3 group-hover:text-[var(--color-admin-accent)] transition-colors">
                  {session.name}
                </h5>
                <p className="text-[11px] text-zinc-600 font-mono font-black uppercase tracking-widest mb-8">SYS_ID: {session.id.split('-')[0]}</p>
                
                <div className="space-y-4 pt-8 border-t border-zinc-900">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">DURACAO</span>
                    <span className="text-[14px] font-mono font-black text-white">{session.duration_minutes} MIN</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">VAL_CREDITO</span>
                    <span className="text-[16px] font-mono font-black text-[var(--color-admin-accent)]">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(session.price)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-10">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-[3rem] shadow-[0_50px_200px_rgba(0,0,0,1)] relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-white opacity-20" />
              
              <div className="p-10 lg:p-14">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h3 className="text-[28px] font-black text-white uppercase tracking-tighter leading-none">
                      {editingSession ? 'ATUALIZAR_PARAMETRO' : 'NOVA_UNIDADE_LOGICA'}
                    </h3>
                    <p className="text-[10px] text-zinc-600 font-mono font-black uppercase tracking-[0.4em] mt-3">Protocolo de Template // v2.0</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 hover:text-white hover:border-white transition-all active:scale-90"
                  >
                    <X size={28} />
                  </button>
                </div>

                <form action={handleSave} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] ml-2">NOME_DO_SERVICO</label>
                      <input 
                        name="name" 
                        required 
                        defaultValue={editingSession?.name}
                        placeholder="EX: SESSÃO_ALPHA"
                        className="w-full bg-black border-2 border-zinc-900 rounded-2xl px-6 py-4 text-[14px] font-black text-white outline-none focus:border-white transition-all placeholder:text-zinc-800" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] ml-2">DURACAO (MIN)</label>
                      <input 
                        name="duration" 
                        type="number" 
                        required 
                        defaultValue={editingSession?.duration_minutes || 60}
                        className="w-full bg-black border-2 border-zinc-900 rounded-2xl px-6 py-4 text-[14px] font-black text-white outline-none focus:border-white transition-all" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] ml-2">VALOR (BRL)</label>
                      <input 
                        name="price" 
                        type="number" 
                        step="0.01" 
                        required 
                        defaultValue={editingSession?.price || 0}
                        className="w-full bg-black border-2 border-zinc-900 rounded-2xl px-6 py-4 text-[14px] font-black text-white outline-none focus:border-white transition-all" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] ml-2">COR_HEXADECIMAL</label>
                      <div className="flex gap-4">
                        <input 
                          name="color" 
                          type="color" 
                          defaultValue={editingSession?.theme_color || "#3b82f6"}
                          className="w-16 h-[60px] bg-black border-2 border-zinc-900 rounded-2xl p-2 cursor-pointer focus:border-white transition-all" 
                        />
                        <input 
                          type="text" 
                          placeholder="#000000"
                          defaultValue={editingSession?.theme_color || "#3b82f6"}
                          className="flex-1 bg-black border-2 border-zinc-900 rounded-2xl px-6 py-4 text-[14px] font-mono font-black text-white outline-none focus:border-white transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] ml-2">METADATA_DESCRICAO</label>
                    <textarea 
                      name="description" 
                      defaultValue={editingSession?.description}
                      placeholder="Input operacional detalhes aqui..."
                      className="w-full bg-black border-2 border-zinc-900 rounded-[1.5rem] px-6 py-4 text-[13px] font-black text-white outline-none focus:border-white transition-all h-32 resize-none placeholder:text-zinc-800" 
                    />
                  </div>

                  <div className="pt-8">
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="w-full bg-white hover:bg-zinc-200 text-black py-6 rounded-[1.5rem] font-black text-[14px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl disabled:opacity-50 group"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} strokeWidth={3} />}
                      {editingSession ? 'CONFIRMAR_LOGICA' : 'IMPLEMENTAR_SERVICO'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingMatrix && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-10">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewingMatrix(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-3xl" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="w-full max-w-5xl bg-zinc-950 border border-zinc-900 rounded-[3rem] shadow-[0_50px_200px_rgba(0,0,0,1)] relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-10 lg:p-14 border-b border-zinc-900">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-[28px] font-black text-white uppercase tracking-tighter leading-none">
                      Matriz_Temporal_Override
                    </h3>
                    <p className="text-[10px] text-[var(--color-admin-accent)] font-mono font-black uppercase tracking-[0.4em] mt-3">
                      Alvo: {viewingMatrix.name}
                    </p>
                  </div>
                  <button 
                    onClick={() => setViewingMatrix(null)}
                    className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 hover:text-white hover:border-white transition-all active:scale-90"
                  >
                    <X size={28} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 lg:p-14 custom-scrollbar">
                {isMatrixLoading ? (
                  <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <Loader2 className="animate-spin text-[var(--color-admin-accent)]" size={48} />
                    <p className="text-[10px] font-mono font-black text-zinc-700 uppercase tracking-[0.4em]">Inspecionando Matriz...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((dayName, dayIndex) => {
                      const daySlots = matrixSlots.filter(s => s.day_of_week === dayIndex);
                      
                      return (
                        <div key={dayIndex} className="bg-zinc-900/50 border border-zinc-900 rounded-[2rem] p-8 space-y-6">
                          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">{dayName}</span>
                            <span className="text-[9px] font-mono text-zinc-600 uppercase">{daySlots.length} SLOTS</span>
                          </div>
                          
                          <div className="space-y-3">
                            {daySlots.map((slot) => (
                              <button
                                key={`${slot.day_of_week}-${slot.start_time}`}
                                onClick={() => handleToggleSlot(slot)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                  slot.is_active 
                                    ? "bg-white text-black border-white shadow-lg" 
                                    : "bg-black text-zinc-600 border-zinc-900 hover:border-zinc-700"
                                }`}
                              >
                                <span className="text-[14px] font-mono font-black">{slot.start_time.substring(0, 5)}</span>
                                {slot.is_active ? (
                                  <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                                ) : (
                                  <div className="w-2 h-2 bg-zinc-900 rounded-full" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Sincronização */}
      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 right-12 bg-white text-black px-10 py-6 rounded-2xl flex items-center gap-5 shadow-[0_0_100px_rgba(255,255,255,0.1)] z-[2000] border-2 border-black"
          >
            <Loader2 className="animate-spin" size={24} strokeWidth={3} />
            <div className="flex flex-col">
               <span className="text-[13px] font-black uppercase tracking-[0.3em]">SINCRONIZANDO</span>
               <span className="text-[10px] text-zinc-500 font-mono font-black uppercase tracking-tighter">Atualizando Ledger...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
