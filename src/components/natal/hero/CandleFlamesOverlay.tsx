"use client";

import React from "react";
import { motion, MotionValue } from "framer-motion";

interface CandleFlamesOverlayProps {
  y?: MotionValue<number>;
  scale?: MotionValue<number>;
}

/**
 * Vídeo das chamas (fundo preto) mesclado via `screen`.
 * IMPORTANTE: precisa ficar no nível da <section> (fora de camadas com transform),
 * pois transform/will-change criam um grupo isolado e o preto do vídeo
 * passaria a cobrir o background (Layer1) em vez de ser mesclado.
 * O blend é aplicado no próprio motion.div para mesclar com tudo que está abaixo.
 */
export function CandleFlamesOverlay({ y, scale }: CandleFlamesOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 z-[25] pointer-events-none select-none overflow-hidden will-change-transform"
      style={{ y, scale, mixBlendMode: "screen" }}
      aria-hidden="true"
    >
      {/* Velas Desktop */}
      <div className="hidden md:block relative w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        >
          <source src="/natal/dobra1/velas/desktop_velas.webm" type="video/webm" />
          <source src="/natal/dobra1/velas/desktop_velas.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Velas Mobile */}
      <div className="block md:hidden relative w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        >
          <source src="/natal/dobra1/velas/mobile_velas.webm" type="video/webm" />
          <source src="/natal/dobra1/velas/mobile_velas.mp4" type="video/mp4" />
        </video>
      </div>
    </motion.div>
  );
}
