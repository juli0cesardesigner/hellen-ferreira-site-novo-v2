import { createClient as createAdminClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import defaultThumbnails from "@/lib/data/category-thumbnails.json";
import galleryIndexData from "@/lib/data/gallery-index.json";

export interface CategoryThumbnailMap {
  [categoryKey: string]: string;
}

let supabaseAdmin: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient | null {
  if (supabaseAdmin) return supabaseAdmin;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  supabaseAdmin = createAdminClient(supabaseUrl, supabaseKey);
  return supabaseAdmin;
}

/**
 * Carrega o mapa de thumbnails das categorias assincronamente a partir do Supabase site_settings,
 * com fallback para category-thumbnails.json e para o default bundled.
 */
export async function getCategoryThumbnailsAsync(): Promise<CategoryThumbnailMap> {
  const fallback: CategoryThumbnailMap = { ...(defaultThumbnails as CategoryThumbnailMap) };
  try {
    const client = getAdminClient();
    if (client) {
      const { data, error } = await client
        .from("site_settings")
        .select("value")
        .eq("key", "category_thumbnails")
        .maybeSingle();

      if (!error && data?.value) {
        const parsed = JSON.parse(data.value);
        return { ...fallback, ...parsed };
      }
    }
  } catch (err) {
    console.error("Error loading category thumbnails from Supabase:", err);
  }

  // Fallback to local file if available
  try {
    const possiblePaths = [
      path.join(process.cwd(), "src", "lib", "data", "category-thumbnails.json"),
      path.join(process.cwd(), "hellen-ferreira-site-novo-v2", "src", "lib", "data", "category-thumbnails.json")
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return { ...fallback, ...JSON.parse(fs.readFileSync(p, "utf-8")) };
      }
    }
  } catch {
    // Ignore and return fallback
  }

  return fallback;
}

/**
 * Função síncrona de compatibilidade para leitura rápida de thumbnails
 */
export function getCategoryThumbnails(): CategoryThumbnailMap {
  const fallback: CategoryThumbnailMap = { ...(defaultThumbnails as CategoryThumbnailMap) };
  try {
    const possiblePaths = [
      path.join(process.cwd(), "src", "lib", "data", "category-thumbnails.json"),
      path.join(process.cwd(), "hellen-ferreira-site-novo-v2", "src", "lib", "data", "category-thumbnails.json")
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return { ...fallback, ...JSON.parse(fs.readFileSync(p, "utf-8")) };
      }
    }
  } catch {
    // Return fallback
  }
  return fallback;
}

/**
 * Salva a nova thumbnail de uma categoria no Supabase e tenta sincronizar localmente
 */
export async function saveCategoryThumbnail(category: string, imagePath: string): Promise<boolean> {
  try {
    const currentMap = await getCategoryThumbnailsAsync();
    currentMap[category] = imagePath;
    const jsonStr = JSON.stringify(currentMap);

    let savedToSupabase = false;
    const client = getAdminClient();
    if (client) {
      const { error } = await client
        .from("site_settings")
        .upsert({
          key: "category_thumbnails",
          value: jsonStr,
          description: "Mapeamento de capas e thumbnails das categorias de ensaios",
          updated_at: new Date().toISOString()
        });

      if (!error) {
        savedToSupabase = true;
      } else {
        console.error("Error upserting category_thumbnails in Supabase:", error);
      }
    }

    // Also attempt saving to local filesystem if writable (e.g. local dev)
    try {
      const possiblePaths = [
        path.join(process.cwd(), "src", "lib", "data", "category-thumbnails.json"),
        path.join(process.cwd(), "hellen-ferreira-site-novo-v2", "src", "lib", "data", "category-thumbnails.json")
      ];
      for (const p of possiblePaths) {
        const dir = path.dirname(p);
        if (fs.existsSync(dir)) {
          fs.writeFileSync(p, JSON.stringify(currentMap, null, 2), "utf-8");
          break;
        }
      }
    } catch {
      // Ignore filesystem write errors in read-only environments (e.g. Vercel)
    }

    return savedToSupabase || true;
  } catch (error) {
    console.error("Error saving category thumbnail:", error);
    return false;
  }
}

/**
 * Retorna as fotos da galeria oficial do estúdio para uma categoria
 */
export function getStudioGalleryImagesForCategory(category: string): string[] {
  try {
    const galleryData: Record<string, (string | { path: string })[]> = galleryIndexData as unknown as Record<string, (string | { path: string })[]>;
    
    // 1. Direct match first (e.g. smash-menino, smash-menina, newborn-menino, etc.)
    if (galleryData[category] && galleryData[category].length > 0) {
      return galleryData[category].map((entry) => 
        typeof entry === "string" ? entry : entry.path
      );
    }

    // 2. Map category key alias if needed as fallback (e.g. legacy smash or newborn)
    let key = category;
    if (category.startsWith("newborn")) key = "newborn";
    if (category.startsWith("mensal")) key = "mensal";
    if (category.startsWith("smash")) key = "smash";
    
    const entries = galleryData[key] || [];
    return entries.map((entry) => 
      typeof entry === "string" ? entry : entry.path
    );
  } catch (error) {
    console.error("Error reading gallery index for category:", category, error);
    return [];
  }
}
