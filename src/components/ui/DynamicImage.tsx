"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryImageEntry {
  path: string;
  width?: number;
  height?: number;
  orientation?: 'horizontal' | 'vertical';
}

interface DynamicImageProps {
  category: string;
  alt: string;
  className?: string;
  priority?: boolean;
  id?: string; // Unique ID to prevent multiple components from showing the same image
  preferCover?: boolean; // When true, always prioritize the admin configured cover
}

export function DynamicImage({ 
  category, 
  alt, 
  className = "", 
  priority = false,
  id = "hero",
  preferCover = false
}: DynamicImageProps) {
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndFindImage = async () => {
      try {
        const response = await fetch(`/api/gallery/${category}`);
        const data = await response.json();
        const entries: GalleryImageEntry[] = data.images;

        if (preferCover && data.coverImage) {
          setCurrentImage(data.coverImage);
          return;
        }

        if (!entries || entries.length === 0) return;

        const storageKey = `last_image_${category}_${id}`;
        const lastImage = sessionStorage.getItem(storageKey);
        
        // Use the ID to create a unique starting offset
        const idOffsetMap: Record<string, number> = {
          "hero": 0,
          "celebracao": 5,
          "legado": 10,
          "baby": 5,
          "familia": 10
        };
        const idOffset = idOffsetMap[id] || 0;

        // Find starting index
        let startIndex = idOffset % entries.length;
        if (lastImage) {
          const index = entries.findIndex(e => e.path === lastImage);
          if (index !== -1) startIndex = (index + 1) % entries.length;
        }

        const isDesktop = window.innerWidth >= 768;
        const preferredOrientation = isDesktop ? 'horizontal' : 'vertical';

        // Get already used images on this page view to avoid duplicates
        const win = window as Window & { _dynamic_images_used?: Record<string, string[]> };
        if (!win._dynamic_images_used) win._dynamic_images_used = {};
        const globalUsed = win._dynamic_images_used;
        if (!globalUsed[category]) globalUsed[category] = [] as string[];
        const usedOnPage: string[] = globalUsed[category];

        // Helper: check if entry matches preferred orientation
        const matchesOrientation = (entry: GalleryImageEntry): boolean => {
          if (entry.orientation) return entry.orientation === preferredOrientation;
          // Fallback: if no metadata, accept any (don't load image just to check)
          return true;
        };

        // First pass: try to find an entry with matching orientation metadata
        let found = false;
        for (let i = 0; i < entries.length; i++) {
          const checkIndex = (startIndex + i) % entries.length;
          const entry = entries[checkIndex];
          
          if (matchesOrientation(entry) && !usedOnPage.includes(entry.path)) {
            setCurrentImage(entry.path);
            sessionStorage.setItem(storageKey, entry.path);
            usedOnPage.push(entry.path);
            found = true;
            break;
          }
        }

        // Second pass: if no orientation match, accept any unused entry
        if (!found) {
          for (let i = 0; i < entries.length; i++) {
            const checkIndex = (startIndex + i) % entries.length;
            const entry = entries[checkIndex];
            
            if (!usedOnPage.includes(entry.path)) {
              setCurrentImage(entry.path);
              sessionStorage.setItem(storageKey, entry.path);
              usedOnPage.push(entry.path);
              found = true;
              break;
            }
          }
        }

        // Fallback: just use the start index
        if (!found) {
          setCurrentImage(entries[startIndex].path);
          sessionStorage.setItem(storageKey, entries[startIndex].path);
        }
      } catch (err) {
        console.error("DynamicImage Discovery Error:", err);
      }
    };

    fetchAndFindImage();
  }, [category, alt, id]);

  if (!currentImage) return <div className={`bg-sand/10 w-full h-full ${className}`} />;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentImage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative w-full h-full"
      >
        <Image
          src={currentImage}
          alt={alt}
          fill
          priority={priority}
          className={`object-cover ${className}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        />
      </motion.div>
    </AnimatePresence>
  );
}
