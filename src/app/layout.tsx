import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
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
    title: "AGENDA",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/black.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/192x192.png',
  },
};

import { PWARegistration } from "@/components/pwa/PWARegistration";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${lato.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-pearl flex flex-col min-h-screen">
        <PWARegistration />
        <GeneralLayout>{children}</GeneralLayout>
      </body>
    </html>
  );
}
