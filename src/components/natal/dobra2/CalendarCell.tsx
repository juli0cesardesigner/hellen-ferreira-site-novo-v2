"use client";

import React from "react";
import Image from "next/image";
import { motion, MotionValue, useTransform } from "framer-motion";
import { CalendarDay } from "./calendar-data";

interface CalendarCellProps {
  day: CalendarDay;
  index: number;
  scrollProgress: MotionValue<number>;
  totalDays?: number;
}

export function CalendarCell({
  day,
  index,
  scrollProgress,
  totalDays = 35,
}: CalendarCellProps) {
  const isAvailable = day.isAvailable;

  /**
   * Cálculo de janela de surgimento por número:
   * O calendário começa a revelar os números a partir de 0.25 do scroll (quando entra no campo de visão)
   * e completa 100% de todos os números exatamente quando o topo da dobra toca o limite superior (1.0).
   * À medida que rola para baixo: surgem em sequência fluida.
   * Ao rolar de volta para cima: desvanecem no sentido inverso perfeitamente.
   */
  const startReveal = 0.25;
  const endReveal = 0.98;
  const step = (endReveal - startReveal) / totalDays;

  const itemStart = startReveal + index * step;
  const itemEnd = Math.min(1.0, itemStart + step * 1.5);

  const opacity = useTransform(scrollProgress, [itemStart, itemEnd], [0, 1]);
  const scale = useTransform(scrollProgress, [itemStart, itemEnd], [0.65, 1]);
  const y = useTransform(scrollProgress, [itemStart, itemEnd], [12, 0]);

  const handleClick = () => {
    if (isAvailable) {
      const target = document.getElementById("precos") || document.getElementById("agenda-aberta");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="relative flex items-center justify-center aspect-square select-none group"
    >
      {/* Exibe apenas os dias que ainda estão disponíveis */}
      {isAvailable ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label={`Dia ${day.number} de ${day.month} - Vagas disponíveis`}
          className="relative w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-[#e3ab6e] flex items-center justify-center shadow-md shadow-black/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_18px_rgba(227,171,110,0.6)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          {/* Número do dia com altura tipográfica rigorosamente padronizada */}
          <div className="relative h-[18px] sm:h-[20px] md:h-[22px] w-full flex items-center justify-center [filter:brightness(0)_saturate(100%)_invert(17%)_sepia(45%)_saturate(1142%)_hue-rotate(345deg)_brightness(94%)_contrast(91%)]">
            <Image
              src={`/natal/dobra2/calendario/${day.svgFile}`}
              alt={`Dia ${day.number}`}
              width={40}
              height={25}
              className="h-full w-auto object-contain pointer-events-none"
            />
          </div>
        </button>
      ) : (
        /* Dia não disponível: não exibe o número, mantendo apenas o espaço estrutural da coluna */
        <div
          className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
