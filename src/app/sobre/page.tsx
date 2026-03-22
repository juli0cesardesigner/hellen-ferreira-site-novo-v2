"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle, Instagram, Heart, Coffee, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { SITE_CONFIG } from "@/lib/constants";

export default function SobrePage() {
  return (
    <div className="flex flex-col w-full bg-pearl">
      {/* 1. Hero Section - A Fotógrafa */}
      <section className="relative min-h-[85vh] flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-1/2 relative h-[50vh] lg:h-auto overflow-hidden">
          <Image 
            src="/content/home/hellen.jpg" 
            alt="Hellen Ferreira - Tia Hellen" 
            fill 
            className="object-cover object-top"
            priority
          />
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 bg-linen/20">
          <div className="max-w-[500px]">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1 mb-8 border border-text-dark/10 rounded-full text-[10px] tracking-[0.4em] uppercase text-text-light"
            >
              Prazer, Hellen
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[clamp(40px,5vw,64px)] leading-[1.1] mb-8"
            >
              Sou a Tia Hellen. <br/> 
              <span className="italic font-serif text-text-light">A primeira fã</span> <br/>
              da sua história.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-text-medium font-light leading-relaxed mb-10"
            >
              Meu trabalho é criar uma atmosfera tão leve e verdadeira que a câmera 
              se torna apenas uma testemunha do amor que já existe aí. 
              Eu não busco a foto perfeita. Eu busco a história de vocês, 
              em sua forma mais pura e honesta.
            </motion.p>
          </div>
        </div>
      </section>

      {/* 2. Manifesto / Filosofia */}
      <section style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }} className="bg-pearl relative">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-linen flex items-center justify-center text-text-dark">
                <Heart size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif italic text-text-dark">O Amor Primeiro</h3>
              <p className="text-sm text-text-light leading-relaxed font-light">
                Antes do clique, existe a conexão. Registro o carinho espontâneo e os detalhes que tornam cada família única.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-linen flex items-center justify-center text-text-dark">
                <Sparkles size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif italic text-text-dark">Sentimento Real</h3>
              <p className="text-sm text-text-light leading-relaxed font-light">
                Esqueça as poses engessadas. No meu estúdio ou na sua casa, o foco é a verdade de cada olhar e sorriso.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-linen flex items-center justify-center text-text-dark">
                <Coffee size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif italic text-text-dark">Café & Conversa</h3>
              <p className="text-sm text-text-light leading-relaxed font-light">
                Quero conhecer vocês. Cada ensaio começa com uma conversa, um café e o desejo de eternizar o seu hoje.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Contato Section */}
      <section style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }} className="bg-linen/30" id="contato">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-20">
            {/* Esquerda: Info */}
            <div className="flex-1 space-y-12">
              <div>
                <h2 className="mb-6">Agora, a conversa fica pessoal.</h2>
                <p className="text-text-medium font-light max-w-[450px]">
                  Seja para agendar sua sessão, tirar uma dúvida ou simplesmente para 
                  bater um papo sobre como podemos contar sua história, estou aqui para você.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-6 group">
                  <div className="w-10 h-10 rounded-full border border-text-dark/10 flex items-center justify-center shrink-0 group-hover:bg-text-dark group-hover:text-white transition-colors">
                    <MapPin size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-text-light mb-2">Onde a magia acontece</h4>
                    <p className="text-text-dark font-light text-sm leading-relaxed">
                      Avenida Getúlio Vargas, 138 - Edifício Prolar, Sala 205<br/>
                      Centro - Colatina, ES<br/>
                      <span className="text-[11px] italic text-text-light opacity-80">(Em cima da Farmácia Indiana, fácil de achar!)</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-10 h-10 rounded-full border border-text-dark/10 flex items-center justify-center shrink-0 group-hover:bg-text-dark group-hover:text-white transition-colors">
                    <MessageCircle size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-text-light mb-2">WhatsApp Direct</h4>
                    <Link href={SITE_CONFIG.social.whatsappLink} target="_blank" className="text-text-dark font-serif text-2xl hover:text-black transition-colors">
                      {SITE_CONFIG.contact.phone}
                    </Link>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-10 h-10 rounded-full border border-text-dark/10 flex items-center justify-center shrink-0 group-hover:bg-text-dark group-hover:text-white transition-colors">
                    <Mail size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-text-light mb-2">E-mail Corporativo</h4>
                    <Link href={`mailto:${SITE_CONFIG.contact.email}`} className="text-text-dark font-serif text-xl hover:text-black transition-colors">
                      {SITE_CONFIG.contact.email}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Link href={SITE_CONFIG.social.instagram} target="_blank" className="p-4 rounded-full border border-text-dark/10 hover:bg-black hover:text-white transition-all">
                  <Instagram size={20} strokeWidth={1.5} />
                </Link>
                <Link href={SITE_CONFIG.social.whatsappLink} target="_blank" className="p-4 rounded-full border border-text-dark/10 hover:bg-black hover:text-white transition-all">
                  <MessageCircle size={20} strokeWidth={1.5} />
                </Link>
              </div>
            </div>

            {/* Direita: Call to Action Visual / Google Maps */}
            <div className="flex-1 relative aspect-square lg:aspect-auto min-h-[400px] rounded-sm overflow-hidden shadow-2xl border border-sand/20 bg-white">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3760.118962112956!2d-40.6315294!3d-19.5365056!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xb7a9402eb29125%3A0x6e9831bd56ed44e7!2sHellen%20Ferreira%20Fotografia!5e0!3m2!1spt-BR!2sbr!4v1774132078722!5m2!1spt-BR!2sbr" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer Message */}
      <section style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }} className="bg-pearl text-center">
        <div className="container-custom max-w-[700px]">
          <h2 className="mb-10">Meu trabalho é construído sobre confiança e profissionalismo. Aqui está a garantia de uma empresa séria e comprometida com a sua história.</h2>
          <div className="text-[10px] tracking-[0.2em] text-text-light uppercase opacity-60">
            CNPJ: 28.778.598/0001-63 <br/>
            Hellen Ferreira Fotografia
          </div>
        </div>
      </section>
    </div>
  );
}
