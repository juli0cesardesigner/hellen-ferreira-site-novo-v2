import fs from "fs";
import path from "path";

export interface CategoryThumbnailMap {
  [categoryKey: string]: string;
}

const THUMBNAILS_FILE = path.join(process.cwd(), "src", "lib", "data", "category-thumbnails.json");
const GALLERY_INDEX_FILE = path.join(process.cwd(), "src", "lib", "data", "gallery-index.json");

export function getCategoryThumbnails(): CategoryThumbnailMap {
  try {
    if (fs.existsSync(THUMBNAILS_FILE)) {
      const content = fs.readFileSync(THUMBNAILS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading category-thumbnails.json:", error);
  }
  return {};
}

export function saveCategoryThumbnail(category: string, imagePath: string): boolean {
  try {
    const currentMap = getCategoryThumbnails();
    currentMap[category] = imagePath;
    
    // Ensure dir exists
    const dir = path.dirname(THUMBNAILS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(THUMBNAILS_FILE, JSON.stringify(currentMap, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error saving category thumbnail:", error);
    return false;
  }
}

export function getStudioGalleryImagesForCategory(category: string): string[] {
  try {
    if (!fs.existsSync(GALLERY_INDEX_FILE)) return [];
    const content = fs.readFileSync(GALLERY_INDEX_FILE, "utf-8");
    const galleryData = JSON.parse(content);
    
    // Map category key alias if needed (e.g. newborn-menino -> newborn)
    let key = category;
    if (category.startsWith("newborn")) key = "newborn";
    if (category.startsWith("mensal")) key = "mensal";
    if (category === "smash-the-cake") key = "smash";
    
    const entries = galleryData[key] || galleryData[category] || [];
    return entries.map((entry: string | { path: string }) => 
      typeof entry === "string" ? entry : entry.path
    );
  } catch (error) {
    console.error("Error reading gallery index for category:", category, error);
    return [];
  }
}
