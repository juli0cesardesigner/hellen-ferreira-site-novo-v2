import { Metadata } from "next";
import {
  NatalHero,
  NatalCalendarSection,
  NatalDobra3,
  NatalDobra4,
  NatalDobra5,
  NatalFooter,
  DynamicFireSparks,
} from "@/components/natal";

export const metadata: Metadata = {
  title: "Ensaios de Natal 2026 | Hellen Ferreira Fotografia",
  description:
    "O Som das Nossas Lembranças — Edição Especial de Ensaios de Natal 2026. Cenário exclusivo, memórias inesquecíveis e vagas limitadas.",
  alternates: {
    canonical: "/natal",
  },
  openGraph: {
    title: "Ensaios de Natal 2026 | Hellen Ferreira Fotografia",
    description:
      "O Som das Nossas Lembranças — Edição Especial de Ensaios de Natal 2026. Cenário exclusivo e memórias inesquecíveis.",
    url: "/natal",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/natal/thumb.jpg",
        width: 1200,
        height: 630,
        alt: "Ensaios de Natal 2026 — O Som das Nossas Lembranças | Hellen Ferreira Fotografia",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ensaios de Natal 2026 | Hellen Ferreira Fotografia",
    description:
      "O Som das Nossas Lembranças — Edição Especial de Ensaios de Natal 2026.",
    images: ["/natal/thumb.jpg"],
  },
};

export default function NatalPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-amber-700 selection:text-white relative">
      {/* Dynamic Fire Sparks sutil sobre toda a página */}
      <DynamicFireSparks desktopCount={55} mobileCount={16} />

      {/* Dobra 1: Hero Multi-layered Parallax */}
      <NatalHero />

      {/* Dobra 2: Calendário com gradiente verde escuro e fundo exclusivo */}
      <NatalCalendarSection />

      {/* Dobra 3: Guia de Cores, Paletas e Estampas com Fundo Temático */}
      <NatalDobra3 />

      {/* Dobra 4: Pacotes e Preços (Digital / Impressa) */}
      <NatalDobra4 />

      {/* Dobra 5: Agenda Aberta */}
      <NatalDobra5 />

      {/* Footer discreto */}
      <NatalFooter />
    </div>
  );
}
