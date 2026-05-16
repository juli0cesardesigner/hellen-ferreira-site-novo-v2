"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, PauseCircle } from "lucide-react";
import { motion } from "framer-motion";
import { DynamicImage } from "@/components/ui/DynamicImage";
import { BookingCTA } from "@/components/booking/BookingCTA";
import { fetchSessionDetails } from "@/lib/actions/booking-actions";
import { SessionWithPackages } from "@/types/database";

export default function MensalMeninoPage() {
  const [galleryImages, setGalleryImages] = React.useState<string[]>([]);
  const [session, setSession] = React.useState<SessionWithPackages | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadSession() {
      try {
        // Mensal ID único conforme SERVICE_ID_MAP
        const { session: sessionData } = await fetchSessionDetails("a67d857c-72ea-441a-9761-1e809bd1bf13");
        setSession(sessionData);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  React.useEffect(() => {
    fetch("/api/gallery/mensal-menino")
      .then(res => res.json())
      .then(data => {
        if (data.images) {
          setGalleryImages(data.images.map((img: { path?: string } | string) => (typeof img === 'string' ? img : img.path || '')));
        }
      })
      .catch(err => console.error("Erro ao carregar galeria Mensal:", err));
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
        <h1 className="text-4xl mb-6">Acompanhamento Mensal Pausado</h1>
        <p className="max-w-[450px] text-text-light font-light leading-relaxed mb-12">
          Este serviço não está aceitando novos agendamentos no momento. 
        </p>
        <Link 
          href="/ensaios" 
          className="px-12 py-5 bg-text-dark text-white rounded-full text-[10px] tracking-[0.3em] uppercase"
        >
          Ver outros serviços
        </Link>
      </div>
    );
  }

  const pkg1 = session?.session_packages?.[0];

  return (
    <div className="flex flex-col w-full bg-pearl">
      {/* 1. Hero Section */}
      <section className="relative h-[85vh] overflow-hidden bg-pearl">
        <div className="absolute inset-0 z-0">
          <DynamicImage
            category="mensal-menino"
            alt="Acompanhamento Mensal Menino"
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
            Cada mês uma nova história
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-10 text-[clamp(40px,8vw,72px)]"
          >
            Acompanhamento Mensal
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-[550px] mx-auto text-lg text-text-medium font-light leading-relaxed"
          >
            Acompanhe o crescimento do seu pequeno com sessões delicadas que registram 
            cada fase importante do primeiro ano de vida.
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
            <p className="text-text-light uppercase tracking-[0.4em] text-[10px] font-medium opacity-70">Valores por Sessão Mensal</p>
          </div>

          <div className="max-w-[900px] mx-auto">
            {pkg1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-sm border border-sand/30 flex flex-col md:flex-row transition-all duration-700 overflow-hidden"
              >
                <div className="relative h-80 md:h-auto md:w-1/2 overflow-hidden">
                  <DynamicImage 
                    category="mensal-menino"
                    id="mensal"
                    alt="Plano Mensal" 
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="p-12 md:p-16 flex flex-col md:w-1/2">
                  <div className="mb-14">
                    <h3 className="text-4xl mb-4 text-blush">{pkg1.name}</h3>
                    <p className="text-text-light italic font-serif text-lg">{pkg1.description || "Evolução registrada com delicadeza"}</p>
                  </div>
                  
                  <ul className="space-y-6 mb-20 flex-grow">
                    {(pkg1.features || [
                      "10 Fotos escolhidas em alta resolução",
                      "1 cenário minimalista",
                      "Duração: Aproximadamente 40 min",
                      "Incluso: Acessórios e Roupas",
                      "Entrega em formato digital",
                      "Galeria online personalizada"
                    ]).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-5 text-text-medium text-sm font-light">
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
                    <div className="flex justify-between items-baseline gap-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-light font-medium">{pkg1.upgrade_label}</span>
                      <span className="text-3xl font-serif text-blush whitespace-nowrap shrink-0">R$ {pkg1.price_print}</span>
                    </div>
                    <p className="text-[9px] text-text-light italic tracking-[0.1em] text-right">
                      * Adicional de R$ 50 para participação de Pais e Irmãos
                    </p>
                  </div>
                  
                  <Link 
                    href={`/agendar/mensal/${pkg1.slug}`} 
                    className="mt-16 w-full py-6 bg-blush text-white text-center rounded-sm tracking-[0.3em] uppercase text-[10px] font-medium hover:bg-[#C29088] transition-all flex items-center justify-center gap-3"
                  >
                    Ver Agenda Disponível
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

      {/* 3.1. Extras Unitários */}
      <section className="bg-linen/30 pb-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto bg-white rounded-sm p-8 md:p-12 border border-sand/40 shadow-sm">
            <h3 className="font-serif italic text-2xl md:text-3xl mb-10 text-text-dark border-b border-sand/20 pb-6 text-center">Foto Extra</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center group">
                <span className="text-[11px] md:text-[13px] tracking-[0.2em] font-medium uppercase text-text-light group-hover:text-text-dark transition-colors">Somente Digital</span>
                <span className="flex-grow border-b border-dotted border-sand/40 mx-4" />
                <span className="text-2xl md:text-3xl font-serif text-text-dark">R$ 20,00</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-[11px] md:text-[13px] tracking-[0.2em] font-medium uppercase text-text-light group-hover:text-text-dark transition-colors">Digital + Impressa</span>
                <span className="flex-grow border-b border-dotted border-sand/40 mx-4" />
                <span className="text-2xl md:text-3xl font-serif text-blush">R$ 25,00</span>
              </div>
            </div>
          </div>
        </div>
      </section>
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
              src={`/content/gallery/mensal-menino/ui/album.webp`}
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
                  <span className="font-serif italic text-2xl font-medium text-text-dark">R$ 400</span>
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
              src={`/content/gallery/mensal-menino/ui/fotos-extras.webp`}
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
              <div className="flex justify-between items-center py-6 border-b border-transparent group hover:bg-sand/10 transition-colors px-4 md:px-6 -mx-4 md:-mx-6 rounded-sm">
                <span className="text-[13px] md:text-[15px] tracking-[0.2em] font-medium uppercase text-text-light group-hover:text-text-dark">Caixa Personalizada</span>
                <span className="font-serif italic text-2xl md:text-3xl font-medium text-text-dark">R$ 200</span>
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

      {/* 8. Booking CTA Component */}
      <BookingCTA 
        sessionName="Acompanhamento Mensal" 
        sessionId="a67d857c-72ea-441a-9761-1e809bd1bf13" 
      />
    </div>
  );
}

