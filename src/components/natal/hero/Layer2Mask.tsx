"use client";

import Image from "next/image";
import { motion, MotionValue } from "framer-motion";

import { MaskLightsOverlay } from "./MaskLightsOverlay";

interface Layer2MaskProps {
  y: MotionValue<number>;
  scale?: MotionValue<number>;
}

export function Layer2Mask({ y, scale }: Layer2MaskProps) {
  return (
    <motion.div
      style={{ y, scale }}
      className="absolute inset-0 z-20 pointer-events-none will-change-transform select-none"
    >
      {/* Máscara Desktop */}
      <div className="hidden md:block relative w-full h-full">
        <Image
          src="/natal/dobra1/desktop_dobra1_mask.webp"
          alt="Primeiro plano elementos de Natal"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Máscara Mobile */}
      <div className="block md:hidden relative w-full h-full">
        <Image
          src="/natal/dobra1/mobile_dobra1_mask.webp"
          alt="Primeiro plano elementos de Natal"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Luzes da Máscara (Primeiro Plano) */}
      <MaskLightsOverlay />
    </motion.div>
  );
}
