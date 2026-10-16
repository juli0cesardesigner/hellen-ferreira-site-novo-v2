"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Clock, CalendarDays, Loader2, Save, X, Edit2, 
  Settings, Database, 
  Briefcase, CalendarClock, Globe, Pause, Play, RotateCcw, AlertTriangle
} from "lucide-react";
import { 
  listSessions, createSession, updateSession, deleteSession,
  listSchemaSlots, addSchemaSlot, resetSessionSlots, getSiteSetting
} from "@/lib/actions/admin-actions";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionColor } from "@/lib/utils/colors";
import { PackageManager } from "@/components/admin/PackageManager";
import { Session, SlotDefinition } from "@/types/database";

// Componentes Oficiais
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { InternalDatePicker } from "@/components/ui/InternalDatePicker";
import { useToast } from "@/components/ui/Toast";

const PRESET_COLORS = [
  "#7986CB", "#7DA0D1", "#8FA1F3", "#90CAF9", "#8ED1F5", "#4DB6AC",
  "#C0CA33", "#2E7D32", "#81C784", "#7CB342", "#66BB6A", "#4CAF50",
  "#E4D09A", "#FFCCBC", "#FF8A3D", "#FFB74D", "#D4A017", "#BCAAA4",
  "#F48FB1", "#F06292", "#F5A9CB", "#CE93D8", "#B39DDB", "#9575CD",
  "#FF4081", "#EF5350", "#9FA8DA", "#8BC34A"
];

const formatCurrencyBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const parseCurrencyBRL = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return Number(digits) / 100;
};

export function SessionConfigSection({ onEditingChange }: { onEditingChange?: (editing: boolean) => void }) {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [viewingMatrix, setViewingMatrix] = useState<Session | null>(null);
  const [matrixSlots, setMatrixSlots] = useState<SlotDefinition[]>([]);
  const [isMatrixLoading, setIsMatrixLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [isPerpetual, setIsPerpetual] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [depositPrice, setDepositPrice] = useState(0);
  const [setupMinutes, setSetupMinutes] = useState(15);
  const [cleanupMinutes, setCleanupMinutes] = useState(15);
  const [globalNoticeHours, setGlobalNoticeHours] = useState(12);
  const [useCustomNotice, setUseCustomNotice] = useState(false);
  const [minNoticeHours, setMinNoticeHours] = useState<number | string>("");
  const [packageManagerSession, setPackageManagerSession] = useState<{ id: string; name: string } | null>(null);

  const [isActiveSession, setIsActiveSession] = useState(true);
  const [newCustomSlotTime, setNewCustomSlotTime] = useState("17:00");
  const [addingSlotDay, setAddingSlotDay] = useState<number | null>(null);

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

  // Notify parent of editing state
  useEffect(() => {
    if (onEditingChange) {
      onEditingChange(isModalOpen || !!viewingMatrix || !!packageManagerSession);
    }
  }, [isModalOpen, viewingMatrix, packageManagerSession, onEditingChange]);

  const loadSessions = React.useCallback(async () => {
    setIsLoading(true);
    const [data, settingVal] = await Promise.all([
      listSessions(),
      getSiteSetting('min_booking_notice_hours')
    ]);
    setSessions(data.sessions || []);
    if (settingVal) {
      setGlobalNoticeHours(parseInt(settingVal) || 12);
    }
    setIsLoading(false);
  }, []);

  const loadMatrix = React.useCallback(async (sessionId: string) => {
    setIsMatrixLoading(true);
    const res = await listSchemaSlots(sessionId);
    setMatrixSlots((res.slots || []) as SlotDefinition[]);
    setIsMatrixLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSessions();
  }, [loadSessions]);

  const handleToggleSessionStatus = async (session: Session) => {
    const newStatus = !(session.is_active ?? true);
    setIsSaving(true);
    const res = await updateSession(session.id, { is_active: newStatus });
    if (res.success) {
      await loadSessions();
      showToast(
        newStatus ? `Ensaio "${session.name}" reativado para agendamentos!` : `Ensaio "${session.name}" pausado com sucesso!`,
        newStatus ? "success" : "info"
      );
    } else {
      showConfirm({
        title: "Erro ao Atualizar",
        message: "Não foi possível alterar o status do serviço: " + res.error,
        confirmLabel: "OK",
        onConfirm: closeConfirm,
        variant: "warning"
      });
    }
    setIsSaving(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSaving(true);
    const data = {
      name: formData.get("name") as string,
      duration_slots: parseInt(formData.get("duration") as string),
      theme_color: selectedColor,
      is_perpetual: isPerpetual,
      start_date: isPerpetual ? null : startDate,
      end_date: isPerpetual ? null : endDate,
      deposit_price: depositPrice,
      setup_minutes: setupMinutes,
      cleanup_minutes: cleanupMinutes,
      min_notice_hours: useCustomNotice && minNoticeHours !== "" ? Number(minNoticeHours) : null,
      is_active: isActiveSession,
      slug: (formData.get("name") as string).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
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
      showConfirm({
        title: "Erro do Sistema",
        message: "Não foi possível salvar as alterações: " + res.error,
        confirmLabel: "Entendido",
        cancelLabel: "",
        onConfirm: closeConfirm,
        variant: "warning"
      });
    }
    setIsSaving(false);
  };

  const performDelete = async (id: string) => {
    setIsSaving(true);
    const res = await deleteSession(id);
    if (res.success) {
      await loadSessions();
    } else {
      showConfirm({
        title: "Erro do Sistema",
        message: "Não foi possível excluir o serviço: " + res.error,
        confirmLabel: "OK",
        cancelLabel: "",
        onConfirm: closeConfirm,
        variant: "warning"
      });
    }
    setIsSaving(false);
  };

  const handleDeleteRequest = (id: string) => {
    showConfirm({
      title: "Excluir Serviço?",
      message: "Tem certeza que deseja excluir este serviço? Todos os horários associados na matriz serão removidos definitivamente. Esta ação não pode ser desfeita.",
      confirmLabel: "Sim, Excluir",
      cancelLabel: "Cancelar",
      onConfirm: () => performDelete(id),
      variant: "danger"
    });
  };

  const handleToggleSlot = async (slot: SlotDefinition) => {
    if (!viewingMatrix) return;
    setIsSaving(true);
    await addSchemaSlot(slot.day_of_week, slot.start_time, viewingMatrix.id, !slot.is_active);
    await loadMatrix(viewingMatrix.id);
    setIsSaving(false);
  };

  const handleAddCustomSlot = async (dayOfWeek: number) => {
    if (!viewingMatrix || !newCustomSlotTime) return;
    setIsSaving(true);
    const formattedTime = newCustomSlotTime.length === 5 ? `${newCustomSlotTime}:00` : newCustomSlotTime;
    const res = await addSchemaSlot(dayOfWeek, formattedTime, viewingMatrix.id, true);
    if (res.success) {
      await loadMatrix(viewingMatrix.id);
      setAddingSlotDay(null);
    } else {
      showConfirm({
        title: "Erro ao Adicionar",
        message: "Não foi possível adicionar o horário: " + res.error,
        confirmLabel: "OK",
        onConfirm: closeConfirm,
        variant: "warning"
      });
    }
    setIsSaving(false);
  };

  const handleResetMatrix = (session: Session) => {
    showConfirm({
      title: "Restaurar Horários Padrão?",
      message: `Deseja remover todas as exceções de "${session.name}" e fazer este serviço voltar a seguir 100% a grade de horários globais do estúdio?`,
      confirmLabel: "Sim, Restaurar Padrão",
      cancelLabel: "Cancelar",
      onConfirm: async () => {
        setIsSaving(true);
        const res = await resetSessionSlots(session.id);
        if (res.success) {
          await loadMatrix(session.id);
          closeConfirm();
        } else {
          showConfirm({
            title: "Erro ao Restaurar",
            message: "Não foi possível restaurar os padrões: " + res.error,
            confirmLabel: "OK",
            onConfirm: closeConfirm,
            variant: "warning"
          });
        }
        setIsSaving(false);
      },
      variant: "warning"
    });
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
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { 
                setEditingSession(null); 
                setSelectedColor("#7986CB");
                setIsPerpetual(true);
                setIsActiveSession(true);
                setStartDate("");
                setEndDate("");
                setDepositPrice(0);
                setSetupMinutes(15);
                setCleanupMinutes(15);
                setUseCustomNotice(false);
                setMinNoticeHours("");
                setIsModalOpen(true); 
              }}
              className="bg-[var(--color-admin-accent)] text-white px-10 py-5 rounded-2xl text-[12px] font-bold tracking-tight flex items-center gap-4 transition-all shadow-sm active:scale-95 group"
            >
              <Plus size={20} strokeWidth={2.5} /> 
              Novo Serviço
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
           <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider animate-pulse">Carregando serviços...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {sessions.map((session) => {
            const colors = getSessionColor(session.name, session.theme_color);
            const customBg = colors.isCustom ? `${colors.customColor}25` : undefined;
            const isPaused = session.is_active === false;
            
            return (
              <motion.div 
                key={session.id} 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`group p-6 lg:p-7 border rounded-[2rem] transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden ${
                  isPaused 
                    ? 'border-rose-500/30 opacity-75 grayscale-[0.3]' 
                    : 'border-[var(--color-admin-border)]'
                } ${!colors.isCustom ? colors.bg : ''}`}
                style={{ backgroundColor: customBg }}
              >
                <div className="flex justify-between items-center mb-5 relative z-10">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-black text-[var(--color-admin-text)] uppercase tracking-tight leading-none">
                      {session.name}
                    </h3>
                    {isPaused && (
                      <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Pausado
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggleSessionStatus(session)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-90 shadow-sm ${
                        isPaused 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white' 
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white'
                      }`}
                      title={isPaused ? "Reativar Ensaio para Agendamentos" : "Pausar Ensaio Temporariamente"}
                    >
                      {isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
                    </button>
                    <button 
                      onClick={() => { setPackageManagerSession({ id: session.id, name: session.name }); }}
                      className="w-9 h-9 rounded-xl bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] text-slate-400 flex items-center justify-center transition-all hover:text-emerald-500 hover:border-emerald-500/30 active:scale-90 shadow-sm"
                      title="Gerenciar Preços dos Pacotes"
                    >
                      <Database size={14} />
                    </button>
                    <button 
                      onClick={() => { setViewingMatrix(session); loadMatrix(session.id); }}
                      className="w-9 h-9 rounded-xl bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] text-slate-400 flex items-center justify-center transition-all hover:text-[var(--color-admin-accent)] hover:border-[var(--color-admin-accent)]/30 active:scale-90 shadow-sm"
                      title="Ver Matriz de Horários"
                    >
                      <Settings size={14} />
                    </button>
                    <button 
                      onClick={() => { 
                        setEditingSession(session); 
                        setSelectedColor(session.theme_color || "#7986CB");
                        setIsPerpetual(session.is_perpetual ?? true);
                        setIsActiveSession(session.is_active ?? true);
                        setStartDate(session.start_date || "");
                        setEndDate(session.end_date || "");
                        setDepositPrice(session.deposit_price || 0);
                        setSetupMinutes(session.setup_minutes ?? 15);
                        setCleanupMinutes(session.cleanup_minutes ?? 15);
                        if (session.min_notice_hours !== null && session.min_notice_hours !== undefined) {
                          setUseCustomNotice(true);
                          setMinNoticeHours(session.min_notice_hours);
                        } else {
                          setUseCustomNotice(false);
                          setMinNoticeHours("");
                        }
                        setIsModalOpen(true); 
                      }}
                      className="w-9 h-9 rounded-xl bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] text-slate-400 flex items-center justify-center transition-all hover:text-[var(--color-admin-accent)] hover:border-[var(--color-admin-accent)]/30 active:scale-90 shadow-sm"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteRequest(session.id)}
                      className="w-9 h-9 rounded-xl bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] text-slate-400 flex items-center justify-center transition-all hover:text-rose-500 hover:border-rose-200 active:scale-90 shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[var(--color-admin-border)]/40 relative z-10">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Status</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold ${session.is_active !== false ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {session.is_active !== false ? 'Ativo' : 'Pausado'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Duração</span>
                    <span className="text-[var(--color-admin-text)]">{(session.duration_slots || 0) * 30} MIN</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Setup</span>
                    <span className="text-[var(--color-admin-text)]">{(session.setup_minutes ?? 15)} MIN</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Intervalo</span>
                    <span className="text-[var(--color-admin-text)]">{(session.cleanup_minutes ?? 15)} MIN</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Antecedência</span>
                    {session.min_notice_hours !== null && session.min_notice_hours !== undefined ? (
                      <span className="text-amber-500 font-bold">{session.min_notice_hours}h (Personalizada)</span>
                    ) : (
                      <span className="text-[var(--color-admin-text)]">{globalNoticeHours}h (Geral)</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Disponibilidade</span>
                    <span className={`px-3 py-1 rounded-full ${session.is_perpetual ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {session.is_perpetual ? 'Perpétuo' : 'Sazonal'}
                    </span>
                  </div>
                  {!session.is_perpetual && session.start_date && (
                    <div className="pt-2 flex items-center gap-2">
                       <CalendarDays size={10} className="text-[var(--color-admin-text-muted)]" />
                       <span className="text-[9px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-tight">
                         {new Date(session.start_date + "T12:00:00").toLocaleDateString('pt-BR')} {session.end_date ? `até ${new Date(session.end_date + "T12:00:00").toLocaleDateString('pt-BR')}` : ''}
                       </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Package Manager Modal */}
      {packageManagerSession && (
        <PackageManager
          sessionId={packageManagerSession.id}
          sessionName={packageManagerSession.name}
          isOpen={!!packageManagerSession}
          onClose={() => setPackageManagerSession(null)}
          onUpdated={() => {
            setPackageManagerSession(null);
          }}
        />
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
              className="w-full max-w-2xl bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[3rem] shadow-[0_50px_200px_rgba(0,0,0,0.1)] relative z-10 overflow-y-auto custom-scrollbar max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--color-admin-accent)] opacity-20" />
              
              {/* Header - SEM STICKY para scroll inteiriço */}
              <div className="p-8 lg:p-12 pb-4 flex justify-between items-center border-b border-[var(--color-admin-border)]/50 shrink-0">
                <div>
                  <h3 className="text-[24px] lg:text-[28px] font-bold text-[var(--color-admin-text)] tracking-tight leading-none">
                    {editingSession ? 'Editar serviço' : 'Novo serviço'}
                  </h3>
                  <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium mt-2">Configure os detalhes do serviço oferecido</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-12 h-12 bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-2xl flex items-center justify-center text-[var(--color-admin-text-muted)] active:scale-90"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form - SEM OVERFLOW para scroll inteiriço */}
              <form onSubmit={handleSave} className="flex flex-col">
                <div className="p-8 lg:p-12 space-y-8">
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

                  {/* ─── Status do Ensaio (Ativo / Pausado) ─── */}
                  <div className="p-5 bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[12px] font-bold text-[var(--color-admin-text)] block">Disponibilidade para Reserva</span>
                      <p className="text-[10px] text-[var(--color-admin-text-muted)] font-medium mt-0.5">
                        {isActiveSession ? "Clientes podem selecionar e agendar este ensaio normalmente." : "Ensaio pausado. A página exibirá aviso que está temporariamente indisponível."}
                      </p>
                    </div>
                    <div className="flex bg-[var(--color-admin-surface)] p-1 rounded-xl border border-[var(--color-admin-border)]">
                      <button
                        type="button"
                        onClick={() => setIsActiveSession(true)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                          isActiveSession 
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'text-[var(--color-admin-text-muted)] hover:text-[var(--color-admin-text)]'
                        }`}
                      >
                        Ativo
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsActiveSession(false)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                          !isActiveSession 
                            ? 'bg-rose-500 text-white shadow-sm' 
                            : 'text-[var(--color-admin-text-muted)] hover:text-[var(--color-admin-text)]'
                        }`}
                      >
                        Pausado
                      </button>
                    </div>
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
                      <div className="grid grid-cols-7 gap-2 bg-[var(--color-admin-bg)] p-4 border-2 border-[var(--color-admin-border)] rounded-2xl">
                        {PRESET_COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`w-full aspect-square rounded-lg transition-all border-2 relative ${
                              selectedColor === color ? "scale-110 shadow-md ring-2 ring-white/20" : "opacity-80 hover:opacity-100"
                            }`}
                            style={{ 
                              backgroundColor: color,
                              borderColor: selectedColor === color ? 'white' : 'transparent'
                            }}
                          >
                            {selectedColor === color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ─── Precificação ─── */}
                  <div className="p-8 bg-[var(--color-admin-surface)] border-2 border-[var(--color-admin-border)] rounded-[2rem] space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                       <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-500/20">
                          <Database size={18} />
                       </div>
                       <div>
                          <h4 className="text-[14px] font-bold text-[var(--color-admin-text)]">Precificação Base</h4>
                          <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium">Valores padrão para este serviço</p>
                       </div>
                    </div>
                    
                    <div className="max-w-md">
                       <div className="space-y-3">
                         <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-2">Valor da Reserva (Sinal)</label>
                         <div className="relative group">
                            <input 
                              type="text" 
                              value={formatCurrencyBRL(depositPrice)} 
                              onChange={(e) => setDepositPrice(parseCurrencyBRL(e.target.value))}
                              className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-2xl px-6 py-4 text-[14px] font-black text-emerald-600 outline-none focus:border-[var(--color-admin-accent)] transition-all shadow-inner" 
                            />
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* ─── Tempos Operacionais ─── */}
                  <div className="p-8 bg-[var(--color-admin-surface)] border-2 border-[var(--color-admin-border)] rounded-[2rem] space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                       <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center border border-amber-500/20">
                          <Clock size={18} />
                       </div>
                       <div>
                          <h4 className="text-[14px] font-bold text-[var(--color-admin-text)]">Tempos Operacionais</h4>
                          <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium">Setup e intervalo entre sessões (cada slot = 30min)</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                         <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-2">Setup (preparação)</label>
                         <div className="relative group">
                            <input 
                              type="number"
                              min={0}
                              max={60}
                              step={5}
                              value={setupMinutes}
                              onChange={(e) => setSetupMinutes(parseInt(e.target.value) || 0)}
                              className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-2xl px-6 py-4 text-[14px] font-black text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all shadow-inner" 
                            />
                         </div>
                         <p className="text-[10px] text-[var(--color-admin-text-muted)] font-medium ml-2">Tempo antes da sessão para preparar cenário</p>
                       </div>
                       <div className="space-y-3">
                         <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-2">Limpeza/Intervalo</label>
                         <div className="relative group">
                            <input 
                              type="number"
                              min={0}
                              max={60}
                              step={5}
                              value={cleanupMinutes}
                              onChange={(e) => setCleanupMinutes(parseInt(e.target.value) || 0)}
                              className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-2xl px-6 py-4 text-[14px] font-black text-amber-600 outline-none focus:border-[var(--color-admin-accent)] transition-all shadow-inner" 
                            />
                         </div>
                         <p className="text-[10px] text-[var(--color-admin-text-muted)] font-medium ml-2">Tempo após a sessão para limpeza/descanso</p>
                       </div>
                    </div>

                    {/* ─── Antecedência Mínima para Reserva ─── */}
                    <div className="pt-6 border-t border-[var(--color-admin-border)] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <label className="text-[12px] font-bold text-[var(--color-admin-text)] tracking-wide flex items-center gap-2">
                            <span>Antecedência Mínima</span>
                            {useCustomNotice && (
                              <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                Sobrepõe Geral
                              </span>
                            )}
                          </label>
                          <p className="text-[10px] text-[var(--color-admin-text-muted)] font-medium mt-0.5">
                            {useCustomNotice 
                              ? "Regra personalizada para este serviço. Clientes só agendam com essa antecedência." 
                              : `Herdando a regra geral do estúdio (${globalNoticeHours} horas).`}
                          </p>
                        </div>

                        <div className="flex bg-[var(--color-admin-bg)] p-1 rounded-xl border border-[var(--color-admin-border)] self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setUseCustomNotice(false);
                              setMinNoticeHours("");
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${!useCustomNotice ? 'bg-[var(--color-admin-accent)] text-white shadow' : 'text-[var(--color-admin-text-muted)] hover:text-[var(--color-admin-text)]'}`}
                          >
                            Padrão Geral ({globalNoticeHours}h)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUseCustomNotice(true);
                              if (minNoticeHours === "" || minNoticeHours === null || minNoticeHours === undefined) {
                                setMinNoticeHours(globalNoticeHours || 12);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${useCustomNotice ? 'bg-amber-500 text-white shadow' : 'text-[var(--color-admin-text-muted)] hover:text-[var(--color-admin-text)]'}`}
                          >
                            Personalizada
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {useCustomNotice && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-2"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative flex-1">
                                <input 
                                  type="number"
                                  min={0}
                                  max={720}
                                  value={minNoticeHours}
                                  onChange={(e) => setMinNoticeHours(e.target.value)}
                                  placeholder="Ex: 24"
                                  className="w-full bg-[var(--color-admin-bg)] border-2 border-amber-500/40 rounded-2xl px-6 py-4 text-[14px] font-black text-amber-500 outline-none focus:border-amber-500 transition-all shadow-inner" 
                                />
                              </div>
                              <span className="text-[13px] font-bold text-[var(--color-admin-text)]">horas</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[9px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider">Atalhos:</span>
                              {[
                                { label: 'Mesmo dia (2h)', val: 2 },
                                { label: '6h', val: 6 },
                                { label: '12h', val: 12 },
                                { label: '24h (1 dia)', val: 24 },
                                { label: '48h (2 dias)', val: 48 },
                                { label: '72h (3 dias)', val: 72 }
                              ].map((preset) => (
                                <button
                                  key={preset.val}
                                  type="button"
                                  onClick={() => setMinNoticeHours(preset.val)}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${Number(minNoticeHours) === preset.val ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-[var(--color-admin-bg)] text-[var(--color-admin-text-muted)] border-[var(--color-admin-border)] hover:text-[var(--color-admin-text)]'}`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-amber-500/90 font-medium">
                              Clientes só conseguirão agendar este serviço se faltar no mínimo {minNoticeHours || 0} horas para o horário escolhido.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* ─── Disponibilidade ─── */}
                  <div className="p-8 bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-[2rem] space-y-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                      <div className="flex items-center gap-4 w-full">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${isPerpetual ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {isPerpetual ? <Globe size={20} /> : <CalendarClock size={20} />}
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold text-[var(--color-admin-text)]">Tipo de Oferta</h4>
                          <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium">Recorrente ou com datas limitadas</p>
                        </div>
                      </div>
                      
                      <div className="flex bg-[var(--color-admin-surface)] p-1.5 rounded-xl border border-[var(--color-admin-border)] w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setIsPerpetual(true)}
                          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[10px] lg:text-[11px] font-bold uppercase tracking-wider transition-all ${isPerpetual ? 'bg-[var(--color-admin-accent)] text-white shadow-lg' : 'text-[var(--color-admin-text-muted)] hover:text-[var(--color-admin-text)]'}`}
                        >
                          Perpétuo
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPerpetual(false)}
                          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-[10px] lg:text-[11px] font-bold uppercase tracking-wider transition-all ${!isPerpetual ? 'bg-amber-500 text-white shadow-lg' : 'text-[var(--color-admin-text-muted)] hover:text-[var(--color-admin-text)]'}`}
                        >
                          Sazonal
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {!isPerpetual && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--color-admin-border)]"
                        >
                          <InternalDatePicker 
                            label="Data de Início"
                            value={startDate}
                            onChange={setStartDate}
                          />
                          <InternalDatePicker 
                            label="Data de Término"
                            value={endDate}
                            onChange={setEndDate}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Footer - SEM STICKY para scroll inteiriço */}
                <div className="p-8 lg:p-10 border-t border-[var(--color-admin-border)]/50 bg-[var(--color-admin-bg)]/30 shrink-0">
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
              className="w-full max-w-5xl bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[3rem] shadow-[0_50px_200px_rgba(0,0,0,0.1)] relative z-10 overflow-y-auto custom-scrollbar max-h-[90vh] flex flex-col"
            >
              <div className="p-8 lg:p-12 border-b border-[var(--color-admin-border)] shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-[24px] lg:text-[28px] font-black text-[var(--color-admin-text)] uppercase tracking-tighter leading-none">
                    Horários do Ensaio
                  </h3>
                  <p className="text-[11px] text-[var(--color-admin-accent)] font-bold uppercase tracking-wider mt-2">
                    Serviço: {viewingMatrix.name}
                  </p>
                  <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium mt-1">
                    Ative ou desative horários neste serviço. As alterações aqui sobrepõem os horários globais do estúdio.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleResetMatrix(viewingMatrix)}
                    className="px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 active:scale-95"
                    title="Restaurar para seguir a grade padrão do estúdio"
                  >
                    <RotateCcw size={14} />
                    Restaurar Padrão Geral
                  </button>
                  <button 
                    onClick={() => setViewingMatrix(null)}
                    className="w-12 h-12 bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-2xl flex items-center justify-center text-[var(--color-admin-text-muted)] active:scale-90"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-8 lg:p-12">
                {isMatrixLoading ? (
                  <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <Loader2 className="animate-spin text-[var(--color-admin-accent)]" size={48} />
                    <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Carregando horários...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((dayName, dayIndex) => {
                      const daySlots = matrixSlots.filter(s => s.day_of_week === dayIndex);
                      const isAdding = addingSlotDay === dayIndex;
                      
                      return (
                        <div key={dayIndex} className="bg-[var(--color-admin-bg)]/50 border border-[var(--color-admin-border)] rounded-[2rem] p-6 space-y-5">
                          <div className="flex justify-between items-center border-b border-[var(--color-admin-border)] pb-3">
                            <span className="text-[12px] font-black text-[var(--color-admin-text)] uppercase tracking-widest">{dayName}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider">{daySlots.length} HORÁRIOS</span>
                              <button
                                onClick={() => setAddingSlotDay(isAdding ? null : dayIndex)}
                                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                                  isAdding 
                                    ? 'bg-rose-500 text-white border-rose-500' 
                                    : 'bg-[var(--color-admin-surface)] text-[var(--color-admin-text)] border-[var(--color-admin-border)] hover:border-[var(--color-admin-accent)]'
                                }`}
                                title={isAdding ? "Cancelar" : "Adicionar Horário neste dia"}
                              >
                                {isAdding ? <X size={13} /> : <Plus size={13} />}
                              </button>
                            </div>
                          </div>

                          {isAdding && (
                            <div className="p-4 bg-[var(--color-admin-surface)] border border-[var(--color-admin-accent)]/30 rounded-xl space-y-3 animate-in fade-in zoom-in-95">
                              <span className="text-[10px] font-bold text-[var(--color-admin-accent)] uppercase tracking-wider block">Adicionar Horário:</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={newCustomSlotTime}
                                  onChange={(e) => setNewCustomSlotTime(e.target.value)}
                                  className="flex-1 bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-lg px-3 py-2 text-[12px] font-black text-[var(--color-admin-text)] outline-none"
                                />
                                <button
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => handleAddCustomSlot(dayIndex)}
                                  className="px-4 py-2 bg-[var(--color-admin-accent)] text-white text-[11px] font-bold rounded-lg uppercase tracking-wider hover:brightness-110 active:scale-95 disabled:opacity-50"
                                >
                                  Salvar
                                </button>
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-2.5">
                            {daySlots.length === 0 ? (
                              <p className="text-[11px] text-[var(--color-admin-text-muted)] py-4 text-center font-medium italic">
                                Nenhum horário ativo neste dia
                              </p>
                            ) : (
                              daySlots.map((slot) => (
                                <button
                                  key={`${slot.day_of_week}-${slot.start_time}`}
                                  onClick={() => handleToggleSlot(slot)}
                                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all active:scale-95 ${
                                    slot.is_active 
                                      ? "bg-[var(--color-admin-accent)] text-white border-[var(--color-admin-accent)] shadow-sm" 
                                      : "bg-[var(--color-admin-surface)] text-slate-400 border-[var(--color-admin-border)] hover:border-slate-300"
                                  }`}
                                >
                                  <span className="text-[13px] font-bold tracking-tight">{slot.start_time.substring(0, 5)}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-wider opacity-80">
                                      {slot.is_active ? 'Disponível' : 'Desativado'}
                                    </span>
                                    {slot.is_active ? (
                                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    ) : (
                                      <div className="w-2 h-2 bg-slate-400/50 rounded-full" />
                                    )}
                                  </div>
                                </button>
                              ))
                            )}
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

      {/* Modal de Confirmação Único */}
      {confirmConfig && (
        <ConfirmModal 
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          cancelLabel={confirmConfig.cancelLabel}
          onConfirm={() => {
            confirmConfig.onConfirm();
            closeConfirm();
          }}
          onCancel={closeConfirm}
          variant={confirmConfig.variant}
        />
      )}

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