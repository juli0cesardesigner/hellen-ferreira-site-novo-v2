import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Mim | Hellen Ferreira Fotografia",
  description: "Conheça a história e a trajetória de Hellen Ferreira na fotografia afetiva de família e newborn.",
  openGraph: {
    title: "Sobre Mim | Hellen Ferreira Fotografia",
    description: "Conheça a história e a trajetória de Hellen Ferreira na fotografia afetiva de família e newborn.",
    url: "https://www.hellenferreira.com/sobre",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/about/hellen-ferreira.avif",
        width: 1200,
        height: 630,
        alt: "Hellen Ferreira Fotógrafa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre Mim | Hellen Ferreira Fotografia",
    description: "Conheça a história e a trajetória de Hellen Ferreira na fotografia afetiva de família e newborn.",
    images: ["/content/about/hellen-ferreira.avif"],
  },
};

export default function SobreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
