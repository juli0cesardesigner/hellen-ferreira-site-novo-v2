import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;

  try {
    const baseGalleryPath = path.join(process.cwd(), "public", "content", "gallery");
    let images: string[] = [];

    if (category === "all") {
      // Retorna imagens de todas as categorias
      if (fs.existsSync(baseGalleryPath)) {
        const categories = fs.readdirSync(baseGalleryPath).filter(file => 
          fs.statSync(path.join(baseGalleryPath, file)).isDirectory()
        );
        
        for (const cat of categories) {
          const portfolioPath = path.join(baseGalleryPath, cat, "portfolio");
          if (fs.existsSync(portfolioPath)) {
            const files = fs.readdirSync(portfolioPath);
            const catImages = files
              .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
              .map(file => `/content/gallery/${cat}/portfolio/${file}`);
            images = images.concat(catImages);
          }
        }
      }
    } else {
      // Retorna apenas da categoria específica
      const galleryPath = path.join(baseGalleryPath, category, "portfolio");
      if (fs.existsSync(galleryPath)) {
        const files = fs.readdirSync(galleryPath);
        images = files
          .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
          .map(file => `/content/gallery/${category}/portfolio/${file}`);
      }
    }

    if (images.length === 0) {
      return NextResponse.json({ error: "No images found" }, { status: 404 });
    }

    // Shuffle the array on the server side
    const shuffled = [...images].sort(() => Math.random() - 0.5);

    return NextResponse.json({ images: shuffled });
  } catch (error) {
    console.error("Error reading gallery:", error);
    return NextResponse.json({ error: "Failed to read gallery" }, { status: 500 });
  }
}
