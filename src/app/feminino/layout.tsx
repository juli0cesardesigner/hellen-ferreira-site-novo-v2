import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ensaio Feminino | Hellen Ferreira Fotografia",
  description: "Retratos autênticos que valorizam a sua essência, autoestima e feminilidade.",
  openGraph: {
    title: "Ensaio Feminino | Hellen Ferreira Fotografia",
    description: "Retratos autênticos que valorizam a sua essência, autoestima e feminilidade.",
    url: "https://www.hellenferreira.com/feminino",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/feminino.jpg",
        width: 1200,
        height: 630,
        alt: "Ensaio Feminino - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ensaio Feminino | Hellen Ferreira Fotografia",
    description: "Retratos autênticos que valorizam a sua essência, autoestima e feminilidade.",
    images: ["/content/services/feminino.jpg"],
  },
};

export default function FemininoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
