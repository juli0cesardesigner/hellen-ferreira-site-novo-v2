import fs from 'fs';
import path from 'path';

export interface GalleryImage {
  src: string;
  width: number;
  height: number;
  orientation: 'horizontal' | 'vertical';
}

export type GalleryIndex = Record<string, GalleryImage[]>;

let cachedIndex: GalleryIndex | null = null;

export function getGalleryIndex(): GalleryIndex {
  if (cachedIndex) return cachedIndex;

  try {
    const indexPath = path.join(process.cwd(), "src", "lib", "data", "gallery-index.json");
    if (fs.existsSync(indexPath)) {
      cachedIndex = JSON.parse(fs.readFileSync(indexPath, "utf8")) as GalleryIndex;
      return cachedIndex;
    }
  } catch (error) {
    console.error("Error reading gallery index:", error);
  }
  return {};
}

export function getGalleryImages(category: string): GalleryImage[] {
  const index = getGalleryIndex();

  if (category === 'all') {
    return Object.values(index).flat();
  }

  return index[category] || [];
}

export function getShuffledGalleryImages(category: string): GalleryImage[] {
  const images = getGalleryImages(category);
  // deterministic shuffle based on current hour to prevent layout shifts on every client load
  // but still provide some variation over time. Or we can just return it as is for deterministic SSR.
  // Actually, standard shuffle is fine if done on server, it will be the same for the client hydration.
  // But wait, if it's dynamic SSR, it shuffles per request. If static, per build.
  // We'll use a simple random shuffle.
  return [...images].sort(() => Math.random() - 0.5);
}
