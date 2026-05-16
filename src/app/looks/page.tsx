"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Star } from "lucide-react";

const LOOKS_IMAGES = [
  "/content/looks/IMG_0907-Editar.webp",
  "/content/looks/IMG_0970-Editar.webp",
  "/content/looks/IMG_1885.webp",
  "/content/looks/IMG_2638-Editar.webp",
  "/content/looks/IMG_3383-Editar.webp",
  "/content/looks/IMG_4117-Editar.webp",
  "/content/looks/IMG_4295-Editar.webp",
  "/content/looks/IMG_5407.webp",
  "/content/looks/IMG_5650-Editar.webp",
  "/content/looks/IMG_5718-Editar.webp",
  "/content/looks/IMG_5780-Editar.webp",
  "/content/looks/IMG_6282_(2).webp",
  "/content/looks/IMG_6378.webp",
  "/content/looks/IMG_6398-Editar.webp",
  "/content/looks/IMG_6415.webp",
  "/content/looks/IMG_6447.webp",
  "/content/looks/IMG_6461.webp",
  "/content/looks/IMG_6474.webp",
  "/content/looks/IMG_6479.webp",
  "/content/looks/IMG_6485.webp",
  "/content/looks/IMG_6696-Editar.webp",
  "/content/looks/IMG_6820.webp",
  "/content/looks/IMG_6954-Editar.webp",
  "/content/looks/IMG_7418-Editar.webp",
  "/content/looks/IMG_8608-Aprimorado-NR-Editar.webp",
  "/content/looks/IMG_8874-Editar.webp",
  "/content/looks/IMG_9309-Editar.webp",
  "/content/looks/IMG_9812-Editar.webp",
];

export default function LooksPage() {
  return (
    <div className="min-h-screen bg-pearl flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-pearl/80 backdrop-blur-md border-b border-sand/20">
        <div className="container-custom h-20 flex items-center justify-between">
          <Link 
            href="/gestante" 
            className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-text-light hover:text-text-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Gestante
          </Link>
          <div className="font-serif italic text-xl text-text-dark">Hellen Ferreira</div>
          <div className="w-[100px]" /> {/* Spacer */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 bg-pearl">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 mb-10 border border-blush/20 rounded-full text-[10px] tracking-[0.4em] uppercase text-blush font-medium bg-blush/5"
          >
            <Sparkles className="w-3 h-3" />
            Acervo Editorial
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            O Nosso <span className="poetic-emphasis">Acervo</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-[650px] mx-auto text-lg text-text-medium font-light leading-relaxed mb-16"
          >
            Curadoria de peças exclusivas, tecidos finos e acessórios selecionados 
            para elevar a estética do seu ensaio ao nível de editoriais de moda. 
            Tudo incluso em seu investimento.
          </motion.p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="pb-32 bg-pearl">
        <div className="container-custom">
          {/* Grid Layout - Masonry-like with CSS columns */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {LOOKS_IMAGES.map((src, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: (index % 5) * 0.1 }}
                className="relative group break-inside-avoid overflow-hidden rounded-sm bg-linen"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={src}
                    alt={`Look Acervo ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                  
                  {/* Subtle info on hover */}
                  <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-white font-medium">Exclusividade Hellen Ferreira</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 bg-linen/30 border-t border-sand/20">
        <div className="container-custom text-center">
          <h2 className="mb-10">Gostou das peças?</h2>
          <p className="text-text-medium font-light max-w-xl mx-auto mb-16">
            Cada ensaio é único. Durante nossa consultoria pré-ensaio, ajudaremos você a escolher 
            as combinações que melhor expressam sua personalidade e estilo.
          </p>
          <Link 
            href="/agendar" 
            className="inline-flex items-center gap-4 px-16 py-6 bg-text-dark text-white rounded-full text-[10px] tracking-[0.4em] uppercase hover:bg-blush transition-all duration-500"
          >
            Reservar Minha Data
            <Star className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
