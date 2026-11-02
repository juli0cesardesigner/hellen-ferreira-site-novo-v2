import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acervo Infantil de Natal | Hellen Ferreira Fotografia",
  description:
    "Catálogo exclusivo de roupas e figurinos infantis disponíveis para os Ensaios de Natal Hellen Ferreira Fotografia.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Acervo Infantil de Natal | Hellen Ferreira Fotografia",
    description:
      "Confira as opções de figurinos infantis disponíveis no estúdio para o seu Ensaio de Natal.",
    url: "/natal/looks",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/natal/thumb.jpg",
        width: 1200,
        height: 630,
        alt: "Acervo Infantil de Natal — Hellen Ferreira Fotografia",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acervo Infantil de Natal | Hellen Ferreira Fotografia",
    description:
      "Confira as opções de figurinos infantis disponíveis no estúdio para o seu Ensaio de Natal.",
    images: ["/natal/thumb.jpg"],
  },
};

export default function NatalLooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

