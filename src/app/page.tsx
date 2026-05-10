import { getShuffledGalleryImages } from "@/lib/gallery/getGallery";
import { HeroSlider } from "@/components/ui/sliders/HeroSlider";
import { GallerySlider } from "@/components/ui/sliders/GallerySlider";
import Image from "next/image";
import Link from "next/link";
import { HOME_CONTENT } from "@/lib/home-content";
import { DynamicImage } from "@/components/ui/DynamicImage";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const allImages = getShuffledGalleryImages("all");

  // Try to use horizontal images for sliders to prevent cropping issues on desktop
  const horizontalImages = allImages.filter(img => img.orientation === 'horizontal').map(img => img.src);

  const heroSlides = horizontalImages.length >= 8
    ? horizontalImages.slice(0, 8)
    : (allImages.length >= 8 ? allImages.slice(0, 8).map(img => img.src) : HOME_CONTENT.hero.slides);

  const gallerySlides = horizontalImages.length >= 20
    ? horizontalImages.slice(8, 20)
    : (allImages.length >= 20 ? allImages.slice(8, 20).map(img => img.src) : HOME_CONTENT.gallery.slides);

  return (
    <div className="flex flex-col bg-pearl selection:bg-blush/20">
      <HeroSlider slides={heroSlides} />

      {/* 2. Intro Statement - Editorial Typography */}
      <section 
        style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }} 
        className="container-custom text-center relative"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-blush/30" />

        <div className="max-w-4xl mx-auto space-y-10 mt-12">
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
        </div>
      </section>

      {/* 3. Category Grid - Precise Alignment */}
      <section 
        style={{ paddingBottom: 'var(--spacing-section-v)' }} 
        className="px-4 sm:px-6 w-full max-w-full mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-6">
          {HOME_CONTENT.categories.map((cat, idx) => (
            <div
              key={cat.category}
              className="group relative h-[70vh] md:h-[80vh] 2xl:h-[85vh] w-full bg-text-dark overflow-hidden rounded-[2px] cursor-pointer shadow-2xl transition-all duration-1000"
            >
              <DynamicImage
                category={cat.category}
                id={`home-card-${cat.category}`}
                alt={cat.title}
                className="opacity-80 group-hover:opacity-100 group-hover:scale-110 ease-out"
                priority={idx < 2}
              />
              {/* Ultra Precise Gradient for Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-text-dark/95 via-text-dark/30 to-transparent transition-all duration-1000 group-hover:from-text-dark/80" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 2xl:p-12 text-center text-white z-10 overflow-hidden pointer-events-none">
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
              <Link href={`/servicos/${cat.slug}`} className="absolute inset-0 z-20" aria-label={`Ver sessão de ${cat.title}`} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. About Section - Parallax Edition */}
      <section 
        style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }} 
        className="bg-linen/20 overflow-hidden"
      >
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="relative h-[550px] md:h-[650px] group w-full">
            {/* Parallax Floating Frame */}
            <div className="absolute inset-0 border-[1px] border-blush/30 translate-x-8 translate-y-8 z-0 group-hover:border-blush/60 transition-colors duration-700" />
            
            <div className="relative z-10 w-full h-full bg-sand overflow-hidden shadow-2xl">
              <Image 
                src={HOME_CONTENT.about.image} 
                alt="Hellen Ferreira" 
                fill 
                className="object-cover transition-transform duration-[3s] group-hover:scale-110" 
              />
            </div>
          </div>

          <div className="space-y-12">
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
          </div>
        </div>
      </section>

      <GallerySlider slides={gallerySlides} />
    </div>
  );
}
