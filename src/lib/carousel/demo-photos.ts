export const DEMO_PHOTOS = [
  { url: '/content/gallery/casal/portfolio/IMG_7211-Editar.webp', label: 'Foto Teste 01' },
  { url: '/content/gallery/casal/portfolio/IMG_7214-Editar.webp', label: 'Foto Teste 02' },
  { url: '/content/gallery/casal/portfolio/IMG_7238-Editar.webp', label: 'Foto Teste 03' },
  { url: '/content/gallery/casal/portfolio/IMG_7260-Editar.webp', label: 'Foto Teste 04' },
  { url: '/content/gallery/casal/portfolio/IMG_7278-Editar.webp', label: 'Foto Teste 05' },
  { url: '/content/gallery/casal/portfolio/IMG_7287-Editar.webp', label: 'Foto Teste 06' },
  { url: '/content/gallery/casal/portfolio/IMG_7329-Editar.webp', label: 'Foto Teste 07' },
  { url: '/content/gallery/casal/portfolio/IMG_7338-Editar.webp', label: 'Foto Teste 08' },
];

let demoIndex = 0;

export function getNextDemoPhoto(): string {
  const photo = DEMO_PHOTOS[demoIndex % DEMO_PHOTOS.length];
  demoIndex++;
  return photo.url;
}
