import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
import { Cormorant_Garamond, Lato, Inter } from "next/font/google";
import { GeneralLayout } from "@/components/layout/GeneralLayout";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-admin",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.hellenferreira.com'),
  title: "Hellen Ferreira Fotografia | Newborn, Gestante e Família",
  description: "Registrando os capítulos mais preciosos da sua história com sensibilidade e arte.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AGENDA",
  },
  openGraph: {
    title: "Hellen Ferreira Fotografia | Newborn, Gestante e Família",
    description: "Registrando os capítulos mais preciosos da sua história com sensibilidade e arte.",
    url: 'https://www.hellenferreira.com',
    siteName: 'Hellen Ferreira Fotografia',
    locale: 'pt_BR',
    type: 'website',

    images: [
      {
        url: '/content/home/hero/hero-4.webp',
        width: 1200,
        height: 630,
        alt: 'Hellen Ferreira Fotografia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Hellen Ferreira Fotografia",
    description: "Registrando os capítulos mais preciosos da sua história com sensibilidade e arte.",
    images: ['/content/home/hero/hero-4.webp'],
  },
  icons: {
    icon: [
      { url: '/brand/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/white.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/brand/white.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};



import { GoogleAnalytics } from '@next/third-parties/google';
import FacebookPixel from "@/components/analytics/FacebookPixel";
import SiteTracker from "@/components/analytics/SiteTracker";
import { PWARegistration } from "@/components/pwa/PWARegistration";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${lato.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-pearl flex flex-col min-h-screen">
        <PWARegistration />
        <FacebookPixel />
        <Suspense fallback={null}>
          <SiteTracker />
        </Suspense>
        <GeneralLayout>{children}</GeneralLayout>
        <GoogleAnalytics gaId="G-T5BFLV0TCX" />
      </body>
    </html>
  );
}
