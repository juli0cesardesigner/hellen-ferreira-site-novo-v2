import React from "react";
import Image from "next/image";
import { getGalleryImages } from "@/lib/gallery/getGallery";

interface DynamicImageProps {
  category: string;
  alt: string;
  className?: string;
  priority?: boolean;
  id?: string;
}

export function DynamicImage({ 
  category, 
  alt, 
  className = "", 
  priority = false,
  id = "hero" 
}: DynamicImageProps) {
  // Try to find images for this category
  // If the category is a list of categories like "casal,familia", we could handle it,
  // but let's assume it's just one category for now. If it's not found, try "all" fallback.
  let images = getGalleryImages(category);
  if (images.length === 0 && category !== "all") {
    images = getGalleryImages("all");
  }

  if (images.length === 0) {
    return <div className={`bg-sand/10 w-full h-full ${className}`} />;
  }

  // Use the ID to create a unique starting offset
  const idOffsetMap: Record<string, number> = {
    "hero": 0,
    "celebracao": 5,
    "legado": 10,
    "baby": 5,
    "familia": 10
  };

  // Create a somewhat stable hash from the id string for other unknown ids
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const idOffset = idOffsetMap[id] !== undefined ? idOffsetMap[id] : hashString(id);

  // Just pick one image deterministically based on ID to render on server
  // This completely eliminates the layout shift and client-side processing
  const startIndex = idOffset % images.length;
  const currentImage = images[startIndex].src;

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Image
        src={currentImage}
        alt={alt}
        fill
        priority={priority}
        className={`object-cover ${className} transition-opacity duration-700`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
      />
    </div>
  );
}
