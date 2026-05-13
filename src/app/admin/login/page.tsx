"use client";

import React, { useState } from "react";
import { login } from "@/lib/actions/auth-actions";
import { motion } from "framer-motion";
import { Shield, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-admin-bg)] flex items-center justify-center p-6 antialiased">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px]"
      >
        {/* ─── Header ─── */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex w-16 h-16 bg-[var(--color-admin-accent)] rounded-2xl items-center justify-center text-white shadow-lg shadow-[var(--color-admin-accent)]/20">
            <Shield size={28} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h1 className="text-[20px] font-bold text-[var(--color-admin-text)] tracking-tight">Admin</h1>
            <p className="text-[11px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-[0.2em]">Acesso Restrito</p>
          </div>
        </div>

        {/* ─── Login Card ─── */}
        <div className="bg-[var(--color-admin-surface)] p-8 lg:p-10 rounded-[2.5rem] border border-[var(--color-admin-border)] shadow-sm">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] tracking-widest uppercase ml-1 opacity-70">E-mail</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[var(--color-admin-accent)] transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  name="email" 
                  required
                  placeholder="hellen@hellenferreira.com"
                  className="w-full pl-14 pr-6 py-5 bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-2xl text-[14px] font-bold text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--color-admin-text-muted)] tracking-widest uppercase ml-1 opacity-70">Senha</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[var(--color-admin-accent)] transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  name="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 bg-[var(--color-admin-bg)] border border-[var(--color-admin-border)] rounded-2xl text-[14px] font-bold text-[var(--color-admin-text)] outline-none focus:border-[var(--color-admin-accent)] transition-all placeholder:text-slate-300 shadow-inner"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
              >
                <Shield size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-red-600">{error}</p>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[var(--color-admin-accent)] hover:bg-[var(--color-admin-accent-hover)] text-white py-5 rounded-2xl font-bold text-[13px] tracking-tight flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} strokeWidth={2.5} /> Entrando...
                </>
              ) : (
                <>
                  Entrar <ArrowRight size={20} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-[10px] font-bold text-[var(--color-admin-text-muted)] uppercase tracking-[0.2em] opacity-50">
          Hellen Ferreira &mdash; Painel Administrativo
        </p>
      </motion.div>
    </div>
  );
}
