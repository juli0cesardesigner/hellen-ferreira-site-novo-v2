import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCategoryThumbnailsAsync } from "@/lib/thumbnails-store";

// Image entry: either a string (legacy) or an object with metadata
type GalleryImageEntry = string | { path: string; width?: number; height?: number; orientation?: 'horizontal' | 'vertical' };

// In-memory cache via globalThis to survive HMR but reset on cold starts
const globalCache = globalThis as typeof globalThis & {
  __galleryIndex?: Record<string, GalleryImageEntry[]>;
  __galleryIndexLoadedAt?: number;
};

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getGalleryIndex(): Record<string, GalleryImageEntry[]> {
  const now = Date.now();
  if (
    globalCache.__galleryIndex &&
    globalCache.__galleryIndexLoadedAt &&
    now - globalCache.__galleryIndexLoadedAt < CACHE_TTL_MS
  ) {
    return globalCache.__galleryIndex;
  }

  const indexPath = path.join(process.cwd(), "src", "lib", "data", "gallery-index.json");
  if (!fs.existsSync(indexPath)) {
    throw new Error("Gallery index not found at " + indexPath);
  }

  const parsed = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  globalCache.__galleryIndex = parsed as Record<string, GalleryImageEntry[]>;
  globalCache.__galleryIndexLoadedAt = now;
  return parsed as Record<string, GalleryImageEntry[]>;
}

// Deterministic seeded shuffle so repeated requests don't reorder images
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Normalize legacy string entries to objects
function normalizeEntry(entry: GalleryImageEntry) {
  if (typeof entry === 'string') return { path: entry };
  return entry;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;

  try {
    const index = getGalleryIndex();
    let entries: GalleryImageEntry[] = [];

    if (category === "all") {
      Object.values(index).forEach((catEntries) => {
        entries = entries.concat(catEntries);
      });
    } else {
      entries = index[category] || [];
    }

    // Seed based on current hour — stable within the same hour, changes hourly
    const hourSeed = Math.floor(Date.now() / 3600000);
    const shuffled = seededShuffle(entries, hourSeed);
    let images = shuffled.map(normalizeEntry);

    // If Admin defined a custom cover thumbnail for this category, put it first!
    const thumbnailsMap = await getCategoryThumbnailsAsync();
    const configuredCover = thumbnailsMap[category];
    if (configuredCover) {
      images = [{ path: configuredCover }, ...images.filter(img => img.path !== configuredCover)];
    }

    if (images.length === 0) {
      return NextResponse.json({ error: "No images found" }, { status: 404 });
    }

    return NextResponse.json({ images, coverImage: configuredCover || null });
  } catch (error) {
    console.error("Error reading gallery:", error);
    return NextResponse.json({ error: "Failed to read gallery" }, { status: 500 });
  }
}
