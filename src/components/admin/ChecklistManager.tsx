"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, CheckCircle2, Circle, Clock, AlertTriangle, 
  Trash2, Edit3, Search, Filter, Sparkles, 
  Layers, CheckSquare, ArrowUpRight, Loader2, X, Save,
  Lightbulb, RefreshCw, PlusCircle, MinusCircle, Bug, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChecklistItem } from "@/types/database";
import { 
  getChecklistItems, 
  createChecklistItem, 
  updateChecklistItem, 
  deleteChecklistItem 
} from "@/lib/actions/admin-actions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type CategoryType = 'improvement' | 'change' | 'add' | 'remove' | 'fix';
type PriorityType = 'low' | 'medium' | 'high' | 'urgent';
type StatusType = 'pending' | 'in_progress' | 'completed';

const CATEGORY_CONFIG: Record<CategoryType, { label: string; icon: any; color: string; bg: string; border: string }> = {
  improvement: { 
    label: "Melhorar", 
    icon: Lightbulb, 
    color: "text-amber-400", 
    bg: "bg-amber-500/10", 
    border: "border-amber-500/20" 
  },
  change: { 
    label: "Alterar", 
    icon: RefreshCw, 
    color: "text-blue-400", 
    bg: "bg-blue-500/10", 
    border: "border-blue-500/20" 
  },
  add: { 
    label: "Adicionar", 
    icon: PlusCircle, 
    color: "text-emerald-400", 
    bg: "bg-emerald-500/10", 
    border: "border-emerald-500/20" 
  },
  remove: { 
    label: "Retirar", 
    icon: MinusCircle, 
    color: "text-rose-400", 
    bg: "bg-rose-500/10", 
    border: "border-rose-500/20" 
  },
  fix: { 
    label: "Correção", 
    icon: Bug, 
    color: "text-purple-400", 
    bg: "bg-purple-500/10", 
    border: "border-purple-500/20" 
  },
};

const PRIORITY_CONFIG: Record<PriorityType, { label: string; color: string; badgeBg: string }> = {
  low: { label: "Baixa", color: "text-slate-400", badgeBg: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  medium: { label: "Média", color: "text-blue-400", badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  high: { label: "Alta", color: "text-amber-400", badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  urgent: { label: "Urgente", color: "text-rose-400", badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse" },
};

const TARGET_AREAS = [
  "Geral",
  "Site Público",
  "Galeria & Fotos",
  "Agendamento Online",
  "Painel Admin",
  "Financeiro",
  "Versão Mobile",
  "SEO & Desempenho",
  "Textos & Conteúdo",
];

export function ChecklistManager() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: CategoryType;
    priority: PriorityType;
    target_area: string;
    status: StatusType;
  }>({
    title: "",
    description: "",
    category: "improvement",
    priority: "medium",
    target_area: "Geral",
    status: "pending",
  });

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const res = await getChecklistItems();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.error("Erro ao carregar checklist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenModal = (item?: ChecklistItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || "",
        category: item.category,
        priority: item.priority,
        target_area: item.target_area || "Geral",
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        description: "",
        category: "improvement",
        priority: "medium",
        target_area: "Geral",
        status: "pending",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setIsSaving(true);
      if (editingItem) {
        const res = await updateChecklistItem(editingItem.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          target_area: formData.target_area,
          status: formData.status,
        });
        if (res.success && res.data) {
          setItems(prev => prev.map(it => it.id === editingItem.id ? res.data! : it));
          setIsModalOpen(false);
        }
      } else {
        const res = await createChecklistItem({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          target_area: formData.target_area,
        });
        if (res.success && res.data) {
          setItems(prev => [res.data!, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Erro ao salvar item:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (item: ChecklistItem) => {
    const newStatus: StatusType = item.status === 'completed' ? 'pending' : 'completed';
    
    // Atualização otimista
    setItems(prev => prev.map(it => it.id === item.id ? { 
      ...it, 
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null
    } : it));

    try {
      await updateChecklistItem(item.id, { status: newStatus });
    } catch (err) {
      console.error("Erro ao alternar status:", err);
      fetchItems(); // reverte em caso de erro
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteChecklistItem(deleteConfirmId);
      setItems(prev => prev.filter(it => it.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Erro ao excluir item:", err);
    }
  };

  // Estatísticas
  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter(i => i.status === 'pending').length;
    const inProgress = items.filter(i => i.status === 'in_progress').length;
    const completed = items.filter(i => i.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, pending, inProgress, completed, percentage };
  }, [items]);

  // Filtros
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.target_area && item.target_area.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [items, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Top Header & Summary ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <CheckSquare size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Checklist & Melhorias
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Espaço para anotar e acompanhar tudo o que precisa melhorar, alterar, adicionar ou retirar.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:bg-slate-200 transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Anotar Melhoria</span>
        </button>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-4 md:p-5 relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total de Notas</div>
          <div className="text-3xl font-black text-white">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-2">Ideias e solicitações registradas</div>
        </div>

        <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-4 md:p-5 relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Pendentes</div>
          <div className="text-3xl font-black text-amber-400">{stats.pending}</div>
          <div className="text-[11px] text-slate-500 mt-2">Aguardando execução</div>
        </div>

        <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-4 md:p-5 relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">Em Progresso</div>
          <div className="text-3xl font-black text-blue-400">{stats.inProgress}</div>
          <div className="text-[11px] text-slate-500 mt-2">Sendo ajustado no momento</div>
        </div>

        <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-4 md:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">Concluídas</div>
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {stats.percentage}%
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats.completed}</div>
          
          {/* Mini progress bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, detalhe ou área..."
              className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-white/30 cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">⏳ Pendentes</option>
            <option value="in_progress">🔨 Em Progresso</option>
            <option value="completed">✅ Concluídos</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-white/30 cursor-pointer"
          >
            <option value="all">Todas as Ações</option>
            <option value="improvement">💡 Melhorar</option>
            <option value="change">🔄 Alterar</option>
            <option value="add">➕ Adicionar</option>
            <option value="remove">➖ Retirar</option>
            <option value="fix">🐛 Correção</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-white/30 cursor-pointer"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="urgent">🔴 Urgente</option>
            <option value="high">🟠 Alta</option>
            <option value="medium">🟡 Média</option>
            <option value="low">🟢 Baixa</option>
          </select>
        </div>
      </div>

      {/* ─── Items List ─── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0B0F19] border border-white/5 rounded-3xl">
          <Loader2 className="animate-spin text-amber-400 mb-3" size={32} />
          <p className="text-sm text-slate-400 font-medium">Carregando checklist...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0B0F19] border border-white/5 rounded-3xl text-center px-4">
          <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-slate-400 mb-4">
            <CheckSquare size={36} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {items.length === 0 ? "Nenhuma anotação no checklist" : "Nenhum item encontrado com os filtros atuais"}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            {items.length === 0 
              ? "Clique no botão abaixo para adicionar a primeira melhoria, alteração ou ajuste que você notou no site." 
              : "Tente limpar os filtros de busca ou selecione outra categoria."}
          </p>
          {items.length === 0 ? (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-200 transition-all"
            >
              <Plus size={18} />
              <span>Adicionar Primeira Melhoria</span>
            </button>
          ) : (
            <button
              onClick={() => { setSearchQuery(""); setStatusFilter("all"); setCategoryFilter("all"); setPriorityFilter("all"); }}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const category = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.improvement;
              const priority = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.medium;
              const isCompleted = item.status === 'completed';
              const isInProgress = item.status === 'in_progress';
              const IconCategory = category.icon;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className={`group relative flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 ${
                    isCompleted 
                      ? "bg-[#0B0F19]/40 border-white/5 opacity-70 hover:opacity-100" 
                      : isInProgress
                      ? "bg-[#0B0F19] border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.05)]"
                      : "bg-[#0B0F19] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Checkbox Trigger */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isCompleted 
                          ? "bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.3)]" 
                          : "border-2 border-slate-600 hover:border-emerald-400 text-transparent"
                      }`}
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {/* Category Badge */}
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${category.bg} ${category.color} ${category.border}`}>
                          <IconCategory size={12} />
                          {category.label}
                        </span>

                        {/* Priority Badge */}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${priority.badgeBg}`}>
                          {priority.label}
                        </span>

                        {/* Target Area Tag */}
                        {item.target_area && (
                          <span className="text-[11px] font-medium text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                            {item.target_area}
                          </span>
                        )}

                        {/* Status tag */}
                        {isInProgress && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock size={10} /> Em Progresso
                          </span>
                        )}
                      </div>

                      <h4 className={`text-base font-bold transition-all ${
                        isCompleted 
                          ? "text-slate-400 line-through decoration-slate-600" 
                          : "text-white"
                      }`}>
                        {item.title}
                      </h4>

                      {item.description && (
                        <p className={`text-xs mt-1 leading-relaxed whitespace-pre-line ${
                          isCompleted ? "text-slate-500" : "text-slate-300"
                        }`}>
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-medium">
                        <span>Criado em: {new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                        {item.completed_at && (
                          <span className="text-emerald-500/80">
                            • Concluído em: {new Date(item.completed_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-2 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5 justify-end">
                    <button
                      onClick={() => handleOpenModal(item)}
                      title="Editar item"
                      className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      title="Excluir item"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ─── Modal Create / Edit ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B0F19] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <CheckSquare size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {editingItem ? "Editar Item do Checklist" : "Nova Anotação de Melhoria"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Preencha os detalhes do que precisa ser feito.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Título do que precisa mudar / melhorar *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Trocar foto do banner principal, ajustar texto do pacote newborn..."
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Detalhes / Instruções (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o que exatamente precisa ser feito, ideias, links ou observações..."
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30 resize-none"
                  />
                </div>

                {/* Grid Category & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category / Tipo de Ação */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Tipo de Ação
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer"
                    >
                      <option value="improvement">💡 Melhorar</option>
                      <option value="change">🔄 Alterar</option>
                      <option value="add">➕ Adicionar</option>
                      <option value="remove">➖ Retirar</option>
                      <option value="fix">🐛 Correção / Bug</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Prioridade
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityType })}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer"
                    >
                      <option value="urgent">🔴 Urgente</option>
                      <option value="high">🟠 Alta</option>
                      <option value="medium">🟡 Média</option>
                      <option value="low">🟢 Baixa</option>
                    </select>
                  </div>
                </div>

                {/* Grid Target Area & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Target Area */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Área do Site
                    </label>
                    <select
                      value={formData.target_area}
                      onChange={(e) => setFormData({ ...formData, target_area: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer"
                    >
                      {TARGET_AREAS.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status (Visible when editing) */}
                  {editingItem ? (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Status Atual
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusType })}
                        className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer"
                      >
                        <option value="pending">⏳ Pendente</option>
                        <option value="in_progress">🔨 Em Progresso</option>
                        <option value="completed">✅ Concluído</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Status Inicial
                      </label>
                      <div className="px-3.5 py-2.5 bg-black/20 border border-white/5 rounded-xl text-sm text-slate-400">
                        ⏳ Pendente
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>{editingItem ? "Salvar Alterações" : "Salvar no Checklist"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="Excluir Item do Checklist"
        message="Tem certeza que deseja excluir esta anotação? Esta ação não pode ser desfeita."
        confirmLabel="Sim, Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
