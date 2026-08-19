import { Metadata } from "next";
import { getCategoryThumbnailsAsync } from "@/lib/thumbnails-store";

const BASE_URL = "https://www.hellenferreira.com";

export function toAbsoluteImageUrl(imagePath: string): string {
  if (!imagePath) {
    return `${BASE_URL}/content/home/hero/hero-4.webp`;
  }
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${BASE_URL}${cleanPath}`;
}

export interface CategoryMetadataOptions {
  category: string;
  title: string;
  description: string;
  path: string;
  fallbackImage?: string;
}

/**
 * Gera dinamicamente os metadados para qualquer categoria ou página,
 * garantindo que a foto configurada no painel admin (Supabase) tenha precedência total.
 */
export async function getCategoryDynamicMetadata({
  category,
  title,
  description,
  path,
  fallbackImage,
}: CategoryMetadataOptions): Promise<Metadata> {
  let coverImage = fallbackImage;

  try {
    const thumbnails = await getCategoryThumbnailsAsync();
    if (thumbnails[category]) {
      coverImage = thumbnails[category];
    } else if (category === "smash" && thumbnails["smash-the-cake"]) {
      coverImage = thumbnails["smash-the-cake"];
    } else if (category === "smash-the-cake" && thumbnails["smash"]) {
      coverImage = thumbnails["smash"];
    }
  } catch (error) {
    console.error(`Erro ao obter thumbnail dinâmica para ${category}:`, error);
  }

  const absoluteImageUrl = toAbsoluteImageUrl(coverImage || `/content/services/${category}.avif`);
  const canonicalUrl = `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Hellen Ferreira Fotografia",
      locale: "pt_BR",
      type: "website",
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} - Hellen Ferreira Fotografia`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImageUrl],
    },
  };
}
