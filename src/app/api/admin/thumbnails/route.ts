import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { 
  getCategoryThumbnailsAsync, 
  saveCategoryThumbnail, 
  getStudioGalleryImagesForCategory 
} from "@/lib/thumbnails-store";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const CATEGORIES_LIST = [
  { id: "gestante", title: "Gestante", section: "Principais" },
  { id: "newborn-menino", title: "Newborn Menino", section: "Principais" },
  { id: "newborn-menina", title: "Newborn Menina", section: "Principais" },
  { id: "mensal-menino", title: "Mensal Menino", section: "Principais" },
  { id: "mensal-menina", title: "Mensal Menina", section: "Principais" },
  { id: "smash-the-cake", title: "Smash the Cake", section: "Principais" },
  { id: "revelacao", title: "Revelação", section: "Principais" },
  { id: "familia", title: "Família", section: "Principais" },
  { id: "feminino", title: "Feminino", section: "Lifestyle & Outros" },
  { id: "corporativo", title: "Corporativo", section: "Lifestyle & Outros" },
  { id: "civil", title: "Civil", section: "Lifestyle & Outros" },
  { id: "casal", title: "Casal", section: "Lifestyle & Outros" }
];

export async function GET() {
  try {
    const thumbnails = await getCategoryThumbnailsAsync();
    
    // Build comprehensive status and gallery choices for each category
    const categoriesData = CATEGORIES_LIST.map((cat) => {
      const galleryPhotos = getStudioGalleryImagesForCategory(cat.id);
      return {
        ...cat,
        currentImage: thumbnails[cat.id] || `/content/services/${cat.id}.avif`,
        galleryPhotos
      };
    });

    return NextResponse.json({ 
      success: true, 
      thumbnails,
      categories: categoriesData 
    });
  } catch (error) {
    console.error("Error in GET /api/admin/thumbnails:", error);
    return NextResponse.json({ error: "Falha ao obter lista de thumbnails" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    
    // Case A: Select from Studio Gallery or URL
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { category, imagePath } = body;

      if (!category || !imagePath) {
        return NextResponse.json({ error: "Categoria e caminho da imagem são obrigatórios" }, { status: 400 });
      }

      const success = await saveCategoryThumbnail(category, imagePath);
      if (!success) {
        return NextResponse.json({ error: "Erro ao salvar a thumbnail" }, { status: 500 });
      }

      try {
        revalidatePath("/", "layout");
        revalidatePath("/ensaios");
        revalidatePath(`/${category}`);
        revalidatePath("/agendar", "layout");
      } catch (revErr) {
        console.warn("Revalidation warning:", revErr);
      }

      return NextResponse.json({ success: true, category, imagePath });
    }

    // Case B: Direct Upload of new Real Studio Photo
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const category = formData.get("category") as string | null;

      if (!file || !category) {
        return NextResponse.json({ error: "Arquivo e categoria são obrigatórios" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || ".jpg";
      const fileName = `${category}_${Date.now()}${ext}`;
      let publicUrl = "";

      // 1. Upload to Supabase Storage bucket 'thumbnails'
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        try {
          const supabaseAdmin = createAdminClient(supabaseUrl, supabaseKey);
          const { error: uploadError } = await supabaseAdmin.storage
            .from("thumbnails")
            .upload(fileName, buffer, {
              contentType: file.type || "image/jpeg",
              upsert: true,
            });

          if (!uploadError) {
            const { data } = supabaseAdmin.storage
              .from("thumbnails")
              .getPublicUrl(fileName);
            publicUrl = data?.publicUrl || "";
          } else {
            console.error("Supabase Storage upload error:", uploadError);
          }
        } catch (storageErr) {
          console.error("Error connecting to Supabase Storage:", storageErr);
        }
      }

      // 2. Local fallback if Supabase Storage is not available
      if (!publicUrl) {
        try {
          const uploadDir = path.join(process.cwd(), "public", "uploads", "thumbnails");
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, buffer);
          publicUrl = `/uploads/thumbnails/${fileName}`;
        } catch (localErr) {
          console.error("Local file write fallback error:", localErr);
        }
      }

      if (!publicUrl) {
        return NextResponse.json({ error: "Erro ao salvar arquivo no servidor de mídia" }, { status: 500 });
      }

      const success = await saveCategoryThumbnail(category, publicUrl);
      if (!success) {
        return NextResponse.json({ error: "Erro ao salvar a thumbnail" }, { status: 500 });
      }

      try {
        revalidatePath("/", "layout");
        revalidatePath("/ensaios");
        revalidatePath(`/${category}`);
        revalidatePath("/agendar", "layout");
      } catch (revErr) {
        console.warn("Revalidation warning:", revErr);
      }

      return NextResponse.json({ success: true, category, imagePath: publicUrl });
    }

    return NextResponse.json({ error: "Formato de requisição não suportado" }, { status: 400 });
  } catch (error) {
    console.error("Error in POST /api/admin/thumbnails:", error);
    return NextResponse.json({ error: "Erro ao atualizar a thumbnail" }, { status: 500 });
  }
}

