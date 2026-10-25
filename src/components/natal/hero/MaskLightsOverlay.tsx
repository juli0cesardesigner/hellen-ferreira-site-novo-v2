"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const MASK_LIGHT_PHASES = [
  {
    desktopSrc: "/natal/dobra1/luzes_mascara_fases/fase_luz_mask_1.webp",
    mobileSrc: "/natal/dobra1/luzes_mascara_fases/fase_luz_mask_mobile_1.webp",
    duration: 3.4,
    delay: 0.2,
    times: [0, 0.25, 0.5, 0.75, 1],
    opacityKeyframes: [0.25, 1, 0.35, 0.9, 0.25],
  },
  {
    desktopSrc: "/natal/dobra1/luzes_mascara_fases/fase_luz_mask_2.webp",
    mobileSrc: "/natal/dobra1/luzes_mascara_fases/fase_luz_mask_mobile_2.webp",
    duration: 2.9,
    delay: 1.1,
    times: [0, 0.3, 0.6, 0.85, 1],
    opacityKeyframes: [0.35, 0.85, 0.2, 1, 0.35],
  },
  {
    desktopSrc: "/natal/dobra1/luzes_mascara_fases/fase_luz_mask_3.webp",
    mobileSrc: "/natal/dobra1/luzes_mascara_fases/fase_luz_mask_mobile_3.webp",
    duration: 3.9,
    delay: 0.6,
    times: [0, 0.2, 0.55, 0.8, 1],
    opacityKeyframes: [0.2, 0.95, 0.85, 0.3, 0.2],
  },
  {
    desktopSrc: "/natal/dobra1/luzes_mascara_fases/fase_luz_mask_4.webp",
    mobileSrc: "/natal/dobra1/luzes_mascara_fases/fase_luz_mask_mobile_4.webp",
    duration: 3.1,
    delay: 1.6,
    times: [0, 0.35, 0.65, 0.9, 1],
    opacityKeyframes: [0.3, 1, 0.25, 0.95, 0.3],
  },
];

export function MaskLightsOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden"
      style={{ mixBlendMode: "screen" }}
      aria-hidden="true"
    >
      {MASK_LIGHT_PHASES.map((phase, idx) => (
        <motion.div
          key={idx}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: phase.opacityKeyframes[0] }}
          animate={{
            opacity: phase.opacityKeyframes,
          }}
          transition={{
            duration: phase.duration,
            delay: phase.delay,
            repeat: Infinity,
            ease: "easeInOut",
            times: phase.times,
          }}
        >
          {/* Luzes da Máscara Desktop */}
          <div className="hidden md:block relative w-full h-full">
            <Image
              src={phase.desktopSrc}
              alt="Luzes de Natal da máscara cintilantes"
              fill
              unoptimized
              sizes="100vw"
              className="object-cover object-center"
              priority={idx < 2}
            />
          </div>

          {/* Luzes da Máscara Mobile */}
          <div className="block md:hidden relative w-full h-full">
            <Image
              src={phase.mobileSrc}
              alt="Luzes de Natal da máscara cintilantes mobile"
              fill
              unoptimized
              sizes="100vw"
              className="object-cover object-center"
              priority={idx < 2}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
