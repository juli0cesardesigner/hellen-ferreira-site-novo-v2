"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const DOBRA3_LIGHT_PHASES = [
  {
    desktopSrc: "/natal/dobra3/luzes_fases/fase_luz_dobra3_1.webp",
    mobileSrc: "/natal/dobra3/luzes_fases/fase_luz_dobra3_mobile_1.webp",
    duration: 3.3,
    delay: 0.1,
    times: [0, 0.25, 0.5, 0.75, 1],
    opacityKeyframes: [0.25, 1, 0.35, 0.9, 0.25],
  },
  {
    desktopSrc: "/natal/dobra3/luzes_fases/fase_luz_dobra3_2.webp",
    mobileSrc: "/natal/dobra3/luzes_fases/fase_luz_dobra3_mobile_2.webp",
    duration: 2.8,
    delay: 0.9,
    times: [0, 0.3, 0.6, 0.85, 1],
    opacityKeyframes: [0.35, 0.85, 0.2, 1, 0.35],
  },
  {
    desktopSrc: "/natal/dobra3/luzes_fases/fase_luz_dobra3_3.webp",
    mobileSrc: "/natal/dobra3/luzes_fases/fase_luz_dobra3_mobile_3.webp",
    duration: 3.7,
    delay: 0.5,
    times: [0, 0.2, 0.55, 0.8, 1],
    opacityKeyframes: [0.2, 0.95, 0.85, 0.3, 0.2],
  },
  {
    desktopSrc: "/natal/dobra3/luzes_fases/fase_luz_dobra3_4.webp",
    mobileSrc: "/natal/dobra3/luzes_fases/fase_luz_dobra3_mobile_4.webp",
    duration: 3.0,
    delay: 1.4,
    times: [0, 0.35, 0.65, 0.9, 1],
    opacityKeyframes: [0.3, 1, 0.25, 0.95, 0.3],
  },
];

export function Dobra3LightsOverlay() {
  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden mix-blend-color-dodge filter brightness-110 saturate-125"
      aria-hidden="true"
    >
      {DOBRA3_LIGHT_PHASES.map((phase, idx) => (
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
          {/* Luzes Desktop da Mesa */}
          <div className="hidden md:block relative w-full h-full">
            <Image
              src={phase.desktopSrc}
              alt="Luzes decorativas da mesa de Natal"
              fill
              sizes="100vw"
              className="object-cover object-bottom w-full h-full"
              priority={idx < 2}
            />
          </div>

          {/* Luzes Mobile da Mesa */}
          <div className="block md:hidden relative w-full h-full">
            <Image
              src={phase.mobileSrc}
              alt="Luzes decorativas da mesa de Natal mobile"
              fill
              sizes="100vw"
              className="object-cover object-bottom w-full h-full"
              priority={idx < 2}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
