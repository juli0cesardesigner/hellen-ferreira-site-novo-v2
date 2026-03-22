"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface DynamicImageProps {
  category: string;
  alt: string;
  className?: string;
  priority?: boolean;
  id?: string; // Unique ID to prevent multiple components from showing the same image
}

export function DynamicImage({ 
  category, 
  alt, 
  className = "", 
  priority = false,
  id = "hero" 
}: DynamicImageProps) {
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndFindImage = async () => {
      try {
        const response = await fetch(`/api/gallery/${category}`);
        const data = await response.json();
        const images = data.images as string[];

        if (!images || images.length === 0) return;

        const storageKey = `last_image_${category}_${id}`;
        const lastImage = sessionStorage.getItem(storageKey);
        
        // Use the ID to create a unique starting offset (e.g., Hero starts at 0, Baby at 5, Familia at 10)
        // This prevents race conditions where both load the same initial image.
        const idOffsetMap: Record<string, number> = {
          "hero": 0,
          "celebracao": 5,
          "legado": 10,
          "baby": 5,
          "familia": 10
        };
        const idOffset = idOffsetMap[id] || 0;

        // Find starting index (either after last image or at use the id offset)
        let startIndex = idOffset % images.length;
        if (lastImage) {
          const index = images.indexOf(lastImage);
          if (index !== -1) startIndex = (index + 1) % images.length;
        }

        // Helper to check orientation
        const isDesktop = window.innerWidth >= 768; // 768px as standard breakpoint
        const isHorizontal = (src: string): Promise<boolean> => {
          return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve(img.width >= img.height);
            img.onerror = () => resolve(isDesktop); // fallback to preferred shape
            img.src = src;
          });
        };

        // Search sequentially for the next horizontal image
        let found = false;
        
        // 1. Get already used images on this page view to avoid duplicates
        // Use window instead of sessionStorage so it clears on refresh
        if (!(window as any)._dynamic_images_used) (window as any)._dynamic_images_used = {};
        const globalUsed = (window as any)._dynamic_images_used;
        if (!globalUsed[category]) globalUsed[category] = [];
        const usedOnPage = globalUsed[category];

        for (let i = 0; i < images.length; i++) {
          const checkIndex = (startIndex + i) % images.length;
          const target = images[checkIndex];
          
          // 2. ONLY pick if it matches preferred viewport orientation AND hasn't been used
          const horizontal = await isHorizontal(target);
          const orientationMatches = isDesktop ? horizontal : !horizontal;
          const isUsed = usedOnPage.includes(target);

          if (orientationMatches && !isUsed) {
            setCurrentImage(target);
            sessionStorage.setItem(storageKey, target);
            
            // 3. Register this image as used on current page view
            usedOnPage.push(target);
            
            found = true;
            break;
          }
        }

        // Fallback: if no horizontal found, just take the next one
        if (!found) {
          setCurrentImage(images[startIndex]);
          sessionStorage.setItem(storageKey, images[startIndex]);
        }
      } catch (err) {
        console.error("DynamicImage Discovery Error:", err);
      }
    };

    fetchAndFindImage();
  }, [category, alt]);

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
