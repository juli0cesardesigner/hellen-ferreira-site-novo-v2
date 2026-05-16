"use client";

import React from "react";
import Link from "next/link";
import { SERVICES_CONTENT } from "@/lib/services-content";
import { DynamicImage } from "@/components/ui/DynamicImage";
import { listActiveSessions } from "@/lib/actions/booking-actions";

// Mapeamento de Slugs para IDs do Banco (para esconder se inativo)
// NOTA: newborn-menino e newborn-menina compartilham o mesmo serviço "Newborn" no banco.
//       mensal-menino e mensal-menina compartilham "Mensal".
//       Ambos são exibidos/ocultados juntos — se precisar de controle independente,
//       crie serviços separados no banco Supabase.
const SERVICE_ID_MAP: Record<string, string> = {
  "gestante": "be68f0ac-d486-4cad-8ea4-3eed090ffada",
  "newborn-menino": "a232eb5e-1583-4fb7-82da-84008e37f1b4",   // → "Newborn"
  "newborn-menina": "a232eb5e-1583-4fb7-82da-84008e37f1b4",   // → "Newborn"
  "mensal-menino": "a67d857c-72ea-441a-9761-1e809bd1bf13",    // → "Mensal"
  "mensal-menina": "a67d857c-72ea-441a-9761-1e809bd1bf13",    // → "Mensal"
  "smash": "6d560dc9-e87d-45c1-8cbf-e26edc72a2f2",
  "revelacao": "50674a5b-ad94-442b-b4d1-328f4d7f59db",
  "familia": "70b4d4e6-72b5-4262-890c-cf0730e0db8e",
  "feminino": "7024263c-2f3e-4c7f-a66f-cf04e2bd069a",
  "corporativo": "dfe6e10c-0fa5-446d-873d-25c7e78b8bba",
  "civil": "1595bad4-1d33-4c39-9ca3-1ec2d1849962",
  "casal": "decd8b7e-1b04-498f-89ac-d846f37b2929"
};

export default function ServicesPage() {
  const [activeSessionIds, setActiveSessionIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadSessions() {
      try {
        const sessions = await listActiveSessions();
        setActiveSessionIds(sessions.map((s: { id: string }) => s.id));
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const isActive = (slug: string) => {
    const id = SERVICE_ID_MAP[slug];
    if (!id) return true; // Se não mapeado, mostra por padrão
    return activeSessionIds.includes(id);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-pearl">
      <div className="w-8 h-8 border-s-2 border-sand rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. Main Services - Light Background */}
      <section 
        style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }}
        className="bg-pearl"
      >
        <div className="container-custom max-w-[1000px]">
          <div className="flex flex-col gap-24">
            <div className="flex flex-col gap-24">
              
              {/* Gestante */}
              {isActive("gestante") && (
                <Link href="/gestante" className="flex flex-col items-center group cursor-pointer">
                  <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-sand/20">
                    <DynamicImage 
                      category="gestante"
                      alt="Gestante" 
                      className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105" 
                    />
                  </div>
                  <div className="mt-[-25px] z-10 transition-transform duration-500 group-hover:scale-105">
                    <span className="bg-[#8B5E3C] text-white px-12 py-4 rounded-full text-sm tracking-[0.2em] font-medium shadow-2xl uppercase">
                      {SERVICES_CONTENT.mainCategories[0].title}
                    </span>
                  </div>
                </Link>
              )}

              {/* Newborn Split */}
              {(isActive("newborn-menino") || isActive("newborn-menina")) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                  {isActive("newborn-menino") && (
                    <Link href="/newborn-menino" className="flex flex-col items-center group cursor-pointer">
                      <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-sand/20">
                        <DynamicImage 
                          category="newborn-menino"
                          alt="Newborn Menino" 
                          className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105" 
                        />
                      </div>
                      <div className="mt-[-25px] z-10 transition-transform duration-500 group-hover:scale-105 text-center">
                        <span className="bg-[#8B5E3C] text-white px-8 py-4 rounded-full text-[10px] sm:text-xs tracking-[0.2em] font-medium shadow-2xl whitespace-nowrap uppercase">
                          {SERVICES_CONTENT.mainCategories[1].title}
                        </span>
                      </div>
                    </Link>
                  )}
                  {isActive("newborn-menina") && (
                    <Link href="/newborn-menina" className="flex flex-col items-center group cursor-pointer">
                      <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-sand/20">
                        <DynamicImage 
                          category="newborn-menina"
                          alt="Newborn Menina" 
                          className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105" 
                        />
                      </div>
                      <div className="mt-[-25px] z-10 transition-transform duration-500 group-hover:scale-105 text-center">
                        <span className="bg-[#8B5E3C] text-white px-8 py-4 rounded-full text-[10px] sm:text-xs tracking-[0.2em] font-medium shadow-2xl whitespace-nowrap uppercase">
                          {SERVICES_CONTENT.mainCategories[2].title}
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              )}

              {/* Mensal Split */}
              {(isActive("mensal-menino") || isActive("mensal-menina")) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                  {isActive("mensal-menino") && (
                    <Link href="/mensal-menino" className="flex flex-col items-center group cursor-pointer">
                      <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-sand/20">
                        <DynamicImage 
                          category="mensal-menino"
                          alt="Mensal Menino" 
                          className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105" 
                        />
                      </div>
                      <div className="mt-[-25px] z-10 transition-transform duration-500 group-hover:scale-105 text-center">
                        <span className="bg-[#8B5E3C] text-white px-8 py-4 rounded-full text-[10px] sm:text-xs tracking-[0.2em] font-medium shadow-2xl whitespace-nowrap uppercase">
                          {SERVICES_CONTENT.mainCategories[3].title}
                        </span>
                      </div>
                    </Link>
                  )}
                  {isActive("mensal-menina") && (
                    <Link href="/mensal-menina" className="flex flex-col items-center group cursor-pointer">
                      <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-sand/20">
                        <DynamicImage 
                          category="mensal-menina"
                          alt="Mensal Menina" 
                          className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105" 
                        />
                      </div>
                      <div className="mt-[-25px] z-10 transition-transform duration-500 group-hover:scale-105 text-center">
                        <span className="bg-[#8B5E3C] text-white px-8 py-4 rounded-full text-[10px] sm:text-xs tracking-[0.2em] font-medium shadow-2xl whitespace-nowrap uppercase">
                          {SERVICES_CONTENT.mainCategories[4].title}
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              )}

              {/* Smash the cake */}
              {isActive("smash") && (
                <Link href="/smash" className="flex flex-col items-center group cursor-pointer">
                  <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-sand/20">
                    <DynamicImage 
                      category="smash"
                      alt="Smash the Cake" 
                      className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105" 
                    />
                  </div>
                  <div className="mt-[-25px] z-10 transition-transform duration-500 group-hover:scale-105">
                    <span className="bg-[#8B5E3C] text-white px-12 py-4 rounded-full text-sm tracking-[0.2em] font-medium shadow-2xl uppercase">
                      {SERVICES_CONTENT.mainCategories[5].title}
                    </span>
                  </div>
                </Link>
              )}

              {/* Revelação */}
              {isActive("revelacao") && (
                <Link href="/revelacao" className="flex flex-col items-center group cursor-pointer">
                  <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-sand/20">
                    <DynamicImage 
                      category="revelacao"
                      alt="Revelação" 
                      className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105" 
                    />
                  </div>
                  <div className="mt-[-25px] z-10 transition-transform duration-500 group-hover:scale-105">
                    <span className="bg-[#8B5E3C] text-white px-12 py-4 rounded-full text-sm tracking-[0.2em] font-medium shadow-2xl uppercase">
                      {SERVICES_CONTENT.mainCategories[6].title}
                    </span>
                  </div>
                </Link>
              )}

              {/* Família */}
              {isActive("familia") && (
                <Link href="/familia" className="flex flex-col items-center group cursor-pointer">
                  <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-sand/20">
                    <DynamicImage 
                      category="familia"
                      alt="Família" 
                      className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105" 
                    />
                  </div>
                  <div className="mt-[-25px] z-10 transition-transform duration-500 group-hover:scale-105">
                    <span className="bg-[#8B5E3C] text-white px-12 py-4 rounded-full text-sm tracking-[0.2em] font-medium shadow-2xl uppercase">
                      {SERVICES_CONTENT.mainCategories[7].title}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Lifestyle Section - Dark Green Background */}
      <section 
        style={{ paddingTop: 'var(--spacing-section-v)', paddingBottom: 'var(--spacing-section-v)' }}
        className="bg-sage"
      >
        <div className="container-custom max-w-[1000px]">
          <div className="flex flex-col gap-24">
            {SERVICES_CONTENT.lifestyleCategories.filter(cat => isActive(cat.id)).map((cat) => (
              <Link 
                key={cat.id}
                href={`/servicos/${cat.id}`}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-black/10">
                  <DynamicImage 
                    category={cat.id} 
                    alt={cat.title} 
                    className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105" 
                  />
                </div>
                <div className="mt-[-25px] z-10 transition-transform duration-500 group-hover:scale-105">
                  <span className="bg-pearl text-text-dark px-12 py-4 rounded-full text-sm tracking-[0.2em] font-medium shadow-2xl uppercase">
                    {cat.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
