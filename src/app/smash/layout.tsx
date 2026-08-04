import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ensaio Smash the Cake | Hellen Ferreira Fotografia",
  description: "Comemore o primeiro aninho com um ensaio alegre, divertido e muito doce!",
  openGraph: {
    title: "Ensaio Smash the Cake | Hellen Ferreira Fotografia",
    description: "Comemore o primeiro aninho com um ensaio alegre, divertido e muito doce!",
    url: "https://www.hellenferreira.com/smash",
    siteName: "Hellen Ferreira Fotografia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/content/services/smash.avif",
        width: 1200,
        height: 630,
        alt: "Ensaio Smash the Cake - Hellen Ferreira Fotografia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ensaio Smash the Cake | Hellen Ferreira Fotografia",
    description: "Comemore o primeiro aninho com um ensaio alegre, divertido e muito doce!",
    images: ["/content/services/smash.avif"],
  },
};

export default function SmashLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
