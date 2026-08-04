import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ensaio de Família | Hellen Ferreira Fotografia",
  description: "Capture o amor, a união e os laços afetivos em um ensaio fotográfico de família inesquecível.",
  openGraph: {
    title: "Ensaio de Família | Hellen Ferreira Fotografia",
    description: "Capture o amor, a união e os laços afetivos em um ensaio fotográfico de família inesquecível.",
    url: "https://www.hellenferreira.com/familia",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/familia.jpg",
        width: 1200,
        height: 630,
        alt: "Ensaio de Família - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ensaio de Família | Hellen Ferreira Fotografia",
    description: "Capture o amor, a união e os laços afetivos em um ensaio fotográfico de família inesquecível.",
    images: ["/content/services/familia.jpg"],
  },
};

export default function FamiliaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
