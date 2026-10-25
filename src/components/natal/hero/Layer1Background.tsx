"use client";

import Image from "next/image";
import { motion, MotionValue } from "framer-motion";

import { ChristmasLightsOverlay } from "./ChristmasLightsOverlay";

interface Layer1BackgroundProps {
  y: MotionValue<number>;
  scale?: MotionValue<number>;
}

export function Layer1Background({ y, scale }: Layer1BackgroundProps) {
  return (
    <motion.div
      style={{ y, scale }}
      className="absolute inset-0 z-0 pointer-events-none will-change-transform select-none"
    >
      {/* Imagem Desktop */}
      <div className="hidden md:block relative w-full h-full">
        <Image
          src="/natal/dobra1/desktop_dobra1_bg.webp"
          alt="Cenário de Natal Hellen Ferreira Fotografia"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Imagem Mobile */}
      <div className="block md:hidden relative w-full h-full">
        <Image
          src="/natal/dobra1/mobile_dobra1_bg.webp"
          alt="Cenário de Natal Hellen Ferreira Fotografia"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Luzes de Natal cintilantes sobrepostas ao cenário */}
      <ChristmasLightsOverlay />
    </motion.div>
  );
}
