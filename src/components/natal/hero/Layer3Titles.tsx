"use client";

import Image from "next/image";
import { motion, MotionValue } from "framer-motion";

interface Layer3TitlesProps {
  y: MotionValue<number>;
  opacity?: MotionValue<number>;
  onCtaClick?: () => void;
  ctaText?: string;
  badgeText?: string;
}

export function Layer3Titles({
  y,
  opacity,
  onCtaClick,
}: Layer3TitlesProps) {
  const handleClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      const target =
        document.getElementById("precos") ||
        document.getElementById("agenda-aberta");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };
  return (
    <motion.div
      style={{ y, opacity }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none px-4 text-center will-change-transform"
    >
      <div className="max-w-4xl w-full flex flex-col items-center justify-center pt-8 md:pt-4">

        {/* Título Artístico renderizado com alta fidelidade */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[580px] md:max-w-[720px] aspect-[2778/1524] drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
        >
          <Image
            src="/natal/dobra1/titulo_dobra1.webp"
            alt="Especial de Natal Hellen Ferreira"
            fill
            priority
            sizes="(max-width: 768px) 90vw, 720px"
            className="object-contain"
          />
        </motion.div>

        {/* Subtítulo Artístico */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: "easeOut" }}
          className="relative w-full max-w-[420px] md:max-w-[540px] aspect-[2500/565] -mt-2 md:-mt-4 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
        >
          <Image
            src="/natal/dobra1/sub-titulo_dobra1.webp"
            alt="Crie memórias inesquecíveis para a sua família"
            fill
            priority
            sizes="(max-width: 768px) 80vw, 540px"
            className="object-contain"
          />
        </motion.div>

        {/* Call to Action com micro-animação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: "easeOut" }}
          className="mt-6 md:mt-8 pointer-events-auto flex items-center justify-center"
        >
          <button
            onClick={handleClick}
            aria-label="Garantir Minha Vaga"
            className="group relative block w-[280px] sm:w-[320px] md:w-[360px] aspect-[502.06/66.13] transition-transform duration-300 ease-out hover:scale-[1.04] active:scale-[0.98] drop-shadow-[0_10px_24px_rgba(0,0,0,0.5)] hover:drop-shadow-[0_16px_32px_rgba(0,0,0,0.7)] focus:outline-none"
          >
            <Image
              src="/natal/dobra1/dobra1_CTA.webp"
              alt="Garantir Minha Vaga"
              fill
              sizes="(max-width: 768px) 320px, 360px"
              className="object-contain w-full h-full pointer-events-none select-none"
              priority
            />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
