import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nossos Ensaios | Hellen Ferreira Fotografia",
  description: "Conheça nossas opções de ensaios fotográficos: Gestante, Newborn, Família, Smash the Cake e mais.",
  openGraph: {
    title: "Nossos Ensaios | Hellen Ferreira Fotografia",
    description: "Conheça nossas opções de ensaios fotográficos: Gestante, Newborn, Família, Smash the Cake e mais.",
    url: "https://www.hellenferreira.com/ensaios",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/gestante.jpg",
        width: 1200,
        height: 630,
        alt: "Nossos Ensaios - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nossos Ensaios | Hellen Ferreira Fotografia",
    description: "Conheça nossas opções de ensaios fotográficos: Gestante, Newborn, Família, Smash the Cake e mais.",
    images: ["/content/services/gestante.jpg"],
  },
};

export default function EnsaiosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
