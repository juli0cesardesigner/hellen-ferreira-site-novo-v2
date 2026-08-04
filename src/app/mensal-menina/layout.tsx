import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acompanhamento Mensal Menina | Hellen Ferreira Fotografia",
  description: "Acompanhe mês a mês o crescimento da sua bebê com cenários encantadores.",
  openGraph: {
    title: "Acompanhamento Mensal Menina | Hellen Ferreira Fotografia",
    description: "Acompanhe mês a mês o crescimento da sua bebê com cenários encantadores.",
    url: "https://www.hellenferreira.com/mensal-menina",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/mensal_menina.avif",
        width: 1200,
        height: 630,
        alt: "Acompanhamento Mensal Menina - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acompanhamento Mensal Menina | Hellen Ferreira Fotografia",
    description: "Acompanhe mês a mês o crescimento da sua bebê com cenários encantadores.",
    images: ["/content/services/mensal_menina.avif"],
  },
};

export default function MensalMeninaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
