"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll } from "framer-motion";
import { DynamicChristmasCalendar } from "./DynamicChristmasCalendar";

export function NatalCalendarSection() {
  const sectionRef = useRef<HTMLElement>(null);

  /**
   * Monitora a aproximação e entrada da Dobra 2 no viewport:
   * - "start end": Quando a borda superior da Dobra 2 entra na parte inferior da tela (0.0)
   * - "start start": Quando o topo da Dobra 2 toca o topo exato da tela (1.0)
   * Dessa forma, à medida que o usuário rola a página, os números vão surgindo proporcionalmente.
   * Ao rolar de volta para cima, o efeito inverte perfeitamente.
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen py-24 pl-9 pr-4 sm:px-8 md:px-10 flex flex-col items-center justify-center overflow-hidden bg-neutral-950"
      aria-label="Datas e Calendário do Especial de Natal"
    >
      {/* 1. Background com Imagem Desktop & Mobile */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {/* Imagem Desktop */}
        <div className="hidden md:block relative w-full h-full">
          <Image
            src="/natal/dobra2/desktop_dobra2_bg.webp"
            alt="Fundo Dobra 2 Natal"
            fill
            sizes="100vw"
            className="object-cover object-center"
            quality={90}
          />
        </div>

        {/* Imagem Mobile */}
        <div className="block md:hidden relative w-full h-full">
          <Image
            src="/natal/dobra2/mobile_dobra2_bg.webp"
            alt="Fundo Dobra 2 Natal"
            fill
            sizes="100vw"
            className="object-cover object-center"
            quality={90}
          />
        </div>
      </div>

      {/* 2. Camada de Gradiente Verde suave e integrada por toda a seção */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(15, 26, 5, 0.85) 0%, rgba(34, 43, 26, 0.7) 65%, rgba(15, 26, 5, 0.9) 100%)",
        }}
        aria-hidden="true"
      />

      {/* 3. Conteúdo da Dobra 2: Título e Calendário */}
      <div className="relative z-20 max-w-5xl w-full flex flex-col items-center justify-center text-center">
        {/* Título da Dobra 2 */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-[500px] md:max-w-[620px] aspect-[2595/606] mb-8 md:mb-12 drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
        >
          <Image
            src="/natal/dobra2/titulo_dobra2.webp"
            alt="Título Dobra 2 Especial de Natal"
            fill
            sizes="(max-width: 768px) 90vw, 620px"
            className="object-contain"
          />
        </motion.div>

        {/* Calendário Dinâmico em SVGs acionado pelo progresso contínuo de scroll */}
        <DynamicChristmasCalendar scrollProgress={scrollYProgress} />
      </div>
    </section>
  );
}
