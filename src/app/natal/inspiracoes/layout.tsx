import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspirações de Looks de Natal | Hellen Ferreira Fotografia",
  description:
    "Galeria de inspirações visuais (geradas por IA apenas para referência) para ajudar na escolha dos looks do seu Ensaio de Natal.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Inspirações de Looks de Natal | Hellen Ferreira Fotografia",
    description:
      "Referências visuais de combinações de cores e estilos para o seu Ensaio de Natal.",
    url: "/natal/inspiracoes",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/natal/thumb.jpg",
        width: 1200,
        height: 630,
        alt: "Inspirações de Looks de Natal — Hellen Ferreira Fotografia",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inspirações de Looks de Natal | Hellen Ferreira Fotografia",
    description:
      "Referências visuais de combinações de cores e estilos para o seu Ensaio de Natal.",
    images: ["/natal/thumb.jpg"],
  },
};

export default function NatalInspiracoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

