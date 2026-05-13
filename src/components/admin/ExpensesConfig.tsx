"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Receipt, CalendarDays, Loader2, Save, X, 
  TrendingDown, ChevronLeft, ChevronRight,
  ThumbsUp, ThumbsDown
} from "lucide-react";
import { 
  getExpenses, createExpense, updateExpenseStatus, deleteExpense, updateExpense 
} from "@/lib/actions/admin-actions";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Componentes Oficiais do Sistema
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { InternalDatePicker } from "@/components/ui/InternalDatePicker";

export default function ExpensesConfig() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Custom Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'info' | 'warning';
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
    variant: 'danger'
  });
  
  // Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Form State
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState("fixed");
  const [status, setStatus] = useState("pending");
  const [installments, setInstallments] = useState("1");
  const [editingExpense, setEditingExpense] = useState<any>(null); // Mantendo para compatibilidade se necessário

  // Função Auxiliar para Máscara de Moeda (Zero Slop)
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

  useEffect(() => {
    loadExpenses();
  }, [currentDate]);

  async function loadExpenses() {
    setIsLoading(true);
    try {
      const data = await getExpenses(currentDate.getMonth(), currentDate.getFullYear());
      setExpenses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function performSave(updateFuture: boolean) {
    if (!editingId) return;
    setIsSaving(true);
    try {
      await updateExpense(editingId, {
        description,
        amount: parseFloat(amount),
        due_date: dueDate,
        type,
        status
      }, updateFuture);
      setIsModalOpen(false);
      resetForm();
      await loadExpenses();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSave() {
    if (!description || !amount || !dueDate) return;
    
    if (editingId) {
      const currentExpense = expenses.find(e => e.id === editingId);
      if (currentExpense?.group_id) {
        const typeLabel = currentExpense.type === 'installment' ? 'parcelas' : 'contas fixas';
        setConfirmConfig({
          isOpen: true,
          title: "Atualizar Futuras?",
          message: `Deseja aplicar estas alterações também em todas as ${typeLabel} futuras deste grupo?`,
          confirmLabel: "Atualizar Tudo",
          cancelLabel: "Apenas esta",
          onConfirm: () => performSave(true),
          onCancel: () => performSave(false),
          variant: 'info'
        });
        return;
      }
      await performSave(false);
    } else {
      setIsSaving(true);
      try {
        await createExpense({
          description,
          amount: parseFloat(amount),
          due_date: dueDate,
          type,
          status,
          installments: parseInt(installments)
        });
        setIsModalOpen(false);
        resetForm();
        await loadExpenses();
      } catch (error) {
        console.error(error);
      } finally {
        setIsSaving(false);
      }
    }
  }

  function handleEdit(expense: any) {
    setEditingId(expense.id);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setDueDate(expense.due_date);
    setType(expense.type);
    setStatus(expense.status);
    setInstallments(expense.total_installments?.toString() || "1");
    setIsModalOpen(true);
  }

  async function handleToggleStatus(e: React.MouseEvent, id: string, currentStatus: string) {
    e.stopPropagation(); 
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    try {
      await updateExpenseStatus(id, newStatus);
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    } catch (error) {
      console.error(error);
    }
  }

  async function performDelete(deleteAll: boolean) {
    if (!editingId) return;
    setIsSaving(true);
    try {
      await deleteExpense(editingId, deleteAll);
      setIsModalOpen(false);
      resetForm();
      await loadExpenses();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingId) return;
    const expense = expenses.find(e => e.id === editingId);
    
    if (expense?.group_id) {
      const typeLabel = expense.type === 'installment' ? 'parcelas' : 'recorrências fixas';
      setConfirmConfig({
        isOpen: true,
        title: "Excluir Grupo?",
        message: `Esta é uma despesa com grupo. Deseja excluir TODAS as ${typeLabel} ou apenas esta?`,
        confirmLabel: "Excluir Tudo",
        cancelLabel: "Apenas esta",
        onConfirm: () => performDelete(true),
        onCancel: () => performDelete(false),
        variant: 'danger'
      });
    } else {
      setConfirmConfig({
        isOpen: true,
        title: "Confirmar Exclusão",
        message: "Deseja realmente excluir esta despesa? Esta ação não pode ser desfeita.",
        onConfirm: () => performDelete(false),
        onCancel: () => setConfirmConfig(prev => ({ ...prev, isOpen: false })),
        variant: 'danger'
      });
    }
  }

  function resetForm() {
    setDescription("");
    setAmount("");
    setDueDate(new Date().toISOString().split('T')[0]);
    setType("fixed");
    setStatus("pending");
    setInstallments("1");
    setEditingId(null);
  }

  const totalMonthly = expenses.reduce((acc: number, e: any) => acc + Number(e.amount), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Compacto */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-6 rounded-[2rem] shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <Receipt size={20} />
              </div>
              <h2 className="text-[20px] font-black text-slate-900 tracking-tight">Saídas</h2>
            </div>
            
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-rose-600 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-rose-600/20 active:scale-95"
            >
              <Plus size={20} strokeWidth={2.5} /> 
            </button>
          </div>

          <div className="flex items-center justify-between bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-2 hover:bg-white rounded-lg transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700 flex-1 text-center">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-2 hover:bg-white rounded-lg transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Barra Fina */}
      <div className="bg-white px-6 py-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingDown size={16} className="text-slate-400" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Mensal</p>
        </div>
        <p className="text-lg font-black text-slate-900">R$ {totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>

      {/* Lista Minimalista */}
      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-rose-600" size={24} />
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-20 text-center px-6">
             <p className="text-slate-300 font-bold text-[11px] uppercase tracking-widest">Sem despesas</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {expenses.map((expense) => (
              <div 
                key={expense.id} 
                onClick={() => handleEdit(expense)}
                className="p-4 lg:px-6 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Data Simples */}
                  <div className="w-10 text-center shrink-0">
                     <p className="text-[14px] font-black text-slate-900 leading-none">
                       {format(new Date(expense.due_date + 'T12:00:00'), 'dd')}
                     </p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                       {format(new Date(expense.due_date + 'T12:00:00'), 'MMM', { locale: ptBR })}
                     </p>
                  </div>

                  {/* Descrição e Tipo */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-bold text-slate-700 truncate">{expense.description}</h4>
                      {expense.type === 'installment' && (
                        <span className="text-[8px] font-black text-indigo-400 uppercase">{expense.installment_number}/{expense.total_installments}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Valor */}
                <p className="text-[14px] font-black text-slate-900 whitespace-nowrap">
                   R$ {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>

                {/* Status Ícone (Joia) */}
                <button 
                  onClick={(e) => handleToggleStatus(e, expense.id, expense.status)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border shrink-0 ${
                    expense.status === 'paid' 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]' 
                      : 'bg-slate-50 border-slate-100 text-slate-300'
                  }`}
                >
                  <ThumbsUp 
                    size={18} 
                    strokeWidth={2.5}
                    className={`transition-transform duration-500 ${expense.status === 'paid' ? '' : 'rotate-180'}`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-10">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-visible max-h-[90vh] flex flex-col"
            >
              <div className="p-8 space-y-6 overflow-y-auto">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {editingId ? "Editar Saída" : "Nova Saída"}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Descrição</label>
                    <input 
                      value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Ex: Aluguel, MEI, Luz..."
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-600/20 focus:bg-white rounded-2xl p-4 text-[14px] font-bold outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                        {type === 'installment' ? 'Valor Total' : 'Valor'}
                      </label>
                      <input 
                        type="text"
                        value={formatCurrencyBRL(Number(amount) || 0)}
                        onChange={e => {
                          const numericValue = parseCurrencyBRL(e.target.value);
                          setAmount(numericValue.toString());
                        }}
                        placeholder="R$ 0,00"
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-600/20 focus:bg-white rounded-2xl p-4 text-[14px] font-black outline-none transition-all"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <InternalDatePicker 
                        label="Vencimento"
                        value={dueDate}
                        onChange={setDueDate}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Tipo de Saída</label>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                      {[
                        { id: 'fixed', label: 'Fixa' },
                        { id: 'variable', label: 'Var' },
                        { id: 'installment', label: 'Parc' }
                      ].map((t) => (
                        <button 
                          key={t.id} onClick={() => setType(t.id)}
                          className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                            type === t.id ? 'bg-white shadow-sm text-rose-600 border border-rose-100' : 'text-slate-400 border border-transparent'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {type === 'installment' && (
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Parcelas</label>
                        <input 
                          type="number" 
                          min="1"
                          value={installments} 
                          onChange={e => setInstallments(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-600/20 rounded-2xl p-4 text-[14px] font-black outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-1">Valor da Parcela</label>
                        <div className="w-full bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4 text-[14px] font-black text-emerald-600 flex items-center">
                          {formatCurrencyBRL(parseFloat(amount || "0") / parseInt(installments || "1"))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Status Inicial</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                      <button 
                        onClick={() => setStatus('pending')}
                        className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                          status === 'pending' ? 'bg-white shadow-sm text-amber-600 border border-amber-100' : 'text-slate-400 border border-transparent'
                        }`}
                      >
                        <ThumbsUp size={12} className="rotate-180" /> Pendente
                      </button>
                      <button 
                        onClick={() => setStatus('paid')}
                        className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                          status === 'paid' ? 'bg-white shadow-sm text-emerald-600 border border-emerald-100' : 'text-slate-400 border border-transparent'
                        }`}
                      >
                        <ThumbsUp size={12} /> Pago
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex items-center gap-3 rounded-b-[3rem]">
                {editingId && (
                  <button 
                    onClick={handleDelete} disabled={isSaving}
                    className="w-14 h-14 bg-white text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 transition-all active:scale-95 hover:bg-rose-50"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button 
                  onClick={handleSave} disabled={isSaving}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação Oficial do Sistema */}
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        cancelLabel={confirmConfig.cancelLabel}
        onConfirm={() => {
          confirmConfig.onConfirm();
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => {
          confirmConfig.onCancel();
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }}
        variant={confirmConfig.variant as any}
      />
    </div>
  );
}
