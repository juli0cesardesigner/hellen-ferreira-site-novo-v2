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
    <div className="min-h-screen bg-[var(--color-admin-bg)] flex items-center justify-center p-6 antialiased" style={{ fontFamily: 'var(--font-admin)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 bg-[var(--color-admin-accent)] rounded-lg items-center justify-center text-white mb-3">
            <Shield size={24} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-admin-text)]" style={{ fontFamily: 'var(--font-admin)' }}>Admin Panel</h1>
          <p className="text-[var(--color-admin-text-muted)] text-[13px] font-medium">Hellen Ferreira Fotografia</p>
        </div>

        <div className="bg-[var(--color-admin-surface)] p-7 lg:p-8 rounded-lg border border-[var(--color-admin-border)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-[var(--color-admin-accent)]" />
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[var(--color-admin-text-muted)] ml-0.5">E-mail</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-admin-text-muted)] group-focus-within:text-[var(--color-admin-text)] transition-colors">
                  <Mail size={16} />
                </div>
                <input 
                  type="email" 
                  name="email" 
                  required
                  placeholder="admin@exemplo.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-[var(--color-admin-border)] rounded-md text-[13px] outline-none focus:bg-white focus:ring-2 focus:ring-[var(--color-admin-accent)]/10 focus:border-[var(--color-admin-accent)] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[var(--color-admin-text-muted)] ml-0.5">Senha</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-admin-text-muted)] group-focus-within:text-[var(--color-admin-text)] transition-colors">
                  <Lock size={16} />
                </div>
                <input 
                  type="password" 
                  name="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-[var(--color-admin-border)] rounded-md text-[13px] outline-none focus:bg-white focus:ring-2 focus:ring-[var(--color-admin-accent)]/10 focus:border-[var(--color-admin-accent)] transition-all"
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[12px] font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-100 flex items-center gap-2"
              >
                ⚠️ {error}
              </motion.p>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[var(--color-admin-accent)] hover:bg-[var(--color-admin-accent-hover)] text-white py-3 rounded-md font-medium text-[13px] flex items-center justify-center gap-2 transition-colors active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Validando...
                </>
              ) : (
                <>
                  Acessar painel <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

      </motion.div>
    </div>
  );
}
