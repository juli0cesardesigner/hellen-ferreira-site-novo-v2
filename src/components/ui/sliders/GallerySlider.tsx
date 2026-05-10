"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GallerySliderProps {
  slides: string[];
}

export function GallerySlider({ slides }: GallerySliderProps) {
  const [galleryIndex, setGalleryIndex] = useState(0);

  if (!slides || slides.length === 0) return null;

  return (
    <section
      style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }}
      className="container-custom"
    >
      <motion.div
         initial={{ opacity: 0 }}
         whileInView={{ opacity: 1 }}
         viewport={{ once: true }}
         className="text-center mb-16 space-y-4"
      >
        <h2 className="text-4xl font-serif">Portfolio em Destaque</h2>
        <div className="w-12 h-px bg-blush mx-auto opacity-30" />
      </motion.div>

      <div className="relative w-full max-w-6xl mx-auto group h-[400px] md:h-[550px] lg:h-[650px]">
        <div className="relative w-full h-full bg-sand overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] rounded-sm group">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={galleryIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={slides[galleryIndex] || slides[0]}
                alt={`Gallery Slide ${galleryIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </motion.div>
          </AnimatePresence>

          {/* Gallery Navigation UI */}
          <div className="absolute inset-0 flex items-center justify-between px-6 z-20">
            <button
              onClick={() => setGalleryIndex((prev) => (prev - 1 + slides.length) % slides.length)}
              className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/90 hover:text-text-dark transition-all duration-500 opacity-40 group-hover:opacity-100"
              aria-label="Anterior"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={() => setGalleryIndex((prev) => (prev + 1) % slides.length)}
              className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/90 hover:text-text-dark transition-all duration-500 opacity-40 group-hover:opacity-100"
              aria-label="Próximo"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="absolute bottom-10 left-12 z-20 flex gap-3 items-center">
            <span className="text-white text-[10px] tracking-widest font-medium opacity-80">
              0{galleryIndex + 1} / {slides.length < 10 ? '0' : ''}{slides.length}
            </span>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIndex(i)}
                  className={cn(
                    "w-1 h-1 rounded-full transition-all duration-500",
                    galleryIndex === i ? "bg-white scale-[2.5]" : "bg-white/30"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Subtle Decorative elements */}
        <div className="absolute -z-10 -bottom-8 -right-8 w-64 h-64 bg-linen/5 blur-3xl rounded-full" />
      </div>
    </section>
  );
}
