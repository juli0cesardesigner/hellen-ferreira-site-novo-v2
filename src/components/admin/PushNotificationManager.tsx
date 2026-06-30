"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { savePushSubscription, removePushSubscription } from "@/lib/actions/push-actions";

// Conversor da chave VAPID pública para o formato exigido pelo pushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se Service Worker e Push são suportados no navegador atual
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setIsSupported(true);
      checkSubscription();
    } else {
      setIsSupported(false);
      setIsLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      setPermission(Notification.permission);
    } catch (err) {
      console.error("Erro ao verificar assinatura push:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPush = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      // 1. Solicitar permissão se necessário
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        throw new Error("Permissão de notificação negada.");
      }

      // 2. Registrar o Service Worker caso ainda não esteja ativado
      const registration = await navigator.serviceWorker.ready;

      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        throw new Error("Chave VAPID pública não configurada no frontend.");
      }

      // 3. Inscrever no serviço de push do navegador
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      // 4. Salvar assinatura no banco de dados do Supabase
      const res = await savePushSubscription(JSON.stringify(sub));

      if (res.success) {
        setSubscription(sub);
        setMessage("Notificações ativadas com sucesso neste dispositivo!");
      } else {
        // Se falhou no backend, desinscreve no navegador para manter consistência
        await sub.unsubscribe();
        throw new Error(res.error || "Erro ao salvar assinatura no servidor.");
      }
    } catch (err: any) {
      console.error("Erro ao assinar notificações push:", err);
      setMessage(err.message || "Não foi possível ativar as notificações.");
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;
    setIsLoading(true);
    setMessage(null);
    try {
      // 1. Remover do banco de dados primeiro
      const res = await removePushSubscription(subscription.endpoint);

      if (res.success) {
        // 2. Desinscrever no navegador
        await subscription.unsubscribe();
        setSubscription(null);
        setMessage("Notificações desativadas para este dispositivo.");
      } else {
        throw new Error(res.error || "Erro ao remover assinatura do servidor.");
      }
    } catch (err: any) {
      console.error("Erro ao desinscrever notificações push:", err);
      setMessage(err.message || "Erro ao desativar notificações.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-slate-500 text-[11px] font-bold">
        <BellOff size={16} />
        <span>Este navegador ou aparelho não suporta Notificações Push (PWA). Instale o app na tela inicial.</span>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            subscription 
              ? "bg-emerald-50 text-emerald-500 border-emerald-200" 
              : "bg-amber-50 text-amber-500 border-amber-200"
          }`}>
            {subscription ? <BellRing size={18} /> : <Bell size={18} />}
          </div>
          <div>
            <h5 className="text-[12px] font-bold text-[var(--color-admin-text)]">
              Notificações do Celular
            </h5>
            <p className="text-[10px] text-slate-400 font-medium">
              {subscription 
                ? "Ativas neste dispositivo" 
                : permission === "denied" 
                  ? "Permissão bloqueada no aparelho" 
                  : "Desativadas. Clique para ativar."
              }
            </p>
          </div>
        </div>

        {isLoading ? (
          <Loader2 size={16} className="animate-spin text-slate-400" />
        ) : subscription ? (
          <button
            onClick={unsubscribeFromPush}
            className="bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-95"
          >
            Desativar
          </button>
        ) : (
          <button
            onClick={subscribeToPush}
            disabled={permission === "denied"}
            className="bg-[var(--color-admin-accent)] hover:opacity-90 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-55"
          >
            Ativar Alertas
          </button>
        )}
      </div>

      {message && (
        <p className={`text-[10px] font-bold uppercase tracking-wider ${
          message.includes("sucesso") || message.includes("desativadas") 
            ? "text-emerald-600" 
            : "text-red-500"
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}
