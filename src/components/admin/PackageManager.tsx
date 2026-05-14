"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Save, X, Loader2, Package, DollarSign, 
  Image, Printer, List, CheckCircle 
} from "lucide-react";
import { 
  listSessionPackages, 
  createSessionPackage, 
  updateSessionPackage, 
  deleteSessionPackage 
} from "@/lib/actions/admin-actions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

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

interface PackageData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tier_order: number;
  price_digital: number;
  price_print: number;
  upgrade_label: string;
  features: string[] | null;
  is_active: boolean;
}

interface PackageManagerProps {
  sessionId: string;
  sessionName: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function PackageManager({ sessionId, sessionName, isOpen, onClose, onUpdated }: PackageManagerProps) {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTierOrder, setFormTierOrder] = useState(1);
  const [formPriceDigital, setFormPriceDigital] = useState(0);
  const [formPricePrint, setFormPricePrint] = useState(0);
  const [formUpgradeLabel, setFormUpgradeLabel] = useState("");
  const [formFeatures, setFormFeatures] = useState<string[]>([""]);
  const [formIsActive, setFormIsActive] = useState(true);

  // Confirm modal
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean,
    title: string,
    message: string,
    confirmLabel?: string,
    cancelLabel?: string,
    onConfirm: () => void,
    variant?: 'danger' | 'info' | 'warning'
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const showConfirm = (config: Omit<NonNullable<typeof confirmConfig>, 'isOpen'>) => {
    setConfirmConfig({ ...config, isOpen: true });
  };

  const closeConfirm = () => {
    setConfirmConfig(null);
  };

  useEffect(() => {
    if (isOpen) {
      loadPackages();
    }
  }, [isOpen, sessionId]);

  async function loadPackages() {
    setIsLoading(true);
    const res = await listSessionPackages(sessionId);
    setPackages(res.packages || []);
    setIsLoading(false);
  }

  function resetForm() {
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormTierOrder(1);
    setFormPriceDigital(0);
    setFormPricePrint(0);
    setFormUpgradeLabel("");
    setFormFeatures([""]);
    setFormIsActive(true);
    setEditingPackage(null);
  }

  function openCreateForm() {
    resetForm();
    const maxTier = packages.reduce((max, p) => Math.max(max, p.tier_order), 0);
    setFormTierOrder(maxTier + 1);
    setIsFormOpen(true);
  }

  function openEditForm(pkg: PackageData) {
    setEditingPackage(pkg);
    setFormName(pkg.name);
    setFormSlug(pkg.slug);
    setFormDescription(pkg.description || "");
    setFormTierOrder(pkg.tier_order);
    setFormPriceDigital(pkg.price_digital);
    setFormPricePrint(pkg.price_print);
    setFormUpgradeLabel(pkg.upgrade_label || "");
    setFormFeatures(pkg.features && pkg.features.length > 0 ? [...pkg.features] : [""]);
    setFormIsActive(pkg.is_active);
    setIsFormOpen(true);
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function handleNameChange(value: string) {
    setFormName(value);
    if (!editingPackage) {
      setFormSlug(generateSlug(value));
    }
  }

  function addFeature() {
    setFormFeatures([...formFeatures, ""]);
  }

  function removeFeature(index: number) {
    const updated = formFeatures.filter((_, i) => i !== index);
    setFormFeatures(updated.length === 0 ? [""] : updated);
  }

  function updateFeature(index: number, value: string) {
    const updated = [...formFeatures];
    updated[index] = value;
    setFormFeatures(updated);
  }

  const handleSavePackage = async () => {
    if (!formName.trim()) {
      showNotification("Nome do pacote é obrigatório.", "error");
      return;
    }

    const data = {
      name: formName.trim(),
      slug: formSlug.trim() || generateSlug(formName),
      description: formDescription.trim() || undefined,
      tier_order: formTierOrder,
      price_digital: formPriceDigital,
      price_print: formPricePrint,
      upgrade_label: formUpgradeLabel,
      features: formFeatures.filter(f => f.trim() !== ""),
      is_active: formIsActive,
    };

    setIsSaving(true);

    let res;
    if (editingPackage) {
      res = await updateSessionPackage(editingPackage.id, data);
    } else {
      res = await createSessionPackage(sessionId, data);
    }

    if (res.success) {
      showNotification(
        editingPackage ? "Pacote atualizado com sucesso!" : "Pacote criado com sucesso!",
        "success"
      );
      await loadPackages();
      onUpdated();
      setIsFormOpen(false);
      resetForm();
    } else {
      showNotification(res.error || "Erro ao salvar pacote.", "error");
    }

    setIsSaving(false);
  };

  const handleDeletePackage = async (id: string, name: string) => {
    showConfirm({
      title: "Excluir Pacote?",
      message: `Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`,
      confirmLabel: "Sim, Excluir",
      cancelLabel: "Cancelar",
      onConfirm: async () => {
        setIsSaving(true);
        const res = await deleteSessionPackage(id);
        if (res.success) {
          showNotification("Pacote excluído com sucesso!", "success");
          await loadPackages();
          onUpdated();
        } else {
          showNotification(res.error || "Erro ao excluir pacote.", "error");
        }
        closeConfirm();
        setIsSaving(false);
      },
      variant: "danger"
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 lg:p-10">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl" 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="w-full max-w-4xl bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[3rem] shadow-[0_50px_200px_rgba(0,0,0,0.1)] relative z-10 overflow-y-auto custom-scrollbar max-h-[90vh] flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[var(--color-admin-accent)] to-amber-500 opacity-30" />
            
            {/* Header */}
            <div className="p-8 lg:p-12 pb-4 flex justify-between items-center border-b border-[var(--color-admin-border)]/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Package size={28} />
                </div>
                <div>
                  <h3 className="text-[24px] lg:text-[28px] font-bold text-[var(--color-admin-text)] tracking-tight leading-none">
                    Pacotes de Preços
                  </h3>
                  <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium mt-2">
                    Gerenciando preços de <span className="text-[var(--color-admin-accent)] font-bold">{sessionName}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-2xl flex items-center justify-center text-[var(--color-admin-text-muted)] active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 lg:p-12">
              {!isFormOpen ? (
                <>
                  {/* Lista de Pacotes */}
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[14px] font-bold text-[var(--color-admin-text)] uppercase tracking-wider">
                      {packages.length} pacote{packages.length !== 1 ? 's' : ''} cadastrado{packages.length !== 1 ? 's' : ''}
                    </h4>
                    <button 
                      onClick={openCreateForm}
                      className="bg-[var(--color-admin-accent)] text-white px-6 py-3.5 rounded-xl text-[11px] font-bold tracking-tight flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                      <Plus size={16} strokeWidth={2.5} /> 
                      Novo Pacote
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                      <div className="relative">
                        <Loader2 className="animate-spin text-[var(--color-admin-accent)]" size={48} strokeWidth={2.5} />
                        <div className="absolute inset-0 blur-3xl bg-[var(--color-admin-accent)] opacity-20 animate-pulse" />
                      </div>
                      <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider animate-pulse">Carregando pacotes...</p>
                    </div>
                  ) : packages.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-[var(--color-admin-border)] rounded-[2.5rem]">
                      <Package className="mx-auto text-slate-300 mb-4" size={48} />
                      <h4 className="text-[16px] font-bold text-slate-500 mb-2">Nenhum pacote cadastrado</h4>
                      <p className="text-[12px] text-slate-400 max-w-xs mx-auto">
                        Clique em "Novo Pacote" para adicionar opções de preços para este serviço.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {packages.map((pkg) => (
                        <motion.div 
                          key={pkg.id}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className={`group p-6 lg:p-8 border rounded-[2rem] transition-all hover:scale-[1.01] shadow-sm ${
                            pkg.is_active 
                              ? 'border-[var(--color-admin-border)] bg-[var(--color-admin-surface)]' 
                              : 'border-red-200/50 bg-red-50/30 opacity-70'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  pkg.is_active 
                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200' 
                                    : 'bg-red-500/10 text-red-600 border border-red-200'
                                }`}>
                                  {pkg.is_active ? 'Ativo' : 'Inativo'}
                                </div>
                                <div className="px-3 py-1 rounded-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                  Tier {pkg.tier_order}
                                </div>
                              </div>

                              <div>
                                <h4 className="text-[18px] font-black text-[var(--color-admin-text)] uppercase tracking-tight">
                                  {pkg.name}
                                </h4>
                                {pkg.description && (
                                  <p className="text-[12px] text-slate-500 font-medium mt-1">{pkg.description}</p>
                                )}
                                <p className="text-[10px] text-slate-400 font-mono mt-1">/{pkg.slug}</p>
                              </div>

                              <div className="flex flex-wrap gap-6 pt-2">
                                <div className="flex items-center gap-2">
                                  <Image size={14} className="text-blue-500" />
                                  <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Digital</span>
                                    <span className="text-[16px] font-black text-[var(--color-admin-text)]">
                                      {formatCurrencyBRL(pkg.price_digital)}
                                    </span>
                                  </div>
                                </div>
                                {pkg.price_print > 0 && (
                                  <div className="flex items-center gap-2">
                                    <Printer size={14} className="text-amber-500" />
                                    <div>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Impresso</span>
                                      <span className="text-[16px] font-black text-[var(--color-admin-text)]">
                                        {formatCurrencyBRL(pkg.price_print)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {pkg.upgrade_label && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/5 border border-amber-200/50 rounded-lg text-[10px] font-bold text-amber-700">
                                  <CheckCircle size={12} />
                                  {pkg.upgrade_label}
                                </div>
                              )}

                              {pkg.features && pkg.features.length > 0 && (
                                <div className="pt-2">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Itens Inclusos:
                                  </p>
                                  <ul className="space-y-1">
                                    {pkg.features.map((feature, idx) => (
                                      <li key={idx} className="text-[12px] text-slate-600 flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">•</span>
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            <div className="flex lg:flex-col gap-2 lg:pt-2">
                              <button 
                                onClick={() => openEditForm(pkg)}
                                className="px-5 py-3 rounded-xl bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-slate-500 hover:text-[var(--color-admin-accent)] hover:border-[var(--color-admin-accent)]/30 transition-all active:scale-95 text-[11px] font-bold flex items-center gap-2"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                                Editar
                              </button>
                              <button 
                                onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                                className="px-5 py-3 rounded-xl bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95 text-[11px] font-bold flex items-center gap-2"
                              >
                                <Trash2 size={14} />
                                Excluir
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Formulário de Criação/Edição */
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <button 
                    onClick={() => { setIsFormOpen(false); resetForm(); }}
                    className="text-[11px] font-bold text-slate-400 flex items-center gap-2 hover:text-[var(--color-admin-accent)] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Voltar para lista
                  </button>

                  <div>
                    <h4 className="text-[20px] font-bold text-[var(--color-admin-text)]">
                      {editingPackage ? "Editar Pacote" : "Novo Pacote"}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      {editingPackage 
                        ? `Editando "${editingPackage.name}"` 
                        : "Configure um novo pacote de preços para este serviço"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Nome */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider ml-1">
                        Nome do Pacote <span className="text-red-500">*</span>
                      </label>
                      <input 
                        value={formName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Ex: Essencial, Celebração, Premium"
                        className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-xl px-5 py-4 text-[14px] font-bold text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider ml-1">
                        Slug (URL)
                      </label>
                      <input 
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        placeholder="essencial"
                        className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-xl px-5 py-4 text-[14px] font-mono text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider ml-1">
                        Descrição Curta
                      </label>
                      <input 
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Ex: Elegância e Autenticidade"
                        className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-xl px-5 py-4 text-[14px] text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Precificação */}
                  <div className="p-8 bg-[var(--color-admin-surface)] border-2 border-[var(--color-admin-border)] rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-500/20">
                        <DollarSign size={18} />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-[var(--color-admin-text)]">Precificação</h4>
                        <p className="text-[10px] text-[var(--color-admin-text-muted)] font-medium">Valores para digital e impresso</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider ml-1">
                          Preço Digital <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-slate-400">R$</span>
                          <input 
                            type="text"
                            value={formatCurrencyBRL(formPriceDigital)}
                            onChange={(e) => setFormPriceDigital(parseCurrencyBRL(e.target.value))}
                            className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-xl pl-12 pr-5 py-4 text-[14px] font-black text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider ml-1">
                          Preço Impresso
                        </label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-slate-400">R$</span>
                          <input 
                            type="text"
                            value={formatCurrencyBRL(formPricePrint)}
                            onChange={(e) => setFormPricePrint(parseCurrencyBRL(e.target.value))}
                            className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-xl pl-12 pr-5 py-4 text-[14px] font-black text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upgrade Label */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider ml-1">
                        Label de Upgrade (ex: "Digital + Impressões 15x20")
                      </label>
                      <input 
                        value={formUpgradeLabel}
                        onChange={(e) => setFormUpgradeLabel(e.target.value)}
                        placeholder="Ex: Digital + Impressões 15x20"
                        className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-xl px-5 py-4 text-[14px] text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Tier Order e Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider ml-1">
                        Ordem (Tier)
                      </label>
                      <input 
                        type="number"
                        value={formTierOrder}
                        onChange={(e) => setFormTierOrder(parseInt(e.target.value) || 1)}
                        min={1}
                        className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-xl px-5 py-4 text-[14px] font-bold text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-wider ml-1">
                        Status
                      </label>
                      <div className="flex gap-3 h-full items-center bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-xl p-2">
                        <button
                          type="button"
                          onClick={() => setFormIsActive(true)}
                          className={`flex-1 py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                            formIsActive 
                              ? 'bg-emerald-500 text-white shadow-md' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Ativo
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormIsActive(false)}
                          className={`flex-1 py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                            !formIsActive 
                              ? 'bg-slate-500 text-white shadow-md' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Inativo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-8 bg-[var(--color-admin-surface)] border-2 border-[var(--color-admin-border)] rounded-[2rem] space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center border border-blue-500/20">
                          <List size={18} />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold text-[var(--color-admin-text)]">Itens Inclusos</h4>
                          <p className="text-[10px] text-[var(--color-admin-text-muted)] font-medium">O que este pacote oferece</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-4 py-2.5 rounded-xl bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-slate-500 hover:text-[var(--color-admin-accent)] transition-all text-[11px] font-bold flex items-center gap-2"
                      >
                        <Plus size={14} /> Adicionar
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-black">{idx + 1}</span>
                          </div>
                          <input 
                            value={feature}
                            onChange={(e) => updateFeature(idx, e.target.value)}
                            placeholder="Descreva o benefício..."
                            className="flex-1 bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-xl px-4 py-3 text-[13px] text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 text-red-400 hover:bg-red-100 transition-all flex items-center justify-center flex-shrink-0"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botões Salvar/Cancelar */}
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => { setIsFormOpen(false); resetForm(); }}
                      className="flex-1 py-5 rounded-xl border-2 border-[var(--color-admin-border)] text-[var(--color-admin-text-muted)] text-[13px] font-bold tracking-tight transition-all hover:bg-[var(--color-admin-bg)] active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSavePackage}
                      disabled={isSaving || !formName.trim()}
                      className="flex-1 bg-[var(--color-admin-accent)] text-white py-5 rounded-xl text-[13px] font-bold tracking-tight flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Save size={20} strokeWidth={2.5} />
                      )}
                      {editingPackage ? "Salvar Alterações" : "Criar Pacote"}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Toast Notification */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed bottom-12 right-12 z-[2000] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
                  notification.type === 'success' 
                    ? 'bg-emerald-500/90 text-white border-emerald-400' 
                    : 'bg-red-500/90 text-white border-red-400'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-[12px] font-bold uppercase tracking-wider">{notification.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirm Modal */}
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
        </div>
      )}
    </AnimatePresence>
  );
}