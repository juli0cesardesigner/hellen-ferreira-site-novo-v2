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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans antialiased">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] space-y-8"
      >
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 bg-zinc-900 rounded-2xl items-center justify-center text-white shadow-xl mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Portal de Gestão</h1>
          <p className="text-zinc-400 text-sm font-medium uppercase tracking-[0.2em]">Hellen Ferreira</p>
        </div>

        <div className="bg-white p-8 lg:p-10 rounded-[32px] shadow-2xl border border-zinc-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-200 via-zinc-900 to-zinc-200" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  name="email" 
                  required
                  placeholder="admin@exemplo.com"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  name="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm outline-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[11px] font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center gap-2"
              >
                ⚠️ {error}
              </motion.p>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-zinc-900 hover:bg-black text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-zinc-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Validando...
                </>
              ) : (
                <>
                  Acessar Painel <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

      </motion.div>
    </div>
  );
}
