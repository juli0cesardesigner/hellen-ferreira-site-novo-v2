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
    <div className="min-h-screen bg-black flex items-center justify-center p-6 antialiased relative overflow-hidden font-mono">
      
      {/* ─── CRT/Scanline Overlay ─── */}
      <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
      <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[440px] space-y-10 relative z-10"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex w-16 h-16 bg-white rounded-2xl items-center justify-center text-black mb-4 shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-transform hover:rotate-12 duration-500">
            <Shield size={32} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h1 className="text-[28px] font-black tracking-tighter text-white uppercase">SYSTEM_ACCESS</h1>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">:: SECURE_GATEWAY_V2.0 ::</p>
          </div>
        </div>

        <div className="bg-zinc-950 p-10 lg:p-12 rounded-[2.5rem] border border-zinc-900 relative shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] ml-2">CREDENTIAL_ID</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors duration-300">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  name="email" 
                  required
                  placeholder="IDENTIFIER@CORE.SYS"
                  className="w-full pl-14 pr-6 py-5 bg-black border-2 border-zinc-900 rounded-2xl text-[14px] font-black text-white outline-none focus:border-white transition-all duration-500 placeholder:text-zinc-800"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] ml-2">ACCESS_CIPHER</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors duration-300">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  name="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 bg-black border-2 border-zinc-900 rounded-2xl text-[14px] font-black text-white outline-none focus:border-white transition-all duration-500 placeholder:text-zinc-800"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[11px] font-black text-red-500 bg-red-500/10 p-5 rounded-2xl border border-red-500/20 flex items-center gap-4 uppercase tracking-tight"
              >
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                AUTH_FAILURE: {error}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-white hover:bg-zinc-200 text-black py-5 rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_40px_rgba(255,255,255,0.1)] group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} strokeWidth={3} /> INITIALIZING...
                </>
              ) : (
                <>
                  ESTABLISH_LINK <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-zinc-800 text-[9px] font-black uppercase tracking-[0.4em]">Proprietary_Software // encrypted_session_active</p>
        </div>
      </motion.div>
    </div>
  );
}
