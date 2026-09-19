"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, BellRing, Calendar, ChevronDown, Loader2, Sparkles, User, X } from "lucide-react";
import { getRecentBookingsForNotifications } from "@/lib/actions/push-actions";
import { NotificationDetailModal } from "./NotificationDetailModal";
import { Booking } from "@/types/database";

// Formata data e hora amigáveis
function formatRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours} h`;
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  } catch {
    return "";
  }
}

interface NotificationCenterProps {
  onEditBooking?: (booking: any) => void;
  refreshTrigger?: number;
}

export default function NotificationCenter({ onEditBooking, refreshTrigger = 0 }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTime, setLastReadTime] = useState<number>(0);
  const [selectedNotification, setSelectedNotification] = useState<Booking | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Carregar notificações e timestamp de leitura
  const fetchNotifications = async (fetchLimit: number = limit) => {
    const res = await getRecentBookingsForNotifications(fetchLimit);
    if (res.success && res.bookings) {
      setBookings(res.bookings);
      
      // Se a quantidade retornada for menor do que o limite solicitado, não há mais registros
      if (fetchLimit > 0 && res.bookings.length < fetchLimit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      // Calcular quantos não foram lidos
      const storedReadTime = localStorage.getItem("lastReadNotificationsTime");
      const readTimeVal = storedReadTime ? parseInt(storedReadTime, 10) : 0;
      setLastReadTime(readTimeVal);

      const unread = res.bookings.filter((b: any) => {
        const createdMs = new Date(b.created_at).getTime();
        return createdMs > readTimeVal;
      }).length;

      setUnreadCount(unread);
    }
  };

  useEffect(() => {
    fetchNotifications(limit);
  }, [refreshTrigger]);

  // Atualizar a cada 30 segundos mantendo o limite atual
  useEffect(() => {
    const interval = setInterval(() => fetchNotifications(limit), 30000);
    return () => clearInterval(interval);
  }, [limit]);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      // Quando abrir, marcar tudo como lido
      const nowMs = Date.now();
      localStorage.setItem("lastReadNotificationsTime", String(nowMs));
      setLastReadTime(nowMs);
      setUnreadCount(0);
    }
    setIsOpen(!isOpen);
  };

  const handleItemClick = (booking: any) => {
    setIsOpen(false);
    setSelectedNotification(booking);
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const newLimit = limit + 20;
    setLimit(newLimit);
    await fetchNotifications(newLimit);
    setIsLoadingMore(false);
  };

  const handleLoadAll = async () => {
    setIsLoadingMore(true);
    setLimit(0); // 0 indica sem limite
    await fetchNotifications(0);
    setHasMore(false);
    setIsLoadingMore(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Botão do Sino */}
      <button
        onClick={handleToggle}
        className={`w-12 h-12 flex items-center justify-center bg-[var(--color-admin-bg)] text-slate-400 rounded-2xl transition-all border border-[var(--color-admin-border)] active:scale-90 shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--color-admin-accent)] outline-none relative ${
          isOpen ? "text-[var(--color-admin-accent)] border-[var(--color-admin-accent)]/30" : ""
        }`}
        title="Notificações"
      >
        {unreadCount > 0 ? (
          <BellRing size={20} className="text-[var(--color-admin-accent)] animate-pulse" />
        ) : (
          <Bell size={20} />
        )}
        
        {/* Badge vermelho */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white px-1 shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Customizado (Ajustado para alinhamento mobile sem estourar layout) */}
      {isOpen && (
        <div className="fixed left-4 right-4 top-24 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96 max-w-md mx-auto sm:mx-0 bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header do Dropdown */}
          <div className="px-5 py-4 border-b border-[var(--color-admin-border)] flex items-center justify-between bg-slate-50/50">
            <h6 className="text-[12px] font-black uppercase tracking-wider text-[var(--color-admin-text)]">
              Agendamentos Recentes
            </h6>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg"
            >
              <X size={14} />
            </button>
          </div>

          {/* Lista de Notificações */}
          <div className="max-h-[380px] overflow-y-auto custom-scrollbar divide-y divide-[var(--color-admin-border)]/50">
            {bookings.length === 0 ? (
              <div className="py-12 px-6 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-300">
                  <Bell size={20} />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider">
                  Nenhuma notificação recente
                </p>
              </div>
            ) : (
              bookings.map((booking) => {
                const createdMs = new Date(booking.created_at).getTime();
                const isUnread = createdMs > lastReadTime;
                
                const [y, m, d] = booking.booking_date.split("-");
                const formattedDate = `${d}/${m}/${y}`;
                const formattedTime = booking.start_time.slice(0, 5) + "h";
                const sessionName = booking.sessions?.name || "Ensaio";

                return (
                  <button
                    key={booking.id}
                    onClick={() => handleItemClick(booking)}
                    className={`w-full text-left p-4 hover:bg-slate-50/80 transition-colors flex gap-3 relative items-start ${
                      isUnread ? "bg-slate-50/30" : ""
                    }`}
                  >
                    {/* Indicador de Unread */}
                    {isUnread && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[var(--color-admin-accent)] shadow-sm" />
                    )}

                    {/* Ícone */}
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={14} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black text-[var(--color-admin-text)] truncate pr-4">
                          {booking.customer_name}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 shrink-0">
                          {formatRelativeTime(booking.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-[10px] font-semibold text-slate-500 truncate">
                        {sessionName} • {booking.location_type === 'externo' ? '🌳 Externo' : '🏠 Estúdio'}
                      </p>

                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider pt-0.5">
                        <Calendar size={10} className="text-[var(--color-admin-accent)]" />
                        <span>
                          {formattedDate} às {formattedTime}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer do Dropdown com Opções de Ver Mais */}
          <div className="px-5 py-3 border-t border-[var(--color-admin-border)] bg-slate-50/30 flex flex-col items-center gap-2">
            {limit > 0 && hasMore && bookings.length >= limit && (
              <div className="flex items-center justify-center gap-2 w-full pt-1">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex-1 py-1.5 px-3 bg-white border border-[var(--color-admin-border)] rounded-xl text-[10px] font-bold text-[var(--color-admin-accent)] hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                  <span>Carregar +20</span>
                </button>

                <button
                  onClick={handleLoadAll}
                  disabled={isLoadingMore}
                  className="flex-1 py-1.5 px-3 bg-[var(--color-admin-accent)] text-white rounded-xl text-[10px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <span>Ver Todas</span>
                  )}
                </button>
              </div>
            )}

            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              {limit > 0 && hasMore
                ? `Mostrando as últimas ${bookings.length} confirmações`
                : `Mostrando todas as ${bookings.length} confirmações`}
            </span>
          </div>
        </div>
      )}

      {/* Modal Informativo Resumido da Notificação */}
      {selectedNotification && (
        <NotificationDetailModal
          booking={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onOpenFullEdit={(booking) => {
            if (onEditBooking) {
              onEditBooking(booking);
            }
          }}
        />
      )}
    </div>
  );
}
