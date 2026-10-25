"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { Dobra3LightsOverlay } from "./Dobra3LightsOverlay";

export function NatalDobra3() {
  return (
    <section
      className="relative w-full min-h-screen pt-20 md:pt-28 pb-0 px-0 flex flex-col items-center justify-between overflow-hidden bg-[#ded8ce]"
      aria-label="Guia de Estilo, Paleta e Estampas do Especial de Natal"
    >
      {/* 1. Backgrounds Temáticos (Desktop & Mobile) com transição suave */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {/* Background Desktop */}
        <div className="hidden md:block relative w-full h-full opacity-60">
          <Image
            src="/natal/dobra3/desktop_dobra3.webp"
            alt="Fundo Cenário Especial de Natal Hellen Ferreira"
            fill
            sizes="100vw"
            className="object-cover object-center"
            quality={90}
            priority
          />
        </div>

        {/* Background Mobile */}
        <div className="block md:hidden relative w-full h-full opacity-60">
          <Image
            src="/natal/dobra3/mobile_dobra3.webp"
            alt="Fundo Cenário Especial de Natal Hellen Ferreira Mobile"
            fill
            sizes="100vw"
            className="object-cover object-center"
            quality={90}
            priority
          />
        </div>

        {/* Gradiente sutil para harmonizar a leitura do texto */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#ded8ce]/90 via-[#ded8ce]/50 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* 2. Conteúdo Central (Título, Paletas e Estampas) */}
      <div className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center text-center">
        {/* Título: GUIA DE CORES */}
        <div className="relative w-full max-w-[340px] sm:max-w-[480px] md:max-w-[560px] aspect-[635/49] mb-8 md:mb-12">
          <Image
            src="/natal/dobra3/titulo_mobile_dobra3.webp"
            alt="Guia de Cores - Especial de Natal"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Cards de Paletas e Estampas sem efeitos artificiais */}
        <div className="w-full flex flex-col gap-6 sm:gap-8 md:gap-10 items-center justify-center">
          {/* Card 1: Paleta Principal */}
          <div className="relative w-full max-w-[850px] aspect-[1000/285]">
            <Image
              src="/natal/dobra3/paleta_principal_dobra3.png"
              alt="Paleta Principal: Vinho, Verde, Black, Red, Off-White, Musgo"
              fill
              sizes="(max-width: 768px) 96vw, 850px"
              className="object-contain w-full h-full"
              priority
            />
          </div>

          {/* Card 2: Paleta de Apoio */}
          <div className="relative w-full max-w-[850px] aspect-[1000/285]">
            <Image
              src="/natal/dobra3/paleta_apoio_dobra3.png"
              alt="Paleta de Apoio: Marrom, Bege, Terracota, Oliva, Creme, Mel"
              fill
              sizes="(max-width: 768px) 96vw, 850px"
              className="object-contain w-full h-full"
            />
          </div>

          {/* Card 3: Estampas e Texturas */}
          <div className="relative w-full max-w-[850px] aspect-[1000/285]">
            <Image
              src="/natal/dobra3/estampas_dobra3.png?v=2"
              alt="Estampas e Tecidos Recomendados: Veludo, Tricô, Xadrez, Floral"
              fill
              unoptimized
              sizes="(max-width: 768px) 96vw, 850px"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* 3. Bottom Decorativo (Mesa de Natal) - Preenche 100% da largura da tela e encosta na base */}
      <div className="relative z-10 w-full mt-auto select-none pointer-events-none leading-none -mb-[1px]">
        {/* Mesa de Natal Desktop */}
        <div className="hidden md:block relative w-full aspect-[3718/622]">
          <Image
            src="/natal/dobra3/bottom_desktop_dobra3.webp"
            alt="Mesa Decorada de Natal Hellen Ferreira"
            fill
            sizes="100vw"
            className="object-cover object-bottom w-full h-full"
            quality={95}
          />
          {/* Sistema de Luzes da Mesa Desktop */}
          <Dobra3LightsOverlay />
        </div>

        {/* Mesa de Natal Mobile */}
        <div className="block md:hidden relative w-full aspect-[1861/622]">
          <Image
            src="/natal/dobra3/bottom_mobile_dobra3.webp"
            alt="Mesa Decorada de Natal Hellen Ferreira Mobile"
            fill
            sizes="100vw"
            className="object-cover object-bottom w-full h-full"
            quality={90}
          />
          {/* Sistema de Luzes da Mesa Mobile */}
          <Dobra3LightsOverlay />
        </div>
      </div>
    </section>
  );
}
