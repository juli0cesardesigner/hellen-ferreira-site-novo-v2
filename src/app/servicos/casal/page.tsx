"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Camera, Heart, Check, Users, Coffee, PauseCircle } from "lucide-react";
import { motion } from "framer-motion";
import { DynamicImage } from "@/components/ui/DynamicImage";
import { SITE_CONFIG } from "@/lib/constants";
import { BookingCTA } from "@/components/booking/BookingCTA";
import { fetchSessionDetails } from "@/lib/actions/booking-actions";

export default function CasalPage() {
  const [galleryImages, setGalleryImages] = React.useState<string[]>([]);
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadSession() {
      try {
        const { session: sessionData } = await fetchSessionDetails("decd8b7e-1b04-498f-89ac-d846f37b2929");
        setSession(sessionData);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  React.useEffect(() => {
    fetch("/api/gallery/casal")
      .then(res => res.json())
      .then(data => {
        if (data.images) {
          setGalleryImages(data.images.map((img: any) => img.path || img));
        }
      })
      .catch(err => console.error("Erro ao carregar galeria Casal:", err));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <div className="w-8 h-8 border-s-2 border-sand rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pearl p-8 text-center">
        <PauseCircle className="w-16 h-16 text-sand mb-8 opacity-20" strokeWidth={1} />
        <h1 className="text-4xl mb-6">Ensaio de Casal Pausado</h1>
        <p className="max-w-[450px] text-text-light font-light leading-relaxed mb-12">
          Este serviço não está aceitando novos agendamentos no momento. 
        </p>
        <Link 
          href="/servicos" 
          className="px-12 py-5 bg-text-dark text-white rounded-full text-[10px] tracking-[0.3em] uppercase"
        >
          Ver outros serviços
        </Link>
      </div>
    );
  }

  const getPackage = (tier: number) => {
    return session?.session_packages?.find((p: any) => p.tier_order === tier);
  };

  const pkg1 = getPackage(1);
  const pkg2 = getPackage(2);

  return (
    <div className="flex flex-col w-full bg-pearl">
      {/* 1. Hero Section */}
      <section className="relative h-[85vh] overflow-hidden bg-pearl">
        <div className="absolute inset-0 z-0">
          <DynamicImage
            category="casal"
            alt="Ensaio de Casal"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pearl/20 via-transparent to-transparent" />
        </div>
      </section>

      {/* 2. Intro Section */}
      <section style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }} className="bg-pearl">
        <div className="container-custom text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-2 mb-10 border border-text-dark/10 rounded-full text-[10px] tracking-[0.5em] uppercase text-text-light font-medium"
          >
            A beleza do encontro
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-10 text-[clamp(40px,8vw,72px)]"
          >
            Amor & Conexão
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-[550px] mx-auto text-lg text-text-medium font-light leading-relaxed"
          >
            Memórias autênticas e naturais que retratam a verdade do casal. 
            Em nossos ensaios, priorizamos o momento a dois em vez de apenas a pose.
          </motion.p>
        </div>
      </section>

      {/* 3. Packages Section */}
      <section 
        style={{ paddingTop: 'var(--spacing-rhythm)', paddingBottom: 'var(--spacing-rhythm)' }} 
        className="bg-linen/30"
      >
        <div className="container-custom">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-rhythm)' }}>
            <h2 className="mb-6">Sessões & Investimento</h2>
            <p className="text-text-light uppercase tracking-[0.4em] text-[10px] font-medium opacity-70">A sua história em cada clique</p>
          </div>

          <div className={`grid grid-cols-1 ${pkg1 && pkg2 ? 'md:grid-cols-2' : ''} gap-8 max-w-[1100px] mx-auto`}>
            {/* Pacote Encontro */}
            {pkg1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-sm border border-sand/30 flex flex-col h-full overflow-hidden"
              >
                {/* Imagem Superior */}
                <div className="relative h-72 md:h-80 w-full overflow-hidden shrink-0">
                  <DynamicImage 
                    category="casal"
                    id={`pkg-${Math.floor(Math.random() * 1000)}`}
                    alt="Capa do Pacote" 
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                {/* Detalhes Abaixo */}
                <div className="p-10 md:p-14 flex flex-col flex-grow bg-white relative z-10 -mt-4 mx-4 mb-4 rounded-sm shadow-sm">
                  <div className="mb-10 text-center">
                    <h3 className="text-3xl mb-4 text-blush">{pkg1.name}</h3>
                    <p className="text-text-light italic font-serif text-lg">{pkg1.description || "Leve e Intimista"}</p>
                  </div>
                  
                  <ul className="space-y-5 mb-14 flex-grow">
                    {(pkg1.features || [
                      "15 Fotos digitais tratadas",
                      "Sessão em estúdio",
                      "Duração de até 01 hora",
                      "Guia de poses e direção afetiva",
                      "Entrega via galeria online",
                      "Curadoria de momentos reais"
                    ]).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-4 text-text-medium text-sm font-light">
                        <Check className="w-4 h-4 text-blush mt-1 shrink-0" strokeWidth={1} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-6 pt-12 border-t border-sand/20">
                    <div className="flex justify-between items-baseline gap-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-light">Digital</span>
                      <span className="text-3xl font-serif text-text-dark whitespace-nowrap shrink-0">R$ {pkg1.price_digital}</span>
                    </div>
                    {pkg1.price_print > 0 && (
                    <div className="flex justify-between items-baseline gap-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-light font-medium">{pkg1.upgrade_label}</span>
                      <span className="text-3xl font-serif text-blush whitespace-nowrap shrink-0">R$ {pkg1.price_print}</span>
                    </div>
                    )}
                  </div>
                  
                  <Link 
                    href={`/agendar/casal/${pkg1.slug}`} 
                    className="mt-12 w-full py-5 bg-blush text-white text-center rounded-sm tracking-[0.3em] uppercase text-[10px] font-medium hover:opacity-90 transition-all flex items-center justify-center gap-3"
                  >
                    Ver Agenda Disponível
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Aventura a Dois */}
            {pkg2 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-sm border border-blush/30 shadow-2xl flex flex-col h-full overflow-hidden"
              >
                {/* Imagem Superior */}
                <div className="relative h-72 md:h-80 w-full overflow-hidden shrink-0">
                  <DynamicImage 
                    category="casal"
                    id={`pkg-${Math.floor(Math.random() * 1000)}`}
                    alt="Capa do Pacote" 
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                {/* Detalhes Abaixo */}
                <div className="p-10 md:p-14 flex flex-col flex-grow bg-white relative z-10 -mt-4 mx-4 mb-4 rounded-sm shadow-sm">
                  <div className="mb-10 text-center">
                    <h3 className="text-3xl mb-4 text-blush">{pkg2.name}</h3>
                    <p className="text-text-light italic font-serif text-lg">{pkg2.description || "Um dia inesquecível"}</p>
                  </div>
                  
                  <ul className="space-y-5 mb-14 flex-grow">
                    {(pkg2.features || [
                      "30 Fotos digitais tratadas",
                      "Sessão em locação externa escolhida",
                      "Ideal para parques, cafés ou cenários urbanos",
                      "Cobertura de estilo Life Style",
                      "Galeria completa personalizada",
                      "Edição poética e sensível",
                      "Consultoria para o destino"
                    ]).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-4 text-text-medium text-sm font-light">
                        <Check className="w-4 h-4 text-blush mt-1 shrink-0" strokeWidth={1} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-6 pt-12 border-t border-sand/20">
                    <div className="flex justify-between items-baseline gap-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-light">Digital</span>
                      <span className="text-3xl font-serif text-text-dark whitespace-nowrap shrink-0">R$ {pkg2.price_digital}</span>
                    </div>
                    {pkg2.price_print > 0 && (
                    <div className="flex justify-between items-baseline gap-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-light font-medium">{pkg2.upgrade_label}</span>
                      <span className="text-3xl font-serif text-blush whitespace-nowrap shrink-0">R$ {pkg2.price_print}</span>
                    </div>
                    )}
                  </div>
                  
                  <Link 
                    href={`/agendar/casal/${pkg2.slug}`} 
                    className="mt-16 w-full py-6 bg-text-dark text-white text-center rounded-sm tracking-[0.3em] uppercase text-[10px] font-medium hover:bg-black transition-all flex items-center justify-center gap-3"
                  >
                    Ver Agenda Disponível
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          {/* Extras */}
          <div className="mt-16 pt-12 border-t border-sand/20 max-w-[1100px] mx-auto">
            <div className="max-w-3xl mx-auto bg-white rounded-sm p-8 md:p-10 border border-sand/40">
              <div className="flex justify-between items-center gap-4 group">
                <span className="text-[11px] md:text-[13px] tracking-[0.15em] font-medium uppercase text-text-dark group-hover:text-blush transition-colors">Foto Extra</span>
                <span className="flex-grow border-b border-dotted border-sand/60 mx-3" />
                <span className="text-[11px] md:text-[13px] tracking-[0.15em] font-medium uppercase text-text-dark group-hover:text-blush transition-colors">Digital + Impressão</span>
                <span className="ml-6 text-2xl md:text-3xl font-serif font-medium text-blush whitespace-nowrap group-hover:text-text-dark transition-colors">R$ 30</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      
                        {/* 5. Fotos Extras e Álbuns */}
      <section style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }} className="bg-linen">
        <div className="container-custom max-w-5xl mx-auto text-center flex flex-col items-center">
          
          <h2 className="font-serif text-4xl md:text-5xl mb-6 font-light text-text-dark">Materialize Suas Memórias</h2>
          <p className="text-text-medium font-light text-[15px] md:text-lg leading-relaxed mb-3">
            O digital é prático, mas o papel é eterno.
          </p>
          <p className="text-text-light font-light text-[14px] md:text-base leading-relaxed mb-20 max-w-2xl">
            Transforme suas fotos favoritas em um patrimônio familiar que seus filhos poderão folhear no futuro.
          </p>

          <div className="relative w-full h-[350px] md:h-[550px] mb-24 overflow-hidden rounded-sm">
            <Image 
              src={`/content/gallery/casal/ui/album.webp`}
              alt="Álbuns Encadernados"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>

          {/* LISTA ESTILOSA: ÁLBUNS */}
          <div className="w-full mb-32">
            <div className="mb-14">
              <h3 className="font-serif italic text-3xl md:text-4xl mb-4 text-text-dark">Álbuns Encadernados (Capa Dura)</h3>
              <p className="font-serif italic text-[17px] md:text-xl text-text-medium">O clássico que atravessa gerações.</p>
            </div>
            
            {/* Bloco 25x25 */}
            <div className="max-w-3xl mx-auto mb-12 bg-white rounded-sm p-8 md:p-12 border border-sand/40">
              <h4 className="font-serif italic text-2xl md:text-3xl mb-8 text-left text-blush border-b border-sand/40 pb-6">Tamanho 25x25 cm</h4>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center py-4 border-b border-sand/20 group hover:bg-sand/10 transition-colors px-4 -mx-4 rounded-sm">
                  <span className="text-[13px] md:text-[15px] tracking-[0.2em] font-medium uppercase text-text-light group-hover:text-text-dark transition-colors">20 Páginas</span>
                  <span className="font-serif italic text-2xl font-medium text-text-dark">R$ 500</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-transparent group hover:bg-sand/10 transition-colors px-4 -mx-4 rounded-sm">
                  <span className="text-[13px] md:text-[15px] tracking-[0.2em] font-medium uppercase text-text-light group-hover:text-text-dark transition-colors">40 Páginas</span>
                  <span className="font-serif italic text-2xl font-medium text-text-dark">R$ 750</span>
                </div>
              </div>
            </div>

            {/* Bloco 20x20 */}
            <div className="max-w-3xl mx-auto mb-20 bg-white rounded-sm p-8 md:p-12 border border-sand/40">
              <h4 className="font-serif italic text-2xl md:text-3xl mb-8 text-left text-blush border-b border-sand/40 pb-6">Tamanho 20x20 cm</h4>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center py-4 border-b border-sand/20 group hover:bg-sand/10 transition-colors px-4 -mx-4 rounded-sm">
                  <span className="text-[13px] md:text-[15px] tracking-[0.2em] font-medium uppercase text-text-light group-hover:text-text-dark transition-colors">20 Páginas</span>
                  <span className="font-serif italic text-2xl font-medium text-text-dark">R$ 350</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-transparent group hover:bg-sand/10 transition-colors px-4 -mx-4 rounded-sm">
                  <span className="text-[13px] md:text-[15px] tracking-[0.2em] font-medium uppercase text-text-light group-hover:text-text-dark transition-colors">40 Páginas</span>
                  <span className="font-serif italic text-2xl font-medium text-text-dark">R$ 500</span>
                </div>
              </div>
            </div>

            {/* Bloco Fotolivro Slim */}
            <div className="max-w-3xl mx-auto bg-white rounded-sm p-8 md:p-12 border border-sand/40">
              <div className="mb-10 text-left border-b border-sand/40 pb-6">
                <h3 className="font-serif italic text-2xl md:text-3xl mb-2 text-blush">Fotolivro Slim</h3>
                <p className="font-serif italic text-base md:text-lg text-text-medium">Leveza e sofisticação em gramatura 400gr.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center py-4 border-b border-transparent group hover:bg-sand/10 transition-colors px-4 -mx-4 rounded-sm">
                  <span className="text-[13px] md:text-[15px] tracking-[0.2em] font-medium uppercase text-text-light group-hover:text-text-dark transition-colors">20x20 cm <span className="lowercase tracking-normal font-light ml-1 text-text-light/70">(20 Págs)</span></span>
                  <span className="font-serif italic text-2xl font-medium text-text-dark">R$ 250</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full h-[350px] md:h-[550px] mb-24 overflow-hidden rounded-sm">
            <Image 
              src={`/content/gallery/casal/ui/fotos-extras.webp`}
              alt="Fotos Extras e Complementos"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>

          {/* LISTA ESTILOSA: FOTOS AVULSAS */}
          <div className="w-full max-w-3xl mx-auto pb-16">
            <h3 className="font-serif italic text-3xl md:text-4xl mb-14 text-text-dark">Complementos e Extras</h3>
            
            <div className="flex flex-col gap-2 bg-white rounded-sm p-8 md:p-12 border border-sand/40">
              <div className="flex justify-between items-center py-6 border-b border-sand/20 group hover:bg-sand/10 transition-colors px-4 md:px-6 -mx-4 md:-mx-6 rounded-sm">
                <span className="text-[13px] md:text-[15px] tracking-[0.2em] font-medium uppercase text-text-light group-hover:text-text-dark">Caixa Personalizada</span>
                <span className="font-serif italic text-2xl md:text-3xl font-medium text-text-dark">R$ 200</span>
              </div>
              <div className="flex justify-between items-center py-6 border-b border-transparent group hover:bg-sand/10 transition-colors px-4 md:px-6 -mx-4 md:-mx-6 rounded-sm">
                <span className="text-[13px] md:text-[15px] tracking-[0.2em] font-medium uppercase text-text-light group-hover:text-text-dark">Foto Digital <span className="font-light text-[11px] ml-2 tracking-normal lowercase text-text-light/70">(unidade)</span></span>
                <span className="font-serif italic text-2xl md:text-3xl font-medium text-text-dark">R$ 25</span>
              </div>
            </div>
          </div>

        </div>
      </section>

                  {/* 4. Portfolio Section */}
      {galleryImages.length >= 5 && (
        <section style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }} className="bg-pearl">
          <div className="container-custom">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-serif text-4xl text-text-dark">Portfólio</h2>
              <div className="w-12 h-px bg-blush mx-auto opacity-30" />
            </div>
            
            {/* Grade Bento Contínua e Simétrica */}
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[300px] grid-flow-row-dense gap-4">
              {galleryImages.slice(0, galleryImages.length - (galleryImages.length % 5)).map((img, i) => {
                const isLarge = i % 5 === 0;
                return (
                  <div 
                    key={i} 
                    className={`relative overflow-hidden rounded-sm group ${isLarge ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`}
                  >
                    <Image 
                      src={img} 
                      alt={`Portfólio ${i}`} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transform group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. Booking CTA Component */}
      <BookingCTA 
        sessionName="Ensaio de Casal" 
        sessionId="decd8b7e-1b04-498f-89ac-d846f37b2929" 
      />
    </div>
  );
}
