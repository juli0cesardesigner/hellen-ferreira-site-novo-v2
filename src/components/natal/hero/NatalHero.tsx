"use client";

import React, { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { Layer1Background } from "./Layer1Background";
import { Layer2Mask } from "./Layer2Mask";
import { Layer3Titles } from "./Layer3Titles";
import { CandleFlamesOverlay } from "./CandleFlamesOverlay";
import { NatalHeroProps } from "./types";

export function NatalHero({
  onCtaClick,
  ctaText,
  badgeText,
}: NatalHeroProps) {
  const containerRef = useRef<HTMLElement>(null);

  // Hook useScroll para calcular o progresso vertical da seção
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  /**
   * Configuração de Parallax Diferenciado por Camada:
   * Camada 1 (Fundo): move-se mais devagar para o fundo (profundidade)
   * Camada 2 (Máscara): move-se a uma velocidade intermediária
   * Camada 3 (Títulos): move-se para cima com fade suave e destaque
   */
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const maskY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const maskScale = useTransform(scrollYProgress, [0, 1], [1, 1.03]);

  const titlesY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const titlesOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.4, 0]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[95vh] md:h-screen min-h-[640px] max-h-[1080px] overflow-hidden bg-neutral-950"
      aria-label="Ensaio de Natal Hellen Ferreira - Apresentação"
    >
      {/* Camada 1 - Background */}
      <Layer1Background y={bgY} scale={bgScale} />

      {/* Camada 2 - Mask (Primeiro plano intermediário) */}
      <Layer2Mask y={maskY} scale={maskScale} />

      {/* Fogo das Velas (fora da máscara para o blend "screen" alcançar o fundo) */}
      <CandleFlamesOverlay y={maskY} scale={maskScale} />

      {/* Camada de Gradiente: 60deg (#5d3a26 para #724f39), modo de mesclagem multiplicar (sobre os bgs, abaixo dos títulos) */}
      <div
        className="absolute inset-0 z-25 pointer-events-none mix-blend-multiply"
        style={{
          background: "linear-gradient(60deg, #5d3a26, #724f39)",
        }}
        aria-hidden="true"
      />

      {/* Camada 3 - Títulos, Subtítulos e Ação */}
      <Layer3Titles
        y={titlesY}
        opacity={titlesOpacity}
        onCtaClick={onCtaClick}
        ctaText={ctaText}
        badgeText={badgeText}
      />

      {/* Gradiente sutil na base para transição fluida para as próximas dobras */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent z-40 pointer-events-none" />
    </section>
  );
}

export * from "./types";
