"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------------------------------------------------------------- */
/*  Dobra 4 — Tabela de Preços (3 packs)                                      */
/*  Desktop: 3 cards na horizontal | Mobile: empilhados na vertical           */
/*  Cada card possui toggle DIGITAL / IMPRESSA (SVGs são os próprios botões)  */
/*  Ativo = 100% opacidade | Inativo = 30% opacidade                          */
/* -------------------------------------------------------------------------- */

type Modalidade = "digital" | "impressa";

const BASE = "/natal/dobra4";

// Dimensões do card em unidades do Illustrator (largura do packX_bg.svg).
// Altura aumentada de 371.83 → 484 para acomodar o botão AGENDAR.
const CARD_W = 343.42;
const CARD_H = 484;
const CARD_RADIUS = 25.4; // rx original do packX_bg.svg

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

// Textos de apoio (compartilhados entre os packs)
const APOIO: Record<Modalidade, { src: string; w: number; h: number; alt: string }> = {
  digital: {
    src: `${BASE}/apoio_sob_preco_digital.webp`,
    w: 206.26,
    h: 17.11,
    alt: "Otimizada para Redes Sociais",
  },
  impressa: {
    src: `${BASE}/apoio_sob_preco_impressa.webp`,
    w: 219.51,
    h: 35.53,
    alt: "Fotos impressas",
  },
};

interface PackAsset {
  src: string;
  w: number;
  h: number;
}

interface Pack {
  id: string;
  nome: string;
  cor: string;
  fotos: string;
  precos: Record<Modalidade, string>;
  titulo: PackAsset;
  fotosImg: PackAsset;
  precoImg: Record<Modalidade, PackAsset>;
}

const PACKS: Pack[] = [
  {
    id: "pack1",
    nome: "Mini Ensaio — somente o baby",
    cor: "#442f23",
    fotos: "10 fotos",
    precos: { digital: "R$ 450", impressa: "R$ 500" },
    titulo: { src: `${BASE}/pack1/pack1_titulo.webp`, w: 203.02, h: 73.43 },
    fotosImg: { src: `${BASE}/pack1/pack1_fotos.webp`, w: 143.03, h: 61.83 },
    precoImg: {
      digital: { src: `${BASE}/pack1/pack1_preco_digital.webp`, w: 167.75, h: 100.95 },
      impressa: { src: `${BASE}/pack1/pack1_preso_impressa.webp`, w: 174.75, h: 100.95 },
    },
  },
  {
    id: "pack2",
    nome: "Família — pais e irmãos",
    cor: "#194230",
    fotos: "25 fotos",
    precos: { digital: "R$ 600", impressa: "Preço impressa" },
    titulo: { src: `${BASE}/pack2/pack2_titulo.webp`, w: 131.58, h: 57.24 },
    fotosImg: { src: `${BASE}/pack2/pack2_fotos.webp`, w: 143.28, h: 23.76 },
    precoImg: {
      digital: { src: `${BASE}/pack2/pack2_preco_digital.webp`, w: 176.23, h: 47.05 },
      impressa: { src: `${BASE}/pack2/pack2_preco_impressa.webp`, w: 166.53, h: 47.05 },
    },
  },
  {
    id: "pack3",
    nome: "Completo — família + acompanhantes",
    cor: "#540b1c",
    fotos: "40 fotos",
    precos: { digital: "R$ 800", impressa: "Preço impressa" },
    titulo: { src: `${BASE}/pack3/pack3_titulo.webp`, w: 224.32, h: 51.48 },
    fotosImg: { src: `${BASE}/pack3/pack3_fotos.webp`, w: 147.93, h: 23.76 },
    precoImg: {
      digital: { src: `${BASE}/pack3/pack3_preco_digital.webp`, w: 175.68, h: 47.05 },
      impressa: { src: `${BASE}/pack3/pack3_preco_impressa.webp`, w: 167.88, h: 47.05 },
    },
  },
];

// Posições verticais (topo de cada bloco, em unidades do card 343.42 × 371.83) — baseadas na referência visual
const POS = {
  titulo: 30,
  fotos: 114,
  toggle: 172,
  preco: 252,
  apoio: 316,
  agendar: 376,
};

const TOGGLE_W = 133.55;
const TOGGLE_H = 51.85;
const AGENDAR_W = 267.11;
const AGENDAR_H = 66.13;

const PACK_SLUGS: Record<string, string> = {
  pack1: "mini-ensaio-baby",
  pack2: "familia-pais-irmaos",
  pack3: "completo-familia-acompanhantes",
};

/** Bloco centralizado horizontalmente, posicionado proporcionalmente dentro do card */
function Slot({
  top,
  w,
  h,
  children,
}: {
  top: number;
  w: number;
  h: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2"
      style={{ top: pct(top, CARD_H), width: pct(w, CARD_W), aspectRatio: `${w} / ${h}` }}
    >
      {children}
    </div>
  );
}

function PriceCard({ pack, index }: { pack: Pack; index: number }) {
  const [modo, setModo] = useState<Modalidade>("digital");
  const preco = pack.precoImg[modo];
  const apoio = APOIO[modo];

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[380px] md:max-w-none select-none"
      style={{ aspectRatio: `${CARD_W} / ${CARD_H}`, containerType: "inline-size" }}
      aria-label={`${pack.nome} — ${pack.fotos}`}
    >
      {/* Fundo do card — mesma cor/raio do packX_bg.svg, mas com altura livre */}
      <div
        aria-hidden="true"
        className="absolute inset-0 shadow-[0_18px_30px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: pack.cor, borderRadius: `${(CARD_RADIUS / CARD_W) * 100}cqw` }}
      />

      {/* Título */}
      <Slot top={POS.titulo} w={pack.titulo.w} h={pack.titulo.h}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pack.titulo.src} alt={pack.nome} className="w-full h-full" draggable={false} />
      </Slot>

      {/* Quantidade de fotos */}
      <Slot top={POS.fotos} w={pack.fotosImg.w} h={pack.fotosImg.h}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pack.fotosImg.src} alt={pack.fotos} className="w-full h-full" draggable={false} />
      </Slot>

      {/* Toggle Digital / Impressa — os SVGs são os botões */}
      <Slot top={POS.toggle} w={TOGGLE_W * 2} h={TOGGLE_H}>
        <div role="tablist" aria-label="Modalidade de entrega" className="flex w-full h-full">
          {(["digital", "impressa"] as Modalidade[]).map((m) => {
            const ativo = modo === m;
            return (
              <button
                key={m}
                id={`${pack.id}-btn-${m}`}
                type="button"
                role="tab"
                aria-selected={ativo}
                aria-controls={`${pack.id}-info`}
                onClick={() => setModo(m)}
                className={`relative w-1/2 h-full cursor-pointer transition-opacity duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  m === "digital" ? "rounded-l-full" : "rounded-r-full"
                } ${ativo ? "opacity-100" : "opacity-30 hover:opacity-50"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${BASE}/${pack.id}/${pack.id}_${m}.webp`}
                  alt={m === "digital" ? "Digital" : "Impressa"}
                  className="w-full h-full block"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      </Slot>

      {/* Informações que mudam conforme a modalidade */}
      <div id={`${pack.id}-info`} role="tabpanel" aria-live="polite" className="absolute inset-0 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={modo}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Slot top={POS.preco} w={preco.w} h={preco.h}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preco.src} alt={pack.precos[modo]} className="w-full h-full" draggable={false} />
            </Slot>
            <Slot top={POS.apoio} w={apoio.w} h={apoio.h}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={apoio.src} alt={apoio.alt} className="w-full h-full" draggable={false} />
            </Slot>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Botão AGENDAR */}
      <Slot top={POS.agendar} w={AGENDAR_W} h={AGENDAR_H}>
        <Link
          id={`${pack.id}-btn-agendar`}
          href={`/agendar/natal/${PACK_SLUGS[pack.id] || "mini-ensaio-baby"}?modality=${modo === 'impressa' ? 'print' : 'digital'}`}
          aria-label={`Agendar ${pack.nome} (${modo})`}
          className="block w-full h-full rounded-full transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_10px_24px_rgba(0,0,0,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE}/${pack.id}/${pack.id}_agendar.webp`}
            alt="Agendar"
            className="w-full h-full block"
            draggable={false}
          />
        </Link>
      </Slot>
    </motion.article>
  );
}

export function NatalDobra4() {
  return (
    <section
      id="precos"
      className="relative w-full py-20 md:py-28 px-4 sm:px-6 md:px-8 bg-[#ded8ce] overflow-hidden"
      aria-label="Pacotes e preços do Ensaio de Natal"
    >
      <h2 className="sr-only">Pacotes e Preços</h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10 justify-items-center">
        {PACKS.map((pack, i) => (
          <PriceCard key={pack.id} pack={pack} index={i} />
        ))}
      </div>
    </section>
  );
}
