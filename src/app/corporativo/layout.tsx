import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ensaio Corporativo | Hellen Ferreira Fotografia",
  description: "Posicione sua imagem profissional com autoridade, elegância e elegância empresarial.",
  openGraph: {
    title: "Ensaio Corporativo | Hellen Ferreira Fotografia",
    description: "Posicione sua imagem profissional com autoridade, elegância e elegância empresarial.",
    url: "https://www.hellenferreira.com/corporativo",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/corporativo.jpg",
        width: 1200,
        height: 630,
        alt: "Ensaio Corporativo - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ensaio Corporativo | Hellen Ferreira Fotografia",
    description: "Posicione sua imagem profissional com autoridade, elegância e elegância empresarial.",
    images: ["/content/services/corporativo.jpg"],
  },
};

export default function CorporativoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
