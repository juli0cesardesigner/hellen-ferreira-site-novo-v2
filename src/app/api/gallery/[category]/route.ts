import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;

  try {
    const indexPath = path.join(process.cwd(), "src", "lib", "data", "gallery-index.json");
    if (!fs.existsSync(indexPath)) {
      console.error("Gallery index not found at " + indexPath);
      return NextResponse.json({ error: "Index not found" }, { status: 500 });
    }

    const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    let images: string[] = [];

    if (category === "all") {
      Object.values(index).forEach((catImages: any) => {
        images = images.concat(catImages);
      });
    } else {
      images = index[category] || [];
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
