"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Info, Shirt } from "lucide-react";

interface ShowcaseCardItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  ctaLabel: string;
  image: string;
  imageAlt: string;
  imageTag?: string;
  accentColor: string;
  isAiReference?: boolean;
}

const SHOWCASE_CARDS: ShowcaseCardItem[] = [
  {
    id: "looks-meninas",
    badge: "Acervo do Estúdio",
    title: "Looks de Meninas",
    subtitle: "Tamanhos P ao 2 anos",
    description:
      "Vestidos, tricôs e peças delicadas disponíveis em nosso estúdio na paleta oficial do cenário.",
    href: "/natal/looks?genero=menina",
    ctaLabel: "Ver Looks de Meninas",
    image: "/natal/looks/as/IMG_6782.webp",
    imageAlt: "Figurino infantil feminino disponível no estúdio para o Ensaio de Natal",
    imageTag: "Peças Reais do Acervo",
    accentColor: "#540b1c",
  },
  {
    id: "looks-meninos",
    badge: "Acervo do Estúdio",
    title: "Looks de Meninos",
    subtitle: "Tamanhos P ao 2 anos",
    description:
      "Jardineiras, camisas e tricôs selecionados em nosso acervo para o conforto dos pequenos.",
    href: "/natal/looks?genero=menino",
    ctaLabel: "Ver Looks de Meninos",
    image: "/natal/looks/os/IMG_6805.webp",
    imageAlt: "Figurino infantil masculino disponível no estúdio para o Ensaio de Natal",
    imageTag: "Peças Reais do Acervo",
    accentColor: "#194230",
  },
  {
    id: "inspiracoes-ia",
    badge: "Guia Visual • Família & Adultos",
    title: "Inspirações de Looks",
    subtitle: "Combinações no Cenário",
    description:
      "Ideias de combinações de cores e tecidos para toda a família. Imagens geradas por IA, apenas para referência.",
    href: "/natal/inspiracoes",
    ctaLabel: "Ver Inspirações",
    image: "/natal/inspiracoes/inspiracao-05.webp",
    imageAlt: "Inspiração de produção familiar no cenário de Natal (gerada por IA para referência)",
    imageTag: "Gerada por IA • Referência",
    accentColor: "#442f23",
    isAiReference: true,
  },
];

export function NatalLooksSection() {
  return (
    <section
      id="figurinos-e-inspiracoes"
      className="relative w-full pt-20 pb-8 md:pt-28 md:pb-12 px-4 sm:px-6 md:px-8 bg-[#ded8ce] text-[#2C2A29] overflow-hidden"
      aria-label="Acervo de Looks Infantis e Inspirações de Produção"
    >
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho da Dobra */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-1.5 mb-4 rounded-full bg-[#540b1c]/10 border border-[#540b1c]/20 text-[#540b1c] text-xs tracking-[0.24em] uppercase font-semibold"
          >
            Acervo & Guia de Produção
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-[clamp(30px,5vw,50px)] leading-[1.12] font-serif text-[#2C2A29] mb-4"
          >
            Figurinos Infantis &{" "}
            <span className="italic text-[#540b1c]">Inspirações</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base text-[#595552] leading-relaxed"
          >
            Consulte as opções de roupas infantis disponíveis em nosso estúdio
            para meninos e meninas, ou inspire-se em nossas referências visuais
            para montar o look de toda a família.
          </motion.p>
        </div>

        {/* Grade de 3 Cards: Meninas | Meninos | Inspirações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-8">
          {SHOWCASE_CARDS.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.65,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex"
            >
              <Link
                href={card.href}
                className="group relative flex flex-col w-full rounded-[24px] bg-[#F5F2EC] border border-[#442f23]/15 overflow-hidden shadow-[0_14px_32px_rgba(68,47,35,0.1)] hover:shadow-[0_20px_40px_rgba(68,47,35,0.16)] transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#540b1c]"
              >
                {/* Imagem de Capa */}
                <div className="relative aspect-[4/4.6] w-full overflow-hidden bg-[#ded8ce]">
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                    aria-hidden="true"
                  />

                  {/* Etiqueta superior */}
                  {card.imageTag && (
                    <div className="absolute top-3.5 left-3.5 px-3.5 py-1.5 rounded-full bg-[#2C2A29]/85 backdrop-blur-sm text-white text-[11px] font-semibold tracking-[0.14em] uppercase shadow-sm">
                      {card.imageTag}
                    </div>
                  )}

                  {/* Subtítulo na base da foto */}
                  <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                      {card.badge}
                    </span>
                    <span className="text-xs font-medium text-white/85">
                      {card.subtitle}
                    </span>
                  </div>
                </div>

                {/* Corpo do Card */}
                <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between gap-5">
                  <div>
                    <h3 className="text-2xl font-serif text-[#2C2A29] mb-2 group-hover:text-[#540b1c] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#595552] leading-relaxed">
                      {card.description}
                    </p>

                    {card.isAiReference && (
                      <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#442f23]/10 border border-[#442f23]/20 text-[#442f23] text-xs font-medium">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span>Imagens geradas por IA (apenas referência)</span>
                      </div>
                    )}
                  </div>

                  {/* Botão CTA */}
                  <div
                    className="w-full min-h-[48px] px-5 rounded-full text-white text-xs font-semibold uppercase tracking-[0.18em] flex items-center justify-between transition-opacity group-hover:opacity-95 shadow-sm"
                    style={{ backgroundColor: card.accentColor }}
                  >
                    <span>{card.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Atalho complementar para ver todos os looks infantis juntos */}
        <div className="mt-8 text-center">
          <Link
            href="/natal/looks"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.18em] text-[#442f23] hover:text-[#540b1c] hover:bg-[#442f23]/5 transition-colors"
          >
            <Shirt className="w-4 h-4" />
            <span>Ver catálogo infantil completo (Meninos e Meninas)</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

