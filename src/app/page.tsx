"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { HOME_CONTENT } from "@/lib/home-content";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { DynamicImage } from "@/components/ui/DynamicImage";

export default function Home() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [dynamicImages, setDynamicImages] = useState<string[]>([]);
  const aboutRef = useRef(null);

  // Fetch all images for dynamic hero and gallery
  useEffect(() => {
    fetch("/api/gallery/all")
      .then(res => res.json())
      .then(async data => {
        if (data.images && data.images.length > 0) {
          // Normalize: entries may be strings (legacy) or {path, width, height, orientation}
          const entries: { path: string; orientation?: string }[] = data.images.map((img: string | { path: string; orientation?: string }) =>
            typeof img === 'string' ? { path: img } : img
          );
          const isDesktop = window.innerWidth >= 768;
          const preferredOrientation = isDesktop ? 'horizontal' : 'vertical';

          const filtered: string[] = [];
          for (const entry of entries) {
            // Use pre-computed orientation metadata when available
            const matchesOrientation = entry.orientation
              ? entry.orientation === preferredOrientation
              : true; // No metadata → accept any
            if (matchesOrientation) {
              filtered.push(entry.path);
            }
            if (filtered.length >= 20) break;
          }

          if (filtered.length >= 8) {
             setDynamicImages(filtered);
          } else {
             setDynamicImages(entries.map(e => e.path));
          }
        }
      })
      .catch(err => console.error("Error loading dynamic gallery for home", err));
  }, []);

  const heroSlides = dynamicImages.length > 0 ? dynamicImages.slice(0, 8) : HOME_CONTENT.hero.slides;
  const gallerySlides = dynamicImages.length > 0 ? dynamicImages.slice(8, 20) : HOME_CONTENT.gallery.slides;

  // Parallax for About section
  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"]
  });
  const frameY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  // Auto-slide for Hero
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="flex flex-col bg-pearl selection:bg-blush/20">
      {/* 1. Hero Slider Section - Now Clean and with Ken Burns */}
      <section className="relative h-[90vh] w-full bg-sand overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 z-0 w-full h-full overflow-hidden"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05],
                opacity: [0.8, 1]
              }}
              transition={{ 
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
              }}
              className="relative w-full h-full"
            >
              <Image
                src={heroSlides[heroIndex] || heroSlides[0]}
                alt={`Slide ${heroIndex + 1}`}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        
        {/* Subtle Gradient for Bottom Blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-pearl/30 z-10" />

        {/* Hero Slide Indicators - Refined */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-4">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className="group p-2 focus:outline-none"
              aria-label={`Ir para slide ${i + 1}`}
            >
              <div className={cn(
                "h-[2px] transition-all duration-700 ease-in-out bg-white",
                heroIndex === i ? "w-12 opacity-100" : "w-6 opacity-30 group-hover:opacity-60"
              )} />
            </button>
          ))}
        </div>
      </section>

      {/* 2. Intro / Narrative Section */}
      <section 
        style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }} 
        className="text-center container-custom"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto space-y-10"
        >
          <h2 className="text-[32px] md:text-[52px] font-serif text-text-dark tracking-tight leading-[1.1] mb-2">
            {HOME_CONTENT.intro.title}
          </h2>
          <div className="flex justify-center items-center gap-4">
            <div className="h-px w-8 bg-blush/40" />
            <p className="text-blush font-serif italic text-2xl">
              {HOME_CONTENT.intro.subtitle}
            </p>
            <div className="h-px w-8 bg-blush/40" />
          </div>
          <p className="text-text-medium text-lg leading-loose max-w-2xl mx-auto font-light opacity-90">
            {HOME_CONTENT.intro.description}
          </p>
        </motion.div>
      </section>

      {/* 3. Category Grid - Precise Alignment */}
      <section 
        style={{ paddingBottom: 'var(--spacing-section-v)' }} 
        className="px-4 sm:px-6 w-full max-w-full mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-6">
          {HOME_CONTENT.categories.map((cat, idx) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              className="group relative h-[70vh] md:h-[80vh] 2xl:h-[85vh] w-full bg-text-dark overflow-hidden rounded-[2px] cursor-pointer shadow-2xl transition-all duration-1000"
            >
              <DynamicImage
                category={cat.category}
                id={`home-card-${cat.category}`}
                alt={cat.title}
                className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[2s] ease-out"
                priority={idx < 2}
              />
              {/* Ultra Precise Gradient for Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-text-dark/95 via-text-dark/30 to-transparent transition-all duration-1000 group-hover:from-text-dark/80" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 2xl:p-12 text-center text-white z-10 overflow-hidden">
                <h3 className="text-[clamp(1.8rem,4vw,3.8rem)] font-serif mb-6 tracking-tight text-white drop-shadow-2xl leading-[1.05] hyphens-auto">
                  {cat.title}
                </h3>
                <p className="text-[10px] md:text-[11px] 2xl:text-[12px] uppercase tracking-[0.4em] leading-[1.8] font-bold text-white/90 max-w-[260px] mx-auto opacity-70 group-hover:opacity-100 transition-opacity duration-700">
                  {cat.description}
                </p>
                <div className="mt-10 flex justify-center opacity-40 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0 text-white">
                  <span className="text-[10px] uppercase tracking-[0.6em] border-b border-white/20 pb-4 font-bold">Ver Sessão</span>
                </div>
              </div>
              <Link href={`/${cat.slug}`} className="absolute inset-0 z-20" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. About Section - Parallax Edition */}
      <section 
        ref={aboutRef} 
        style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }} 
        className="bg-linen/20 overflow-hidden"
      >
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative h-[550px] md:h-[650px] group w-full"
          >
            {/* Parallax Floating Frame */}
            <motion.div 
              style={{ y: frameY }}
              className="absolute inset-0 border-[1px] border-blush/30 translate-x-8 translate-y-8 z-0 group-hover:border-blush/60 transition-colors duration-700" 
            />
            
            <div className="relative z-10 w-full h-full bg-sand overflow-hidden shadow-2xl">
              <Image 
                src={HOME_CONTENT.about.image} 
                alt="Hellen Ferreira" 
                fill 
                className="object-cover transition-transform duration-[3s] group-hover:scale-105" 
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <span className="text-blush uppercase tracking-[0.4em] text-[10px] font-bold">Minha Essência</span>
              <h2 className="text-[42px] md:text-[62px] font-serif text-text-dark leading-[1.05] tracking-tight">
                {HOME_CONTENT.about.title}
              </h2>
            </div>
            
            <div className="w-16 h-px bg-blush/60" />
            
            <p className="text-text-medium leading-relaxed font-light text-xl max-w-lg opacity-80">
              {HOME_CONTENT.about.description}
            </p>
            
            <Link href="/sobre" className="group inline-flex items-center gap-4 py-2 border-b border-blush/30 hover:border-blush transition-all duration-500">
              <span className="font-serif italic text-2xl text-text-dark group-hover:text-blush transition-colors">conhecer minha trajetória</span>
              <ArrowRight size={18} className="text-blush group-hover:translate-x-2 transition-transform duration-500" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 5. Gallery Slider Slider (Below About) - Interactive Focus */}
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
                  src={gallerySlides[galleryIndex] || gallerySlides[0]}
                  alt={`Gallery Slide ${galleryIndex + 1}`}
                  fill
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Gallery Navigation UI - Pro Visible Version */}
            <div className="absolute inset-0 flex items-center justify-between px-6 z-20">
              <button 
                onClick={() => setGalleryIndex((prev) => (prev - 1 + gallerySlides.length) % gallerySlides.length)}
                className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/90 hover:text-text-dark transition-all duration-500 opacity-70 md:opacity-40 md:group-hover:opacity-100"
                aria-label="Anterior"
              >
                <ChevronLeft size={28} />
              </button>
              <button 
                onClick={() => setGalleryIndex((prev) => (prev + 1) % gallerySlides.length)}
                className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/90 hover:text-text-dark transition-all duration-500 opacity-70 md:opacity-40 md:group-hover:opacity-100"
                aria-label="Próximo"
              >
                <ChevronRight size={28} />
              </button>
            </div>

            {/* Progress Indicators - Modern Minimalist */}
            <div className="absolute bottom-10 left-12 z-20 flex gap-3 items-center">
              <span className="text-white text-[10px] tracking-widest font-medium opacity-80">
                0{galleryIndex + 1} / {gallerySlides.length < 10 ? '0' : ''}{gallerySlides.length}
              </span>
              <div className="flex gap-2">
                {gallerySlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setGalleryIndex(i)}
                    aria-label={`Ir para foto ${i + 1}`}
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
    </div>
  );
}
