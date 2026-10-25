"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, MotionValue } from "framer-motion";
import { WEEKDAYS, CALENDAR_ROWS } from "./calendar-data";
import { CalendarCell } from "./CalendarCell";
import { getNatalCalendarAvailability } from "@/lib/actions/booking-actions";

interface DynamicChristmasCalendarProps {
  scrollProgress: MotionValue<number>;
}

export function DynamicChristmasCalendar({ scrollProgress }: DynamicChristmasCalendarProps) {
  const [dynamicAvailability, setDynamicAvailability] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    let isMounted = true;
    getNatalCalendarAvailability()
      .then((map) => {
        if (isMounted && map) {
          setDynamicAvailability(map);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar disponibilidade de Natal:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex items-center justify-center w-full max-w-[620px] md:max-w-[700px] mx-auto select-none"
    >
      {/* Abas laterais verticais dos Meses (Novembro e Dezembro) */}
      <div className="absolute -left-7 sm:-left-9 md:-left-11 top-0 bottom-0 flex flex-col justify-between py-10 sm:py-14 md:py-18 z-20 pointer-events-none">
        {/* Aba Novembro */}
        <div className="relative w-7 h-32 sm:w-9 sm:h-38 md:w-11 md:h-44 bg-[#e3ab6e] rounded-l-xl flex items-center justify-center shadow-[-4px_4px_16px_rgba(0,0,0,0.4)] border-y border-l border-[#f5cc98]/50 overflow-hidden">
          <span className="transform -rotate-90 text-[10px] sm:text-xs md:text-sm font-serif font-bold tracking-[0.28em] text-[#42220f] uppercase whitespace-nowrap drop-shadow-sm select-none">
            NOVEMBRO
          </span>
        </div>

        {/* Aba Dezembro */}
        <div className="relative w-7 h-32 sm:w-9 sm:h-38 md:w-11 md:h-44 bg-[#e3ab6e] rounded-l-xl flex items-center justify-center shadow-[-4px_4px_16px_rgba(0,0,0,0.4)] border-y border-l border-[#f5cc98]/50 overflow-hidden">
          <span className="transform -rotate-90 text-[10px] sm:text-xs md:text-sm font-serif font-bold tracking-[0.28em] text-[#42220f] uppercase whitespace-nowrap drop-shadow-sm select-none">
            DEZEMBRO
          </span>
        </div>
      </div>

      {/* Cartão Principal do Calendário (Fundo Verde Escuro com Bordas Arredondadas) */}
      <div className="relative w-full bg-[#1b2517]/95 border border-[#3b4933]/50 rounded-[24px] sm:rounded-[32px] p-5 sm:p-7 md:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-sm overflow-hidden">
        {/* Cabeçalho dos Dias da Semana com Proporções Exatas do Illustrator */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pb-3 mb-4 border-b border-[#a48259]/30">
          {WEEKDAYS.map((day) => (
            <div
              key={day.id}
              className="relative flex items-center justify-center h-5 sm:h-6 opacity-80 [filter:brightness(0)_invert(82%)]"
            >
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: `calc(${day.width} * 0.75px)`,
                  height: `calc(${day.height} * 0.75px)`,
                }}
              >
                <Image
                  src={day.svg}
                  alt={day.label}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Grid de Dias (5 Semanas x 7 Dias) */}
        <div className="flex flex-col gap-2 sm:gap-3">
          {CALENDAR_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-7 gap-1 sm:gap-2">
              {row.days.map((day, colIndex) => {
                const isAvailable =
                  dynamicAvailability !== null && day.dateStr in dynamicAvailability
                    ? dynamicAvailability[day.dateStr]
                    : day.isAvailable;
                const effectiveDay = { ...day, isAvailable };

                return (
                  <CalendarCell
                    key={`${rowIndex}-${colIndex}-${day.number}`}
                    day={effectiveDay}
                    index={rowIndex * 7 + colIndex}
                    scrollProgress={scrollProgress}
                    totalDays={35}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
