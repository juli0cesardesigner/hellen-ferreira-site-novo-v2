"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Portal } from "./Portal";

interface DatePickerProps {
  value: string; // ISO format YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function InternalDatePicker({ value, onChange, label, placeholder = "Selecione uma data", className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? parseISO(value) : new Date());
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 340 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // If portal is open, we need to check if the click was inside the portal
        // But since we use fixed positioning and AnimatePresence, 
        // a simpler way is to check if the target has a specific data attribute or is inside the portal div
        const portalContent = document.querySelector('[data-datepicker-portal]');
        if (portalContent && portalContent.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update position when opening
  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const windowWidth = window.innerWidth;
      
      let left = rect.left;
      // If popover goes off-screen to the right, align it to the right of the trigger
      if (left + 340 > windowWidth) {
        left = rect.right - 340;
      }
      // Mobile safety
      if (left < 10) left = 10;

      setPopoverPos({
        top: rect.bottom + 8,
        left: left,
        width: 340
      });
    }
  }, [isOpen]);

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-black/40">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-[14px] font-bold text-white capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return (
      <div className="grid grid-cols-7 mb-2 border-b border-zinc-900/50 pb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const selectedDate = value ? parseISO(value) : null;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isTodayDate = isToday(day);

        days.push(
          <button
            key={day.toString()}
            type="button"
            className={`relative h-12 w-full flex items-center justify-center text-[13px] font-bold transition-all rounded-xl
              ${!isCurrentMonth ? "text-zinc-800 pointer-events-none" : "text-slate-300 hover:bg-zinc-900 hover:text-white"}
              ${isSelected ? "bg-white text-black hover:bg-white hover:text-black shadow-lg scale-95" : ""}
              ${isTodayDate && !isSelected ? "text-[var(--color-admin-accent)]" : ""}
            `}
            onClick={() => {
              onChange(format(cloneDay, "yyyy-MM-dd"));
              setIsOpen(false);
            }}
          >
            {formattedDate}
            {isTodayDate && !isSelected && (
              <div className="absolute bottom-2 w-1 h-1 bg-[var(--color-admin-accent)] rounded-full" />
            )}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="p-4">{rows}</div>;
  };

  const displayValue = value ? format(parseISO(value), "dd/MM/yyyy") : "";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[11px] font-bold text-slate-400 tracking-wide ml-2 mb-3 block">
          {label}
        </label>
      )}
      
      <div 
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group cursor-pointer"
      >
        <CalendarIcon size={18} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isOpen ? 'text-white' : 'text-zinc-500'}`} />
        <div className={`w-full bg-[var(--color-admin-bg)] border ${isOpen ? 'border-white' : 'border-[var(--color-admin-border)]'} px-14 py-5 rounded-2xl text-[13px] font-bold text-white transition-all shadow-inner min-h-[62px] flex items-center`}>
          {displayValue || <span className="text-zinc-700">{placeholder}</span>}
        </div>
        
        {value && !isOpen && (
          <button 
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <Portal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              data-datepicker-portal
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                position: 'fixed',
                top: popoverPos.top,
                left: popoverPos.left,
                width: popoverPos.width,
                zIndex: 9999
              }}
              className="bg-zinc-950 border border-zinc-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {renderHeader()}
              <div className="p-4 pb-2">
                {renderDays()}
                {renderCells()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}

