"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Shirt,
} from "lucide-react";
import { NATAL_INSPIRACOES } from "@/lib/data/natal-inspiracoes-data";
import { NatalFooter } from "@/components/natal/NatalFooter";

export default function NatalInspiracoesPage() {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(
    null
  );

  const handlePrevLightbox = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex(
      (activeLightboxIndex - 1 + NATAL_INSPIRACOES.length) %
        NATAL_INSPIRACOES.length
    );
  }, [activeLightboxIndex]);

  const handleNextLightbox = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex(
      (activeLightboxIndex + 1) % NATAL_INSPIRACOES.length
    );
  }, [activeLightboxIndex]);

  useEffect(() => {
    if (activeLightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveLightboxIndex(null);
      if (e.key === "ArrowLeft") handlePrevLightbox();
      if (e.key === "ArrowRight") handleNextLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, handlePrevLightbox, handleNextLightbox]);

  const activeItem =
    activeLightboxIndex !== null
      ? NATAL_INSPIRACOES[activeLightboxIndex]
      : null;

  return (
    <div className="min-h-screen bg-[#ded8ce] text-[#2C2A29] flex flex-col selection:bg-[#540b1c] selection:text-white">
      {/* Header Discreto e Exclusivo */}
      <header className="sticky top-0 z-40 w-full bg-[#ded8ce]/90 backdrop-blur-md border-b border-[#442f23]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link
            href="/natal"
            className="inline-flex items-center gap-2 min-h-[44px] px-3 -ml-3 rounded-full text-xs tracking-[0.2em] uppercase text-[#442f23] hover:text-[#540b1c] hover:bg-[#442f23]/5 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Especial de Natal</span>
          </Link>

          <div className="font-serif italic text-xl sm:text-2xl text-[#2C2A29] tracking-tight">
            Hellen Ferreira
          </div>

          <Link
            href="/natal/looks"
            className="hidden sm:inline-flex items-center gap-2 min-h-[44px] px-3.5 rounded-full text-xs tracking-[0.16em] uppercase text-[#194230] hover:bg-[#194230]/10 transition-colors font-semibold"
          >
            <Shirt className="w-3.5 h-3.5 shrink-0" />
            <span>Looks Infantis</span>
          </Link>
        </div>
      </header>

      {/* Hero Editorial Compacto */}
      <section className="relative pt-10 pb-6 sm:pt-14 sm:pb-10 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-1.5 mb-5 rounded-full bg-[#194230]/10 border border-[#194230]/20 text-[#194230] text-xs tracking-[0.25em] uppercase font-semibold"
          >
            Guia Visual de Produção
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-[clamp(32px,6vw,56px)] leading-[1.1] font-serif text-[#2C2A29] mb-4"
          >
            Inspirações de <span className="italic text-[#540b1c]">Looks</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto text-sm sm:text-base text-[#595552] leading-relaxed font-normal"
          >
            Sugestões visuais de combinações de cores, sobreposições e texturas
            para inspirar a produção da sua família em harmonia com o nosso
            cenário de Natal.
          </motion.p>
        </div>
      </section>

      {/* Aviso Informativo de IA */}
      <section aria-label="Aviso sobre imagens de referência" className="px-4 sm:px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#F5F2EC] border border-[#540b1c]/20 rounded-2xl p-4 sm:p-5 shadow-[0_8px_24px_rgba(68,47,35,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#540b1c]/10 border border-[#540b1c]/20 text-[#540b1c] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[#540b1c]">
                  Informativo • Imagens geradas por IA (Apenas para Referência)
                </p>
                <p className="text-xs sm:text-sm text-[#595552] mt-0.5 leading-relaxed">
                  Estas imagens foram criadas por Inteligência Artificial
                  exclusivamente para demonstrar ideias de combinações de roupas
                  e cores dos adultos e famílias no cenário. Para ver as peças
                  reais disponíveis no estúdio para os pequenos, acesse o{" "}
                  <Link
                    href="/natal/looks"
                    className="font-semibold text-[#194230] underline underline-offset-2 hover:text-[#540b1c] transition-colors"
                  >
                    Acervo Infantil
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grade de Inspirações: 1 coluna no mobile, 2 colunas sm/md, 3 colunas lg */}
      <section className="flex-1 px-4 sm:px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {NATAL_INSPIRACOES.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (index % 3) * 0.06 }}
                className="group relative flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => setActiveLightboxIndex(index)}
                  aria-label={`Ampliar inspiração ${index + 1}`}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#ded8ce] border border-[#442f23]/15 shadow-[0_8px_24px_rgba(68,47,35,0.08)] text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#540b1c]"
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Etiqueta discreta de Referência IA */}
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#2C2A29]/80 backdrop-blur-sm text-white/95 text-[10px] font-semibold tracking-[0.14em] uppercase shadow-sm">
                    Referência IA
                  </div>
                </button>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Lightbox ao clicar na foto */}
      <AnimatePresence>
        {activeItem && activeLightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Inspiração de look ${activeLightboxIndex + 1}`}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveLightboxIndex(null)}
          >
            {/* Botão Fechar */}
            <button
              type="button"
              onClick={() => setActiveLightboxIndex(null)}
              aria-label="Fechar visualização"
              className="fixed top-4 right-4 z-50 min-w-[48px] min-h-[48px] rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navegação Anterior / Próxima */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevLightbox();
              }}
              aria-label="Inspiração anterior"
              className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 min-w-[48px] min-h-[48px] rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextLightbox();
              }}
              aria-label="Próxima inspiração"
              className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 min-w-[48px] min-h-[48px] rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Imagem Ampliada */}
            <div
              className="relative max-w-lg w-full bg-[#ded8ce] rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[3/4] w-full bg-[#ded8ce]">
                <Image
                  src={activeItem.image}
                  alt={activeItem.alt}
                  fill
                  sizes="(max-width: 768px) 95vw, 512px"
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-full bg-[#2C2A29]/85 backdrop-blur-sm text-white text-[11px] font-semibold tracking-[0.14em] uppercase shadow-md">
                  Imagem gerada por IA • Apenas referência
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rodapé Oficial da Campanha de Natal */}
      <NatalFooter />
    </div>
  );
}

