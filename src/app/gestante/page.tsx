"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Image as ImageIcon, Check, PauseCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DynamicImage } from "@/components/ui/DynamicImage";
import { BookingCTA } from "@/components/booking/BookingCTA";
import { fetchSessionDetails } from "@/lib/actions/booking-actions";
import { SessionWithPackages, Package } from "@/types/database";

export default function GestantePage() {
  const [galleryImages, setGalleryImages] = React.useState<string[]>([]);
  const [session, setSession] = React.useState<SessionWithPackages | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadSession() {
      try {
        const { session: sessionData } = await fetchSessionDetails("be68f0ac-d486-4cad-8ea4-3eed090ffada");
        setSession(sessionData);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  React.useEffect(() => {
    fetch("/api/gallery/gestante")
      .then(res => res.json())
      .then(data => {
        if (data.images) {
          setGalleryImages(data.images.map((img: { path?: string } | string) => (typeof img === 'string' ? img : img.path || '')));
        }
      })
      .catch(err => console.error("Erro ao carregar galeria dinâmica:", err));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <div className="w-8 h-8 border-s-2 border-sand rounded-full animate-spin" />
      </div>
    );
  }

  // Se a sessão estiver inativa/pausada
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pearl p-8 text-center">
        <PauseCircle className="w-16 h-16 text-sand mb-8 opacity-20" strokeWidth={1} />
        <h1 className="text-4xl mb-6">Ensaio Gestante Pausado</h1>
        <p className="max-w-[450px] text-text-light font-light leading-relaxed mb-12">
          Este serviço não está aceitando novos agendamentos no momento. 
          Entre em contato para saber mais sobre novas datas.
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

  const getPackage = (tier: number) => {
    return session?.session_packages?.find((p: Package) => p.tier_order === tier);
  };

  const pkg1 = getPackage(1);
  const pkg2 = getPackage(2);

  return (
    <div className="flex flex-col w-full bg-pearl">
      {/* 1. Hero Section */}
      <section className="relative h-[85vh] overflow-hidden bg-pearl">
        <div className="absolute inset-0 z-0">
          <DynamicImage
            category="gestante"
            alt="Ensaio Gestante"
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
            A Essência da Vida
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-10 text-[clamp(40px,8vw,72px)]"
          >
            Ensaio Gestante
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-[550px] mx-auto text-lg text-text-medium font-light leading-relaxed"
          >
            Uma poesia visual que eterniza a fase mais transformadora da sua vida, 
            com o toque atemporal da arte cinematográfica.
          </motion.p>
        </div>
      </section>

      {/* 3. Packages Section */}
      <section 
        style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }} 
        className="bg-linen/30"
      >
        <div className="container-custom">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-rhythm)' }}>
            <h2 className="mb-6">Sessões & Investimento</h2>
            <p className="text-text-light uppercase tracking-[0.4em] text-[10px] font-medium opacity-70">Preços Válidos para 2026</p>
          </div>

          <div className={`grid grid-cols-1 ${pkg1 && pkg2 ? 'md:grid-cols-2' : 'max-w-[600px]'} gap-20 max-w-[1100px] mx-auto`}>
            {/* Celebração (Tier 1) */}
            {pkg1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-sm border border-sand/30 flex flex-col transition-all duration-700 overflow-hidden"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <DynamicImage 
                    category="gestante"
                    id="celebracao"
                    alt="Ensaio Celebração" 
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                  <div className="p-16 flex flex-col flex-grow">
                  <div className="mb-14">
                    <h3 className="text-4xl mb-4">{pkg1.name}</h3>
                    <p className="text-text-light italic font-serif text-lg">{pkg1.description || "Leve e memorável"}</p>
                  </div>
                  
                  <ul className="space-y-6 mb-20 flex-grow">
                    {(pkg1.features || [
                      "25 Fotos em alta resolution",
                      "2 trocas de roupa (acervo incluso)",
                      "Estúdio ou Externa",
                      "Entrega em formato digital",
                      "Galeria online por 6 meses"
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
                  </div>
                  
                  <Link 
                    href={`/agendar/gestante/${pkg1.slug}`} 
                    className="mt-16 w-full py-6 bg-blush text-white text-center rounded-sm tracking-[0.3em] uppercase text-[10px] font-medium hover:bg-[#C29088] transition-all flex items-center justify-center gap-3"
                  >
                    Ver Agenda Disponível
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Legado (Tier 2) */}
            {pkg2 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-sm border border-sand/40 flex flex-col relative transition-all duration-700 overflow-hidden"
              >
                <div className="absolute top-4 right-4 z-10 bg-sand/80 backdrop-blur-sm text-text-dark px-6 py-2 text-[9px] tracking-[0.4em] uppercase font-bold">
                  Exclusivo
                </div>
                <div className="relative h-64 w-full overflow-hidden">
                  <DynamicImage 
                    category="gestante"
                    id="legado"
                    alt="Ensaio Legado" 
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="p-16 flex flex-col flex-grow">
                  <div className="mb-14">
                    <h3 className="text-4xl mb-4">{pkg2.name}</h3>
                    <p className="text-text-light italic font-serif text-lg">{pkg2.description || "Uma obra de arte completa"}</p>
                  </div>
                  
                  <ul className="space-y-6 mb-20 flex-grow">
                    {(pkg2.features || [
                      "45 Fotos em alta resolução",
                      "3 trocas de roupa (acervo incluso)",
                      "Estúdio ou Externa",
                      "Look adicional: R$ 50",
                      "Entrega prioritária",
                      "Consultoria de figurino completa"
                    ]).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-5 text-text-medium text-sm font-light">
                        <Check className="w-4 h-4 text-warm-gold mt-1 shrink-0" strokeWidth={1} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-6 pt-12 border-t border-sand/20">
                    <div className="flex justify-between items-baseline gap-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-light">Digital</span>
                      <span className="text-3xl font-serif text-text-dark whitespace-nowrap shrink-0">R$ {pkg2.price_digital}</span>
                    </div>
                    <div className="flex justify-between items-baseline gap-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-light font-medium">{pkg2.upgrade_label}</span>
                      <span className="text-3xl font-serif text-blush whitespace-nowrap shrink-0">R$ {pkg2.price_print}</span>
                    </div>
                  </div>

                  <Link 
                    href={`/agendar/gestante/${pkg2.slug}`} 
                    className="mt-16 w-full py-6 bg-blush text-white text-center rounded-sm tracking-[0.3em] uppercase text-[10px] font-medium hover:bg-[#C29088] transition-all flex items-center justify-center gap-3"
                  >
                    Ver Agenda Disponível
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
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
      {/* 4. Experience / Acervo */}
      <section className="bg-pearl py-24 md:py-32 overflow-hidden">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-stretch">
            {/* Main Acervo Card */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-8 relative min-h-[500px] md:min-h-[600px] rounded-sm overflow-hidden group bg-linen shadow-2xl shadow-sand/20"
            >
              <Image 
                src="/content/looks/IMG_6447.webp" 
                alt="Nosso Acervo Editorial" 
                fill 
                className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              {/* Gradient Overlay - Strengthened for better readability over bright images */}
              <div className="absolute inset-0 bg-gradient-to-r from-pearl via-pearl/90 md:via-pearl/70 to-transparent" />
              
              <div className="absolute inset-0 p-10 md:p-20 flex flex-col justify-center max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-sand/20">
                    <Sparkles className="w-5 h-5 text-blush" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] tracking-[0.6em] uppercase text-text-dark font-bold">Experiência Premium</span>
                </div>
                
                <h2 className="mb-8 text-[clamp(32px,5vw,56px)] leading-[1.1] font-serif text-text-dark">
                  Um Guarda-Roupa <br/> 
                  <span className="italic text-blush">Exclusivo para Você</span>
                </h2>
                
                <p className="text-text-dark mb-12 text-base md:text-lg font-light leading-relaxed max-w-md">
                  Esqueça a preocupação com o figurino. Disponibilizamos um acervo editorial completo com vestidos, 
                  tules e acessórios de alta costura que valorizam sua gestação e criam memórias atemporais.
                </p>
                
                <Link 
                  href="/looks" 
                  className="group/btn inline-flex items-center gap-6 px-12 py-6 bg-text-dark text-white rounded-full text-[11px] tracking-[0.5em] uppercase hover:bg-blush transition-all duration-500 shadow-2xl shadow-text-dark/20 w-fit"
                >
                  Ver Acervo Completo
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Sparkles className="w-4 h-4 text-white/50 group-hover/btn:text-white" />
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            {/* Side Column - Secondary Features */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4 flex flex-col gap-8"
            >
              <div className="bg-linen/40 p-12 rounded-sm border border-sand/30 flex-grow flex flex-col justify-center hover:bg-linen/60 transition-colors duration-500">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
                  <ImageIcon className="w-5 h-5 text-blush" strokeWidth={1.5} />
                </div>
                <h4 className="font-serif text-2xl italic text-text-dark mb-6">Entrega Rápida</h4>
                <p className="text-sm text-text-light leading-relaxed font-light">
                  Sabemos que você mal pode esperar para ver o resultado. Por isso, priorizamos uma entrega ágil 
                  mantendo o mais alto padrão de tratamento de imagem.
                </p>
              </div>
              
              <div className="bg-white p-12 rounded-sm border border-sand/40 flex-grow flex flex-col justify-center shadow-sm hover:border-blush/20 transition-colors duration-500">
                <div className="w-12 h-12 bg-linen/50 rounded-full flex items-center justify-center mb-8">
                  <Check className="w-5 h-5 text-blush" strokeWidth={1.5} />
                </div>
                <h4 className="font-serif text-2xl italic text-text-dark mb-6">Curadoria</h4>
                <p className="text-sm text-text-light leading-relaxed font-light">
                  Cada peça é selecionada para harmonizar com a luz e o cenário escolhido, garantindo que 
                  o foco principal seja sempre a sua beleza.
                </p>
              </div>
            </motion.div>
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
              src={`/content/gallery/gestante/ui/album.webp`}
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
              src={`/content/gallery/gestante/ui/fotos-extras.webp`}
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
        sessionName="Gestante" 
        sessionId="be68f0ac-d486-4cad-8ea4-3eed090ffada" 
      />
    </div>
  );
}

