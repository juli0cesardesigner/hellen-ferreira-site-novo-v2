import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casamento Civil | Hellen Ferreira Fotografia",
  description: "Registros emocionantes da sua cerimônia de casamento civil com olhar sensível e atemporal.",
  openGraph: {
    title: "Casamento Civil | Hellen Ferreira Fotografia",
    description: "Registros emocionantes da sua cerimônia de casamento civil com olhar sensível e atemporal.",
    url: "https://www.hellenferreira.com/civil",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/civil.jpg",
        width: 1200,
        height: 630,
        alt: "Casamento Civil - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Casamento Civil | Hellen Ferreira Fotografia",
    description: "Registros emocionantes da sua cerimônia de casamento civil com olhar sensível e atemporal.",
    images: ["/content/services/civil.jpg"],
  },
};

export default function CivilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
