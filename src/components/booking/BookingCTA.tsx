"use client";

import React from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface BookingCTAProps {
  sessionName: string;
  sessionId: string;
}

export function BookingCTA({ sessionName, sessionId }: BookingCTAProps) {
  return (
    <section className="py-20 bg-linen/20">
      <div className="container-custom max-w-4xl text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-text-light">Garanta sua Data</span>
          <h2 className="text-4xl md:text-5xl font-serif text-text-dark italic">Vamos contar a sua história juntos?</h2>
          <p className="text-text-medium max-w-2xl mx-auto font-light leading-relaxed">
            Nossa agenda para <strong>{sessionName}</strong> costuma ter poucas datas mensais. 
            Agende agora para garantir o seu registro com toda a calma e carinho que sua família merece.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link 
            href={`/agendar?sessao=${sessionId}`}
            className="group inline-flex items-center gap-4 px-12 py-5 bg-text-dark text-white rounded-sm text-[12px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-all shadow-2xl hover:shadow-blush/20"
          >
            Agendar Sessão Agora <Calendar size={18} className="group-hover:rotate-12 transition-transform" />
          </Link>
          
          <p className="mt-6 text-[10px] text-text-light uppercase tracking-widest flex items-center justify-center gap-3">
             <span className="w-8 h-[1px] bg-sand" /> Confirmação Automática via Stripe <span className="w-8 h-[1px] bg-sand" />
          </p>
        </motion.div>
      </div>
    </section>
  );
}
