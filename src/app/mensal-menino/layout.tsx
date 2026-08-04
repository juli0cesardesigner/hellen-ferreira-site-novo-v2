import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acompanhamento Mensal Menino | Hellen Ferreira Fotografia",
  description: "Registre cada fase do desenvolvimento do seu filho durante o primeiro ano de vida.",
  openGraph: {
    title: "Acompanhamento Mensal Menino | Hellen Ferreira Fotografia",
    description: "Registre cada fase do desenvolvimento do seu filho durante o primeiro ano de vida.",
    url: "https://www.hellenferreira.com/mensal-menino",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/mensal_menino.avif",
        width: 1200,
        height: 630,
        alt: "Acompanhamento Mensal Menino - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acompanhamento Mensal Menino | Hellen Ferreira Fotografia",
    description: "Registre cada fase do desenvolvimento do seu filho durante o primeiro ano de vida.",
    images: ["/content/services/mensal_menino.avif"],
  },
};

export default function MensalMeninoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
