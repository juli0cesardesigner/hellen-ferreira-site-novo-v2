"use client";

import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

export interface AttentionNoticeBoxRef {
  triggerAttention: () => void;
}

interface AttentionNoticeBoxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: React.ReactNode;
  children: React.ReactNode;
  alertMessage?: string;
  className?: string;
}

export const AttentionNoticeBox = forwardRef<AttentionNoticeBoxRef, AttentionNoticeBoxProps>(
  (
    {
      checked,
      onChange,
      title,
      children,
      alertMessage = "👆 Por favor, leia este aviso para liberar a agenda",
      className = "",
    },
    ref
  ) => {
    const [isAlertActive, setIsAlertActive] = useState(false);
    const [shakeKey, setShakeKey] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useImperativeHandle(ref, () => ({
      triggerAttention: () => {
        // Dispara nova animação de shake
        setShakeKey((prev) => prev + 1);
        setIsAlertActive(true);

        // Scroll suave para centralizar na tela
        if (containerRef.current) {
          containerRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        // Foco acessível no input
        if (inputRef.current) {
          inputRef.current.focus({ preventScroll: true });
        }

        // Remove o destaque após 3.5 segundos se não for clicado
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsAlertActive(false);
        }, 3500);
      },
    }));

    // Se o usuário marcar, desativa o alerta de atenção imediatamente
    useEffect(() => {
      if (checked) {
        setIsAlertActive(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    }, [checked]);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);

    return (
      <div ref={containerRef} className={`relative transition-all duration-300 ${className}`}>
        {/* Tag Flutuante de Instrução */}
        <AnimatePresence>
          {isAlertActive && !checked && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mb-3 p-2.5 bg-blush/10 border border-blush/40 rounded-sm flex items-center gap-2 text-blush text-xs font-medium shadow-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-blush animate-pulse" />
              <span>{alertMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caixa com animação de vibração e realce */}
        <motion.div
          key={shakeKey}
          animate={
            shakeKey > 0
              ? {
                  x: [0, -8, 8, -6, 6, -3, 3, 0],
                  transition: { duration: 0.5, ease: "easeInOut" },
                }
              : {}
          }
          className={`p-4 rounded-sm border transition-all duration-300 ${
            isAlertActive && !checked
              ? "border-blush bg-blush/[0.04] ring-2 ring-blush/30 shadow-md"
              : "border-sand/30 bg-transparent hover:border-sand/50"
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input
              ref={inputRef}
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              className={`mt-0.5 w-4 h-4 rounded border-2 cursor-pointer shrink-0 transition-all ${
                isAlertActive && !checked
                  ? "border-blush ring-2 ring-blush/40 text-blush focus:ring-blush"
                  : "border-blush/40 text-blush focus:ring-blush/30 focus:ring-offset-0"
              }`}
            />
            <div className="text-xs text-text-medium leading-relaxed group-hover:text-text-dark transition-colors">
              {title && <strong className="block text-text-dark text-sm mb-1">{title}</strong>}
              {children}
            </div>
          </label>
        </motion.div>
      </div>
    );
  }
);

AttentionNoticeBox.displayName = "AttentionNoticeBox";
