"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import {
  NATAL_CHILD_LOOKS,
  GENDER_FILTERS,
  SIZE_FILTERS,
  LookGender,
  LookSize,
} from "@/lib/data/natal-looks-data";
import { NatalFooter } from "@/components/natal/NatalFooter";

export default function NatalChildLooksPage() {
  const [selectedGender, setSelectedGender] = useState<"todos" | LookGender>("todos");
  const [selectedSize, setSelectedSize] = useState<"todas" | LookSize>("todas");
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Permite pré-filtrar via URL (?genero=menina ou ?genero=menino)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get("genero") || params.get("gender");
    if (g === "menina" || g === "menino") {
      setSelectedGender(g);
    }
  }, []);

  // Filtra os figurinos combinando Gênero + Tamanho
  const filteredLooks = useMemo(() => {
    return NATAL_CHILD_LOOKS.filter((look) => {
      const matchesGender =
        selectedGender === "todos" || look.gender === selectedGender;

      const matchesSize =
        selectedSize === "todas" || look.size === selectedSize;

      return matchesGender && matchesSize;
    });
  }, [selectedGender, selectedSize]);

  const hasActiveFilters = selectedGender !== "todos" || selectedSize !== "todas";

  const resetFilters = () => {
    setSelectedGender("todos");
    setSelectedSize("todas");
  };

  // Navegação por teclado no Lightbox
  const handlePrevLightbox = useCallback(() => {
    if (activeLightboxIndex === null || filteredLooks.length === 0) return;
    setActiveLightboxIndex(
      (activeLightboxIndex - 1 + filteredLooks.length) % filteredLooks.length
    );
  }, [activeLightboxIndex, filteredLooks.length]);

  const handleNextLightbox = useCallback(() => {
    if (activeLightboxIndex === null || filteredLooks.length === 0) return;
    setActiveLightboxIndex((activeLightboxIndex + 1) % filteredLooks.length);
  }, [activeLightboxIndex, filteredLooks.length]);

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

  const activeLook =
    activeLightboxIndex !== null ? filteredLooks[activeLightboxIndex] : null;

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

          {/* Link rápido para Inspirações */}
          <Link
            href="/natal/inspiracoes"
            className="hidden sm:inline-flex items-center min-h-[44px] px-3.5 rounded-full text-xs tracking-[0.16em] uppercase text-[#540b1c] hover:bg-[#540b1c]/10 transition-colors font-semibold"
          >
            <span>Inspirações</span>
          </Link>
        </div>
      </header>

      {/* Hero Editorial Compacto */}
      <section className="relative pt-10 pb-8 sm:pt-14 sm:pb-12 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-1.5 mb-5 rounded-full bg-[#540b1c]/10 border border-[#540b1c]/20 text-[#540b1c] text-xs tracking-[0.25em] uppercase font-semibold"
          >
            Acervo Infantil Exclusivo
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-[clamp(32px,6vw,56px)] leading-[1.1] font-serif text-[#2C2A29] mb-4"
          >
            Figurinos para as <span className="italic text-[#540b1c]">Crianças</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto text-sm sm:text-base text-[#595552] leading-relaxed font-normal"
          >
            Peças selecionadas na paleta oficial do nosso cenário de Natal, disponíveis
            em nosso estúdio para compor o ensaio dos pequenos com conforto e harmonia.
          </motion.p>
        </div>
      </section>

      {/* Superfície Conectada de Filtros */}
      <section
        aria-label="Filtros de Gênero e Tamanho"
        className="px-4 sm:px-6 pb-8"
      >
        <div className="max-w-6xl mx-auto bg-[#F5F2EC] border border-[#442f23]/15 rounded-2xl p-4 sm:p-6 shadow-[0_8px_24px_rgba(68,47,35,0.06)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            {/* Grupo 1: Gênero */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#442f23] shrink-0">
                Gênero:
              </span>
              <div
                role="group"
                aria-label="Filtrar por gênero"
                className="flex flex-wrap gap-2"
              >
                {GENDER_FILTERS.map((item) => {
                  const isActive = selectedGender === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedGender(item.id)}
                      aria-pressed={isActive}
                      className={`min-h-[44px] px-5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#540b1c] text-white shadow-sm"
                          : "bg-[#ded8ce]/60 text-[#2C2A29] hover:bg-[#ded8ce] border border-[#442f23]/15"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divisor sutil no Desktop */}
            <div
              className="hidden lg:block w-px h-8 bg-[#442f23]/15"
              aria-hidden="true"
            />

            {/* Grupo 2: Tamanho / Idade */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 flex-1">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#442f23] shrink-0">
                Tamanho:
              </span>
              <div
                role="group"
                aria-label="Filtrar por tamanho ou idade"
                className="flex flex-wrap gap-2"
              >
                {SIZE_FILTERS.map((item) => {
                  const isActive = selectedSize === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedSize(item.id)}
                      aria-pressed={isActive}
                      className={`min-h-[44px] px-4 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#194230] text-white shadow-sm"
                          : "bg-[#ded8ce]/60 text-[#2C2A29] hover:bg-[#ded8ce] border border-[#442f23]/15"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Barra de Status dos Resultados + Limpar Filtros */}
          <div className="mt-4 pt-3 border-t border-[#442f23]/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#595552]">
            <p aria-live="polite" className="font-medium">
              Exibindo{" "}
              <strong className="text-[#2C2A29] font-bold">
                {filteredLooks.length}
              </strong>{" "}
              {filteredLooks.length === 1 ? "opção disponível" : "opções disponíveis"}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3 -my-2 rounded-lg text-xs font-semibold text-[#540b1c] hover:bg-[#540b1c]/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grade de Figurinos: 1 coluna no mobile, 2 colunas sm/md, 3 colunas lg */}
      <section className="flex-1 px-4 sm:px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {filteredLooks.length === 0 ? (
            <div className="bg-[#F5F2EC] border border-[#442f23]/15 rounded-2xl p-10 sm:p-16 text-center max-w-xl mx-auto my-6">
              <h2 className="text-2xl font-serif text-[#2C2A29] mb-3">
                Nenhum figurino encontrado para esta combinação
              </h2>
              <p className="text-sm text-[#595552] mb-6">
                Tente selecionar outro tamanho ou visualizar todas as opções do
                catálogo infantil.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-full bg-[#540b1c] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#540b1c]/90 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Ver todas as roupas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              <AnimatePresence mode="popLayout">
                {filteredLooks.map((look, index) => {
                  return (
                    <motion.article
                      layout
                      key={look.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3 }}
                      className="group relative flex flex-col"
                    >
                      {/* Card Principal */}
                      <button
                        type="button"
                        onClick={() => setActiveLightboxIndex(index)}
                        aria-label={`Ampliar figurino tamanho ${look.size}`}
                        className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#ded8ce] border border-[#442f23]/15 shadow-[0_8px_24px_rgba(68,47,35,0.08)] text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#540b1c]"
                      >
                        <Image
                          src={look.image}
                          alt={`Figurino tamanho ${look.size}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Etiqueta de Tamanho exclusiva sobre a imagem */}
                        <div className="absolute top-3 left-3 px-3.5 py-1.5 rounded-full bg-[#2C2A29]/85 backdrop-blur-sm text-white text-xs font-bold tracking-[0.14em] uppercase shadow-sm">
                          {look.size}
                        </div>
                      </button>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Modal Lightbox ao clicar na foto */}
      <AnimatePresence>
        {activeLook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Figurino tamanho ${activeLook.size}`}
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
            {filteredLooks.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevLightbox();
                  }}
                  aria-label="Figurino anterior"
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
                  aria-label="Próximo figurino"
                  className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 min-w-[48px] min-h-[48px] rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Imagem Ampliada com Etiqueta de Tamanho sobreposta */}
            <div
              className="relative max-w-lg w-full bg-[#ded8ce] rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[3/4] w-full bg-[#ded8ce]">
                <Image
                  src={activeLook.image}
                  alt={`Figurino tamanho ${activeLook.size}`}
                  fill
                  sizes="(max-width: 768px) 95vw, 512px"
                  className="object-cover"
                  priority
                />
                <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-[#2C2A29]/85 backdrop-blur-sm text-white text-xs font-bold tracking-[0.14em] uppercase shadow-md">
                  {activeLook.size}
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
