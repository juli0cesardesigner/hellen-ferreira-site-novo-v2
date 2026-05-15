"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Clock, CalendarDays, Loader2, Save, X, Edit2, 
  Palette, Settings, Database, 
  Briefcase, CalendarClock, Globe
} from "lucide-react";
import { 
  listSessions, createSession, updateSession, deleteSession,
  listSchemaSlots, addSchemaSlot, syncSessionColors
} from "@/lib/actions/admin-actions";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionColor } from "@/lib/utils/colors";
import { PackageManager } from "@/components/admin/PackageManager";
import { Session, SlotDefinition } from "@/types/database";

// Componentes Oficiais
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { InternalDatePicker } from "@/components/ui/InternalDatePicker";

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
  const [fullPrice, setFullPrice] = useState(0);
  const [depositPrice, setDepositPrice] = useState(0);
  const [setupMinutes, setSetupMinutes] = useState(15);
  const [cleanupMinutes, setCleanupMinutes] = useState(15);
  const [packageManagerSession, setPackageManagerSession] = useState<{ id: string; name: string } | null>(null);

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
    const data = await listSessions();
    setSessions(data.sessions || []);
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
      full_price: fullPrice,
      deposit_price: depositPrice,
      setup_minutes: setupMinutes,
      cleanup_minutes: cleanupMinutes,
      is_active: true,
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

  const handleSyncColorsRequest = () => {
    showConfirm({
      title: "Sincronizar Cores?",
      message: "Deseja aplicar a nova paleta de cores vibrantes em todos os serviços cadastrados?",
      confirmLabel: "Sincronizar Agora",
      cancelLabel: "Voltar",
      onConfirm: async () => {
        setIsSaving(true);
        await syncSessionColors();
        await loadSessions();
        setIsSaving(false);
        showConfirm({
          title: "Sucesso",
          message: "Cores sincronizadas com sucesso em toda a rede de serviços.",
          confirmLabel: "Excelente",
          cancelLabel: "",
          onConfirm: closeConfirm,
          variant: "info"
        });
      },
      variant: "info"
    });
  };

  const handleToggleSlot = async (slot: SlotDefinition) => {
    if (!viewingMatrix) return;
    setIsSaving(true);
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

          <div className="flex items-center gap-4">
            <button 
              onClick={handleSyncColorsRequest}
              className="bg-white border-2 border-[var(--color-admin-border)] text-slate-600 px-6 py-5 rounded-2xl text-[12px] font-bold tracking-tight flex items-center gap-3 transition-all hover:border-[var(--color-admin-accent)] hover:text-[var(--color-admin-accent)] active:scale-95 shadow-sm"
            >
              <Palette size={20} />
              Sincronizar Cores
            </button>

            <button 
              onClick={() => { 
                setEditingSession(null); 
                setSelectedColor("#7986CB");
                setIsPerpetual(true);
                setStartDate("");
                setEndDate("");
                setFullPrice(0);
                setDepositPrice(0);
                setSetupMinutes(15);
                setCleanupMinutes(15);
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
            
            return (
              <motion.div 
                key={session.id} 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`group p-6 lg:p-7 border border-[var(--color-admin-border)] rounded-[2rem] transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden ${!colors.isCustom ? colors.bg : ''}`}
                style={{ backgroundColor: customBg }}
              >
                <div className="flex justify-between items-center mb-5 relative z-10">
                  <h3 className="text-[17px] font-black text-[var(--color-admin-text)] uppercase tracking-tight leading-none">
                    {session.name}
                  </h3>
                  <div className="flex gap-2">
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
                        setStartDate(session.start_date || "");
                        setEndDate(session.end_date || "");
                        setFullPrice(session.full_price || 0);
                        setDepositPrice(session.deposit_price || 0);
                        setSetupMinutes(session.setup_minutes ?? 15);
                        setCleanupMinutes(session.cleanup_minutes ?? 15);
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                         <label className="text-[11px] font-bold text-[var(--color-admin-text-muted)] tracking-wide ml-2">Preço Total (Exibição)</label>
                         <div className="relative group">
                            <input 
                              type="text" 
                              value={formatCurrencyBRL(fullPrice)} 
                              onChange={(e) => setFullPrice(parseCurrencyBRL(e.target.value))}
                              className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-2xl px-6 py-4 text-[14px] font-black text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all shadow-inner" 
                            />
                         </div>
                       </div>
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
              <div className="p-10 lg:p-14 border-b border-[var(--color-admin-border)] shrink-0">
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

              <div className="p-10 lg:p-14">
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