import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ensaio Newborn Menina | Hellen Ferreira Fotografia",
  description: "Registros apaixonantes e seguros dos primeiros dias da sua menininha.",
  openGraph: {
    title: "Ensaio Newborn Menina | Hellen Ferreira Fotografia",
    description: "Registros apaixonantes e seguros dos primeiros dias da sua menininha.",
    url: "https://www.hellenferreira.com/newborn-menina",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/new_menina.avif",
        width: 1200,
        height: 630,
        alt: "Ensaio Newborn Menina - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ensaio Newborn Menina | Hellen Ferreira Fotografia",
    description: "Registros apaixonantes e seguros dos primeiros dias da sua menininha.",
    images: ["/content/services/new_menina.avif"],
  },
};

export default function NewbornMeninaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
