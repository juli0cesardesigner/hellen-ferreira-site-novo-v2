"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Calendar, Clock, Save, Loader2, Pause, Play, 
  Plus, X, Home, Trees, Layers, AlertCircle, CheckCircle2, RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Session, NatalConfig, NatalSlot } from "@/types/database";
import { listSessions, getNatalConfigAdmin, saveNatalConfigAdmin } from "@/lib/actions/admin-actions";
import { useToast } from "@/components/ui/Toast";
import { InternalDatePicker } from "@/components/ui/InternalDatePicker";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const DAYS_OF_WEEK = [
  { id: 0, label: "Dom", full: "Domingo" },
  { id: 1, label: "Seg", full: "Segunda-feira" },
  { id: 2, label: "Ter", full: "Terça-feira" },
  { id: 3, label: "Qua", full: "Quarta-feira" },
  { id: 4, label: "Qui", full: "Quinta-feira" },
  { id: 5, label: "Sex", full: "Sexta-feira" },
  { id: 6, label: "Sáb", full: "Sábado" },
];

export function NatalSeasonalSection({ onEditingChange }: { onEditingChange?: (editing: boolean) => void }) {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estado da configuração de Natal
  const [config, setConfig] = useState<NatalConfig>({
    enabled: false,
    startDate: "",
    endDate: "",
    defaultLocationOverride: "all",
    sessionRules: {}
  });

  // Modal para editar horários específicos de Natal de um ensaio
  const [editingSessionSlots, setEditingSessionSlots] = useState<Session | null>(null);
  const [tempSlots, setTempSlots] = useState<NatalSlot[]>([]);
  const [newSlotTime, setNewSlotTime] = useState("17:00");
  const [newSlotDay, setNewSlotDay] = useState(1);

  // Modal de confirmação
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'info' | 'warning';
  } | null>(null);

  useEffect(() => {
    if (onEditingChange) {
      onEditingChange(!!editingSessionSlots || !!confirmConfig);
    }
  }, [editingSessionSlots, confirmConfig, onEditingChange]);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const [sessRes, natalRes] = await Promise.all([
      listSessions(),
      getNatalConfigAdmin()
    ]);
    setSessions(sessRes.sessions || []);
    setConfig(natalRes);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (updatedConfig = config) => {
    setIsSaving(true);
    const res = await saveNatalConfigAdmin(updatedConfig);
    if (res.success) {
      setConfig(updatedConfig);
      showToast("Configurações da Temporada de Natal salvas com sucesso!", "success");
    } else {
      showToast("Erro ao salvar regras de Natal: " + res.error, "error");
    }
    setIsSaving(false);
  };

  const toggleNatalEnabled = () => {
    const updated: NatalConfig = {
      ...config,
      enabled: !config.enabled
    };
    setConfig(updated);
    handleSave(updated);
  };

  const toggleSessionPaused = (sessionId: string) => {
    const currentRule = config.sessionRules[sessionId] || {
      sessionId,
      paused: false,
      locationOverride: 'all',
      slots: []
    };

    const updated: NatalConfig = {
      ...config,
      sessionRules: {
        ...config.sessionRules,
        [sessionId]: {
          ...currentRule,
          paused: !currentRule.paused
        }
      }
    };
    setConfig(updated);
    handleSave(updated);
  };

  const setLocationOverride = (sessionId: string, locationOverride: 'all' | 'estudio' | 'externo') => {
    const currentRule = config.sessionRules[sessionId] || {
      sessionId,
      paused: false,
      locationOverride: 'all',
      slots: []
    };

    const updated: NatalConfig = {
      ...config,
      sessionRules: {
        ...config.sessionRules,
        [sessionId]: {
          ...currentRule,
          locationOverride
        }
      }
    };
    setConfig(updated);
    handleSave(updated);
  };

  const openSlotEditor = (session: Session) => {
    const rule = config.sessionRules[session.id];
    setEditingSessionSlots(session);
    setTempSlots(rule?.slots ? [...rule.slots] : []);
  };

  const handleAddTempSlot = () => {
    if (!newSlotTime) return;
    const formatted = newSlotTime.length === 5 ? `${newSlotTime}:00` : newSlotTime;
    const exists = tempSlots.some(s => s.day_of_week === newSlotDay && s.time.substring(0, 5) === formatted.substring(0, 5));
    if (exists) {
      showToast("Este horário já está adicionado para este dia.", "info");
      return;
    }
    setTempSlots([...tempSlots, { day_of_week: newSlotDay, time: formatted }]);
  };

  const handleRemoveTempSlot = (index: number) => {
    setTempSlots(tempSlots.filter((_, i) => i !== index));
  };

  const handleSaveSessionSlots = () => {
    if (!editingSessionSlots) return;
    const currentRule = config.sessionRules[editingSessionSlots.id] || {
      sessionId: editingSessionSlots.id,
      paused: false,
      locationOverride: 'all',
      slots: []
    };

    const updated: NatalConfig = {
      ...config,
      sessionRules: {
        ...config.sessionRules,
        [editingSessionSlots.id]: {
          ...currentRule,
          slots: tempSlots
        }
      }
    };
    setConfig(updated);
    handleSave(updated);
    setEditingSessionSlots(null);
  };

  const handleResetSessionSlots = () => {
    if (!editingSessionSlots) return;
    setTempSlots([]);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <Loader2 className="animate-spin text-rose-500" size={48} />
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Carregando Temporada de Natal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* ─── Banner de Destaque Natalino ─── */}
      <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-emerald-950 border border-rose-500/20 rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full text-rose-300 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} />
              Regras Sazonais Automáticas
            </div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
              Temporada de Natal 🎄
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl font-light leading-relaxed">
              Defina o período dos ensaios de Natal. Todas as pausas, restrições e horários personalizados 
              <strong> entram em vigor na data de início e expiram automaticamente na data de término</strong>, 
              sem você precisar alterar nada manualmente quando o Natal acabar.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl shrink-0">
            <span className="text-[12px] font-bold uppercase tracking-wider pl-4">
              Status da Temporada:
            </span>
            <button
              onClick={toggleNatalEnabled}
              disabled={isSaving}
              className={`px-6 py-3 rounded-xl font-black text-[12px] uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2 ${
                config.enabled 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
            >
              {config.enabled ? (
                <>
                  <CheckCircle2 size={16} /> Ativado
                </>
              ) : (
                <>
                  <Pause size={16} /> Desativado
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Período da Temporada (Datas) ─── */}
      <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-8 lg:p-10 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-[var(--color-admin-border)] pb-6">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-500/20">
            <Calendar size={22} />
          </div>
          <div>
            <h3 className="text-[18px] font-black text-[var(--color-admin-text)] tracking-tight">1. Período da Temporada</h3>
            <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium">
              Fora destas datas, o estúdio funcionará normalmente na sua grade original.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InternalDatePicker
            label="Data de Início do Natal"
            value={config.startDate}
            onChange={(val) => {
              const updated = { ...config, startDate: val };
              setConfig(updated);
            }}
          />
          <InternalDatePicker
            label="Data de Término do Natal"
            value={config.endDate}
            onChange={(val) => {
              const updated = { ...config, endDate: val };
              setConfig(updated);
            }}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-6 py-3 bg-[var(--color-admin-accent)] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar Datas
          </button>
        </div>
      </div>

      {/* ─── Tabela de Ensaios e Regras do Natal ─── */}
      <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-8 lg:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-admin-border)] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20">
              <Layers size={22} />
            </div>
            <div>
              <h3 className="text-[18px] font-black text-[var(--color-admin-text)] tracking-tight">2. Regras por Ensaio no Natal</h3>
              <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium">
                Defina quais ensaios serão pausados e os horários e locais dos que continuarão ativos.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const rule = config.sessionRules[session.id] || {
              sessionId: session.id,
              paused: false,
              locationOverride: 'all',
              slots: []
            };

            const isPausedInNatal = rule.paused;
            const hasCustomSlots = rule.slots && rule.slots.length > 0;
            const locationMode = rule.locationOverride || 'all';

            return (
              <div 
                key={session.id}
                className={`p-6 rounded-[2rem] border transition-all space-y-5 ${
                  isPausedInNatal 
                    ? 'bg-rose-500/5 border-rose-500/20 opacity-80' 
                    : 'bg-[var(--color-admin-bg)] border-[var(--color-admin-border)]'
                }`}
              >
                {/* Cabeçalho do Ensaio */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[15px] font-black text-[var(--color-admin-text)] uppercase tracking-tight">
                      {session.name}
                    </h4>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      isPausedInNatal ? 'text-rose-500' : 'text-emerald-500'
                    }`}>
                      {isPausedInNatal ? '⛔ Pausado no Natal' : '✅ Ativo no Natal'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleSessionPaused(session.id)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-90 ${
                      isPausedInNatal
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white'
                    }`}
                    title={isPausedInNatal ? "Reativar Ensaio no Natal" : "Pausar Ensaio no Natal"}
                  >
                    {isPausedInNatal ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
                  </button>
                </div>

                {!isPausedInNatal && (
                  <div className="space-y-4 pt-4 border-t border-[var(--color-admin-border)]/50">
                    
                    {/* Controle de Modalidade: Estúdio vs Externo */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider block">
                        Local no Período de Natal:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 bg-[var(--color-admin-surface)] p-1 rounded-xl border border-[var(--color-admin-border)]">
                        <button
                          type="button"
                          onClick={() => setLocationOverride(session.id, 'all')}
                          className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                            locationMode === 'all' 
                              ? 'bg-[var(--color-admin-accent)] text-white shadow-sm' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Ambos
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocationOverride(session.id, 'estudio')}
                          className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                            locationMode === 'estudio' 
                              ? 'bg-amber-500 text-white shadow-sm' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Só Estúdio
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocationOverride(session.id, 'externo')}
                          className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                            locationMode === 'externo' 
                              ? 'bg-emerald-500 text-white shadow-sm' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Só Externo
                        </button>
                      </div>
                    </div>

                    {/* Controle de Horários Específicos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider block">
                          Horários no Natal:
                        </label>
                        <span className="text-[9px] font-black uppercase text-amber-500">
                          {hasCustomSlots ? `${rule.slots?.length} slots custom` : 'Grade Normal'}
                        </span>
                      </div>

                      <button
                        onClick={() => openSlotEditor(session)}
                        className={`w-full py-2.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                          hasCustomSlots
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white'
                            : 'bg-[var(--color-admin-surface)] border-[var(--color-admin-border)] text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <Clock size={13} />
                        {hasCustomSlots ? 'Editar Horários de Natal' : 'Personalizar Horários de Natal'}
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Modal para Editar Horários Específicos do Natal para um Ensaio ─── */}
      <AnimatePresence>
        {editingSessionSlots && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-10">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingSessionSlots(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl" 
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="w-full max-w-3xl bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-[var(--color-admin-border)] flex items-center justify-between">
                <div>
                  <h3 className="text-[20px] font-black text-[var(--color-admin-text)] uppercase tracking-tight">
                    Horários de Natal: {editingSessionSlots.name}
                  </h3>
                  <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium mt-1">
                    Ex: Sábado 11:00 e 16:00 | Seg-Sex 17:00. Estes horários valem exclusivamente no período de Natal.
                  </p>
                </div>
                <button
                  onClick={() => setEditingSessionSlots(null)}
                  className="w-10 h-10 rounded-xl bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] flex items-center justify-center text-slate-400 active:scale-90"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Corpo com Adição e Lista de Horários */}
              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                
                {/* Adicionar Horário */}
                <div className="p-5 bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-2xl space-y-3">
                  <span className="text-[10px] font-black text-[var(--color-admin-accent)] uppercase tracking-wider block">
                    Adicionar Horário para o Natal:
                  </span>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <select
                      value={newSlotDay}
                      onChange={(e) => setNewSlotDay(Number(e.target.value))}
                      className="w-full sm:w-auto flex-1 bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-xl px-4 py-2.5 text-[12px] font-bold text-[var(--color-admin-text)] outline-none"
                    >
                      {DAYS_OF_WEEK.map(d => (
                        <option key={d.id} value={d.id}>{d.full}</option>
                      ))}
                    </select>

                    <input
                      type="time"
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="w-full sm:w-auto bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-xl px-4 py-2 text-[13px] font-black text-[var(--color-admin-text)] outline-none"
                    />

                    <button
                      type="button"
                      onClick={handleAddTempSlot}
                      className="w-full sm:w-auto px-6 py-2.5 bg-rose-500 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
                    >
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>
                </div>

                {/* Grade de Horários Configurador por Dia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {DAYS_OF_WEEK.map(day => {
                    const daySlots = tempSlots.filter(s => s.day_of_week === day.id);
                    return (
                      <div key={day.id} className="p-4 bg-[var(--color-admin-bg)]/60 border border-[var(--color-admin-border)] rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-[var(--color-admin-border)] pb-2">
                          <span className="text-[11px] font-black uppercase text-[var(--color-admin-text)] tracking-wider">
                            {day.label}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400">
                            {daySlots.length} slots
                          </span>
                        </div>

                        <div className="space-y-1.5 min-h-[60px]">
                          {daySlots.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic text-center py-4">Sem horário</p>
                          ) : (
                            daySlots.map((slot) => {
                              const originalIndex = tempSlots.findIndex(s => s.day_of_week === slot.day_of_week && s.time === slot.time);
                              return (
                                <div 
                                  key={slot.time}
                                  className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] text-[12px] font-bold text-[var(--color-admin-text)]"
                                >
                                  <span>{slot.time.substring(0, 5)}</span>
                                  <button
                                    onClick={() => handleRemoveTempSlot(originalIndex)}
                                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                    title="Remover horário"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Rodapé do Modal */}
              <div className="p-6 border-t border-[var(--color-admin-border)] flex items-center justify-between bg-[var(--color-admin-bg)]/40">
                <button
                  type="button"
                  onClick={handleResetSessionSlots}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-500 hover:text-rose-500 hover:border-rose-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 active:scale-95"
                >
                  <RotateCcw size={12} /> Limpar e Seguir Grade Normal
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingSessionSlots(null)}
                    className="px-5 py-2.5 rounded-xl border border-[var(--color-admin-border)] text-slate-400 text-[10px] font-bold uppercase tracking-wider active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSessionSlots}
                    className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md hover:bg-rose-600 active:scale-95 flex items-center gap-2"
                  >
                    <Save size={14} /> Salvar Horários de Natal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
