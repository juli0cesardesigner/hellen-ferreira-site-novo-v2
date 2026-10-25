"use client";

import React from "react";
import Image from "next/image";

export function NatalDobra5() {
  return (
    <section
      id="agenda-aberta"
      className="relative w-full overflow-hidden bg-[#0a0807] select-none"
      aria-label="Agenda Aberta - Natal 2026 Hellen Ferreira"
    >
      {/* Versão Desktop (16:9) */}
      <div className="hidden md:block relative w-full aspect-[2560/1440]">
        <Image
          src="/natal/dobra5/dobra5_desktop.webp"
          alt="Agenda Aberta - Natal 2026 - O som das nossas lembranças"
          fill
          sizes="100vw"
          quality={90}
          className="object-cover object-center w-full h-full"
          priority
        />
      </div>

      {/* Versão Mobile (4:5) */}
      <div className="block md:hidden relative w-full aspect-[1080/1350]">
        <Image
          src="/natal/dobra5/dobra5_mobile.webp"
          alt="Agenda Aberta - Natal 2026 - O som das nossas lembranças"
          fill
          sizes="100vw"
          quality={90}
          className="object-cover object-center w-full h-full"
          priority
        />
      </div>
    </section>
  );
}
