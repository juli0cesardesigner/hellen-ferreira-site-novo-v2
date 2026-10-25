"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const LIGHT_PHASES = [
  {
    desktopSrc: "/natal/dobra1/luzes_fases/fase_luz_1.webp",
    mobileSrc: "/natal/dobra1/luzes_mobile_fases/fase_luz_mobile_1.webp",
    duration: 3.2,
    delay: 0,
    times: [0, 0.25, 0.5, 0.75, 1],
    opacityKeyframes: [0.25, 0.95, 0.4, 1, 0.25],
  },
  {
    desktopSrc: "/natal/dobra1/luzes_fases/fase_luz_2.webp",
    mobileSrc: "/natal/dobra1/luzes_mobile_fases/fase_luz_mobile_2.webp",
    duration: 3.8,
    delay: 0.8,
    times: [0, 0.3, 0.6, 0.85, 1],
    opacityKeyframes: [0.35, 1, 0.2, 0.85, 0.35],
  },
  {
    desktopSrc: "/natal/dobra1/luzes_fases/fase_luz_3.webp",
    mobileSrc: "/natal/dobra1/luzes_mobile_fases/fase_luz_mobile_3.webp",
    duration: 2.7,
    delay: 1.4,
    times: [0, 0.2, 0.55, 0.8, 1],
    opacityKeyframes: [0.2, 0.85, 1, 0.3, 0.2],
  },
  {
    desktopSrc: "/natal/dobra1/luzes_fases/fase_luz_4.webp",
    mobileSrc: "/natal/dobra1/luzes_mobile_fases/fase_luz_mobile_4.webp",
    duration: 4.2,
    delay: 0.4,
    times: [0, 0.35, 0.65, 0.9, 1],
    opacityKeyframes: [0.4, 0.95, 0.3, 1, 0.4],
  },
];

export function ChristmasLightsOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden"
      style={{ mixBlendMode: "screen" }}
      aria-hidden="true"
    >
      {LIGHT_PHASES.map((phase, idx) => (
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
          {/* Luzes Desktop */}
          <div className="hidden md:block relative w-full h-full">
            <Image
              src={phase.desktopSrc}
              alt="Luzes de Natal cintilantes"
              fill
              unoptimized
              sizes="100vw"
              className="object-cover object-center"
              priority={idx < 2}
            />
          </div>

          {/* Luzes Mobile */}
          <div className="block md:hidden relative w-full h-full">
            <Image
              src={phase.mobileSrc}
              alt="Luzes de Natal cintilantes mobile"
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
