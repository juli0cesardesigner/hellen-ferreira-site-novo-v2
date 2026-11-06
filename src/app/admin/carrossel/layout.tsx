import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#0A0D14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Carrossel Studio | Hellen Ferreira',
  description: 'Estúdio de Criação de Carrossel Fotográfico',
  manifest: '/manifest-carrossel.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Carrossel',
  },
  icons: {
    icon: '/icons/carrossel.svg',
    apple: '/icons/carrossel-192.png',
  },
};

export default function CarrosselLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

