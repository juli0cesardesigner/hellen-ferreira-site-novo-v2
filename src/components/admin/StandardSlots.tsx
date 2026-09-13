"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, Loader2, Save, X, Filter, Globe, Database, RefreshCw, Eye, EyeOff } from "lucide-react";
import { listSchemaSlots, addSchemaSlot, deleteSchemaSlot, getSiteSetting, updateSiteSetting } from "@/lib/actions/admin-actions";
import { motion, AnimatePresence } from "framer-motion";
import { SESSIONS_DATA } from "@/lib/data/sessions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { SlotDefinition } from "@/types/database";

export function StandardSlotsSection({ onEditingChange }: { onEditingChange?: (editing: boolean) => void }) {
  const sessions = Object.values(SESSIONS_DATA);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [slots, setSlots] = useState<SlotDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newSlotTime, setNewSlotTime] = useState<string>("09:00");
  const [addingToDay, setAddingToDay] = useState<number | null>(null);

  const [minNoticeHours, setMinNoticeHours] = useState<string>("24");
  const [isUpdatingNotice, setIsUpdatingNotice] = useState(false);

  // System Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean,
    title: string,
    message: string,
    confirmLabel?: string,
    cancelLabel?: string,
    onConfirm: () => void,
    variant?: 'danger' | 'info' | 'warning'
  } | null>(null);

  const showConfirm = (config: Omit<NonNullable<typeof confirmConfig>, 'isOpen'>) => {
    setConfirmConfig({ ...config, isOpen: true });
  };

  const closeConfirm = () => {
    setConfirmConfig(null);
  };

  // Notify parent if we are adding a slot or modal is open
  useEffect(() => {
    if (onEditingChange) {
      onEditingChange(addingToDay !== null || !!confirmConfig);
    }
  }, [addingToDay, confirmConfig, onEditingChange]);

  const loadNoticeHours = React.useCallback(async () => {
    const val = await getSiteSetting('min_booking_notice_hours');
    if (val) setMinNoticeHours(val);
  }, []);

  const loadSlots = React.useCallback(async () => {
    setIsLoading(true);
    const res = await listSchemaSlots(selectedSession || null);
    setSlots((res.slots || []) as SlotDefinition[]);
    setIsLoading(false);
  }, [selectedSession]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSlots();
    loadNoticeHours();
  }, [loadSlots, loadNoticeHours]);

  const handleUpdateNotice = async () => {
    setIsUpdatingNotice(true);
    const res = await updateSiteSetting('min_booking_notice_hours', minNoticeHours);
    if (res.success) {
      showConfirm({
        title: "Sucesso",
        message: "Prazo de antecedência atualizado com sucesso!",
        confirmLabel: "Ótimo",
        onConfirm: closeConfirm,
        variant: "info"
      });
    }
    setIsUpdatingNotice(false);
  };


  const handleAddSlot = async (dayOfWeek: number) => {
    if (!newSlotTime) return;
    setIsSaving(true);
    const res = await addSchemaSlot(dayOfWeek, newSlotTime + ":00", selectedSession || null);
    if (res.success) {
      await loadSlots();
      setAddingToDay(null);
    } else {
      showConfirm({
        title: "Erro ao Salvar",
        message: "Não foi possível adicionar o horário: " + res.error,
        confirmLabel: "OK",
        cancelLabel: "",
        onConfirm: closeConfirm,
        variant: "warning"
      });
    }
    setIsSaving(false);
  };

  const handleToggleSlot = async (slot: SlotDefinition, dayOfWeek: number) => {
    const isGlobal = slot.source === 'global';
    
    if (selectedSession && isGlobal) {
        setIsSaving(true);
        // Toggling visibility of a global slot for this specific session
        if (slot.is_active) {
            // Hide it: add a record with is_active = false
            await addSchemaSlot(dayOfWeek, slot.start_time, selectedSession, false);
        } else {
            // Show it: delete the overriding record
            if (slot.id) await deleteSchemaSlot(slot.id);
        }
        await loadSlots();
        setIsSaving(false);
    } else {
        // Actual deletion - request confirmation
        showConfirm({
          title: "Remover Horário",
          message: "Deseja remover este horário da agenda? Esta ação é definitiva para este serviço.",
          confirmLabel: "Remover",
          cancelLabel: "Cancelar",
          onConfirm: async () => {
            setIsSaving(true);
            if (slot.id) await deleteSchemaSlot(slot.id);
            await loadSlots();
            setIsSaving(false);
            closeConfirm();
          },
          variant: "danger"
        });
    }
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
      <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-10 lg:p-14 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-admin-accent)] to-transparent opacity-0" />
        
        <div className="flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[var(--color-admin-bg)] text-[var(--color-admin-text)] rounded-2xl flex items-center justify-center border border-[var(--color-admin-border)] shadow-inner">
                <Globe size={28} />
              </div>
              <div>
                <h4 className="text-[20px] font-bold text-[var(--color-admin-text)] tracking-tight leading-none">Horários de Atendimento</h4>
                <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium mt-2">Gerencie a grade de horários padrão do estúdio</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-4xl">
            {/* Antecedência Mínima */}
            <div className="flex flex-1 items-center gap-4 bg-[var(--color-admin-bg)] p-3 rounded-2xl border border-[var(--color-admin-border)] shadow-inner w-full sm:w-auto">
              <div className="pl-3 text-[var(--color-admin-text-muted)]">
                <Clock size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-admin-text-muted)] mb-0.5">Antecedência Mínima Geral</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={minNoticeHours}
                    onChange={(e) => setMinNoticeHours(e.target.value)}
                    className="w-16 bg-transparent border-none text-[14px] font-bold text-[var(--color-admin-text)] focus:ring-0 p-0"
                    placeholder="24"
                  />
                  <span className="text-[12px] font-bold text-[var(--color-admin-text-muted)]">horas</span>
                  <span className="text-[9px] text-[var(--color-admin-text-muted)] hidden xl:inline font-medium ml-1">(Padrão do estúdio — serviços com regra própria têm prioridade)</span>
                </div>
              </div>
              <button 
                onClick={handleUpdateNotice}
                disabled={isUpdatingNotice}
                className="ml-auto bg-[var(--color-admin-accent)] text-white p-3 rounded-xl hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
              >
                {isUpdatingNotice ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              </button>
            </div>

            <div className="relative flex-1 w-full group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-admin-text-muted)] group-focus-within:text-[var(--color-admin-accent)] transition-colors duration-300">
                <Database size={18} />
              </div>
              <select 
                value={selectedSession} 
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-2xl pl-14 pr-12 py-5 text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-admin-text)] focus:border-[var(--color-admin-accent)] transition-all duration-500 appearance-none cursor-pointer shadow-inner"
              >
                <option value="">Configuração Geral</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--color-admin-text-muted)] pointer-events-none transition-colors">
                 <Filter size={16} />
              </div>
            </div>
            
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
            <div key={day.value} className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2rem] flex flex-col overflow-hidden shadow-sm transition-all">
              <div className="bg-[var(--color-admin-bg)] px-6 py-5 border-b border-[var(--color-admin-border)] flex items-center justify-center">
                <span className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide transition-colors">{day.label}</span>
              </div>
              
              <div className="p-4 space-y-4 flex-1 min-h-0 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {slots.filter(s => s.day_of_week === day.value).map(slot => {
                    const isGlobal = slot.source === 'global';
                    const isDeactivated = !slot.is_active;

                    return (
                      <motion.div 
                        key={slot.id || `${slot.day_of_week}-${slot.start_time}`} 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                          isDeactivated 
                            ? 'bg-red-500/5 border-red-500/10 grayscale opacity-40' 
                            : 'bg-[var(--color-admin-bg)] border-[var(--color-admin-border)]'
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                           <span className={`text-[18px] font-bold tracking-tight ${isDeactivated ? 'text-red-900/50 line-through' : 'text-[var(--color-admin-text)] transition-colors'}`}>
                            {slot.start_time.slice(0, 5)}
                          </span>
                          <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${isGlobal ? 'bg-slate-300' : 'bg-[var(--color-admin-accent)] shadow-sm'}`} />
                             <span className={`text-[9px] font-black uppercase tracking-widest ${isGlobal ? 'text-slate-400' : 'text-[var(--color-admin-accent)]'}`}>
                               {isGlobal ? 'PADRÃO' : 'ESPECÍFICO'}
                             </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleToggleSlot(slot, day.value)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-90 ${
                            (selectedSession && slot.source === 'global')
                              ? 'bg-[var(--color-admin-bg)] border-[var(--color-admin-border)] text-[var(--color-admin-accent)]'
                              : 'bg-[var(--color-admin-surface)] border-[var(--color-admin-border)] text-[var(--color-admin-text-muted)]'
                          }`}
                        >
                          {selectedSession && slot.source === 'global' ? (
                            slot.is_active ? <Eye size={18} /> : <EyeOff size={18} className="text-red-400" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {addingToDay === day.value ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-accent)] rounded-[1.5rem] space-y-5 mt-6 shadow-sm relative z-20">
                    <input 
                      type="time" 
                      value={newSlotTime} 
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="w-full bg-[var(--color-admin-surface)] border-2 border-[var(--color-admin-border)] rounded-xl px-4 py-4 text-[16px] font-bold text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all"
                    />
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleAddSlot(day.value)}
                        disabled={isSaving}
                        className="flex-1 bg-[var(--color-admin-accent)] text-white text-[11px] font-black py-4 rounded-xl disabled:opacity-30 uppercase tracking-[0.2em] transition-all shadow-sm"
                      >
                        Adicionar
                      </button>
                      <button 
                        onClick={() => setAddingToDay(null)}
                        className="p-4 bg-[var(--color-admin-surface)] border-2 border-[var(--color-admin-border)] text-[var(--color-admin-text-muted)] rounded-xl transition-all"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => setAddingToDay(day.value)}
                    className="w-full mt-8 flex items-center justify-center gap-3 p-6 border-2 border-dashed border-[var(--color-admin-border)] bg-[var(--color-admin-bg)] text-[var(--color-admin-text-muted)] transition-all rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.4em]"
                  >
                    <Plus size={20} strokeWidth={2.5} /> Novo Horário
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação Único */}
      {confirmConfig && (
        <ConfirmModal 
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          cancelLabel={confirmConfig.cancelLabel}
          onConfirm={confirmConfig.onConfirm}
          onCancel={closeConfirm}
          variant={confirmConfig.variant}
        />
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
