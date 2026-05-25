"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Plus, Search, Loader2, Save, X, User, Phone, Mail, 
  Instagram, Calendar, Baby, DollarSign, Heart, Edit3, Trash2,
  ChevronRight, MessageSquare, ExternalLink
} from "lucide-react";
import { 
  getClientsList, getClientDetails, updateClientCRM, createClientCRM 
} from "@/lib/actions/crm-actions";
import { motion, AnimatePresence } from "framer-motion";
import { Client, Booking } from "@/types/database";

export function CRMSection({ 
  onEditingChange, 
  onEditBooking,
  refreshTrigger 
}: { 
  onEditingChange?: (editing: boolean) => void;
  onEditBooking?: (booking: Booking) => void;
  refreshTrigger?: number;
}) {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [financeFilter, setFinanceFilter] = useState<'all' | 'debtors' | 'paid'>('all');
  
  // Selection & Details State
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientDetails, setClientDetails] = useState<any | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editedClient, setEditedClient] = useState<Partial<Client>>({});
  const [detailsTab, setDetailsTab] = useState<'personal' | 'finance' | 'history'>('personal');

  // New Client Modal State
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    instagram: "",
    notes: ""
  });
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  // Child form state inside Client Edit
  const [newChildName, setNewChildName] = useState("");
  const [newChildBirthdate, setNewChildBirthdate] = useState("");

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const refreshClientDetails = useCallback(async (id: string) => {
    try {
      const res = await getClientDetails(id);
      setClientDetails(res.client);
      if (!isEditingClient) {
        setEditedClient(res.client || {});
      }
    } catch (e) {
      console.error("Erro ao recarregar detalhes:", e);
    }
  }, [isEditingClient]);

  useEffect(() => {
    loadClients();
    if (selectedClientId) {
      refreshClientDetails(selectedClientId);
    }
  }, [refreshTrigger, selectedClientId, refreshClientDetails]);

  useEffect(() => {
    if (onEditingChange) {
      onEditingChange(isEditingClient || isNewClientOpen || isCreatingClient);
    }
  }, [isEditingClient, isNewClientOpen, isCreatingClient, onEditingChange]);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const res = await getClientsList();
      setClients(res.clients || []);
    } catch (e) {
      console.error(e);
      showNotification("Erro ao carregar clientes", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClient = async (id: string) => {
    setSelectedClientId(id);
    setIsDetailsLoading(true);
    setIsEditingClient(false);
    setDetailsTab('personal'); // Reset tab to Personal on selection
    try {
      const res = await getClientDetails(id);
      setClientDetails(res.client);
      setEditedClient(res.client || {});
    } catch (e) {
      console.error(e);
      showNotification("Erro ao carregar detalhes", "error");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleUpdateClient = async () => {
    if (!clientDetails?.id) return;
    setIsDetailsLoading(true);
    try {
      const res = await updateClientCRM(clientDetails.id, editedClient);
      if (res.success) {
        showNotification("Cliente atualizado com sucesso!");
        setIsEditingClient(false);
        // Refresh details & list
        const refreshed = await getClientDetails(clientDetails.id);
        setClientDetails(refreshed.client);
        setEditedClient(refreshed.client || {});
        loadClients();
      } else {
        showNotification(res.error || "Erro ao atualizar cliente", "error");
      }
    } catch (e) {
      console.error(e);
      showNotification("Erro ao atualizar cliente", "error");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.name) {
      showNotification("Nome é obrigatório", "error");
      return;
    }
    setIsCreatingClient(true);
    try {
      const res = await createClientCRM({
        name: newClientData.name,
        email: newClientData.email || null,
        phone: newClientData.phone || null,
        cpf: newClientData.cpf || null,
        instagram: newClientData.instagram || null,
        notes: newClientData.notes || null,
        children_info: [],
        estimated_delivery_date: null
      });

      if (res.success) {
        showNotification("Cliente criado com sucesso!");
        setIsNewClientOpen(false);
        setNewClientData({ name: "", email: "", phone: "", cpf: "", instagram: "", notes: "" });
        loadClients();
        if (res.client?.id) {
          handleSelectClient(res.client.id);
        }
      } else {
        showNotification(res.error || "Erro ao criar cliente", "error");
      }
    } catch (e) {
      console.error(e);
      showNotification("Erro ao criar cliente", "error");
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleAddChild = () => {
    if (!newChildName) return;
    const currentChildren = editedClient.children_info || [];
    const updatedChildren = [
      ...currentChildren, 
      { name: newChildName, birthdate: newChildBirthdate }
    ];
    setEditedClient({
      ...editedClient,
      children_info: updatedChildren
    });
    setNewChildName("");
    setNewChildBirthdate("");
  };

  const handleRemoveChild = (index: number) => {
    const currentChildren = editedClient.children_info || [];
    const updatedChildren = currentChildren.filter((_, i) => i !== index);
    setEditedClient({
      ...editedClient,
      children_info: updatedChildren
    });
  };

  // Filter clients based on search and financial status
  const filteredClients = useMemo(() => {
    let list = clients;

    // Apply financial status filter
    if (financeFilter === 'debtors') {
      list = list.filter(c => (c.total_balance_due || 0) > 0);
    } else if (financeFilter === 'paid') {
      list = list.filter(c => (c.total_balance_due || 0) === 0);
    }

    // Apply search query filter
    if (!searchQuery) return list;
    const query = searchQuery.toLowerCase().trim();
    return list.filter(c => 
      c.name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.includes(query) ||
      c.cpf?.includes(query)
    );
  }, [clients, searchQuery, financeFilter]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // Quick Action to WhatsApp
  const openWhatsApp = (phone: string, clientName: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(`Olá, ${clientName}! Tudo bem? Gostaria de falar sobre o seu agendamento no Estúdio Hellen Ferreira Fotografia...`);
    window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${text}`, "_blank");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-28 left-1/2 z-[250] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 min-w-[200px] justify-center backdrop-blur-md ${
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

      {/* Header & Search */}
      <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[var(--color-admin-bg)] text-[var(--color-admin-text)] rounded-2xl flex items-center justify-center border border-[var(--color-admin-border)] shadow-inner">
              <User size={26} />
            </div>
            <div>
              <h4 className="text-[20px] font-bold text-[var(--color-admin-text)] tracking-tight leading-none">Clientes & CRM</h4>
              <p className="text-[11px] text-[var(--color-admin-text-muted)] font-medium mt-2">Gerencie o relacionamento e finanças de seus clientes</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 lg:w-80 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-admin-text-muted)] group-focus-within:text-[var(--color-admin-accent)] transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, e-mail, telefone..."
                className="w-full bg-[var(--color-admin-bg)] border-2 border-[var(--color-admin-border)] rounded-2xl pl-12 pr-4 py-4 text-[13px] font-medium text-[var(--color-admin-text)] focus:border-[var(--color-admin-accent)] transition-all outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsNewClientOpen(true)}
              className="bg-[var(--color-admin-accent)] text-white text-[11px] font-bold uppercase tracking-[0.2em] px-6 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-md active:scale-95 hover:opacity-90 shrink-0"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Novo Cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Clients List Panel */}
        <div className="xl:col-span-1 bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col max-h-[750px]">
          <div className="px-8 py-5 border-b border-[var(--color-admin-border)] bg-[var(--color-admin-bg)]/50 flex items-center justify-between gap-4">
            <h5 className="text-[11px] font-black uppercase tracking-[0.15em] text-[var(--color-admin-text-secondary)]">
              Lista ({filteredClients.length})
            </h5>
            
            <div className="flex bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] p-1 rounded-xl text-[10px] font-bold shrink-0">
              <button 
                onClick={() => setFinanceFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  financeFilter === 'all' 
                    ? 'bg-white text-[var(--color-admin-text)] shadow-sm' 
                    : 'text-slate-400 hover:text-slate-650'
                }`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFinanceFilter('debtors')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  financeFilter === 'debtors' 
                    ? 'bg-red-500 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-red-500'
                }`}
              >
                Devedores
              </button>
              <button 
                onClick={() => setFinanceFilter('paid')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  financeFilter === 'paid' 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-emerald-500'
                }`}
              >
                Pagos
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-[var(--color-admin-accent)]" size={32} />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Carregando CRM...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <p className="text-[13px] font-medium">Nenhum cliente encontrado.</p>
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClientId === client.id;
                const isDebtor = (client.total_balance_due || 0) > 0;
                
                let boxStyle = '';
                if (isDebtor) {
                  boxStyle = isSelected 
                    ? 'bg-red-50/80 border-red-400 ring-2 ring-red-400/20' 
                    : 'bg-red-50/30 border-red-200/80 hover:border-red-300';
                } else {
                  boxStyle = isSelected 
                    ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-400/20' 
                    : 'bg-emerald-50/25 border-emerald-200/70 hover:border-emerald-300';
                }

                return (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group active:scale-[0.99] ${boxStyle}`}
                  >
                    <div className="min-w-0 pr-4 space-y-2 flex-1">
                      <h6 className={`font-bold text-[14px] leading-tight transition-colors ${
                        isDebtor 
                          ? 'text-red-600 group-hover:text-red-700' 
                          : 'text-emerald-600 group-hover:text-emerald-700'
                      }`}>
                        {client.name}
                      </h6>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <span>{client.total_bookings} {client.total_bookings === 1 ? 'ensaio' : 'ensaios'}</span>
                        {client.last_booking_date && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>Último: {formatDate(client.last_booking_date)}</span>
                          </>
                        )}
                        {isDebtor && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-red-300" />
                            <span className="text-red-650 font-black">Devendo: {formatCurrency(client.total_balance_due)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight 
                      size={18} 
                      className={`transition-transform shrink-0 ${
                        isDebtor 
                          ? 'text-red-400' 
                          : 'text-slate-400'
                      } ${
                        isSelected ? 'translate-x-1' : 'group-hover:translate-x-1'
                      }`} 
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Client Details Panel */}
        <div className="xl:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!selectedClientId ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] border-dashed rounded-[2.5rem] p-24 text-center text-slate-400 shadow-sm flex flex-col items-center justify-center h-full min-h-[400px]"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 mb-6">
                  <User size={28} className="text-slate-300" />
                </div>
                <h5 className="text-[16px] font-bold text-[var(--color-admin-text)] tracking-tight">Nenhum cliente selecionado</h5>
                <p className="text-[12px] text-slate-400 max-w-sm mt-2">Selecione um cliente ao lado para ver sua ficha técnica.</p>
              </motion.div>
            ) : isDetailsLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-32 flex flex-col items-center justify-center gap-4 shadow-sm h-full"
              >
                <Loader2 className="animate-spin text-[var(--color-admin-accent)]" size={40} />
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Buscando ficha técnica...</p>
              </motion.div>
            ) : clientDetails ? (
              <motion.div
                key={clientDetails.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Profile Card Summary */}
                <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center border text-[var(--color-admin-text)] font-black text-[22px] tracking-tight">
                        {clientDetails.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-[22px] font-bold text-[var(--color-admin-text)] tracking-tight leading-tight">{clientDetails.name}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[12px] font-medium text-[var(--color-admin-text-muted)]">
                          {clientDetails.email && (
                            <span className="flex items-center gap-1.5"><Mail size={14} /> {clientDetails.email}</span>
                          )}
                          {clientDetails.phone && (
                            <span className="flex items-center gap-1.5"><Phone size={14} /> {clientDetails.phone}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-center">
                      {clientDetails.phone && (
                        <button
                          onClick={() => openWhatsApp(clientDetails.phone, clientDetails.name)}
                          className="flex-1 sm:flex-none w-12 h-12 flex items-center justify-center bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl hover:bg-emerald-100 active:scale-95 transition-all"
                          title="Falar no WhatsApp"
                        >
                          <MessageSquare size={18} />
                        </button>
                      )}
                      
                      {!isEditingClient ? (
                        <button
                          onClick={() => {
                            setIsEditingClient(true);
                            setEditedClient({ ...clientDetails });
                          }}
                          className="flex-1 sm:flex-none px-6 h-12 bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] text-slate-600 rounded-2xl hover:bg-slate-50 font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <Edit3 size={15} />
                          <span>Editar Cadastro</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={handleUpdateClient}
                            className="flex-1 sm:flex-none px-6 h-12 bg-emerald-500 text-white rounded-2xl font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 hover:opacity-90 transition-all shadow-md"
                          >
                            <Save size={15} />
                            <span>Salvar</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingClient(false);
                              setEditedClient({ ...clientDetails });
                            }}
                            className="w-12 h-12 flex items-center justify-center bg-red-50 border border-red-200 text-red-500 rounded-2xl hover:bg-red-100 active:scale-95 transition-all"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-Tabs selector for Cleanliness */}
                <div className="flex border-b border-[var(--color-admin-border)] gap-6 lg:gap-10">
                  <button
                    onClick={() => setDetailsTab('personal')}
                    className={`pb-4 text-[11px] lg:text-[12px] font-black uppercase tracking-[0.2em] relative transition-colors ${
                      detailsTab === 'personal' 
                        ? 'text-[var(--color-admin-accent)]' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span>Dados Pessoais</span>
                    {detailsTab === 'personal' && (
                      <motion.div 
                        layoutId="activeDetailsTabLine"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-admin-accent)]"
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setDetailsTab('finance')}
                    className={`pb-4 text-[11px] lg:text-[12px] font-black uppercase tracking-[0.2em] relative transition-colors ${
                      detailsTab === 'finance' 
                        ? 'text-[var(--color-admin-accent)]' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span>Dados Financeiros</span>
                    {detailsTab === 'finance' && (
                      <motion.div 
                        layoutId="activeDetailsTabLine"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-admin-accent)]"
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setDetailsTab('history')}
                    className={`pb-4 text-[11px] lg:text-[12px] font-black uppercase tracking-[0.2em] relative transition-colors ${
                      detailsTab === 'history' 
                        ? 'text-[var(--color-admin-accent)]' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span>Histórico de Ensaios</span>
                    {detailsTab === 'history' && (
                      <motion.div 
                        layoutId="activeDetailsTabLine"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-admin-accent)]"
                      />
                    )}
                  </button>
                </div>

                {/* Sub-Tabs Contents */}
                
                {/* 1. PERSONAL TAB */}
                {detailsTab === 'personal' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    
                    {/* CRM Profile data card */}
                    <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-8 shadow-sm space-y-6">
                      <h5 className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-admin-text-secondary)] border-b pb-4 flex items-center gap-2">
                        <Heart size={16} className="text-pink-400" />
                        <span>Ficha de Relacionamento (CRM)</span>
                      </h5>

                      {isEditingClient ? (
                        <div className="space-y-4">
                          {/* CPF */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF</label>
                            <input
                              type="text"
                              value={editedClient.cpf || ""}
                              onChange={(e) => setEditedClient({ ...editedClient, cpf: e.target.value })}
                              placeholder="000.000.000-00"
                              className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-[var(--color-admin-accent)] transition-all"
                            />
                          </div>

                          {/* Instagram */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instagram</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[13px]">@</span>
                              <input
                                type="text"
                                value={editedClient.instagram?.replace("@", "") || ""}
                                onChange={(e) => setEditedClient({ ...editedClient, instagram: e.target.value })}
                                placeholder="perfil"
                                className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-xl pl-8 pr-4 py-3 text-[13px] font-medium outline-none focus:border-[var(--color-admin-accent)] transition-all"
                              />
                            </div>
                          </div>

                          {/* DPP Pregnancy */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <span>D.P.P. (Data Provável do Parto)</span>
                            </label>
                            <input
                              type="date"
                              value={editedClient.estimated_delivery_date || ""}
                              onChange={(e) => setEditedClient({ ...editedClient, estimated_delivery_date: e.target.value || null })}
                              className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-[var(--color-admin-accent)] transition-all text-slate-700"
                            />
                          </div>

                          {/* Notes */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anotações Internas</label>
                            <textarea
                              value={editedClient.notes || ""}
                              onChange={(e) => setEditedClient({ ...editedClient, notes: e.target.value })}
                              placeholder="Anotações, preferências estéticas, restrições..."
                              rows={4}
                              className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-[var(--color-admin-accent)] transition-all resize-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-5 text-[13px]">
                          {/* Static Details */}
                          <div className="grid grid-cols-2 gap-4 bg-[var(--color-admin-bg)] p-4 rounded-2xl border">
                            <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">CPF</span>
                              <span className="font-bold text-slate-700">{clientDetails.cpf || "Não cadastrado"}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Instagram</span>
                              {clientDetails.instagram ? (
                                <a 
                                  href={`https://instagram.com/${clientDetails.instagram.replace("@", "")}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="font-bold text-[var(--color-admin-accent)] hover:underline flex items-center gap-1"
                                >
                                  @{clientDetails.instagram.replace("@", "")}
                                  <ExternalLink size={12} />
                                </a>
                              ) : (
                                <span className="font-bold text-slate-700">Não cadastrado</span>
                              )}
                            </div>
                          </div>

                          {/* DPP pregnancy alert */}
                          {clientDetails.estimated_delivery_date && (
                            <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 flex items-start gap-3">
                              <Heart size={18} className="text-pink-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest block">Maternidade</span>
                                <span className="font-bold text-pink-900">D.P.P.: {formatDate(clientDetails.estimated_delivery_date)}</span>
                              </div>
                            </div>
                          )}

                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Anotações</span>
                            <div className="bg-[var(--color-admin-bg)] border rounded-2xl p-4 min-h-[100px] text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">
                              {clientDetails.notes || "Nenhuma anotação registrada ainda."}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Children / Family card */}
                    <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-8 shadow-sm space-y-6">
                      <h5 className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-admin-text-secondary)] border-b pb-4 flex items-center gap-2">
                        <Baby size={16} className="text-blue-400" />
                        <span>Filhos & Família</span>
                      </h5>

                      <div className="space-y-3">
                        {(isEditingClient ? editedClient.children_info : clientDetails.children_info)?.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 border border-dashed rounded-2xl">
                            <p className="text-[12px] font-medium">Nenhum filho cadastrado.</p>
                          </div>
                        ) : (
                          (isEditingClient ? editedClient.children_info : clientDetails.children_info)?.map((child: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-[var(--color-admin-bg)] border rounded-2xl">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center border">
                                  <Baby size={16} />
                                </div>
                                <div>
                                  <span className="font-bold text-slate-700 text-[13px] block">{child.name}</span>
                                  {child.birthdate && (
                                    <span className="text-[10px] text-slate-400 font-bold block">
                                      Nascimento: {formatDate(child.birthdate)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isEditingClient && (
                                <button 
                                  onClick={() => handleRemoveChild(idx)}
                                  className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {isEditingClient && (
                        <div className="bg-[var(--color-admin-bg)] border border-dashed rounded-2xl p-4 space-y-4 mt-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cadastrar Filho(a)</span>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={newChildName}
                              onChange={(e) => setNewChildName(e.target.value)}
                              placeholder="Nome do Filho"
                              className="bg-white border rounded-xl px-3 py-2 text-[12px] font-medium outline-none"
                            />
                            <input
                              type="date"
                              value={newChildBirthdate}
                              onChange={(e) => setNewChildBirthdate(e.target.value)}
                              className="bg-white border rounded-xl px-3 py-2 text-[12px] font-medium outline-none text-slate-600"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleAddChild}
                            className="w-full bg-[var(--color-admin-text)] text-[var(--color-admin-bg)] py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                          >
                            Adicionar Filho
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. FINANCE TAB */}
                {detailsTab === 'finance' && (
                  <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-8 shadow-sm space-y-8 animate-in fade-in duration-300">
                    <h5 className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-admin-text-secondary)] border-b pb-4 flex items-center gap-2">
                      <DollarSign size={16} className="text-emerald-500" />
                      <span>Dados Financeiros & Balanço do Cliente</span>
                    </h5>

                    {/* Resumo Financeiro */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-emerald-50/20 border border-emerald-100 p-6 rounded-[1.5rem] flex flex-col justify-between">
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Total Pago (Acumulado)</span>
                        <span className="font-black text-emerald-600 text-[22px]">{formatCurrency(clientDetails.ltv || 0)}</span>
                      </div>
                      <div className={`border p-6 rounded-[1.5rem] flex flex-col justify-between ${
                        clientDetails.total_balance_due > 0 
                          ? 'bg-red-50/20 border-red-200' 
                          : 'bg-slate-50/50 border-slate-200'
                      }`}>
                        <span className={`text-[9px] font-black uppercase tracking-widest block mb-2 ${
                          clientDetails.total_balance_due > 0 ? 'text-red-600' : 'text-slate-400'
                        }`}>Saldo Devedor Geral</span>
                        <span className={`font-black text-[22px] ${
                          clientDetails.total_balance_due > 0 ? 'text-red-500' : 'text-slate-500'
                        }`}>{formatCurrency(clientDetails.total_balance_due || 0)}</span>
                      </div>
                    </div>

                    {/* Breakdown por agendamento */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Lançamentos Financeiros</span>
                      
                      {clientDetails.bookings?.length === 0 ? (
                        <p className="py-8 text-center text-slate-400 font-medium text-[12px]">Nenhum lançamento financeiro registrado.</p>
                      ) : (
                        <div className="border border-[var(--color-admin-border)] rounded-2xl overflow-hidden divide-y divide-[var(--color-admin-border)] bg-[var(--color-admin-bg)]">
                          {clientDetails.bookings?.map((booking: Booking & { sessions?: { name: string; theme_color?: string } }) => {
                            const contractVal = Number(booking.total_amount) || 0;
                            const paidVal = Number(booking.paid_amount) || 0;
                            const balanceVal = Math.max(0, contractVal - paidVal);

                            return (
                              <div 
                                key={booking.id} 
                                onClick={() => onEditBooking?.(booking)}
                                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition-colors cursor-pointer group"
                              >
                                <div className="min-w-0 flex items-center gap-3">
                                  <div 
                                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                                    style={{ backgroundColor: booking.sessions?.theme_color || 'var(--color-admin-accent)' }} 
                                  />
                                  <div>
                                    <span className="font-bold text-[13px] text-[var(--color-admin-text)] block group-hover:text-[var(--color-admin-accent)] transition-colors">{booking.sessions?.name || "Outros"}</span>
                                    <span className="text-[10px] font-medium text-slate-400 block">{formatDate(booking.booking_date)}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6 text-right sm:w-80">
                                  <div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Contrato</span>
                                    <span className="font-bold text-slate-600 text-[12px]">{formatCurrency(contractVal)}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Pago</span>
                                    <span className="font-bold text-emerald-600 text-[12px]">{formatCurrency(paidVal)}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Saldo</span>
                                    <span className={`font-bold text-[12px] ${balanceVal > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                      {formatCurrency(balanceVal)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. HISTORY TAB */}
                {detailsTab === 'history' && (
                  <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                    <h5 className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-admin-text-secondary)] border-b pb-4 flex items-center gap-2">
                      <Calendar size={16} className="text-purple-400" />
                      <span>Linha do Tempo de Ensaios</span>
                    </h5>

                    <div className="space-y-4">
                      {clientDetails.bookings?.length === 0 ? (
                        <p className="py-12 text-center text-slate-400 font-medium text-[12px]">Nenhum ensaio agendado ainda.</p>
                      ) : (
                        clientDetails.bookings?.map((booking: Booking & { sessions?: { name: string; theme_color?: string } }) => {
                          return (
                            <div 
                              key={booking.id}
                              onClick={() => onEditBooking?.(booking)}
                              className="border border-[var(--color-admin-border)] rounded-2xl p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[var(--color-admin-accent)]/30 hover:shadow-md cursor-pointer transition-all active:scale-[0.99] group"
                            >
                              <div className="flex items-center gap-4">
                                <div 
                                  className="w-3.5 h-3.5 rounded-full shrink-0" 
                                  style={{ backgroundColor: booking.sessions?.theme_color || 'var(--color-admin-accent)' }} 
                                  />
                                <div>
                                  <h6 className="font-bold text-[14px] text-[var(--color-admin-text)] leading-none group-hover:text-[var(--color-admin-accent)] transition-colors">
                                    {booking.sessions?.name || "Outros"}
                                  </h6>
                                  <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>{formatDate(booking.booking_date)}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span>{booking.start_time.slice(0, 5)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1 bg-slate-50 border rounded-lg">
                                  {booking.package_type || "Padrão"}
                                </span>
                                
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  booking.status === 'confirmed'
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : booking.status === 'completed'
                                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                      : booking.status === 'cancelled'
                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                        : 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse'
                                }`}>
                                  {booking.status === 'confirmed' ? 'Confirmado' :
                                   booking.status === 'completed' ? 'Concluído' :
                                   booking.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

      </div>

      {/* New Client Modal Overlay */}
      <AnimatePresence>
        {isNewClientOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNewClientOpen(false)}
            className="fixed inset-0 bg-[var(--color-admin-bg)]/80 backdrop-blur-md z-[200] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-[2.5rem] p-8 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h4 className="text-[18px] font-bold text-[var(--color-admin-text)] uppercase tracking-widest">Novo Cliente</h4>
                <button 
                  onClick={() => setIsNewClientOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateClient} className="space-y-4">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={newClientData.name}
                    onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                    placeholder="Nome do Cliente"
                    className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-[var(--color-admin-accent)] transition-all"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</label>
                  <input
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    placeholder="exemplo@email.com"
                    className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-[var(--color-admin-accent)] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone</label>
                    <input
                      type="text"
                      value={newClientData.phone}
                      onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                      placeholder="(27) 99999-9999"
                      className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-[var(--color-admin-accent)] transition-all"
                    />
                  </div>
                  
                  {/* CPF */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF</label>
                    <input
                      type="text"
                      value={newClientData.cpf}
                      onChange={(e) => setNewClientData({ ...newClientData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-[var(--color-admin-accent)] transition-all"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instagram</label>
                  <input
                    type="text"
                    value={newClientData.instagram}
                    onChange={(e) => setNewClientData({ ...newClientData, instagram: e.target.value })}
                    placeholder="@perfil"
                    className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-[var(--color-admin-accent)] transition-all"
                  />
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anotações Iniciais</label>
                  <textarea
                    value={newClientData.notes}
                    onChange={(e) => setNewClientData({ ...newClientData, notes: e.target.value })}
                    placeholder="Preferências, notas, etc."
                    rows={3}
                    className="w-full bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:border-[var(--color-admin-accent)] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingClient}
                  className="w-full mt-6 bg-[var(--color-admin-accent)] text-white text-[11px] font-black uppercase tracking-[0.2em] py-4 rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  {isCreatingClient ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Cadastrando...</span>
                    </>
                  ) : (
                    <span>Cadastrar Cliente</span>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
