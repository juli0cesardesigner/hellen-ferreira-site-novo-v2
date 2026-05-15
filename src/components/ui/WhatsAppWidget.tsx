"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import Image from "next/image";
import { SITE_CONFIG } from "@/lib/constants";
import { fbEvent } from "@/components/analytics/FacebookPixel";

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const handleStartConversation = () => {
    fbEvent('Contact', { 
      method: 'WhatsApp',
      content_name: 'Suporte/Agendamento via WhatsApp'
    });
    window.open(SITE_CONFIG.social.whatsappLink, "_blank");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-6 w-[320px] sm:w-[350px] bg-white rounded-[24px] shadow-2xl overflow-hidden border border-zinc-100"
          >
            {/* Header - WhatsApp Green */}
            <div className="bg-[#25D366] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 bg-white rounded-full p-1.5 shadow-sm">
                  <Image 
                    src="/ui/whatsapp.svg"
                    alt="WhatsApp"
                    fill
                    className="object-contain p-1.5"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Hellen Ferreira</h4>
                  <p className="text-white/80 text-[10px] uppercase tracking-wider">Online agora</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors bg-black/10 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 bg-[#e5ddd5] relative min-h-[140px] flex items-start">
              <div className="bg-white p-5 rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px] shadow-sm relative max-w-[90%]">
                {/* Speech bubble tail */}
                <div className="absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-t-transparent border-r-[10px] border-r-white border-b-[10px] border-b-transparent"></div>
                <p className="text-zinc-700 text-sm leading-relaxed font-medium">
                  Olá! Como posso ajudar você a eternizar esses momentos? ✨
                </p>
              </div>
            </div>

            {/* Footer / CTA */}
            <div className="p-5 bg-white">
              <button
                onClick={handleStartConversation}
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
              >
                <span>Iniciar conversa</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button - Green Again */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#25D366] text-white w-16 h-16 rounded-full shadow-[0_10px_40px_-5px_rgba(37,211,102,0.4)] flex items-center justify-center relative group transition-all"
      >
        <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20 pointer-events-none group-hover:hidden"></div>
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <div className="relative w-10 h-10 brightness-0 invert">
            <Image 
              src="/ui/whatsapp.svg"
              alt="WhatsApp"
              fill
              className="object-contain"
            />
          </div>
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blush rounded-full border-2 border-white"></span>
        )}
      </motion.button>
    </div>
  );
}
