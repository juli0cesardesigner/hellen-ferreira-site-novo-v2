import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ensaio Newborn Menino | Hellen Ferreira Fotografia",
  description: "Sensibilidade e arte para eternizar os primeiros dias do seu menininho com total conforto e segurança.",
  openGraph: {
    title: "Ensaio Newborn Menino | Hellen Ferreira Fotografia",
    description: "Sensibilidade e arte para eternizar os primeiros dias do seu menininho com total conforto e segurança.",
    url: "https://www.hellenferreira.com/newborn-menino",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/new_menino.avif",
        width: 1200,
        height: 630,
        alt: "Ensaio Newborn Menino - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ensaio Newborn Menino | Hellen Ferreira Fotografia",
    description: "Sensibilidade e arte para eternizar os primeiros dias do seu menininho com total conforto e segurança.",
    images: ["/content/services/new_menino.avif"],
  },
};

export default function NewbornMeninoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
