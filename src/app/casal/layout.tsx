import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ensaio de Casal | Hellen Ferreira Fotografia",
  description: "Celebre o amor e a sintonia do casal com fotos espontâneas, românticas e atemporais.",
  openGraph: {
    title: "Ensaio de Casal | Hellen Ferreira Fotografia",
    description: "Celebre o amor e a sintonia do casal com fotos espontâneas, românticas e atemporais.",
    url: "https://www.hellenferreira.com/casal",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/casal.jpg",
        width: 1200,
        height: 630,
        alt: "Ensaio de Casal - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ensaio de Casal | Hellen Ferreira Fotografia",
    description: "Celebre o amor e a sintonia do casal com fotos espontâneas, românticas e atemporais.",
    images: ["/content/services/casal.jpg"],
  },
};

export default function CasalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
