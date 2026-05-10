"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HOME_CONTENT } from "@/lib/home-content";
import Link from "next/link";

interface HeroSliderProps {
  slides?: string[];
}

export function HeroSlider({ slides = [] }: HeroSliderProps) {
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSlides = slides.length > 0 ? slides : HOME_CONTENT.hero.slides;

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <section className="relative h-[90vh] w-full bg-sand overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={heroIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 z-0 w-full h-full"
        >
          <motion.div
            animate={{
              scale: [1, 1.1],
              x: [0, -20],
              y: [0, -10]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
            className="w-full h-full"
          >
            <Image
              src={heroSlides[heroIndex] || heroSlides[0]}
              alt={`Hellen Ferreira Photography Hero Slide ${heroIndex + 1}`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-text-dark/40 via-text-dark/20 to-text-dark/50 z-10" />

      <div className="relative z-20 container-custom h-full flex flex-col justify-center items-center text-center text-white space-y-8">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.2, delay: 0.2 }}
           className="space-y-4"
        >
          <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-white/90 drop-shadow-md">
            {HOME_CONTENT.hero.tagline}
          </span>
          <h1 className="text-[48px] md:text-[72px] lg:text-[96px] font-serif tracking-tighter leading-[0.95] drop-shadow-xl text-white">
            Hellen Ferreira
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Link
            href="/servicos"
            className="inline-block mt-8 text-[12px] uppercase tracking-[0.3em] border-b border-white/40 pb-2 hover:border-white transition-all duration-300 font-bold"
          >
            Explorar Sessões
          </Link>
        </motion.div>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setHeroIndex(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              heroIndex === i ? "bg-white scale-150" : "bg-white/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
