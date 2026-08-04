import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ensaio Chá Revelação | Hellen Ferreira Fotografia",
  description: "Guarde para sempre a emoção e a surpresa da descoberta do sexo do seu bebê.",
  openGraph: {
    title: "Ensaio Chá Revelação | Hellen Ferreira Fotografia",
    description: "Guarde para sempre a emoção e a surpresa da descoberta do sexo do seu bebê.",
    url: "https://www.hellenferreira.com/revelacao",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/revelacao.avif",
        width: 1200,
        height: 630,
        alt: "Chá Revelação - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ensaio Chá Revelação | Hellen Ferreira Fotografia",
    description: "Guarde para sempre a emoção e a surpresa da descoberta do sexo do seu bebê.",
    images: ["/content/services/revelacao.avif"],
  },
};

export default function RevelacaoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
