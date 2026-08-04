import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agendamento Online | Hellen Ferreira Fotografia",
  description: "Escolha a melhor data e horário e agende seu ensaio fotográfico de forma simples e rápida.",
  openGraph: {
    title: "Agendamento Online | Hellen Ferreira Fotografia",
    description: "Escolha a melhor data e horário e agende seu ensaio fotográfico de forma simples e rápida.",
    url: "https://www.hellenferreira.com/agendar",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/gestante.jpg",
        width: 1200,
        height: 630,
        alt: "Agendamento Online - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agendamento Online | Hellen Ferreira Fotografia",
    description: "Escolha a melhor data e horário e agende seu ensaio fotográfico de forma simples e rápida.",
    images: ["/content/services/gestante.jpg"],
  },
};

export default function AgendarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
