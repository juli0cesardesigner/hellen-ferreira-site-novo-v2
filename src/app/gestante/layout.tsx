import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ensaio Gestante | Hellen Ferreira Fotografia",
  description: "Eternize a magia e a beleza da sua gestação com ensaios fotográficos únicos e delicados.",
  openGraph: {
    title: "Ensaio Gestante | Hellen Ferreira Fotografia",
    description: "Eternize a magia e a beleza da sua gestação com ensaios fotográficos únicos e delicados.",
    url: "https://www.hellenferreira.com/gestante",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/gestante.jpg",
        width: 1200,
        height: 630,
        alt: "Ensaio Gestante - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ensaio Gestante | Hellen Ferreira Fotografia",
    description: "Eternize a magia e a beleza da sua gestação com ensaios fotográficos únicos e delicados.",
    images: ["/content/services/gestante.jpg"],
  },
};

export default function GestanteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
