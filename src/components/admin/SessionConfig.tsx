"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Clock, CalendarDays, Loader2, Save, X, Edit2, 
  Palette, Settings, ShieldCheck, Camera, Info, Database, 
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
      duration_slots: parseInt(formData.get("duration") as string),
      theme_color: formData.get("color") as string,
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
    if (!confirm("Tem certeza que deseja excluir este serviço? Todos os horários associados serão removidos. Continuar?")) return;
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
      <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-10 lg:p-14 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-admin-accent)] to-transparent opacity-0" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[var(--color-admin-accent)] opacity-[0.02] blur-[100px] rounded-full" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[var(--color-admin-bg)] text-[var(--color-admin-text)] rounded-2xl flex items-center justify-center border border-[var(--color-admin-border)] shadow-inner">
                <Briefcase size={28} />
              </div>
              <div>
                <h2 className="text-[14px] lg:text-[20px] font-bold text-[var(--color-admin-text)] tracking-tight leading-none">Serviços e Pacotes</h2>
                <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium mt-2">Gerenciamento de ofertas do estúdio</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => { setEditingSession(null); setIsModalOpen(true); }}
            className="bg-[var(--color-admin-accent)] text-white px-10 py-5 rounded-2xl text-[12px] font-bold tracking-tight flex items-center gap-4 transition-all shadow-sm active:scale-95 group"
          >
            <Plus size={20} strokeWidth={2.5} /> 
            Novo Serviço
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-64 bg-zinc-950/20 border-2 border-dashed border-zinc-900 rounded-[3rem] gap-8">
           <div className="relative">
              <Loader2 className="animate-spin text-[var(--color-admin-accent)]" size={60} strokeWidth={2.5} />
              <div className="absolute inset-0 blur-3xl bg-[var(--color-admin-accent)] opacity-20 animate-pulse" />
           </div>
           <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider animate-pulse">Carregando serviços...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {sessions.map((session) => (
            <motion.div 
              key={session.id} 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-10 flex flex-col justify-between transition-all shadow-sm group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-admin-accent)]/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-0 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div 
                    className="w-14 h-14 rounded-2xl border-2 shadow-inner flex items-center justify-center bg-[var(--color-admin-bg)]"
                    style={{ borderColor: session.theme_color || '#333' }}
                  >
                    <Camera size={24} style={{ color: session.theme_color || '#333' }} />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setViewingMatrix(session); loadMatrix(session.id); }}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-[var(--color-admin-text-muted)] transition-all active:scale-90"
                      title="Ver Matriz de Horários"
                    >
                      <Settings size={18} />
                    </button>
                    <button 
                      onClick={() => { setEditingSession(session); setIsModalOpen(true); }}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-[var(--color-admin-text-muted)] transition-all active:scale-90"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(session.id)}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-[var(--color-admin-text-muted)] transition-all active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h5 className="text-[22px] font-black text-[var(--color-admin-text)] uppercase tracking-tighter leading-none mb-3 transition-colors">
                  {session.name}
                </h5>
                <p className="text-[11px] text-[var(--color-admin-text-muted)] font-bold uppercase tracking-wider mb-8">ID: {session.id.split('-')[0]}</p>
                
                <div className="space-y-4 pt-8 border-t border-[var(--color-admin-border)]">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider">Duração</span>
                    <span className="text-[14px] font-bold text-[var(--color-admin-text)]">{(session.duration_slots || 0) * 30} MIN</span>
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
              className="w-full max-w-2xl bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[3rem] shadow-[0_50px_200px_rgba(0,0,0,0.1)] relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--color-admin-accent)] opacity-20" />
              
              <div className="p-10 lg:p-14">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h3 className="text-[28px] font-bold text-[var(--color-admin-text)] tracking-tight leading-none">
                      {editingSession ? 'Editar serviço' : 'Novo serviço'}
                    </h3>
                    <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium mt-2">Configure os detalhes do serviço oferecido</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-14 h-14 bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-2xl flex items-center justify-center text-[var(--color-admin-text-muted)] active:scale-90"
                  >
                    <X size={28} />
                  </button>
                </div>

                <form action={handleSave} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-2">Nome do Serviço</label>
                    <input 
                      name="name" 
                      required 
                      defaultValue={editingSession?.name}
                      placeholder="Ex: Ensaio Gestante"
                      className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-2xl px-6 py-4 text-[14px] font-black text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-2">Slots (30min cada)</label>
                      <input 
                        name="duration" 
                        type="number" 
                        required 
                        defaultValue={editingSession?.duration_slots || 2}
                        className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-2xl px-6 py-4 text-[14px] font-black text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-2">Cor do Calendário</label>
                      <div className="flex gap-4">
                        <input 
                          name="color" 
                          type="color" 
                          defaultValue={editingSession?.theme_color || "#3b82f6"}
                          className="w-16 h-[60px] bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-2xl p-2 cursor-pointer focus:border-[var(--color-admin-accent)] transition-all" 
                        />
                        <input 
                          type="text" 
                          placeholder="#000000"
                          defaultValue={editingSession?.theme_color || "#3b82f6"}
                          className="flex-1 bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-2xl px-6 py-4 text-[14px] font-bold text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all" 
                        />
                      </div>
                    </div>
                  </div>



                  <div className="pt-8">
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="w-full bg-[var(--color-admin-accent)] text-white py-6 rounded-[1.5rem] font-bold text-[14px] tracking-tight flex items-center justify-center gap-4 transition-all active:scale-95 shadow-lg disabled:opacity-50 group"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} strokeWidth={2.5} />}
                      {editingSession ? 'Salvar Alterações' : 'Criar Serviço'}
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
              className="w-full max-w-5xl bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[3rem] shadow-[0_50px_200px_rgba(0,0,0,0.1)] relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-10 lg:p-14 border-b border-[var(--color-admin-border)]">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-[28px] font-black text-[var(--color-admin-text)] uppercase tracking-tighter leading-none">
                      Horários Específicos
                    </h3>
                    <p className="text-[11px] text-[var(--color-admin-accent)] font-bold uppercase tracking-wider mt-3">
                      Serviço: {viewingMatrix.name}
                    </p>
                  </div>
                  <button 
                    onClick={() => setViewingMatrix(null)}
                    className="w-14 h-14 bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-2xl flex items-center justify-center text-[var(--color-admin-text-muted)] active:scale-90"
                  >
                    <X size={28} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 lg:p-14 custom-scrollbar">
                {isMatrixLoading ? (
                  <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <Loader2 className="animate-spin text-[var(--color-admin-accent)]" size={48} />
                    <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Carregando horários...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((dayName, dayIndex) => {
                      const daySlots = matrixSlots.filter(s => s.day_of_week === dayIndex);
                      
                      return (
                        <div key={dayIndex} className="bg-[var(--color-admin-bg)]/50 border border-[var(--color-admin-border)] rounded-[2rem] p-8 space-y-6">
                          <div className="flex justify-between items-center border-b border-[var(--color-admin-border)] pb-4">
                            <span className="text-[11px] font-black text-[var(--color-admin-text)] uppercase tracking-widest">{dayName}</span>
                            <span className="text-[11px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider">{daySlots.length} HORÁRIOS</span>
                          </div>
                          
                          <div className="space-y-3">
                            {daySlots.map((slot) => (
                              <button
                                key={`${slot.day_of_week}-${slot.start_time}`}
                                onClick={() => handleToggleSlot(slot)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all active:scale-95 ${
                                  slot.is_active 
                                    ? "bg-[var(--color-admin-accent)] text-white border-[var(--color-admin-accent)] shadow-lg" 
                                    : "bg-[var(--color-admin-bg)] text-slate-400 border-[var(--color-admin-border)]"
                                }`}
                              >
                                <span className="text-[14px] font-bold">{slot.start_time.substring(0, 5)}</span>
                                {slot.is_active ? (
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                ) : (
                                  <div className="w-2 h-2 bg-slate-300 rounded-full" />
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
               <span className="text-[13px] font-bold uppercase tracking-wider">Sincronizando</span>
               <span className="text-[11px] text-slate-500 font-medium">Salvando alterações...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
