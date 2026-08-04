import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guia de Looks | Hellen Ferreira Fotografia",
  description: "Inspirações e guia completo de figurinos para o seu ensaio fotográfico perfeitos.",
  openGraph: {
    title: "Guia de Looks | Hellen Ferreira Fotografia",
    description: "Inspirações e guia completo de figurinos para o seu ensaio fotográfico perfeitos.",
    url: "https://www.hellenferreira.com/looks",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/looks/IMG_5407.webp",
        width: 1200,
        height: 630,
        alt: "Guia de Looks - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guia de Looks | Hellen Ferreira Fotografia",
    description: "Inspirações e guia completo de figurinos para o seu ensaio fotográfico perfeitos.",
    images: ["/content/looks/IMG_5407.webp"],
  },
};

export default function LooksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
