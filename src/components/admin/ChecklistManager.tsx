"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, Check, Trash2, Edit3, Loader2, X, Save, CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChecklistItem } from "@/types/database";
import { 
  getChecklistItems, 
  createChecklistItem, 
  updateChecklistItem, 
  deleteChecklistItem 
} from "@/lib/actions/admin-actions";

export function ChecklistManager() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  // Adicionar novo item
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isAdding) return;

    const titleToAdd = newTitle.trim();
    setNewTitle("");
    setIsAdding(true);

    try {
      const res = await createChecklistItem({ title: titleToAdd });
      if (res.success && res.data) {
        setItems(prev => [res.data!, ...prev]);
      }
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
    } finally {
      setIsAdding(false);
    }
  };

  // Alternar checkbox (Pendente / Concluído)
  const handleToggle = async (item: ChecklistItem) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';

    // Atualização otimista imediata na interface
    setItems(prev => prev.map(it => it.id === item.id ? { 
      ...it, 
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null
    } : it));

    try {
      await updateChecklistItem(item.id, { status: newStatus });
    } catch (err) {
      console.error("Erro ao alternar status:", err);
      fetchItems(); // Restaura em caso de falha
    }
  };

  // Iniciar edição inline
  const startEditing = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditingText(item.title);
  };

  // Salvar edição inline
  const saveEditing = async (id: string) => {
    if (!editingText.trim() || isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      const res = await updateChecklistItem(id, { title: editingText.trim() });
      if (res.success && res.data) {
        setItems(prev => prev.map(it => it.id === id ? res.data! : it));
        setEditingId(null);
      }
    } catch (err) {
      console.error("Erro ao editar item:", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Cancelar edição
  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  // Excluir item
  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
    try {
      await deleteChecklistItem(id);
    } catch (err) {
      console.error("Erro ao excluir:", err);
      fetchItems();
    }
  };

  // Contadores
  const counts = useMemo(() => {
    const total = items.length;
    const pending = items.filter(i => i.status === 'pending').length;
    const completed = items.filter(i => i.status === 'completed').length;
    return { total, pending, completed };
  }, [items]);

  // Lista filtrada
  const filteredItems = useMemo(() => {
    if (filter === 'pending') return items.filter(i => i.status === 'pending');
    if (filter === 'completed') return items.filter(i => i.status === 'completed');
    return items;
  }, [items, filter]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      {/* ─── Header Simples ─── */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <CheckSquare size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Checklist de Melhorias
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Anote o que precisa melhorar, alterar, adicionar ou retirar.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Input Rápido para Adicionar ─── */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="O que precisa ser feito ou melhorado?"
          className="flex-1 px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-2xl text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 shadow-inner transition-all"
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || isAdding}
          className="px-5 py-3 rounded-2xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0 active:scale-95 shadow-md"
        >
          {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
          <span className="hidden sm:inline">Adicionar</span>
        </button>
      </form>

      {/* ─── Filtros Rápidos ─── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            filter === 'all' 
              ? 'bg-white/10 text-white' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todas ({counts.total})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            filter === 'pending' 
              ? 'bg-amber-500/20 text-amber-300' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pendentes ({counts.pending})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            filter === 'completed' 
              ? 'bg-emerald-500/20 text-emerald-300' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Concluídas ({counts.completed})
        </button>
      </div>

      {/* ─── Lista de Itens ─── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="animate-spin text-amber-400 mb-2" size={28} />
          <span className="text-xs">Carregando itens...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl p-6">
          <p className="text-sm">
            {items.length === 0 
              ? "Nenhum item anotado ainda. Digite acima para começar!" 
              : "Nenhum item nesta aba."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const isCompleted = item.status === 'completed';
              const isEditing = editingId === item.id;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className={`group flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isCompleted 
                      ? "bg-[#0B0F19]/40 border-white/5 opacity-60 hover:opacity-100" 
                      : "bg-[#0B0F19] border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggle(item)}
                    className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      isCompleted 
                        ? "bg-emerald-500 text-slate-950 font-black shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                        : "border-2 border-slate-600 hover:border-amber-400 text-transparent"
                    }`}
                  >
                    <Check size={16} strokeWidth={3} />
                  </button>

                  {/* Text / Edit Form */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditing(item.id);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                          className="w-full px-3 py-1.5 bg-black/60 border border-amber-400/50 rounded-xl text-sm text-white focus:outline-none"
                        />
                        <button
                          onClick={() => saveEditing(item.id)}
                          disabled={isSavingEdit}
                          className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <p 
                        onClick={() => handleToggle(item)}
                        className={`text-sm sm:text-base leading-snug cursor-pointer select-none transition-all ${
                          isCompleted 
                            ? "text-slate-500 line-through" 
                            : "text-slate-100"
                        }`}
                      >
                        {item.title}
                      </p>
                    )}
                  </div>

                  {/* Actions (Editar / Excluir) */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEditing(item)}
                        title="Editar"
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Excluir"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
