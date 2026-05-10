import type { Metadata } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import { GeneralLayout } from "@/components/layout/GeneralLayout";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const lato = Lato({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Hellen Ferreira Fotografia | Newborn, Gestante e Família",
  description: "Registrando os capítulos mais preciosos da sua história com sensibilidade e arte.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HF Admin",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${lato.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-pearl flex flex-col min-h-screen">
        <GeneralLayout>{children}</GeneralLayout>
      </body>
    </html>
  );
}
